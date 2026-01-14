-- Criar tabela de marcas
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

-- Adicionar marca ao lote de produto
ALTER TABLE public.product_lots ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Adicionar configurações de prefixo ao produtor
ALTER TABLE public.producers ADD COLUMN lot_prefix_mode TEXT DEFAULT 'auto' CHECK (lot_prefix_mode IN ('auto', 'manual'));
ALTER TABLE public.producers ADD COLUMN custom_prefix TEXT;

-- Habilitar RLS para marcas
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Políticas para marcas
CREATE POLICY "Anyone can view brands" 
  ON public.brands FOR SELECT 
  USING (true);

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

-- Trigger para updated_at em brands
CREATE TRIGGER update_brands_updated_at 
  BEFORE UPDATE ON public.brands 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
