-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - VIVA RASTREA (V3)
-- Atualizado para bater 100% com o código da aplicação
-- =====================================================
-- Gerado em: 2026-01-21
-- PostgreSQL: 17.6
-- =====================================================

-- =====================================================
-- LIMPEZA TOTAL (RESET)
-- ATENÇÃO: Isso apagará TODOS os dados existentes!
-- =====================================================

-- Apagar políticas de storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Limpar buckets de storage
DELETE FROM storage.buckets WHERE id IN ('propriedades', 'branding');

-- Apagar TODAS as tabelas do schema public
DROP TABLE IF EXISTS public.tasks CASCADE;
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
DROP FUNCTION IF EXISTS public.generate_unique_lot_code CASCADE;

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
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('propriedades', 'branding'));
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('propriedades', 'branding'));
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('propriedades', 'branding'));
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('propriedades', 'branding'));

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_lot_views(lot_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE product_lots SET views = views + 1 WHERE code = lot_code;
END;
$$;

-- =====================================================
-- TABELAS
-- =====================================================

-- 1. PRODUTORES
CREATE TABLE public.producers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document_number TEXT,
    phone TEXT,
    email TEXT,
    property_name TEXT NOT NULL,
    property_description TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    altitude INTEGER,
    average_temperature NUMERIC,
    cep TEXT,
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

-- 2. ASSOCIAÇÕES
CREATE TABLE public.associations (
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

-- 3. MARCAS
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producer_id, slug)
);

-- 4. INDÚSTRIAS
CREATE TABLE public.industries (
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

-- 5. CATEGORIAS e CARACTERÍSTICAS
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.sensory_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    show_radar BOOLEAN DEFAULT TRUE,
    show_average BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. LOTES DE PRODUTOS
CREATE TABLE public.product_lots (
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
    
    -- Análise sensorial legada
    fragrance_score NUMERIC(3,1),
    flavor_score NUMERIC(3,1),
    finish_score NUMERIC(3,1),
    acidity_score NUMERIC(3,1),
    body_score NUMERIC(3,1),
    sensory_notes TEXT,
    
    -- Novos campos
    views INTEGER NOT NULL DEFAULT 0,
    brand_id UUID REFERENCES public.brands(id),
    industry_id UUID REFERENCES public.industries(id),
    association_id UUID REFERENCES public.associations(id),
    sensory_type TEXT DEFAULT 'nota',
    
    -- Localização
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

-- 7. COMPONENTES DE BLEND
CREATE TABLE public.lot_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    component_name TEXT NOT NULL,
    component_variety TEXT,
    component_percentage NUMERIC,
    component_quantity NUMERIC,
    component_unit TEXT,
    component_origin TEXT,
    component_harvest_year TEXT,
    producer_id UUID REFERENCES public.producers(id),
    association_id UUID REFERENCES public.associations(id),
    
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

-- 8. RELAÇÕES E CARACTERÍSTICAS
CREATE TABLE public.product_lot_characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    characteristic_id UUID REFERENCES public.characteristics(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.product_lot_sensory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    sensory_attribute_id UUID REFERENCES public.sensory_attributes(id) ON DELETE CASCADE,
    value NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CONTROLE DE SELOS (ATUALIZADO)
CREATE TABLE public.seal_controls (
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

-- 10. CONFIGURAÇÕES E VÍNCULOS
CREATE TABLE public.system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.producers_associations (
    producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
    association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
    since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT,
    PRIMARY KEY (producer_id, association_id)
);

-- 11. TAREFAS
CREATE TABLE public.tasks (
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

-- =====================================================
-- RLS - SEGURANÇA
-- =====================================================

DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Select" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Public Select" ON public.%I FOR SELECT USING (true)', t);
        EXECUTE format('DROP POLICY IF EXISTS "Auth All" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Auth All" ON public.%I FOR ALL TO authenticated USING (true)', t);
    END LOOP;
END $$;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

INSERT INTO public.categories (name) VALUES ('Café'), ('Erva-Mate'), ('Cacau'), ('Açaí'), ('Outros') ON CONFLICT DO NOTHING;
INSERT INTO public.characteristics (name) VALUES ('Variedade'), ('Processamento'), ('Torra'), ('Peneira'), ('Altitude') ON CONFLICT DO NOTHING;
INSERT INTO public.sensory_attributes (name, type) VALUES 
    ('Fragrância', 'quantitative'), ('Sabor', 'quantitative'), ('Finalização', 'quantitative'), 
    ('Acidez', 'quantitative'), ('Corpo', 'quantitative'), ('Doçura', 'qualitative'), ('Amargor', 'qualitative') 
ON CONFLICT DO NOTHING;

-- =====================================================
-- TRIGGERS
-- =====================================================

DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name != 'product_lot_characteristics' AND table_name != 'product_lot_sensory' AND table_name != 'producers_associations' LOOP
        EXECUTE format('CREATE TRIGGER tr_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- =====================================================
-- FIM
-- =====================================================
