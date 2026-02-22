-- =====================================================
-- FIX: Login 500 "Database error querying schema"
-- =====================================================
-- Usuários criados via SQL (create_tenant_with_admin /
-- create_user_for_tenant) ficam com colunas de token NULL.
-- O GoTrue (Supabase Auth) espera strings; NULL causa erro
-- ao fazer login. Execute uma vez no SQL Editor do Supabase.
-- =====================================================

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  recovery_token = COALESCE(recovery_token, '')
WHERE confirmation_token IS NULL
   OR email_change IS NULL
   OR email_change_token_new IS NULL
   OR recovery_token IS NULL;
