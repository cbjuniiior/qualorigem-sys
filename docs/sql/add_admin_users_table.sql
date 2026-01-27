-- =====================================================
-- SOLUÇÃO ALTERNATIVA PARA GESTÃO DE USUÁRIOS
-- Para Supabase Self-Hosted sem Edge Functions
-- =====================================================
-- Execute este script no SQL Editor do seu Supabase
-- =====================================================

-- 1. CRIAR TABELA DE PERFIS DE USUÁRIOS
-- Esta tabela armazena metadados dos usuários autenticados
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HABILITAR RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURANÇA
-- Todos podem ler (para listar usuários)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" 
    ON public.user_profiles FOR SELECT 
    USING (true);

-- Usuários autenticados podem inserir/atualizar
DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can manage profiles" 
    ON public.user_profiles FOR ALL 
    TO authenticated 
    USING (true);

-- 4. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO AO REGISTRAR USUÁRIO
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

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. SINCRONIZAR USUÁRIOS EXISTENTES
-- Este comando copia todos os usuários já existentes para a tabela user_profiles
INSERT INTO public.user_profiles (id, email, full_name, created_at)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name',
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. TRIGGER PARA ATUALIZAR updated_at
CREATE TRIGGER tr_updated_at_user_profiles 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- APÓS EXECUTAR ESTE SCRIPT:
-- 1. Faça reload do schema: NOTIFY pgrst, 'reload schema';
-- 2. Faça deploy da aplicação novamente
-- =====================================================

-- Executar reload do schema automaticamente
NOTIFY pgrst, 'reload schema';
