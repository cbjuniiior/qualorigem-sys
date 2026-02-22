-- =====================================================
-- MIGRATION V5 - PLATFORM ENHANCEMENTS
-- =====================================================
-- Data: Fevereiro 2026
-- Descrição: Tabelas e RPCs adicionais para o painel
-- de administração da plataforma.
-- =====================================================
-- NOTA: Execute APÓS MIGRATION_V4

-- =====================================================
-- 1. Tabela tenant_subscriptions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled', 'trial')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins full access on subscriptions"
  ON public.tenant_subscriptions
  FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- =====================================================
-- 2. Tabela system_type_templates
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_type_templates (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  type_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  default_modules jsonb DEFAULT '[]'::jsonb,
  default_fields jsonb DEFAULT '[]'::jsonb,
  color text DEFAULT '#4f46e5',
  icon text DEFAULT 'Buildings',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_type_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read on type templates"
  ON public.system_type_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Platform admins write on type templates"
  ON public.system_type_templates
  FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Seed dos 3 tipos
INSERT INTO public.system_type_templates (type_key, name, description, default_modules, default_fields, color, icon)
VALUES
  ('ig', 'Indicação Geográfica', 'Sistema para gestão de Indicações Geográficas (IG), com rastreabilidade completa de lotes, produtores e análise sensorial.', 
   '["traceability", "sensory_analysis", "seal_control"]'::jsonb,
   '["seal", "weight", "sensory_attributes", "radar_chart", "lot_observations"]'::jsonb,
   '#4f46e5', 'MapPin'),
  ('marca_coletiva', 'Marca Coletiva', 'Sistema para Marcas Coletivas com gestão de cooperativas, produtores internos, certificações e rastreabilidade.',
   '["traceability", "certifications", "internal_producers", "sensory_analysis"]'::jsonb,
   '["certifications", "internal_producers", "sensory_attributes", "radar_chart", "lot_observations", "youtube_video"]'::jsonb,
   '#10b981', 'UsersThree'),
  ('privado', 'Empresa Privada', 'Sistema simplificado para empresas privadas com rastreabilidade e controle de qualidade.',
   '["traceability"]'::jsonb,
   '["weight", "lot_observations"]'::jsonb,
   '#f59e0b', 'Buildings')
ON CONFLICT (type_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_modules = EXCLUDED.default_modules,
  default_fields = EXCLUDED.default_fields,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- =====================================================
-- 3. RPC: create_platform_admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_platform_admin(
  p_email text,
  p_password text,
  p_full_name text
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Verificar se já existe
  SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;
  
  IF new_user_id IS NOT NULL THEN
    -- Usuário existe, adicionar como platform admin
    INSERT INTO public.platform_admins (user_id, role)
    VALUES (new_user_id, 'superadmin')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN new_user_id;
  END IF;

  -- Criar novo usuário
  new_user_id := extensions.uuid_generate_v4();
  
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data,
    created_at, updated_at, role, aud,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_full_name),
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_user_id, new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email),
    'email', new_user_id::text,
    now(), now(), now()
  );

  -- Criar perfil
  INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
  VALUES (new_user_id, p_email, p_full_name, 'superadmin', true)
  ON CONFLICT (id) DO UPDATE SET full_name = p_full_name;

  -- Adicionar como platform admin
  INSERT INTO public.platform_admins (user_id, role)
  VALUES (new_user_id, 'superadmin')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. RPC: get_tenant_activity
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_tenant_activity(p_tenant_id uuid)
RETURNS TABLE (
  activity_type text,
  title text,
  description text,
  created_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY (
    -- Últimos lotes
    SELECT 
      'lot'::text AS activity_type,
      pl.product_name::text AS title,
      ('Lote ' || pl.lot_code)::text AS description,
      pl.created_at
    FROM public.product_lots pl
    WHERE pl.tenant_id = p_tenant_id
    ORDER BY pl.created_at DESC
    LIMIT 10
  )
  UNION ALL
  (
    -- Últimos membros
    SELECT
      'member'::text AS activity_type,
      COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text AS title,
      ('Papel: ' || tm.role)::text AS description,
      tm.created_at
    FROM public.tenant_memberships tm
    JOIN auth.users au ON au.id = tm.user_id
    WHERE tm.tenant_id = p_tenant_id
    ORDER BY tm.created_at DESC
    LIMIT 10
  )
  ORDER BY created_at DESC
  LIMIT 15;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
