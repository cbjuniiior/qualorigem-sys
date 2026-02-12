-- =====================================================
-- FIX: Tenant Admin pode atualizar branding do próprio tenant
-- =====================================================
-- Problema: Apenas platform_admin podia fazer UPDATE em tenants.
--           Tenant admins precisam poder salvar personalização (branding).
-- Solução: Política que permite tenant_admin atualizar seu próprio tenant.
-- =====================================================

DROP POLICY IF EXISTS "Tenant Admin Update Own" ON public.tenants;
CREATE POLICY "Tenant Admin Update Own" ON public.tenants 
FOR UPDATE USING (
  id IN (SELECT public.get_user_admin_tenant_ids())
);
