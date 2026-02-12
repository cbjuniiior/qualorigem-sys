-- =====================================================
-- FIX: Constraint UNIQUE em system_configurations
-- =====================================================
-- Problema: config_key era UNIQUE globalmente - apenas um tenant
--           podia ter cada configuração. Multi-tenant exige
--           (tenant_id, config_key) único.
-- Solução: Trocar constraint para UNIQUE(tenant_id, config_key)
-- =====================================================

-- 1. Remover constraint antiga (config_key UNIQUE)
ALTER TABLE public.system_configurations 
  DROP CONSTRAINT IF EXISTS system_configurations_config_key_key;

-- 2. Adicionar constraint composta para multi-tenant
ALTER TABLE public.system_configurations 
  ADD CONSTRAINT system_configurations_tenant_config_key_unique 
  UNIQUE (tenant_id, config_key);
