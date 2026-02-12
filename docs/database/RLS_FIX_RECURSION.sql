-- =====================================================
-- FIX: Recursão infinita nas políticas RLS
-- =====================================================
-- Erro: "infinite recursion detected in policy for relation tenant_memberships"
-- Causa: A política de tenant_memberships faz SELECT em tenant_memberships
--        para decidir se permite o SELECT, causando recursão.
-- Solução: Funções SECURITY DEFINER que leem tenant_memberships sem aplicar RLS.
-- =====================================================

-- 1. Função auxiliar: retorna os tenant_ids em que o usuário é membro
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Função auxiliar: retorna os tenant_ids em que o usuário é admin
CREATE OR REPLACE FUNCTION public.get_user_admin_tenant_ids()
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.tenant_memberships 
  WHERE user_id = auth.uid() AND role = 'tenant_admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Recriar política de tenant_memberships (SEM recursão)
DROP POLICY IF EXISTS "Tenant Read" ON public.tenant_memberships;
CREATE POLICY "Tenant Read" ON public.tenant_memberships FOR SELECT USING (
  tenant_id IN (SELECT public.get_user_tenant_ids())
  OR public.is_platform_admin()
);
