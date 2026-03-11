BEGIN;

-- 1) Novos campos de hierarquia diretamente em producers
ALTER TABLE public.producers
  ADD COLUMN IF NOT EXISTS coop_role text,
  ADD COLUMN IF NOT EXISTS parent_producer_id uuid,
  ADD COLUMN IF NOT EXISTS coop_group_key text;

-- 2) FK self-reference para singular -> principal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'producers_parent_producer_id_fkey'
  ) THEN
    ALTER TABLE public.producers
      ADD CONSTRAINT producers_parent_producer_id_fkey
      FOREIGN KEY (parent_producer_id) REFERENCES public.producers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Backfill idempotente a partir do legado em associations/producers_associations
-- principal
UPDATE public.producers p
SET
  coop_role = 'principal',
  coop_group_key = COALESCE(a.partner_group_key, p.coop_group_key)
FROM public.producers_associations pa
JOIN public.associations a
  ON a.id = pa.association_id
 AND a.tenant_id = pa.tenant_id
WHERE pa.producer_id = p.id
  AND pa.tenant_id = p.tenant_id
  AND a.partner_kind = 'cooperativa_principal'
  AND (p.coop_role IS NULL OR p.coop_role = '' OR p.coop_role = 'principal');

-- singular + vínculo ao principal
WITH singular_map AS (
  SELECT
    ps.id AS singular_producer_id,
    ps.tenant_id,
    aps.partner_group_key,
    (
      SELECT pa2.producer_id
      FROM public.producers_associations pa2
      WHERE pa2.association_id = aps.parent_association_id
        AND pa2.tenant_id = aps.tenant_id
      ORDER BY pa2.producer_id
      LIMIT 1
    ) AS principal_producer_id
  FROM public.producers ps
  JOIN public.producers_associations pas
    ON pas.producer_id = ps.id
   AND pas.tenant_id = ps.tenant_id
  JOIN public.associations aps
    ON aps.id = pas.association_id
   AND aps.tenant_id = pas.tenant_id
  WHERE aps.partner_kind = 'cooperativa_singular'
)
UPDATE public.producers p
SET
  coop_role = 'singular',
  parent_producer_id = COALESCE(sm.principal_producer_id, p.parent_producer_id),
  coop_group_key = COALESCE(sm.partner_group_key, p.coop_group_key)
FROM singular_map sm
WHERE p.id = sm.singular_producer_id
  AND p.tenant_id = sm.tenant_id
  AND (p.coop_role IS NULL OR p.coop_role = '' OR p.coop_role = 'singular');

-- 4) Constraints de integridade
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'producers_coop_role_check'
  ) THEN
    ALTER TABLE public.producers
      ADD CONSTRAINT producers_coop_role_check
      CHECK (
        coop_role IS NULL OR coop_role IN ('principal', 'singular')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'producers_parent_required_for_singular_check'
  ) THEN
    ALTER TABLE public.producers
      ADD CONSTRAINT producers_parent_required_for_singular_check
      CHECK (
        coop_role IS DISTINCT FROM 'singular'
        OR parent_producer_id IS NOT NULL
      );
  END IF;
END $$;

-- 5) Índices úteis
CREATE INDEX IF NOT EXISTS idx_producers_coop_role_tenant
  ON public.producers (tenant_id, coop_role);

CREATE INDEX IF NOT EXISTS idx_producers_parent_producer
  ON public.producers (parent_producer_id);

CREATE INDEX IF NOT EXISTS idx_producers_coop_group_key_tenant
  ON public.producers (tenant_id, coop_group_key);

COMMIT;
