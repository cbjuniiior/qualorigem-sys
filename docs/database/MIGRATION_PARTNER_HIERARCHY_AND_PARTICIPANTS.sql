-- =====================================================
-- MIGRATION - PARTNER HIERARCHY AND LOT PARTICIPANTS
-- =====================================================
-- Objetivo:
-- 1) Estruturar parceiros hierárquicos (principal/singular/empresa)
-- 2) Relacionar produtores participantes por lote
-- 3) Incluir famílias no produtor para cálculo de impacto
-- =====================================================

BEGIN;

-- =====================================================
-- 1) ASSOCIAÇÕES: HIERARQUIA DE PARCEIROS
-- =====================================================

ALTER TABLE public.associations
  ADD COLUMN IF NOT EXISTS partner_kind text,
  ADD COLUMN IF NOT EXISTS parent_association_id uuid REFERENCES public.associations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS partner_group_key text;

-- Backfill seguro a partir do campo legado "type"
UPDATE public.associations
SET partner_kind = CASE
  WHEN type = 'cooperativa' THEN 'cooperativa_principal'
  WHEN type = 'associacao' THEN 'parceiro'
  ELSE 'parceiro'
END
WHERE partner_kind IS NULL;

ALTER TABLE public.associations
  DROP CONSTRAINT IF EXISTS associations_partner_kind_check;

ALTER TABLE public.associations
  ADD CONSTRAINT associations_partner_kind_check
  CHECK (partner_kind IN ('cooperativa_principal', 'cooperativa_singular', 'empresa_participante', 'parceiro'));

ALTER TABLE public.associations
  DROP CONSTRAINT IF EXISTS associations_parent_required_for_children_check;

ALTER TABLE public.associations
  ADD CONSTRAINT associations_parent_required_for_children_check
  CHECK (
    partner_kind IN ('cooperativa_principal', 'parceiro')
    OR parent_association_id IS NOT NULL
  );

CREATE UNIQUE INDEX IF NOT EXISTS uniq_principal_by_group_per_tenant
  ON public.associations (tenant_id, COALESCE(partner_group_key, id::text))
  WHERE partner_kind = 'cooperativa_principal';

CREATE INDEX IF NOT EXISTS idx_associations_parent_association
  ON public.associations(parent_association_id);

CREATE INDEX IF NOT EXISTS idx_associations_partner_kind
  ON public.associations(tenant_id, partner_kind);

-- =====================================================
-- 2) PRODUTORES: FAMÍLIAS E ASSOCIAÇÃO PRINCIPAL
-- =====================================================

ALTER TABLE public.producers
  ADD COLUMN IF NOT EXISTS family_members integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS primary_association_id uuid REFERENCES public.associations(id) ON DELETE SET NULL;

ALTER TABLE public.producers
  DROP CONSTRAINT IF EXISTS producers_family_members_min_check;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_family_members_min_check
  CHECK (family_members >= 1);

CREATE INDEX IF NOT EXISTS idx_producers_primary_association
  ON public.producers(primary_association_id);

-- Backfill do vínculo principal para quem já tinha relação em producers_associations
UPDATE public.producers p
SET primary_association_id = pa.association_id
FROM (
  SELECT DISTINCT ON (producer_id) producer_id, association_id
  FROM public.producers_associations
  ORDER BY producer_id, since DESC NULLS LAST
) pa
WHERE p.id = pa.producer_id
  AND p.primary_association_id IS NULL;

-- =====================================================
-- 3) LOTES: PRODUTORES PARTICIPANTES EXPLÍCITOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_lot_participating_producers (
  lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE CASCADE,
  producer_id uuid NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  role text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (lot_id, producer_id)
);

CREATE INDEX IF NOT EXISTS idx_plpp_lot ON public.product_lot_participating_producers(lot_id);
CREATE INDEX IF NOT EXISTS idx_plpp_producer ON public.product_lot_participating_producers(producer_id);
CREATE INDEX IF NOT EXISTS idx_plpp_tenant ON public.product_lot_participating_producers(tenant_id);

ALTER TABLE public.product_lot_participating_producers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant Read" ON public.product_lot_participating_producers;
CREATE POLICY "Tenant Read" ON public.product_lot_participating_producers
FOR SELECT USING (
  tenant_id IN (SELECT public.get_user_tenant_ids())
  OR public.is_platform_admin()
);

DROP POLICY IF EXISTS "Tenant Write" ON public.product_lot_participating_producers;
CREATE POLICY "Tenant Write" ON public.product_lot_participating_producers
FOR ALL USING (
  tenant_id IN (SELECT public.get_user_admin_tenant_ids())
  OR public.is_platform_admin()
);

