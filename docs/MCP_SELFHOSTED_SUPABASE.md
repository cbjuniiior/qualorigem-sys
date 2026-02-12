# Configuração do Self-Hosted Supabase MCP

Este guia explica como configurar o [selfhosted-supabase-mcp](https://github.com/HenkDz/selfhosted-supabase-mcp) para usar com o Cursor e o projeto QualOrigem-Sys.

## O que foi instalado

- **Localização:** `.mcp-servers/selfhosted-supabase-mcp/`
- **Configuração Cursor:** `.cursor/mcp.json`
- **Entrada principal:** `dist/index.js`

## Onde obter as credenciais

### Supabase Cloud (seu projeto atual)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione o projeto `giomnnxpgjrpwyjrkkwr`
3. Vá em **Settings** → **API** para obter:
   - **URL:** `https://giomnnxpgjrpwyjrkkwr.supabase.co`
   - **anon key** (chave pública)
   - **service_role key** (chave de serviço – **não exponha em frontend**)
4. Vá em **Settings** → **Database** para obter:
   - **Connection string** (URI do PostgreSQL)
   - **JWT Secret** (em Configuration → JWT)

### Supabase local (supabase start)

Se você usa Supabase local:

- **URL:** `http://localhost:54321` ou `http://localhost:8000` (Kong)
- **anon key / service_role:** em `supabase/.env` ou saída do `supabase start`
- **Database URL:** `postgresql://postgres:postgres@localhost:54322/postgres`
- **JWT Secret:** em `supabase/config.toml`

## Configuração do mcp.json

1. Copie o template (se ainda não tiver o arquivo):
   ```powershell
   Copy-Item .cursor/mcp.json.example .cursor/mcp.json
   ```

2. Edite o arquivo `.cursor/mcp.json` e substitua os placeholders:

| Placeholder | Substitua por |
|-------------|---------------|
| `SUA_URL_SUPABASE` | URL do projeto (ex: `https://giomnnxpgjrpwyjrkkwr.supabase.co`) |
| `SUA_ANON_KEY` | Chave anônima (anon key) |
| `SUA_SERVICE_ROLE_KEY` | Chave de serviço (service role key) |
| `postgresql://postgres:SUA_SENHA@db.REFERENCIA_PROJETO.supabase.co:5432/postgres` | Connection string completa do banco |
| `SEU_JWT_SECRET` | JWT Secret do projeto |

### Exemplo para Supabase Cloud

```json
{
  "mcpServers": {
    "selfhosted-supabase": {
      "command": "node",
      "args": [
        "C:/Users/Cassio/Documents/Projetos IA/qualorigem-sys/.mcp-servers/selfhosted-supabase-mcp/dist/index.js",
        "--url",
        "https://giomnnxpgjrpwyjrkkwr.supabase.co",
        "--anon-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        "--service-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        "--db-url",
        "postgresql://postgres.[id]:[senha]@aws-0-[regiao].pooler.supabase.com:6543/postgres",
        "--jwt-secret",
        "seu-jwt-secret-aqui"
      ]
    }
  }
}
```

## Recompilar o MCP (se necessário)

Se você atualizar o código do MCP ou após um `git pull`:

```powershell
cd .mcp-servers/selfhosted-supabase-mcp
npm install
npx tsc -p tsconfig.build.json
```

> **Nota:** O projeto usa Bun no build original. Como alternativa, usamos `tsc` com `tsconfig.build.json` para excluir os testes.

## Funcionalidades disponíveis

O MCP oferece, entre outros:

- **Schema:** `list_tables`, `list_migrations`, `apply_migration`
- **Operações:** `execute_sql`, `generate_typescript_types`
- **Auth:** `list_auth_users`, `get_auth_user`, `create_auth_user`
- **Storage:** `list_storage_buckets`, `list_storage_objects`
- **Segurança:** `get_advisors`, `list_rls_policies`
- **Tuning:** `get_database_stats`, `get_database_connections`

## Ajustando o caminho do servidor

O caminho completo do `index.js` no `mcp.json.example` está configurado para o seu ambiente. Em outro computador ou para outro desenvolvedor, atualize o primeiro argumento em `args` para o caminho correto, por exemplo:

- Windows: `C:/caminho/para/projeto/.mcp-servers/selfhosted-supabase-mcp/dist/index.js`
- Linux/macOS: `/caminho/para/projeto/.mcp-servers/selfhosted-supabase-mcp/dist/index.js`

## Segurança

- Não faça commit de chaves reais no `mcp.json` (o arquivo está no `.gitignore`)
- A `service_role key` ignora RLS – use com cuidado
- Considere manter o MCP em `~/.cursor/mcp.json` se quiser credenciais separadas do projeto

## Referências

- [Repositório selfhosted-supabase-mcp](https://github.com/HenkDz/selfhosted-supabase-mcp)
- [Configuração MCP no Cursor](https://docs.cursor.com/context/model-context-protocol)
