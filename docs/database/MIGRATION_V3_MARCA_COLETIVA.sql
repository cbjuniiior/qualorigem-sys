-- =====================================================
-- MIGRATION V3 - MARCA COLETIVA & CERTIFICAÇÕES
-- =====================================================
-- Data: Fevereiro 2026
-- Descrição: Adiciona suporte estrutural a tenants do tipo
-- "marca_coletiva", sistema de certificações, produtores
-- internos, múltiplas indústrias por lote e configuração
-- de campos por tenant.
-- =====================================================
-- NOTA: Execute APÓS MIGRATION_V2 e RLS_POLICIES_V2.sql

-- =====================================================
-- PASSO 1: NOVAS TABELAS
-- =====================================================

-- 1. Certificações (documentos oficiais do tenant)
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuing_body text,                    -- Órgão emissor
  valid_until date,                     -- Data de validade
  document_url text,                    -- URL do PDF no Storage
  is_public boolean DEFAULT true,       -- Exibir na página pública
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Vínculo certificação <-> entidade (produtor/cooperativa ou lote)
CREATE TABLE IF NOT EXISTS public.certification_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('producer', 'lot')),
  entity_id uuid NOT NULL,             -- ID do producer ou product_lot
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (certification_id, entity_type, entity_id)
);

-- 3. Produtores internos (vinculados a uma cooperativa)
CREATE TABLE IF NOT EXISTS public.internal_producers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cooperativa_id uuid REFERENCES public.producers(id) ON DELETE SET NULL,
  name text NOT NULL,
  document text,                        -- CPF ou documento
  city text,
  state text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Pivot: lote <-> produtores internos
CREATE TABLE IF NOT EXISTS public.product_lot_internal_producers (
  lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE CASCADE,
  internal_producer_id uuid NOT NULL REFERENCES public.internal_producers(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  PRIMARY KEY (lot_id, internal_producer_id)
);

-- 5. Pivot: lote <-> múltiplas indústrias (substitui FK única industry_id)
CREATE TABLE IF NOT EXISTS public.product_lot_industries (
  lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE CASCADE,
  industry_id uuid NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  PRIMARY KEY (lot_id, industry_id)
);

-- 6. Configuração de campos por tenant
CREATE TABLE IF NOT EXISTS public.tenant_field_settings (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  field_key text NOT NULL,              -- seal, weight, sensory_attributes, radar_chart, certifications
  enabled boolean DEFAULT true,
  required boolean DEFAULT false,
  PRIMARY KEY (tenant_id, field_key)
);

-- =====================================================
-- PASSO 2: HABILITAR RLS
-- =====================================================

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_internal_producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_field_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 3: RLS POLICIES (PADRÃO MULTI-TENANT)
-- =====================================================

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'certifications',
        'certification_entities',
        'internal_producers',
        'product_lot_internal_producers',
        'product_lot_industries',
        'tenant_field_settings'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Limpar policies antigas se existirem
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Read" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Write" ON public.%I', t);

        -- Leitura: Membros do tenant OU Platform Admin
        EXECUTE format('
            CREATE POLICY "Tenant Read" ON public.%I
            FOR SELECT USING (
                tenant_id IN (SELECT public.get_user_tenant_ids())
                OR public.is_platform_admin()
            )', t);

        -- Escrita: Tenant Admin OU Platform Admin
        EXECUTE format('
            CREATE POLICY "Tenant Write" ON public.%I
            FOR ALL USING (
                tenant_id IN (SELECT public.get_user_admin_tenant_ids())
                OR public.is_platform_admin()
            )', t);
    END LOOP;
END $$;

-- Certificações também precisam de leitura pública (para página do lote)
DROP POLICY IF EXISTS "Public Read Certifications" ON public.certifications;
CREATE POLICY "Public Read Certifications" ON public.certifications
FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Public Read Certification Entities" ON public.certification_entities;
CREATE POLICY "Public Read Certification Entities" ON public.certification_entities
FOR SELECT USING (
  certification_id IN (
    SELECT id FROM public.certifications WHERE is_public = true
  )
);

-- =====================================================
-- PASSO 4: ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_certifications_tenant ON public.certifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certification_entities_cert ON public.certification_entities(certification_id);
CREATE INDEX IF NOT EXISTS idx_certification_entities_entity ON public.certification_entities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_internal_producers_tenant ON public.internal_producers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_internal_producers_coop ON public.internal_producers(cooperativa_id);
CREATE INDEX IF NOT EXISTS idx_plip_lot ON public.product_lot_internal_producers(lot_id);
CREATE INDEX IF NOT EXISTS idx_plip_producer ON public.product_lot_internal_producers(internal_producer_id);
CREATE INDEX IF NOT EXISTS idx_pli_lot ON public.product_lot_industries(lot_id);
CREATE INDEX IF NOT EXISTS idx_pli_industry ON public.product_lot_industries(industry_id);
CREATE INDEX IF NOT EXISTS idx_tfs_tenant ON public.tenant_field_settings(tenant_id);

-- =====================================================
-- PASSO 5: STORAGE BUCKET PARA CERTIFICADOS (PDFs)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificados',
  'certificados',
  true,
  10485760,  -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policies de Storage para o novo bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('propriedades', 'branding', 'certificados'));

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('propriedades', 'branding', 'certificados'));

DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('propriedades', 'branding', 'certificados'));

-- =====================================================
-- PASSO 6: MIGRAÇÃO DE DADOS (indústrias existentes)
-- =====================================================
-- Migrar relações industry_id existentes para a tabela pivot

INSERT INTO public.product_lot_industries (lot_id, industry_id, tenant_id)
SELECT id, industry_id, tenant_id
FROM public.product_lots
WHERE industry_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- NOTA: Não removemos a coluna industry_id de product_lots
-- para manter compatibilidade. Ela será mantida como fallback
-- mas novas relações usarão a tabela pivot.
