-- =====================================================
-- MIGRATION V2 - ARQUITETURA MULTI-TENANT
-- =====================================================
-- Data: Fevereiro 2026
-- Descrição: Transforma o sistema em multi-tenant, adicionando
-- tabelas de tenants e isolamento via RLS.
-- =====================================================

-- -----------------------------------------------------
-- PASSO 1: CRIAR NOVAS TABELAS ESTRUTURAIS
-- -----------------------------------------------------

-- 1. Tenants (Organizações/Clientes)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',  -- active, suspended
  type text NOT NULL DEFAULT 'ig',        -- ig, marca_coletiva, etc.
  branding jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Módulos por Tenant (Feature Flags)
CREATE TABLE IF NOT EXISTS public.tenant_modules (
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  module_key text NOT NULL,               -- traceability_ig, traceability_marca_coletiva, crm...
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  PRIMARY KEY (tenant_id, module_key)
);

-- 3. Membros do Tenant (Vínculo Usuário <-> Tenant)
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',    -- tenant_admin, producer, viewer
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- 4. Administradores da Plataforma (Superadmins)
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'superadmin',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- PASSO 2: ADICIONAR COLUNA TENANT_ID (NULLABLE INICIALMENTE)
-- -----------------------------------------------------

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'producers', 'associations', 'brands', 'industries',
        'product_lots', 'lot_components', 'seal_controls', 
        'product_lot_characteristics', 'product_lot_sensory',
        'categories', 'characteristics', 'sensory_attributes',
        'system_configurations', 'tasks', 'producers_associations',
        'user_profiles'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id)', t);
    END LOOP;
END $$;

-- Ajuste específico para product_lots (unicidade composta)
-- Primeiro removemos a constraint antiga se existir
ALTER TABLE public.product_lots DROP CONSTRAINT IF EXISTS product_lots_code_key;
-- O índice único será recriado APÓS a migração de dados e definição de NOT NULL

-- -----------------------------------------------------
-- PASSO 3: MIGRAÇÃO DE DADOS (CRIAR TENANT DEFAULT)
-- -----------------------------------------------------

DO $$
DECLARE
    default_tenant_id uuid;
BEGIN
    -- 1. Criar o tenant padrão se não existir
    INSERT INTO public.tenants (slug, name, type)
    VALUES ('default', 'Organização Padrão', 'ig')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO default_tenant_id;

    -- 2. Preencher tenant_id em todas as tabelas para registros existentes
    UPDATE public.producers SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.associations SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.brands SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.industries SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.product_lots SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.lot_components SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.seal_controls SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.product_lot_characteristics SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.product_lot_sensory SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.categories SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.characteristics SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.sensory_attributes SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.system_configurations SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.tasks SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.producers_associations SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.user_profiles SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;

    -- 3. Adicionar memberships para usuários existentes (como admins do tenant default)
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    SELECT default_tenant_id, id, 'tenant_admin'
    FROM auth.users
    ON CONFLICT (tenant_id, user_id) DO NOTHING;

    -- 4. Opcional: Transformar o primeiro usuário em Platform Admin (ajuste o email se necessário)
    -- INSERT INTO public.platform_admins (user_id)
    -- SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
    -- ON CONFLICT DO NOTHING;
END $$;

-- -----------------------------------------------------
-- PASSO 4: ENFORÇAR NOT NULL E CONSTRAINTS
-- -----------------------------------------------------

DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'producers', 'associations', 'brands', 'industries',
        'product_lots', 'lot_components', 'seal_controls', 
        'product_lot_characteristics', 'product_lot_sensory',
        'categories', 'characteristics', 'sensory_attributes',
        'system_configurations', 'tasks', 'producers_associations',
        'user_profiles'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', t);
    END LOOP;
END $$;

-- Recriar constraint de unicidade para product_lots
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_lots_tenant_code ON public.product_lots (tenant_id, code);

-- -----------------------------------------------------
-- PASSO 5: HELPERS SQL PARA RLS
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_tenant_role(p_tenant_id uuid, p_roles text[])
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
      AND role = ANY(p_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------------
-- PASSO 6: POLICIES RLS (EXEMPLO PARA UMA TABELA - REPLICAR PADRÃO)
-- -----------------------------------------------------

-- Exemplo para a tabela 'producers'
DROP POLICY IF EXISTS "Public Select" ON public.producers;
DROP POLICY IF EXISTS "Auth All" ON public.producers;

-- Leitura: Membros do tenant OU Platform Admin
CREATE POLICY "Tenant Read" ON public.producers
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid()
  )
  OR public.is_platform_admin()
);

-- Escrita: Tenant Admin OU Platform Admin
CREATE POLICY "Tenant Write" ON public.producers
FOR ALL USING (
  (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_memberships 
      WHERE user_id = auth.uid() AND role = 'tenant_admin'
    )
  )
  OR public.is_platform_admin()
);

-- NOTA: Você precisará aplicar políticas similares para TODAS as outras tabelas,
-- ajustando conforme a necessidade (ex: product_lots pode ter leitura pública se for para QR Code).
