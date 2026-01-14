-- Remover campos de propriedade da tabela producers
-- Esses campos agora pertencem apenas aos lotes (product_lots)

-- Tornar campos opcionais (remover NOT NULL)
ALTER TABLE public.producers 
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN state DROP NOT NULL,
  ALTER COLUMN property_name DROP NOT NULL;

-- Remover colunas de propriedade (opcional - comentado para não quebrar dados existentes)
-- ALTER TABLE public.producers 
--   DROP COLUMN IF EXISTS property_name,
--   DROP COLUMN IF EXISTS property_description,
--   DROP COLUMN IF EXISTS photos,
--   DROP COLUMN IF EXISTS altitude,
--   DROP COLUMN IF EXISTS average_temperature,
--   DROP COLUMN IF EXISTS cep,
--   DROP COLUMN IF EXISTS address,
--   DROP COLUMN IF EXISTS city,
--   DROP COLUMN IF EXISTS state,
--   DROP COLUMN IF EXISTS address_internal_only,
--   DROP COLUMN IF EXISTS latitude,
--   DROP COLUMN IF EXISTS longitude,
--   DROP COLUMN IF EXISTS use_coordinates;
