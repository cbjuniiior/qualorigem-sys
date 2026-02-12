-- =====================================================
-- TORNAR USUÁRIO ADMIN (SUPERADMIN & TENANT ADMIN)
-- =====================================================
-- Usuário: cb.juniiior@gmail.com
-- ID: bfe75ec1-434f-4d96-88db-b23429f45c7d
-- =====================================================

-- 1. Adicionar como Superadmin da Plataforma (Acesso total a /platform)
INSERT INTO public.platform_admins (user_id, role)
VALUES ('bfe75ec1-434f-4d96-88db-b23429f45c7d', 'superadmin')
ON CONFLICT (user_id) DO NOTHING;

-- 2. Garantir acesso como Admin do Tenant 'default' (Acesso a /default/admin)
DO $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- Buscar ID do tenant default
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'default';

  -- Se o tenant default existir, adiciona/atualiza o membership
  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    VALUES (v_tenant_id, 'bfe75ec1-434f-4d96-88db-b23429f45c7d', 'tenant_admin')
    ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'tenant_admin';
  END IF;
END $$;
