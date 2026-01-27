# 🔧 Configuração do Supabase

## Visão Geral

O QualOrigem-Sys utiliza o Supabase como backend, incluindo:
- **PostgreSQL** para banco de dados
- **Auth** para autenticação de usuários
- **Storage** para upload de imagens
- **Row Level Security (RLS)** para segurança

## Opções de Setup

### Opção 1: Supabase Cloud (Recomendado para testes)

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e Anon Key das configurações

### Opção 2: Supabase Self-Hosted (Produção)

Para produção, recomendamos self-hosting via EasyPanel ou Docker.
Consulte o guia [Deploy com EasyPanel](./DEPLOY_EASYPANEL.md).

## Configurando o Banco de Dados

### Passo 1: Execute o Schema Completo

1. Acesse o **SQL Editor** no painel do Supabase
2. Abra o arquivo `docs/database/SCHEMA_COMPLETO.sql`
3. Cole e execute o conteúdo completo

O schema criará:
- ✅ 14 tabelas principais
- ✅ Funções auxiliares
- ✅ Triggers para updated_at
- ✅ Políticas RLS
- ✅ Storage buckets
- ✅ Dados iniciais

### Passo 2: Verifique a Criação

Execute no SQL Editor:

```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Resultado esperado (14 tabelas):
- associations
- brands
- categories
- characteristics
- industries
- lot_components
- producers
- producers_associations
- product_lot_characteristics
- product_lot_sensory
- product_lots
- seal_controls
- sensory_attributes
- system_configurations
- tasks
- user_profiles

### Passo 3: Configure os Storage Buckets

Os buckets são criados automaticamente pelo schema:

| Bucket | Uso | Limite |
|--------|-----|--------|
| `propriedades` | Fotos de propriedades e lotes | 5MB |
| `branding` | Logos de marcas e associações | 2MB |

## Gestão de Usuários

O sistema utiliza a tabela `user_profiles` sincronizada com `auth.users`:

1. Ao criar um usuário no Auth, um perfil é criado automaticamente
2. A sincronização é feita via trigger `on_auth_user_created`

### Criar Primeiro Administrador

Opção via SQL (descomentar e executar):

```sql
INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'admin@seudominio.com',
    crypt('SuaSenhaSegura123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador"}',
    NOW(), NOW()
);
```

## Variáveis de Ambiente

Após configurar o Supabase, configure as variáveis:

```env
# URL do projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave anônima (pública)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## Troubleshooting

### Erro 406 - Not Acceptable

O PostgREST precisa recarregar o schema:

```sql
NOTIFY pgrst, 'reload schema';
```

### Tabelas não aparecem na API

1. Verifique se RLS está habilitado
2. Verifique se existem políticas de SELECT
3. Execute o reload do schema

### Problemas de autenticação

1. Verifique a Anon Key no .env
2. Verifique se o email está confirmado no Auth
3. Limpe o localStorage do navegador
