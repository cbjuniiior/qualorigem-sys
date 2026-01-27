# Conexão com Supabase - RastreaCha

## Informações do Projeto

- **Nome do Projeto**: RastreaCha
- **Project ID**: `lhwaqwypakcchzottejd`
- **Região**: sa-east-1 (São Paulo)
- **Status**: ACTIVE_HEALTHY
- **Versão PostgreSQL**: 17.6.1.063

## Credenciais de Conexão

### URL da API
```
https://lhwaqwypakcchzottejd.supabase.co
```

### Chave Anon (Pública)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod2Fxd3lwYWtjY2h6b3R0ZWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjA5MzMsImV4cCI6MjA4NDU5NjkzM30.c-zfvkLW5CSC-ZttzgjpvTAFU4IKPBaSuZxMJo0tgyA
```

## Estrutura do Banco de Dados

O projeto possui as seguintes tabelas principais:

### Tabelas Core
- **producers** - Produtores/Propriedades rurais
- **lots** - Lotes de café
- **associations** - Associações de produtores
- **producers_associations** - Relacionamento produtores-associações
- **tasks** - Sistema de tarefas

### Tabelas de Sistema
- **profiles** - Perfis de usuários
- **system_configurations** - Configurações do sistema
- **activity_logs** - Logs de atividades

### Tabelas de Auditoria
- **lot_views** - Visualizações de lotes
- **lot_shares** - Compartilhamentos de lotes

## Configuração Local

As credenciais estão configuradas no arquivo `.env`:

```bash
VITE_SUPABASE_URL=https://lhwaqwypakcchzottejd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Avisos de Segurança

O projeto possui alguns avisos de segurança (warnings) que podem ser resolvidos:

1. **Function Search Path Mutable** - Funções sem search_path definido
   - `increment_lot_views`
   - `update_updated_at_column`
   - `handle_updated_at`

2. **RLS Policy Always True** - Políticas RLS muito permissivas
   - Várias tabelas com política "Auth All" usando `true`

3. **Leaked Password Protection Disabled** - Proteção contra senhas vazadas desabilitada

### Links de Remediação
- [Function Search Path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Permissive RLS Policy](https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy)
- [Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Como Usar

1. Certifique-se de que o arquivo `.env` existe com as credenciais corretas
2. Execute `npm install` para instalar as dependências
3. Execute `npm run dev` para iniciar o servidor de desenvolvimento
4. Acesse `http://localhost:8081` (ou a porta disponível)

## Acesso ao Dashboard Supabase

Acesse o dashboard do projeto em:
https://supabase.com/dashboard/project/lhwaqwypakcchzottejd
