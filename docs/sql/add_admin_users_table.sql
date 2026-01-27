-- =====================================================
-- SETUP DE GESTÃO DE USUÁRIOS - SUPABASE SELF-HOSTED
-- =====================================================
-- Este script configura a gestão de usuários para
-- funcionar sem Edge Functions em Supabase self-hosted.
-- 
-- Execute este script no SQL Editor do Supabase.
-- =====================================================
-- Última atualização: Janeiro 2026
-- =====================================================

-- =====================================================
-- PASSO 1: CRIAR TABELA DE PERFIS DE USUÁRIOS
-- =====================================================
-- Esta tabela armazena metadados dos usuários do Auth
-- e permite gerenciá-los pelo painel administrativo.

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
-- PASSO 2: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 3: CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Política: Todos podem visualizar perfis
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" 
    ON public.user_profiles 
    FOR SELECT 
    USING (true);

-- Política: Usuários autenticados podem gerenciar perfis
DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can manage profiles" 
    ON public.user_profiles 
    FOR ALL 
    TO authenticated 
    USING (true);

-- =====================================================
-- PASSO 4: CRIAR TRIGGER AUTOMÁTICO
-- =====================================================
-- Este trigger cria automaticamente um perfil quando
-- um novo usuário é registrado no Auth.

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

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PASSO 5: SINCRONIZAR USUÁRIOS EXISTENTES
-- =====================================================
-- Copia todos os usuários já existentes no Auth
-- para a tabela user_profiles.

INSERT INTO public.user_profiles (id, email, full_name, created_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', ''),
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name);

-- =====================================================
-- PASSO 6: CRIAR TRIGGER PARA UPDATED_AT
-- =====================================================
-- Atualiza automaticamente o campo updated_at.

DROP TRIGGER IF EXISTS tr_updated_at_user_profiles ON public.user_profiles;

CREATE TRIGGER tr_updated_at_user_profiles 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PASSO 7: RECARREGAR SCHEMA DO POSTGREST
-- =====================================================
-- IMPORTANTE: Isso faz a API reconhecer as novas tabelas.

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute estas queries para verificar se tudo funcionou:

-- Ver usuários sincronizados:
SELECT id, email, full_name, is_active, created_at 
FROM public.user_profiles 
ORDER BY created_at DESC;

-- Verificar se o trigger existe:
SELECT tgname, tgtype 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- =====================================================
-- SCRIPT OPCIONAL: CRIAR PRIMEIRO ADMIN MANUALMENTE
-- =====================================================
-- Descomente e execute apenas se precisar criar o
-- primeiro usuário sem acesso ao painel.

/*
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_current,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@seudominio.com',                           -- Altere aqui
    crypt('SuaSenhaSegura123', gen_salt('bf')),       -- Altere aqui
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador"}',                 -- Altere aqui
    NOW(),
    NOW(),
    '', '', '', ''
);
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
