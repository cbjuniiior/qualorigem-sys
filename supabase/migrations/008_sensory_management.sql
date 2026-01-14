-- Criar tabela de atributos sensoriais
CREATE TABLE IF NOT EXISTS public.sensory_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('quantitative', 'qualitative')),
  show_radar BOOLEAN DEFAULT TRUE, -- Apenas para quantitativo
  show_average BOOLEAN DEFAULT TRUE, -- Apenas para quantitativo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de junção para análise sensorial do lote
CREATE TABLE IF NOT EXISTS public.product_lot_sensory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES public.product_lots(id) ON DELETE CASCADE,
  sensory_attribute_id UUID REFERENCES public.sensory_attributes(id) ON DELETE CASCADE,
  value DECIMAL(5,2) NOT NULL, -- Valor numérico (0-10 ou 0-100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.sensory_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lot_sensory ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Leitura)
CREATE POLICY "Anyone can view sensory attributes" ON public.sensory_attributes FOR SELECT USING (true);
CREATE POLICY "Anyone can view lot sensory analysis" ON public.product_lot_sensory FOR SELECT USING (true);

-- Políticas Autenticadas (Escrita)
CREATE POLICY "Authenticated users can manage sensory attributes" ON public.sensory_attributes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage lot sensory analysis" ON public.product_lot_sensory FOR ALL TO authenticated USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_sensory_attributes_updated_at 
  BEFORE UPDATE ON public.sensory_attributes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns atributos sensoriais iniciais (baseados em café como exemplo)
INSERT INTO public.sensory_attributes (name, type, show_radar, show_average) 
VALUES 
  ('Fragrância', 'quantitative', true, true),
  ('Sabor', 'quantitative', true, true),
  ('Finalização', 'quantitative', true, true),
  ('Acidez', 'quantitative', true, true),
  ('Corpo', 'quantitative', true, true),
  ('Doçura', 'qualitative', false, false),
  ('Amargor', 'qualitative', false, false)
ON CONFLICT (name) DO NOTHING;
