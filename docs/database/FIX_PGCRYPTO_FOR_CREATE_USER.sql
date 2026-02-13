-- =====================================================
-- FIX: gen_salt(unknown) does not exist ao criar cliente
-- =====================================================
-- No Supabase, a extensão pgcrypto fica no schema
-- "extensions". A função deve usar extensions.gen_salt
-- e extensions.crypt.
--
-- Execute este script no SQL Editor do Supabase
-- (Dashboard → SQL Editor). Uma vez é suficiente.
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_user_for_tenant(
  p_email text,
  p_password text,
  p_full_name text,
  p_tenant_id uuid,
  p_role text DEFAULT 'tenant_admin'
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;

  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    VALUES (p_tenant_id, new_user_id, p_role)
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_role;
    RETURN new_user_id;
  END IF;

  new_user_id := extensions.uuid_generate_v4();

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data,
    created_at, updated_at, role, aud,
    confirmation_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_full_name),
    now(), now(), 'authenticated', 'authenticated',
    ''
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

  INSERT INTO public.user_profiles (id, email, full_name, tenant_id, role, is_active)
  VALUES (new_user_id, p_email, p_full_name, p_tenant_id, p_role, true)
  ON CONFLICT (id) DO UPDATE SET
    full_name = p_full_name,
    tenant_id = p_tenant_id;

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (p_tenant_id, new_user_id, p_role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_role;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Se você também usa "Criar administrador da plataforma" e vê o mesmo erro
-- gen_salt, execute no SQL Editor a função create_platform_admin de
-- MIGRATION_V5_PLATFORM_ENHANCEMENTS.sql (troque gen_salt por extensions.gen_salt e crypt por extensions.crypt).
