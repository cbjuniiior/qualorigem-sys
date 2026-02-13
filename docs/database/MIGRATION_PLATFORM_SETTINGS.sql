-- =====================================================
-- MIGRATION - PLATFORM SETTINGS (Personalização da plataforma)
-- =====================================================
-- Descrição: Tabela singleton para favicon, título e descrição
-- do site nas páginas do painel da plataforma (/platform/*).
-- =====================================================
-- NOTA: Execute após MIGRATION_V5 (usa is_platform_admin).

-- =====================================================
-- 1. Tabela platform_settings (singleton)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  favicon_url text,
  site_title text NOT NULL DEFAULT 'QualOrigem - Painel Admin',
  site_description text,
  og_image_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT platform_settings_singleton CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer um (página raiz e painel precisam exibir título, descrição e favicon)
DROP POLICY IF EXISTS "Authenticated read platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Public read platform_settings" ON public.platform_settings;
CREATE POLICY "Public read platform_settings"
  ON public.platform_settings
  FOR SELECT
  USING (true);

-- Escrita: apenas platform admins
DROP POLICY IF EXISTS "Platform admins write platform_settings" ON public.platform_settings;
CREATE POLICY "Platform admins write platform_settings"
  ON public.platform_settings
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Inserir linha única (singleton)
INSERT INTO public.platform_settings (id, site_title, site_description, og_image_url)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'QualOrigem - Painel Admin', 'Sistema de rastreabilidade de origem.', null)
ON CONFLICT (id) DO NOTHING;
