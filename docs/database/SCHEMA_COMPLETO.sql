-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - QUALORIGEM-SYS
-- =====================================================
-- Sistema de Rastreabilidade para Produtos com IG
-- Versão: 1.0.0
-- Data: Janeiro 2026
-- PostgreSQL: 17+
-- =====================================================

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 1. Acesse o SQL Editor do Supabase
-- 2. Cole este script completo
-- 3. Execute (pode demorar alguns segundos)
-- 4. Verifique se não houve erros
-- 5. Execute NOTIFY pgrst, 'reload schema';
-- =====================================================

-- =====================================================
-- LIMPEZA COMPLETA (OPCIONAL - RESET TOTAL)
-- =====================================================
-- ATENÇÃO: Descomente esta seção apenas se quiser
-- apagar TODOS os dados existentes!
-- =====================================================

/*
-- Apagar políticas de storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Limpar buckets de storage
DELETE FROM storage.buckets WHERE id IN ('propriedades', 'branding');

-- Apagar TODAS as tabelas do schema public
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.producers_associations CASCADE;
DROP TABLE IF EXISTS public.system_configurations CASCADE;
DROP TABLE IF EXISTS public.seal_controls CASCADE;
DROP TABLE IF EXISTS public.product_lot_sensory CASCADE;
DROP TABLE IF EXISTS public.product_lot_characteristics CASCADE;
DROP TABLE IF EXISTS public.lot_components CASCADE;
DROP TABLE IF EXISTS public.product_lots CASCADE;
DROP TABLE IF EXISTS public.sensory_attributes CASCADE;
DROP TABLE IF EXISTS public.characteristics CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.industries CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.associations CASCADE;
DROP TABLE IF EXISTS public.producers CASCADE;

-- Apagar funções
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.increment_lot_views CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Apagar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
*/

-- =====================================================
-- EXTENSÕES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('propriedades', 'propriedades', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
    ('branding', 'branding', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('propriedades', 'branding'));

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('propriedades', 'branding'));

DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('propriedades', 'branding'));

DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('propriedades', 'branding'));

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Alias para compatibilidade
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar visualizações do lote
CREATE OR REPLACE FUNCTION public.increment_lot_views(lot_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE product_lots SET views = views + 1 WHERE code = lot_code;
END;
$$;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- -------------------------------------------------
-- 1. PRODUTORES
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.producers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document_number TEXT,
    phone TEXT,
    email TEXT,
    property_name TEXT,
    property_description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    cep TEXT,
    altitude INTEGER,
    average_temperature NUMERIC,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photos TEXT[] DEFAULT '{}',
    use_coordinates BOOLEAN DEFAULT FALSE,
    lot_prefix_mode TEXT DEFAULT 'auto',
    custom_prefix TEXT,
    profile_picture_url TEXT,
    address_internal_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 2. ASSOCIAÇÕES / COOPERATIVAS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    logo_url TEXT,
    contact_info JSONB DEFAULT '{}',
    city TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 3. MARCAS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producer_id, slug)
);

