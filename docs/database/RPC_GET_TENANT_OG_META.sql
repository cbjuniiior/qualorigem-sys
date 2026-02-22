-- =====================================================
-- RPC: get_tenant_og_meta
-- =====================================================
-- Retorna título, descrição e imagem para Open Graph
-- de um tenant por slug. Usado pelo servidor para injetar
-- meta tags quando crawlers (WhatsApp, Facebook, etc.) solicitam a página.
-- Público (sem auth). Execute no SQL Editor do Supabase.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_tenant_og_meta(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_tenant_id uuid;
  v_tenant_branding jsonb;
  v_config_branding jsonb;
  v_platform jsonb;
  v_title text;
  v_description text;
  v_image text;
  v_logo text;
  v_header_image text;
  v_has_personalization boolean;
BEGIN
  -- 1. Buscar tenant ativo por slug
  SELECT id, branding INTO v_tenant_id, v_tenant_branding
  FROM public.tenants
  WHERE slug = p_slug AND status = 'active'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. Buscar branding em system_configurations (prioridade)
  SELECT config_value INTO v_config_branding
  FROM public.system_configurations
  WHERE tenant_id = v_tenant_id AND config_key = 'branding_settings'
  LIMIT 1;

  -- 3. Usar config ou tenant.branding
  v_tenant_branding := COALESCE(v_config_branding, v_tenant_branding);

  -- 4. Platform settings (fallback)
  SELECT jsonb_build_object(
    'site_title', site_title,
    'site_description', site_description,
    'og_image_url', og_image_url
  ) INTO v_platform
  FROM public.platform_settings
  WHERE id = '00000000-0000-0000-0000-000000000001'
  LIMIT 1;

  -- 5. Extrair valores do tenant
  v_logo := NULLIF(TRIM(COALESCE(
    v_tenant_branding->>'logoUrl',
    v_tenant_branding->>'logo_url'
  )), '');
  v_header_image := NULLIF(TRIM(COALESCE(
    v_tenant_branding->>'headerImageUrl',
    v_tenant_branding->>'header_image_url'
  )), '');
  v_has_personalization := (v_logo IS NOT NULL) OR (NULLIF(TRIM(v_tenant_branding->>'siteTitle'), '') IS NOT NULL);

  -- 6. Título: tenant siteTitle ou platform
  v_title := NULLIF(TRIM(v_tenant_branding->>'siteTitle'), '');
  IF v_title IS NULL THEN
    v_title := COALESCE(v_platform->>'site_title', 'QualOrigem');
  END IF;

  -- 7. Descrição: tenant siteDescription ou platform
  v_description := NULLIF(TRIM(v_tenant_branding->>'siteDescription'), '');
  IF v_description IS NULL THEN
    v_description := COALESCE(v_platform->>'site_description', 'Sistema de rastreabilidade de origem.');
  END IF;

  -- 8. Imagem: logo do tenant (se personalizou) > header > platform
  v_image := NULL;
  IF v_has_personalization AND v_logo IS NOT NULL THEN
    v_image := v_logo;
  ELSIF v_header_image IS NOT NULL THEN
    v_image := v_header_image;
  ELSE
    v_image := v_platform->>'og_image_url';
  END IF;

  IF v_image IS NULL OR v_image = '' THEN
    v_image := 'og-default.png';
  END IF;

  RETURN jsonb_build_object(
    'title', v_title,
    'description', v_description,
    'image', v_image
  );
END;
$$;
