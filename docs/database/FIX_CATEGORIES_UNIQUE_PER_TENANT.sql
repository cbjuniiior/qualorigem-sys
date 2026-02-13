-- =====================================================
-- FIX: UNIQUE por tenant em categories, characteristics e sensory_attributes
-- =====================================================
-- Problema: name era UNIQUE globalmente - apenas um "Café" no banco inteiro.
--           Ao criar categoria com nome já existente (em outro tenant ou duplicado) retorna 409.
-- Solução: UNIQUE(tenant_id, name) para cada tenant poder ter suas próprias categorias.
--
-- Se DROP falhar (constraint com outro nome), liste com:
--   SELECT conname FROM pg_constraint WHERE conrelid = 'public.categories'::regclass AND contype = 'u';
-- =====================================================

-- 1. CATEGORIES (idempotente: pode rodar de novo sem erro)
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_tenant_name_unique;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_tenant_name_unique UNIQUE (tenant_id, name);

-- 2. CHARACTERISTICS
ALTER TABLE public.characteristics DROP CONSTRAINT IF EXISTS characteristics_name_key;
ALTER TABLE public.characteristics DROP CONSTRAINT IF EXISTS characteristics_tenant_name_unique;
ALTER TABLE public.characteristics
  ADD CONSTRAINT characteristics_tenant_name_unique UNIQUE (tenant_id, name);

-- 3. SENSORY_ATTRIBUTES
ALTER TABLE public.sensory_attributes DROP CONSTRAINT IF EXISTS sensory_attributes_name_key;
ALTER TABLE public.sensory_attributes DROP CONSTRAINT IF EXISTS sensory_attributes_tenant_name_unique;
ALTER TABLE public.sensory_attributes
  ADD CONSTRAINT sensory_attributes_tenant_name_unique UNIQUE (tenant_id, name);
