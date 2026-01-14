-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de características (antiga variedade/tipo)
CREATE TABLE IF NOT EXISTS public.characteristics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de junção para características do lote
CREATE TABLE IF NOT EXISTS public.product_lot_characteristics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
  characteristic_id UUID REFERENCES public.characteristics(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_characteristics ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Leitura)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view characteristics" ON public.characteristics FOR SELECT USING (true);
CREATE POLICY "Anyone can view lot characteristics" ON public.product_lot_characteristics FOR SELECT USING (true);

-- Políticas Autenticadas (Escrita)
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage characteristics" ON public.characteristics FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage lot characteristics" ON public.product_lot_characteristics FOR ALL TO authenticated USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON public.categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characteristics_updated_at 
  BEFORE UPDATE ON public.characteristics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas categorias iniciais baseadas no que já temos
INSERT INTO public.categories (name) 
VALUES ('Café'), ('Erva-Mate'), ('Cacau'), ('Açaí'), ('Outros')
ON CONFLICT (name) DO NOTHING;

-- Inserir algumas características comuns
INSERT INTO public.characteristics (name) 
VALUES ('Variedade'), ('Processamento'), ('Torra'), ('Peneira'), ('Altitude')
ON CONFLICT (name) DO NOTHING;
