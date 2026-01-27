# 🔐 Variáveis de Ambiente

## Visão Geral

O QualOrigem-Sys utiliza variáveis de ambiente para configuração. Todas as variáveis que precisam estar disponíveis no cliente devem ter o prefixo `VITE_`.

## Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | URL da API do Supabase | `https://supabase.exemplo.com` |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon key) | `eyJhbGciOiJIUzI1...` |

## Arquivo .env

### Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Produção (EasyPanel)

Configure as variáveis na seção **Environment** da aplicação:

1. Acesse a aplicação no EasyPanel
2. Vá em **Settings** > **Environment**
3. Adicione cada variável

## Arquivo .env.example

O projeto inclui um `.env.example` como template:

```env
# Supabase Configuration
# Get these values from your Supabase project settings
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Obtendo as Credenciais

### Supabase Cloud

1. Acesse [supabase.com](https://supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### Supabase Self-Hosted

1. Acesse o Supabase Studio
2. Vá em **Settings** > **API**
3. Copie as mesmas informações

## Scripts de Setup

### Windows (setup-env.bat)

```batch
@echo off
echo Configurando variaveis de ambiente...
set /p SUPABASE_URL="Digite a URL do Supabase: "
set /p SUPABASE_KEY="Digite a Anon Key: "
echo VITE_SUPABASE_URL=%SUPABASE_URL%> .env
echo VITE_SUPABASE_ANON_KEY=%SUPABASE_KEY%>> .env
echo Arquivo .env criado com sucesso!
```

### Linux/Mac (setup-env.sh)

```bash
#!/bin/bash
echo "Configurando variáveis de ambiente..."
read -p "Digite a URL do Supabase: " SUPABASE_URL
read -p "Digite a Anon Key: " SUPABASE_KEY
echo "VITE_SUPABASE_URL=$SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY" >> .env
echo "Arquivo .env criado com sucesso!"
```

## Uso no Código

As variáveis são acessadas via `import.meta.env`:

```typescript
// src/integrations/supabase/client.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## Build de Produção

Durante o build, as variáveis são injetadas:

```bash
# Build normal (usa .env)
npm run build

# Build com variáveis inline
VITE_SUPABASE_URL=https://... VITE_SUPABASE_ANON_KEY=... npm run build
```

### Docker

No Dockerfile, as variáveis são passadas como ARG:

```dockerfile
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build
```

## Segurança

⚠️ **Importante:**

- NUNCA commite o arquivo `.env` no Git
- A `ANON_KEY` é pública e segura para expor no cliente
- A `SERVICE_ROLE_KEY` NUNCA deve ser exposta no cliente
- Use RLS para proteger os dados

## Validação

Para verificar se as variáveis estão configuradas:

```typescript
// Console do navegador
console.log(import.meta.env.VITE_SUPABASE_URL);
// Deve mostrar a URL, não undefined
```

## Troubleshooting

### Variável undefined

1. Verifique se o arquivo `.env` existe
2. Verifique se a variável tem o prefixo `VITE_`
3. Reinicie o servidor de desenvolvimento

### Variável não atualiza

1. Pare o servidor de desenvolvimento
2. Limpe o cache: `rm -rf node_modules/.vite`
3. Reinicie: `npm run dev`

### Build não usa variáveis

1. Verifique se as variáveis foram passadas no build
2. No Docker, verifique os ARGs
3. No EasyPanel, verifique as variáveis de ambiente
