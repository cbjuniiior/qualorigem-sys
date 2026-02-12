-- =====================================================
-- APLICAR TODOS OS FIXES MULTI-TENANT
-- =====================================================
-- Execute este script no SQL Editor do Supabase para
-- corrigir problemas de personalização e salvamento.
-- =====================================================

-- 1. CONSTRAINT em system_configurations (permite config por tenant)
ALTER TABLE public.system_configurations 
  DROP CONSTRAINT IF EXISTS system_configurations_config_key_key;

ALTER TABLE public.system_configurations 
  DROP CONSTRAINT IF EXISTS system_configurations_tenant_config_key_unique;

ALTER TABLE public.system_configurations 
  ADD CONSTRAINT system_configurations_tenant_config_key_unique 
  UNIQUE (tenant_id, config_key);

-- 2. Tenant Admin pode atualizar branding do próprio tenant
DROP POLICY IF EXISTS "Tenant Admin Update Own" ON public.tenants;
CREATE POLICY "Tenant Admin Update Own" ON public.tenants 
FOR UPDATE USING (
  id IN (SELECT public.get_user_admin_tenant_ids())
);
