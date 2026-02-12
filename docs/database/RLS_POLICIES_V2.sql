-- =====================================================
-- RLS POLICIES V2 - SEGURANÇA MULTI-TENANT
-- =====================================================
-- Data: Fevereiro 2026
-- Descrição: Define as políticas de segurança (RLS) para todas
-- as tabelas, garantindo isolamento entre tenants.
-- =====================================================

-- NOTA: Execute este script APÓS o MIGRATION_V2_MULTITENANT.sql

-- =====================================================
-- 0. FUNÇÕES AUXILIARES (evitam recursão nas policies)
-- =====================================================
-- Políticas que fazem SELECT em tenant_memberships causam recursão infinita.
-- Essas funções SECURITY DEFINER leem tenant_memberships sem aplicar RLS.

CREATE OR REPLACE FUNCTION public.get_user_tenant_ids()
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.tenant_memberships WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_admin_tenant_ids()
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.tenant_memberships 
  WHERE user_id = auth.uid() AND role = 'tenant_admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- 1. POLICIES PARA TABELAS ESTRUTURAIS
-- =====================================================

-- TENANTS
DROP POLICY IF EXISTS "Public Read" ON public.tenants;
CREATE POLICY "Public Read" ON public.tenants FOR SELECT USING (true); -- Necessário para resolver slug na URL

DROP POLICY IF EXISTS "Admin Manage" ON public.tenants;
CREATE POLICY "Admin Manage" ON public.tenants FOR ALL USING (public.is_platform_admin());

-- TENANT_MODULES
DROP POLICY IF EXISTS "Public Read" ON public.tenant_modules;
CREATE POLICY "Public Read" ON public.tenant_modules FOR SELECT USING (true); -- Necessário para carregar features

DROP POLICY IF EXISTS "Admin Manage" ON public.tenant_modules;
CREATE POLICY "Admin Manage" ON public.tenant_modules FOR ALL USING (public.is_platform_admin());

-- TENANT_MEMBERSHIPS (usa get_user_tenant_ids para evitar recursão)
DROP POLICY IF EXISTS "Tenant Read" ON public.tenant_memberships;
CREATE POLICY "Tenant Read" ON public.tenant_memberships FOR SELECT USING (
  tenant_id IN (SELECT public.get_user_tenant_ids())
  OR public.is_platform_admin()
);

DROP POLICY IF EXISTS "Admin Manage" ON public.tenant_memberships;
CREATE POLICY "Admin Manage" ON public.tenant_memberships FOR ALL USING (
  -- Apenas Platform Admin ou Tenant Admin do próprio tenant pode gerenciar membros
  public.is_platform_admin() OR 
  public.has_tenant_role(tenant_id, ARRAY['tenant_admin'])
);

-- =====================================================
-- 2. POLICIES PARA TABELAS DE DOMÍNIO (PADRÃO)
-- =====================================================
-- Tabelas que seguem a regra:
-- SELECT: Membro do tenant OU Platform Admin
-- INSERT/UPDATE/DELETE: Tenant Admin OU Platform Admin

DO $$
DECLARE
    t text;
    -- Lista de tabelas padrão (exclui product_lots que tem regra especial)
    tables text[] := ARRAY[
        'producers', 'associations', 'brands', 'industries',
        'lot_components', 'seal_controls', 
        'product_lot_characteristics', 'product_lot_sensory',
        'categories', 'characteristics', 'sensory_attributes',
        'system_configurations', 'tasks', 'producers_associations',
        'user_profiles'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Limpar policies antigas
        EXECUTE format('DROP POLICY IF EXISTS "Public Select" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Auth All" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Read" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant Write" ON public.%I', t);

        -- Policy de Leitura (usa funções para evitar recursão em tenant_memberships)
        EXECUTE format('
            CREATE POLICY "Tenant Read" ON public.%I
            FOR SELECT USING (
                tenant_id IN (SELECT public.get_user_tenant_ids())
                OR public.is_platform_admin()
            )', t);

        -- Policy de Escrita (Tenant Admin ou Platform Admin)
        EXECUTE format('
            CREATE POLICY "Tenant Write" ON public.%I
            FOR ALL USING (
                tenant_id IN (SELECT public.get_user_admin_tenant_ids())
                OR public.is_platform_admin()
            )', t);
    END LOOP;
END $$;

-- =====================================================
-- 3. POLICIES ESPECIAIS (PRODUCT_LOTS)
-- =====================================================
-- Lotes precisam ser públicos para leitura (QR Code), mas filtrados por tenant se necessário

DROP POLICY IF EXISTS "Public Select" ON public.product_lots;
DROP POLICY IF EXISTS "Auth All" ON public.product_lots;
DROP POLICY IF EXISTS "Public Read" ON public.product_lots;
DROP POLICY IF EXISTS "Tenant Write" ON public.product_lots;

-- Leitura Pública (Qualquer um pode ver lotes, o filtro acontece na query via tenant_id)
CREATE POLICY "Public Read" ON public.product_lots
FOR SELECT USING (true);

-- Escrita (Apenas Tenant Admin ou Platform Admin)
CREATE POLICY "Tenant Write" ON public.product_lots
FOR ALL USING (
  tenant_id IN (SELECT public.get_user_admin_tenant_ids())
  OR public.is_platform_admin()
);

-- =====================================================
-- 4. STORAGE POLICIES (ATUALIZAÇÃO)
-- =====================================================
-- As policies de storage também precisam ser revisadas para considerar o tenant,
-- mas como storage não tem coluna tenant_id direta (depende do path ou metadata),
-- manteremos as genéricas por enquanto, ou restringiremos uploads apenas para autenticados.

-- (Mantido do schema original, mas reforçando segurança)
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id IN ('propriedades', 'branding'));
