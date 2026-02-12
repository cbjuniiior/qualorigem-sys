-- =====================================================
-- MIGRATION V4 - PLATFORM ADMIN FUNCTIONS
-- =====================================================
-- Data: Fevereiro 2026
-- Descrição: Funções auxiliares para o painel de
-- administração da plataforma (superadmin).
-- =====================================================
-- NOTA: Execute APÓS MIGRATION_V3

-- =====================================================
-- 1. Listar todos os usuários (cross-tenant)
-- =====================================================
-- auth.users não é acessível via RLS; esta função 
-- SECURITY DEFINER permite ao platform admin listar.

CREATE OR REPLACE FUNCTION public.get_all_users_for_platform()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas platform admins';
  END IF;

  RETURN QUERY
    SELECT 
      au.id,
      au.email::text,
      COALESCE(au.raw_user_meta_data->>'full_name', up.full_name, '')::text AS full_name,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON up.id = au.id
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 2. Estatísticas globais da plataforma
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_tenants bigint,
  active_tenants bigint,
  total_users bigint,
  total_lots bigint
) AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT
      (SELECT count(*) FROM public.tenants)::bigint AS total_tenants,
      (SELECT count(*) FROM public.tenants WHERE status = 'active')::bigint AS active_tenants,
      (SELECT count(*) FROM auth.users)::bigint AS total_users,
      (SELECT count(*) FROM public.product_lots)::bigint AS total_lots;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 3. Estatísticas de um tenant específico
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_tenant_stats(p_tenant_id uuid)
RETURNS TABLE (
  producers_count bigint,
  lots_count bigint,
  members_count bigint,
  certifications_count bigint
) AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT
      (SELECT count(*) FROM public.producers WHERE tenant_id = p_tenant_id)::bigint,
      (SELECT count(*) FROM public.product_lots WHERE tenant_id = p_tenant_id)::bigint,
      (SELECT count(*) FROM public.tenant_memberships WHERE tenant_id = p_tenant_id)::bigint,
      (SELECT count(*) FROM public.certifications WHERE tenant_id = p_tenant_id)::bigint;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 4. Listar membros de um tenant (com dados do user)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_tenant_members(p_tenant_id uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  role text,
  joined_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT 
      tm.user_id,
      au.email::text,
      COALESCE(au.raw_user_meta_data->>'full_name', up.full_name, '')::text,
      tm.role,
      tm.created_at AS joined_at
    FROM public.tenant_memberships tm
    JOIN auth.users au ON au.id = tm.user_id
    LEFT JOIN public.user_profiles up ON up.id = tm.user_id
    WHERE tm.tenant_id = p_tenant_id
    ORDER BY tm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 5. Listar platform admins (com dados do user)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_platform_admins()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
) AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
    SELECT 
      pa.user_id,
      au.email::text,
      COALESCE(au.raw_user_meta_data->>'full_name', up.full_name, '')::text,
      pa.role,
      pa.created_at
    FROM public.platform_admins pa
    JOIN auth.users au ON au.id = pa.user_id
    LEFT JOIN public.user_profiles up ON up.id = pa.user_id
    ORDER BY pa.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 6. Criar usuário para um tenant (via Supabase Auth)
-- =====================================================
-- NOTA: Esta função usa auth.users diretamente.
-- No Supabase self-hosted, a criação de usuário pode
-- ser feita via API REST com service_role key.
-- Esta função é um fallback para criação via SQL.

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

  -- Verificar se usuário já existe
  SELECT id INTO new_user_id FROM auth.users WHERE email = p_email;
  
  IF new_user_id IS NOT NULL THEN
    -- Usuário já existe, apenas adicionar ao tenant
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    VALUES (p_tenant_id, new_user_id, p_role)
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_role;
    
    RETURN new_user_id;
  END IF;

  -- Criar usuário no auth.users (Supabase self-hosted)
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
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_full_name),
    now(), now(), 'authenticated', 'authenticated',
    ''
  );

  -- Criar identidade
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
  INSERT INTO public.user_profiles (id, email, full_name, tenant_id, role, is_active)
  VALUES (new_user_id, p_email, p_full_name, p_tenant_id, p_role, true)
  ON CONFLICT (id) DO UPDATE SET 
    full_name = p_full_name,
    tenant_id = p_tenant_id;

  -- Criar membership
  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (p_tenant_id, new_user_id, p_role)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_role;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
