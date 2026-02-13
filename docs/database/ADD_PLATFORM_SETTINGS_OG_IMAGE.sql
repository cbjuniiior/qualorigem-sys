-- =====================================================
-- ADD COLUMN og_image_url (para quem já aplicou MIGRATION_PLATFORM_SETTINGS antes)
-- =====================================================
-- Execute apenas se a tabela platform_settings já existir sem a coluna og_image_url.

ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS og_image_url text;
