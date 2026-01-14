-- Criar tabela de indústrias
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    document_number TEXT, -- CNPJ
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para indústrias
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de indústrias" ON public.industries
    FOR SELECT USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados" ON public.industries
    FOR ALL USING (auth.role() = 'authenticated');

-- Adicionar vínculos ao lote de produtos
ALTER TABLE public.product_lots 
ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES public.industries(id),
ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id),
ADD COLUMN IF NOT EXISTS sensory_type TEXT DEFAULT 'nota'; -- 'nota' (café) ou 'caracteristica' (erva-mate)

-- Trigger para updated_at em indústrias
CREATE TRIGGER set_updated_at_industries
    BEFORE UPDATE ON public.industries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
