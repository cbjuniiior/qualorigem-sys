# 🚀 Guia Completo de Deploy - Raízes Acre

## Sistema de Rastreabilidade com Supabase Self-Hosted no EasyPanel

**Última atualização:** Janeiro 2026

---

## 📋 Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Supabase Self-Hosted](#2-configuração-do-supabase-self-hosted)
3. [Configuração do Banco de Dados](#3-configuração-do-banco-de-dados)
4. [Configuração da Aplicação](#4-configuração-da-aplicação)
5. [Deploy no EasyPanel](#5-deploy-no-easypanel)
6. [Pós-Deploy](#6-pós-deploy)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pré-requisitos

### Serviços necessários:
- [ ] Servidor com EasyPanel instalado
- [ ] Supabase Self-Hosted configurado no EasyPanel
- [ ] Repositório Git configurado (GitHub, GitLab, etc.)

### Credenciais que você precisará:
- URL do Supabase (ex: `https://seu-projeto.easypanel.host`)
- Anon Key do Supabase
- Acesso ao SQL Editor do Supabase

---

## 2. Configuração do Supabase Self-Hosted

### 2.1 Variáveis de Ambiente Obrigatórias

No EasyPanel, configure estas variáveis no serviço do Supabase:

```env
############
# CONFIGURAÇÕES CRÍTICAS PARA O SISTEMA FUNCIONAR
############

## Email auth - IMPORTANTE: Habilitar autoconfirm!
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true    # ⚠️ DEVE SER TRUE

## Phone auth
ENABLE_PHONE_SIGNUP=true
ENABLE_PHONE_AUTOCONFIRM=true

## Desabilitar verificação JWT para funções (opcional)
FUNCTIONS_VERIFY_JWT=false
```

### 2.2 Por que `ENABLE_EMAIL_AUTOCONFIRM=true`?

Sem um servidor SMTP configurado, o Supabase não consegue enviar emails de confirmação. Com `ENABLE_EMAIL_AUTOCONFIRM=true`:
- Usuários são criados já confirmados
- Não precisa configurar SMTP
- Funciona perfeitamente para sistemas internos/admin

---

## 3. Configuração do Banco de Dados

### 3.1 Script Principal do Schema

Execute o arquivo `docs/sql/database_complete_schema.sql` no SQL Editor do Supabase.

Este script cria:
- Todas as tabelas do sistema (producers, product_lots, etc.)
- Funções auxiliares
- Políticas de RLS (Row Level Security)
- Storage buckets para imagens

### 3.2 Script de Gestão de Usuários

Execute o arquivo `docs/sql/add_admin_users_table.sql` no SQL Editor.

Este script cria:
- Tabela `user_profiles` para gerenciar usuários admin
- Trigger automático para sincronizar com `auth.users`
- Políticas de segurança

**Conteúdo do script:**

```sql
-- 1. CRIAR TABELA DE PERFIS DE USUÁRIOS
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
CREATE POLICY "Users can view all profiles" 
    ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage profiles" 
    ON public.user_profiles FOR ALL 
    TO authenticated USING (true);

-- 4. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. SINCRONIZAR USUÁRIOS EXISTENTES
INSERT INTO public.user_profiles (id, email, full_name, created_at)
SELECT id, email, raw_user_meta_data->>'full_name', created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. TRIGGER PARA updated_at
CREATE TRIGGER tr_updated_at_user_profiles 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RECARREGAR SCHEMA DO POSTGREST
NOTIFY pgrst, 'reload schema';
```

### 3.3 Criar Primeiro Usuário Admin

Se você precisa criar o primeiro usuário manualmente (antes de ter acesso ao painel):

```sql
-- Criar usuário admin inicial
-- Substitua os valores conforme necessário

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
    'admin@seudominio.com',        -- Altere o email
    crypt('SuaSenhaSegura123', gen_salt('bf')),  -- Altere a senha
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador"}',
    NOW(),
    NOW(),
    '', '', '', ''
);

-- Criar perfil do usuário
INSERT INTO public.user_profiles (id, email, full_name, is_active, created_at)
SELECT id, email, 'Administrador', true, NOW()
FROM auth.users 
WHERE email = 'admin@seudominio.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 4. Configuração da Aplicação

### 4.1 Variáveis de Ambiente da Aplicação

No EasyPanel, na seção de variáveis de ambiente da **aplicação** (não do Supabase):

```env
VITE_SUPABASE_URL=https://seu-projeto.easypanel.host
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ IMPORTANTE: URL sem barra no final!

✅ Correto: `https://seu-projeto.easypanel.host`
❌ Errado: `https://seu-projeto.easypanel.host/`

A barra extra causa erros 404/500 nas chamadas de API.

### 4.2 Build Arguments no Docker

Se estiver usando Docker/Dockerfile, configure os Build Arguments:

```
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

---

## 5. Deploy no EasyPanel

### 5.1 Ordem de Execução

1. **Primeiro:** Configure o Supabase (variáveis de ambiente)
2. **Segundo:** Execute os scripts SQL no banco de dados
3. **Terceiro:** Configure e faça deploy da aplicação

### 5.2 Checklist de Deploy

- [ ] Supabase Self-Hosted rodando
- [ ] `ENABLE_EMAIL_AUTOCONFIRM=true` configurado
- [ ] Script `database_complete_schema.sql` executado
- [ ] Script `add_admin_users_table.sql` executado
- [ ] `NOTIFY pgrst, 'reload schema';` executado
- [ ] Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas
- [ ] URL **sem** barra no final
- [ ] Primeiro usuário admin criado
- [ ] Deploy da aplicação realizado

---

## 6. Pós-Deploy

### 6.1 Testar Funcionalidades

Após o deploy, verifique:

1. **Login:** Acesse a aplicação e faça login com o admin
2. **Gestão de Usuários:** Vá em Admin > Usuários e tente criar um novo usuário
3. **Configurações:** Atualize seu nome nas configurações e verifique se aparece na lista de usuários

### 6.2 Sincronizar Nomes (se necessário)

Se os nomes dos usuários não aparecem corretamente:

```sql
-- Sincronizar nomes do auth.users para user_profiles
UPDATE public.user_profiles 
SET full_name = (
    SELECT raw_user_meta_data->>'full_name' 
    FROM auth.users 
    WHERE auth.users.id = public.user_profiles.id
)
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'full_name' IS NOT NULL
    AND raw_user_meta_data->>'full_name' != ''
);
```

---

## 7. Troubleshooting

### Erro 406 (Not Acceptable) em endpoints REST

**Causa:** Cache do PostgREST desatualizado.

**Solução:** Execute no SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

---

### Erro 500 ao criar usuário / "Error sending confirmation email"

**Causa:** `ENABLE_EMAIL_AUTOCONFIRM=false` ou servidor SMTP não configurado.

**Solução:** 
1. No EasyPanel, edite as variáveis do Supabase
2. Altere `ENABLE_EMAIL_AUTOCONFIRM=true`
3. Reinicie o serviço do Supabase

---

### Admin é deslogado ao criar novo usuário

**Causa:** comportamento padrão do `signUp`.

**Solução:** A aplicação já inclui código para preservar a sessão do admin. Certifique-se de ter a versão mais recente do código.

---

### Nome do usuário não aparece na lista

**Causa:** A tabela `user_profiles` não está sincronizada com `auth.users`.

**Solução:**
1. Verifique se o trigger `on_auth_user_created` existe
2. Execute o script de sincronização (seção 6.2)

---

### URL com erro de "barra dupla" (//)

**Causa:** A variável `VITE_SUPABASE_URL` termina com `/`.

**Solução:** Remova a barra do final da URL nas variáveis de ambiente e faça redeploy.

---

### Usuário criado mas não aparece na lista

**Causa:** A tabela `user_profiles` não foi criada ou o trigger não está funcionando.

**Solução:**
1. Execute o script `add_admin_users_table.sql`
2. Verifique se o trigger existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

---

## 📁 Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `docs/sql/database_complete_schema.sql` | Schema completo do banco |
| `docs/sql/add_admin_users_table.sql` | Tabela e triggers para gestão de usuários |
| `docs/EASYPANEL_SETUP.md` | Guia de configuração do EasyPanel |
| `Dockerfile` | Configuração do Docker para build |
| `nginx.conf` | Configuração do Nginx para SPA |

---

## 🔄 Resumo Rápido (Cheatsheet)

```bash
# 1. Configurar Supabase
ENABLE_EMAIL_AUTOCONFIRM=true

# 2. Executar SQLs (no SQL Editor do Supabase)
# - database_complete_schema.sql
# - add_admin_users_table.sql
# - NOTIFY pgrst, 'reload schema';

# 3. Configurar App
VITE_SUPABASE_URL=https://seu-projeto.easypanel.host  # SEM barra no final!
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui

# 4. Deploy!
```

---

## 📞 Suporte

Para problemas não listados:
1. Verifique os logs no EasyPanel
2. Verifique o console do navegador (F12)
3. Consulte a documentação do [Supabase](https://supabase.com/docs)

---

**Desenvolvido com ❤️ para Raízes Acre**
