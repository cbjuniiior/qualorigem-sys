-- =====================================================
-- FIX: tenant_id null em user_profiles ao criar cliente
-- =====================================================
-- O INSERT em tenants pode não devolver o id ao cliente (RLS).
-- Esta RPC cria tenant + admin numa única transação no servidor,
-- garantindo que o tenant_id nunca seja null.
--
-- Execute no SQL Editor do Supabase. Depois atualize o front
-- para usar create_tenant_with_admin em vez de insert + create_user_for_tenant.
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_tenant_with_admin(
  p_name text,
  p_slug text,
  p_type text,
  p_admin_email text,
  p_admin_password text,
  p_admin_name text,
  p_status text DEFAULT 'active',
  p_admin_role text DEFAULT 'tenant_admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_tenant_id uuid;
  new_user_id uuid;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- 1. Criar o tenant e obter o id na mesma transação
  INSERT INTO public.tenants (name, slug, type, status)
  VALUES (p_name, p_slug, p_type, COALESCE(p_status, 'active'))
  RETURNING id INTO new_tenant_id;

  -- 2. Criar o usuário admin vinculado ao tenant (mesma lógica de create_user_for_tenant)
  SELECT id INTO new_user_id FROM auth.users WHERE email = p_admin_email;

  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    VALUES (new_tenant_id, new_user_id, p_admin_role)
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_admin_role;
    RETURN new_tenant_id;
  END IF;

  new_user_id := extensions.uuid_generate_v4();

  -- O trigger on_auth_user_created (handle_new_user) insere em user_profiles ao inserir em auth.users.
  -- Precisamos informar o tenant_id para o trigger (user_profiles.tenant_id é NOT NULL).
  PERFORM set_config('app.tenant_id', new_tenant_id::text, true);
  PERFORM set_config('app.tenant_role', p_admin_role, true);

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data,
    created_at, updated_at, role, aud,
    confirmation_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_admin_email,
    extensions.crypt(p_admin_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_admin_name),
    now(), now(), 'authenticated', 'authenticated',
    ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_user_id, new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_admin_email),
    'email', new_user_id::text,
    now(), now(), now()
  );

  INSERT INTO public.user_profiles (id, email, full_name, tenant_id, role, is_active)
  VALUES (new_user_id, p_admin_email, p_admin_name, new_tenant_id, p_admin_role, true)
  ON CONFLICT (id) DO UPDATE SET
    full_name = p_admin_name,
    tenant_id = new_tenant_id;

  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (new_tenant_id, new_user_id, p_admin_role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_admin_role;

  RETURN new_tenant_id;
END;
$$;
