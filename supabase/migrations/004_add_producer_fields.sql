-- Adicionar novos campos à tabela de produtores
ALTER TABLE public.producers 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS address_internal_only BOOLEAN DEFAULT FALSE;
