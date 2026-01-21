-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - VIVA RASTREA
-- Sistema de Rastreabilidade para Produtos com IG
-- =====================================================
-- Gerado em: 2026-01-21
-- Projeto: SysRastreabilidade (giomnnxpgjrpwyjrkkwr)
-- Região: sa-east-1 (São Paulo, Brasil)
-- PostgreSQL: 17.6.1.008
-- =====================================================

-- =====================================================
-- EXTENSÕES
-- =====================================================

-- Habilitar extensão para UUID (caso não esteja habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STORAGE BUCKETS (Supabase Storage)
-- =====================================================

-- Criar bucket para imagens de propriedades e lotes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'propriedades',
    'propriedades',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para logos e branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'branding',
    'branding',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS DE STORAGE (RLS para Buckets)
-- =====================================================

-- Política: Qualquer pessoa pode visualizar arquivos públicos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('propriedades', 'branding'));

-- Política: Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('propriedades', 'branding'));

-- Política: Usuários autenticados podem atualizar seus arquivos
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('propriedades', 'branding'));

-- Política: Usuários autenticados podem deletar arquivos
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('propriedades', 'branding'));

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Função alternativa para updated_at (compatibilidade)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar visualizações de lotes
CREATE OR REPLACE FUNCTION public.increment_lot_views(lot_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE product_lots 
    SET views = views + 1 
    WHERE code = lot_code;
END;
$$;

-- =====================================================
-- TABELA: producers (Produtores)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.producers (
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
    average_temperature NUMERIC(4,2),
    cep VARCHAR,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photos TEXT[],
    use_coordinates BOOLEAN,
    lot_prefix_mode TEXT DEFAULT 'auto' CHECK (lot_prefix_mode IN ('auto', 'manual')),
    custom_prefix TEXT,
    profile_picture_url TEXT,
    address_internal_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: associations (Associações)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: brands (Marcas)
-- =====================================================

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

-- =====================================================
-- TABELA: industries (Indústrias)
-- =====================================================

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

-- =====================================================
-- TABELA: categories (Categorias de Produtos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: characteristics (Características)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: sensory_attributes (Atributos Sensoriais)
-- =====================================================

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

-- =====================================================
-- TABELA: product_lots (Lotes de Produtos)
-- =====================================================

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
    
    -- Análise sensorial (campos legados - mantidos para compatibilidade)
    fragrance_score NUMERIC(3,1) CHECK (fragrance_score >= 0 AND fragrance_score <= 10),
    flavor_score NUMERIC(3,1) CHECK (flavor_score >= 0 AND flavor_score <= 10),
    finish_score NUMERIC(3,1) CHECK (finish_score >= 0 AND finish_score <= 10),
    acidity_score NUMERIC(3,1) CHECK (acidity_score >= 0 AND acidity_score <= 10),
    body_score NUMERIC(3,1) CHECK (body_score >= 0 AND body_score <= 10),
    sensory_notes TEXT,
    
    -- Campos adicionais
    views INTEGER NOT NULL DEFAULT 0,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES public.industries(id),
    association_id UUID REFERENCES public.associations(id),
    sensory_type TEXT DEFAULT 'nota',
    
    -- Geolocalização e propriedade (campos movidos do produtor)
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
    
    -- Vídeo
    video_description TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: lot_components (Componentes de Blend)
-- =====================================================

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
    
    -- Relacionamentos
    producer_id UUID REFERENCES public.producers(id) ON DELETE SET NULL,
    association_id UUID REFERENCES public.associations(id) ON DELETE SET NULL,
    
    -- Geolocalização do componente
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
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: product_lot_characteristics (Características dos Lotes)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_lot_characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    characteristic_id UUID REFERENCES public.characteristics(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: product_lot_sensory (Análise Sensorial dos Lotes)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_lot_sensory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    sensory_attribute_id UUID REFERENCES public.sensory_attributes(id) ON DELETE CASCADE,
    value NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: seal_controls (Controle de Selos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seal_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
    seal_number_start INTEGER,
    seal_number_end INTEGER,
    quantity INTEGER,
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: system_configurations (Configurações do Sistema)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: producers_associations (Relação Produtores-Associações)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.producers_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
    association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producer_id, association_id)
);

-- =====================================================
-- TABELA: tasks (Sistema de Tarefas)
-- =====================================================

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

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para product_lots
CREATE INDEX IF NOT EXISTS idx_product_lots_code ON public.product_lots(code);
CREATE INDEX IF NOT EXISTS idx_product_lots_producer ON public.product_lots(producer_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_category ON public.product_lots(category);
CREATE INDEX IF NOT EXISTS idx_product_lots_brand ON public.product_lots(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_industry ON public.product_lots(industry_id);
CREATE INDEX IF NOT EXISTS idx_product_lots_association ON public.product_lots(association_id);

-- Índices para lot_components
CREATE INDEX IF NOT EXISTS idx_lot_components_lot ON public.lot_components(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_components_producer ON public.lot_components(producer_id);
CREATE INDEX IF NOT EXISTS idx_lot_components_association ON public.lot_components(association_id);

-- Índices para brands
CREATE INDEX IF NOT EXISTS idx_brands_producer ON public.brands(producer_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);

-- Índices para seal_controls
CREATE INDEX IF NOT EXISTS idx_seal_controls_lot ON public.seal_controls(lot_id);
CREATE INDEX IF NOT EXISTS idx_seal_controls_producer ON public.seal_controls(producer_id);

-- Índices para características e análise sensorial
CREATE INDEX IF NOT EXISTS idx_lot_characteristics_lot ON public.product_lot_characteristics(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_sensory_lot ON public.product_lot_sensory(lot_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Producers
CREATE TRIGGER update_producers_updated_at 
    BEFORE UPDATE ON public.producers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Product Lots
CREATE TRIGGER update_product_lots_updated_at 
    BEFORE UPDATE ON public.product_lots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Brands
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON public.brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Lot Components
CREATE TRIGGER update_lot_components_updated_at 
    BEFORE UPDATE ON public.lot_components 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Categories
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Characteristics
CREATE TRIGGER update_characteristics_updated_at 
    BEFORE UPDATE ON public.characteristics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sensory Attributes
CREATE TRIGGER update_sensory_attributes_updated_at 
    BEFORE UPDATE ON public.sensory_attributes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seal Controls
CREATE TRIGGER update_seal_controls_updated_at 
    BEFORE UPDATE ON public.seal_controls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- System Configurations
CREATE TRIGGER update_system_configurations_updated_at 
    BEFORE UPDATE ON public.system_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Industries
CREATE TRIGGER update_industries_updated_at 
    BEFORE UPDATE ON public.industries 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Associations
CREATE TRIGGER update_associations_updated_at 
    BEFORE UPDATE ON public.associations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tasks
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seal_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_sensory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS - LEITURA PÚBLICA
-- =====================================================

-- Producers
CREATE POLICY "Anyone can view producers" 
    ON public.producers FOR SELECT 
    USING (true);

-- Product Lots
CREATE POLICY "Anyone can view product lots" 
    ON public.product_lots FOR SELECT 
    USING (true);

-- Brands
CREATE POLICY "Anyone can view brands" 
    ON public.brands FOR SELECT 
    USING (true);

-- Lot Components
CREATE POLICY "Anyone can view lot components" 
    ON public.lot_components FOR SELECT 
    USING (true);

-- Categories
CREATE POLICY "Anyone can view categories" 
    ON public.categories FOR SELECT 
    USING (true);

-- Characteristics
CREATE POLICY "Anyone can view characteristics" 
    ON public.characteristics FOR SELECT 
    USING (true);

-- Product Lot Characteristics
CREATE POLICY "Anyone can view lot characteristics" 
    ON public.product_lot_characteristics FOR SELECT 
    USING (true);

-- Sensory Attributes
CREATE POLICY "Anyone can view sensory attributes" 
    ON public.sensory_attributes FOR SELECT 
    USING (true);

-- Product Lot Sensory
CREATE POLICY "Anyone can view lot sensory analysis" 
    ON public.product_lot_sensory FOR SELECT 
    USING (true);

-- Industries
CREATE POLICY "Anyone can view industries" 
    ON public.industries FOR SELECT 
    USING (true);

-- Associations
CREATE POLICY "Anyone can view associations" 
    ON public.associations FOR SELECT 
    USING (true);

-- =====================================================
-- POLÍTICAS RLS - ESCRITA AUTENTICADA
-- =====================================================

-- Producers
CREATE POLICY "Authenticated users can insert producers" 
    ON public.producers FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update producers" 
    ON public.producers FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can delete producers" 
    ON public.producers FOR DELETE 
    TO authenticated 
    USING (true);

-- Product Lots
CREATE POLICY "Authenticated users can insert product lots" 
    ON public.product_lots FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update product lots" 
    ON public.product_lots FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can delete product lots" 
    ON public.product_lots FOR DELETE 
    TO authenticated 
    USING (true);

-- Brands
CREATE POLICY "Authenticated users can insert brands" 
    ON public.brands FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update brands" 
    ON public.brands FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can delete brands" 
    ON public.brands FOR DELETE 
    TO authenticated 
    USING (true);

-- Lot Components
CREATE POLICY "Authenticated users can insert lot components" 
    ON public.lot_components FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update lot components" 
    ON public.lot_components FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can delete lot components" 
    ON public.lot_components FOR DELETE 
    TO authenticated 
    USING (true);

-- Categories
CREATE POLICY "Authenticated users can manage categories" 
    ON public.categories FOR ALL 
    TO authenticated 
    USING (true);

-- Characteristics
CREATE POLICY "Authenticated users can manage characteristics" 
    ON public.characteristics FOR ALL 
    TO authenticated 
    USING (true);

-- Product Lot Characteristics
CREATE POLICY "Authenticated users can manage lot characteristics" 
    ON public.product_lot_characteristics FOR ALL 
    TO authenticated 
    USING (true);

-- Sensory Attributes
CREATE POLICY "Authenticated users can manage sensory attributes" 
    ON public.sensory_attributes FOR ALL 
    TO authenticated 
    USING (true);

-- Product Lot Sensory
CREATE POLICY "Authenticated users can manage lot sensory analysis" 
    ON public.product_lot_sensory FOR ALL 
    TO authenticated 
    USING (true);

-- Industries
CREATE POLICY "Authenticated users can manage industries" 
    ON public.industries FOR ALL 
    TO authenticated 
    USING (true);

-- Associations
CREATE POLICY "Authenticated users can manage associations" 
    ON public.associations FOR ALL 
    TO authenticated 
    USING (true);

-- Seal Controls
CREATE POLICY "Authenticated users can manage seal controls" 
    ON public.seal_controls FOR ALL 
    TO authenticated 
    USING (true);

-- System Configurations
CREATE POLICY "Authenticated users can manage system configurations" 
    ON public.system_configurations FOR ALL 
    TO authenticated 
    USING (true);

-- Tasks
CREATE POLICY "Authenticated users can manage tasks" 
    ON public.tasks FOR ALL 
    TO authenticated 
    USING (true);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir categorias padrão
INSERT INTO public.categories (name, description) 
VALUES 
    ('Café', 'Produtos de café com indicação geográfica'),
    ('Erva-Mate', 'Produtos de erva-mate'),
    ('Cacau', 'Produtos de cacau'),
    ('Açaí', 'Produtos de açaí'),
    ('Outros', 'Outras categorias de produtos')
ON CONFLICT (name) DO NOTHING;

-- Inserir características padrão
INSERT INTO public.characteristics (name, description) 
VALUES 
    ('Variedade', 'Variedade do produto'),
    ('Processamento', 'Tipo de processamento'),
    ('Torra', 'Nível de torra (para café)'),
    ('Peneira', 'Classificação por peneira'),
    ('Altitude', 'Altitude de cultivo')
ON CONFLICT (name) DO NOTHING;

-- Inserir atributos sensoriais padrão
INSERT INTO public.sensory_attributes (name, description, type, show_radar, show_average) 
VALUES 
    ('Fragrância', 'Aroma do produto', 'quantitative', true, true),
    ('Sabor', 'Sabor predominante', 'quantitative', true, true),
    ('Finalização', 'Finalização/retrogosto', 'quantitative', true, true),
    ('Acidez', 'Nível de acidez', 'quantitative', true, true),
    ('Corpo', 'Corpo/textura', 'quantitative', true, true),
    ('Doçura', 'Nível de doçura', 'qualitative', false, false),
    ('Amargor', 'Nível de amargor', 'qualitative', false, false)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE public.producers IS 'Tabela de produtores cadastrados no sistema';
COMMENT ON TABLE public.product_lots IS 'Tabela de lotes de produtos rastreáveis';
COMMENT ON TABLE public.lot_components IS 'Componentes de blend para lotes compostos';
COMMENT ON TABLE public.brands IS 'Marcas dos produtores';
COMMENT ON TABLE public.industries IS 'Indústrias parceiras';
COMMENT ON TABLE public.associations IS 'Associações de produtores';
COMMENT ON TABLE public.categories IS 'Categorias de produtos';
COMMENT ON TABLE public.characteristics IS 'Características dos produtos';
COMMENT ON TABLE public.sensory_attributes IS 'Atributos para análise sensorial';
COMMENT ON TABLE public.seal_controls IS 'Controle de selos de rastreabilidade';
COMMENT ON TABLE public.system_configurations IS 'Configurações gerais do sistema';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Para verificar se tudo foi criado corretamente, execute:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