-- Backfill: pelo menos o produtor principal do lote entra como participante
INSERT INTO public.product_lot_participating_producers (lot_id, producer_id, tenant_id, is_primary, role)
SELECT pl.id, pl.producer_id, pl.tenant_id, true, 'responsavel'
FROM public.product_lots pl
WHERE pl.producer_id IS NOT NULL
ON CONFLICT (lot_id, producer_id) DO NOTHING;

COMMIT;
-- =====================================================
-- Hierarquia de Parceiros + Participantes por Lote
-- =====================================================
-- Objetivo:
-- 1) Evoluir associations para suportar:
--    - cooperativa_principal
--    - cooperativa_singular (filha da principal)
--    - empresa_participante (filha da principal)
-- 2) Permitir vínculo explícito de produtores participantes por lote
-- 3) Incluir métrica social básica no produtor (family_members)
-- =====================================================

-- -----------------------------------------------------
-- 1) ESTRUTURA HIERÁRQUICA DE PARCEIROS (ASSOCIATIONS)
-- -----------------------------------------------------
ALTER TABLE public.associations
  ADD COLUMN IF NOT EXISTS partner_kind text,
  ADD COLUMN IF NOT EXISTS parent_association_id uuid REFERENCES public.associations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS partner_group_key text;

-- Backfill inicial para manter compatibilidade com dados antigos
UPDATE public.associations
SET partner_kind = CASE
  WHEN type = 'cooperativa' THEN 'cooperativa_principal'
  WHEN type = 'associacao' THEN 'parceiro'
  ELSE 'parceiro'
END
WHERE partner_kind IS NULL;

ALTER TABLE public.associations
  ALTER COLUMN partner_kind SET DEFAULT 'parceiro';

ALTER TABLE public.associations
  ADD CONSTRAINT associations_partner_kind_check
  CHECK (partner_kind IN ('cooperativa_principal', 'cooperativa_singular', 'empresa_participante', 'parceiro'));

-- Para cooperativas singulares/empresas participantes, exige principal vinculada
ALTER TABLE public.associations
  ADD CONSTRAINT associations_parent_required_for_children_check
  CHECK (
    partner_kind IN ('cooperativa_principal', 'parceiro')
    OR parent_association_id IS NOT NULL
  );

-- Garante no máximo 1 principal por "grupo" dentro do tenant.
-- Quando partner_group_key não existir, usa o próprio id como fallback.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_principal_by_group_per_tenant
ON public.associations (tenant_id, COALESCE(partner_group_key, id::text))
WHERE partner_kind = 'cooperativa_principal';

CREATE INDEX IF NOT EXISTS idx_associations_parent_association
ON public.associations(parent_association_id);

CREATE INDEX IF NOT EXISTS idx_associations_partner_kind
ON public.associations(partner_kind);

-- -----------------------------------------------------
-- 2) CAMPO SOCIAL NO PRODUTOR
-- -----------------------------------------------------
ALTER TABLE public.producers
  ADD COLUMN IF NOT EXISTS family_members integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS primary_association_id uuid REFERENCES public.associations(id) ON DELETE SET NULL;

ALTER TABLE public.producers
  ADD CONSTRAINT producers_family_members_check
  CHECK (family_members >= 0);

CREATE INDEX IF NOT EXISTS idx_producers_primary_association
ON public.producers(primary_association_id);

-- -----------------------------------------------------
-- 3) PRODUTORES PARTICIPANTES POR LOTE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_lot_participating_producers (
  lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE CASCADE,
  producer_id uuid NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  role text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (lot_id, producer_id)
);

CREATE INDEX IF NOT EXISTS idx_plpp_lot
ON public.product_lot_participating_producers(lot_id);

CREATE INDEX IF NOT EXISTS idx_plpp_producer
ON public.product_lot_participating_producers(producer_id);

CREATE INDEX IF NOT EXISTS idx_plpp_tenant
ON public.product_lot_participating_producers(tenant_id);

ALTER TABLE public.product_lot_participating_producers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant Read" ON public.product_lot_participating_producers;
CREATE POLICY "Tenant Read" ON public.product_lot_participating_producers
FOR SELECT USING (
  tenant_id IN (SELECT public.get_user_tenant_ids())
  OR public.is_platform_admin()
);

DROP POLICY IF EXISTS "Tenant Write" ON public.product_lot_participating_producers;
CREATE POLICY "Tenant Write" ON public.product_lot_participating_producers
FOR ALL USING (
  tenant_id IN (SELECT public.get_user_admin_tenant_ids())
  OR public.is_platform_admin()
);

