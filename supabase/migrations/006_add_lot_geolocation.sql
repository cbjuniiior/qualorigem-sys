-- Adicionar geolocalização ao lote de produtos
ALTER TABLE public.product_lots 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;
