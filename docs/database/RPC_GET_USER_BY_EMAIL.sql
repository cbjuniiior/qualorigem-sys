-- =====================================================
-- RPC: get_user_id_by_email
-- =====================================================
-- Usado pela Edge Function create-tenant-with-admin para
-- verificar se um usuário já existe antes de criar via Admin API.
-- Execute no SQL Editor do Supabase.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$;
