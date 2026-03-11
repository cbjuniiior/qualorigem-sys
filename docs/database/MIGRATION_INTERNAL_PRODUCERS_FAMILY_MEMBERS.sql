BEGIN;

-- Adiciona quantidade de pessoas da família para produtores internos
ALTER TABLE public.internal_producers
  ADD COLUMN IF NOT EXISTS family_members integer;

-- Backfill idempotente para registros antigos
UPDATE public.internal_producers
SET family_members = 1
WHERE family_members IS NULL OR family_members < 1;

-- Garante integridade para novos registros
ALTER TABLE public.internal_producers
  ALTER COLUMN family_members SET DEFAULT 1;

ALTER TABLE public.internal_producers
  ALTER COLUMN family_members SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'internal_producers_family_members_check'
  ) THEN
    ALTER TABLE public.internal_producers
      ADD CONSTRAINT internal_producers_family_members_check CHECK (family_members >= 1);
  END IF;
END $$;

COMMIT;