-- -------------------------------------------------
-- 4. INDÚSTRIAS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 5. CATEGORIAS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 6. CARACTERÍSTICAS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 7. ATRIBUTOS SENSORIAIS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sensory_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('quantitative', 'qualitative')),
    show_radar BOOLEAN DEFAULT TRUE,
    show_average BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 8. LOTES DE PRODUTOS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    variety TEXT,
    harvest_year TEXT,
    quantity NUMERIC(10,2),
    unit TEXT,
    image_url TEXT,
    producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
    
    -- Análise sensorial legada (para compatibilidade)
    fragrance_score NUMERIC(3,1) CHECK (fragrance_score >= 0 AND fragrance_score <= 10),
    flavor_score NUMERIC(3,1) CHECK (flavor_score >= 0 AND flavor_score <= 10),
    finish_score NUMERIC(3,1) CHECK (finish_score >= 0 AND finish_score <= 10),
    acidity_score NUMERIC(3,1) CHECK (acidity_score >= 0 AND acidity_score <= 10),
    body_score NUMERIC(3,1) CHECK (body_score >= 0 AND body_score <= 10),
    sensory_notes TEXT,
    
    -- Vínculos
    views INTEGER NOT NULL DEFAULT 0,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
    association_id UUID REFERENCES public.associations(id) ON DELETE SET NULL,
    sensory_type TEXT DEFAULT 'nota',
    
    -- Localização do lote
    latitude NUMERIC,
    longitude NUMERIC,
    altitude INTEGER,
    average_temperature NUMERIC,
    property_name TEXT,
    property_description TEXT,
    photos TEXT[] DEFAULT '{}',
    address TEXT,
    city TEXT,
    state TEXT,
    cep TEXT,
    address_internal_only BOOLEAN DEFAULT FALSE,
    
    -- Vídeo e Controle
    lot_observations TEXT,
    seals_quantity INTEGER,
    video_delay_seconds INTEGER DEFAULT 3,
    video_description TEXT,
    youtube_video_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 9. COMPONENTES DE BLEND
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lot_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    component_variety TEXT,
    component_percentage NUMERIC,
    component_quantity NUMERIC,
    component_unit TEXT,
    component_origin TEXT,
    component_harvest_year TEXT,
    producer_id UUID REFERENCES public.producers(id) ON DELETE SET NULL,
    association_id UUID REFERENCES public.associations(id) ON DELETE SET NULL,
    
    latitude NUMERIC,
    longitude NUMERIC,
    altitude INTEGER,
    property_name TEXT,
    property_description TEXT,
    photos TEXT[] DEFAULT '{}',
    address TEXT,
    city TEXT,
    state TEXT,
    cep TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 10. CARACTERÍSTICAS DO LOTE
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_lot_characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    characteristic_id UUID REFERENCES public.characteristics(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 11. ANÁLISE SENSORIAL DO LOTE
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_lot_sensory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    sensory_attribute_id UUID REFERENCES public.sensory_attributes(id) ON DELETE CASCADE,
    value NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 12. CONTROLE DE SELOS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seal_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
    seal_type TEXT NOT NULL,
    package_size NUMERIC NOT NULL,
    package_unit TEXT NOT NULL,
    total_packages INTEGER NOT NULL,
    total_seals_generated INTEGER NOT NULL,
    notes TEXT,
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 13. VÍNCULO PRODUTORES <-> ASSOCIAÇÕES (M:N)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.producers_associations (
    producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
    association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
    since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT,
    PRIMARY KEY (producer_id, association_id)
);

-- -------------------------------------------------
-- 14. CONFIGURAÇÕES DO SISTEMA
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 15. TAREFAS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    assigned_to UUID,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------
-- 16. PERFIS DE USUÁRIOS (ADMIN)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_lots_code ON public.product_lots(code);
CREATE INDEX IF NOT EXISTS idx_product_lots_producer ON public.product_lots(producer_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_category ON public.product_lots(category);
CREATE INDEX IF NOT EXISTS idx_brands_producer ON public.brands(producer_id);
CREATE INDEX IF NOT EXISTS idx_lot_components_lot ON public.lot_components(lot_id);
CREATE INDEX IF NOT EXISTS idx_product_lot_characteristics_lot ON public.product_lot_characteristics(lot_id);
CREATE INDEX IF NOT EXISTS idx_product_lot_sensory_lot ON public.product_lot_sensory(lot_id);
CREATE INDEX IF NOT EXISTS idx_seal_controls_lot ON public.seal_controls(lot_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_sensory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seal_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producers_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas padrão para todas as tabelas
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
        -- Política de leitura pública
        EXECUTE format('DROP POLICY IF EXISTS "Public Select" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Public Select" ON public.%I FOR SELECT USING (true)', t);
        
        -- Política de escrita para autenticados
        EXECUTE format('DROP POLICY IF EXISTS "Auth All" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Auth All" ON public.%I FOR ALL TO authenticated USING (true)', t);
    END LOOP;
END $$;

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Criar triggers para todas as tabelas com updated_at
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name NOT IN ('product_lot_characteristics', 'product_lot_sensory', 'producers_associations') 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_updated_at_%I ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER tr_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- =====================================================
-- TRIGGER PARA SINCRONIZAR USUÁRIOS
-- =====================================================

-- Função para criar perfil quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SINCRONIZAR USUÁRIOS EXISTENTES
-- =====================================================

INSERT INTO public.user_profiles (id, email, full_name, created_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Categorias padrão
INSERT INTO public.categories (name, description) VALUES 
    ('Café', 'Café especial com indicação geográfica'),
    ('Erva-Mate', 'Erva-mate com indicação geográfica'),
    ('Cacau', 'Cacau e chocolate com indicação geográfica'),
    ('Açaí', 'Açaí com indicação geográfica'),
    ('Outros', 'Outros produtos com indicação geográfica')
ON CONFLICT (name) DO NOTHING;

-- Características padrão
INSERT INTO public.characteristics (name, description) VALUES 
    ('Variedade', 'Variedade do produto'),
    ('Processamento', 'Método de processamento'),
    ('Torra', 'Nível de torra (para café)'),
    ('Peneira', 'Classificação por peneira'),
    ('Altitude', 'Faixa de altitude do cultivo')
ON CONFLICT (name) DO NOTHING;

-- Atributos sensoriais padrão
INSERT INTO public.sensory_attributes (name, type, show_radar, show_average, description) VALUES 
    ('Fragrância', 'quantitative', true, true, 'Aroma do produto seco'),
    ('Sabor', 'quantitative', true, true, 'Notas de sabor'),
    ('Finalização', 'quantitative', true, true, 'Persistência e limpeza'),
    ('Acidez', 'quantitative', true, true, 'Intensidade e qualidade da acidez'),
    ('Corpo', 'quantitative', true, true, 'Sensação tátil na boca'),
    ('Doçura', 'qualitative', false, false, 'Percepção de doçura'),
    ('Amargor', 'qualitative', false, false, 'Percepção de amargor')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- RECARREGAR SCHEMA DO POSTGREST
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Execute esta query para verificar as tabelas criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Deve retornar 16 tabelas:
-- associations, brands, categories, characteristics, industries,
-- lot_components, producers, producers_associations, product_lot_characteristics,
-- product_lot_sensory, product_lots, seal_controls, sensory_attributes,
-- system_configurations, tasks, user_profiles

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
