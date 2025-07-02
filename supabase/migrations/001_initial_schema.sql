-- Remover as tabelas específicas de café e criar versões genéricas
DROP TABLE IF EXISTS public.coffee_lots CASCADE;
DROP TABLE IF EXISTS public.coffee_producers CASCADE;

-- Criar tabela genérica de produtores
CREATE TABLE public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_number TEXT, -- CPF/CNPJ
  phone TEXT,
  email TEXT,
  property_name TEXT NOT NULL,
  property_description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  altitude INTEGER,
  average_temperature DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela genérica de produtos/lotes
CREATE TABLE public.product_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- Código do lote para busca
  name TEXT NOT NULL,
  category TEXT, -- Ex: "Café", "Vinho", "Queijo", etc.
  variety TEXT, -- Variedade do produto
  harvest_year TEXT,
  quantity DECIMAL(10,2),
  unit TEXT, -- Kg, L, unidades, etc.
  image_url TEXT,
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  
  -- Análise sensorial genérica
  fragrance_score DECIMAL(3,1) CHECK (fragrance_score >= 0 AND fragrance_score <= 10),
  flavor_score DECIMAL(3,1) CHECK (flavor_score >= 0 AND flavor_score <= 10),
  finish_score DECIMAL(3,1) CHECK (finish_score >= 0 AND finish_score <= 10),
  acidity_score DECIMAL(3,1) CHECK (acidity_score >= 0 AND acidity_score <= 10),
  body_score DECIMAL(3,1) CHECK (body_score >= 0 AND body_score <= 10),
  sensory_notes TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;

-- Políticas para produtores (públicas para leitura, autenticadas para escrita)
CREATE POLICY "Anyone can view producers" 
  ON public.producers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert producers" 
  ON public.producers FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update producers" 
  ON public.producers FOR UPDATE 
  TO authenticated 
  USING (true);

-- Políticas para lotes de produtos (públicas para leitura, autenticadas para escrita)
CREATE POLICY "Anyone can view product lots" 
  ON public.product_lots FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert product lots" 
  ON public.product_lots FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product lots" 
  ON public.product_lots FOR UPDATE 
  TO authenticated 
  USING (true);

-- Índices para melhor performance
CREATE INDEX idx_product_lots_code ON public.product_lots(code);
CREATE INDEX idx_product_lots_producer ON public.product_lots(producer_id);
CREATE INDEX idx_product_lots_category ON public.product_lots(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_producers_updated_at 
  BEFORE UPDATE ON public.producers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_lots_updated_at 
  BEFORE UPDATE ON public.product_lots 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 