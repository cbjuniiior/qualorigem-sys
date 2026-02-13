-- =====================================================
-- FIX: trigger handle_new_user deve preencher tenant_id
-- =====================================================
-- Ao inserir em auth.users, o trigger cria uma linha em
-- user_profiles. A coluna tenant_id é NOT NULL; o trigger
-- antigo não a preenchia e quebrava na criação de cliente.
--
-- Esta função usa app.tenant_id e app.tenant_role (definidos
-- pela RPC create_tenant_with_admin) ou tenant default.
-- Execute no SQL Editor do Supabase.
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id uuid;
  v_role text;
BEGIN
  v_tenant_id := NULLIF(trim(current_setting('app.tenant_id', true)), '')::uuid;
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'default' LIMIT 1;
  END IF;
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM public.tenants ORDER BY created_at ASC LIMIT 1;
  END IF;
  v_role := COALESCE(NULLIF(trim(current_setting('app.tenant_role', true)), ''), 'viewer');

  INSERT INTO public.user_profiles (id, email, full_name, tenant_id, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_tenant_id,
    v_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    tenant_id = COALESCE(EXCLUDED.tenant_id, public.user_profiles.tenant_id),
    role = COALESCE(EXCLUDED.role, public.user_profiles.role),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
