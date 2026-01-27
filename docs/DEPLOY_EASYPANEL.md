 # 🚢 Deploy com EasyPanel

## Visão Geral

Este guia descreve como fazer deploy do QualOrigem-Sys usando EasyPanel com Supabase Self-Hosted.

## Pré-requisitos

- Servidor VPS com EasyPanel instalado
- Domínio configurado
- Supabase Self-Hosted rodando

## Passo 1: Configurar Supabase

### 1.1 Instale o Supabase no EasyPanel

1. No painel do EasyPanel, vá em **Templates**
2. Busque por **Supabase** e instale
3. Aguarde todos os containers iniciarem

### 1.2 Acesse o Supabase

- URL do Studio: `https://studio.seu-dominio.com`
- URL da API: `https://supabase.seu-dominio.com`

### 1.3 Execute o Schema

1. Acesse o Studio
2. Vá em **SQL Editor**
3. Execute o arquivo `docs/database/SCHEMA_COMPLETO.sql`

### 1.4 Obtenha as Credenciais

No Supabase Studio, vá em **Settings > API** e copie:
- **API URL**: `https://supabase.seu-dominio.com`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

## Passo 2: Criar Aplicação no EasyPanel

### 2.1 Nova Aplicação

1. Clique em **Create** > **App**
2. Escolha **Dockerfile** como tipo
3. Configure:
   - **Name**: `qualorigem`
   - **Repository**: URL do GitHub
   - **Branch**: `main`

### 2.2 Variáveis de Ambiente

Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://supabase.seu-dominio.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 2.3 Configurar Domínio

1. Vá na aba **Domains**
2. Adicione: `app.seu-dominio.com`
3. Ative HTTPS

### 2.4 Deploy

Clique em **Deploy** e aguarde o build completar.

## Passo 3: Verificar Deploy

### 3.1 Teste a Aplicação

Acesse `https://app.seu-dominio.com` e verifique:
- [ ] Homepage carrega corretamente
- [ ] Busca de lotes funciona
- [ ] Login funciona
- [ ] Dashboard admin carrega

### 3.2 Teste a API

```bash
curl https://supabase.seu-dominio.com/rest/v1/producers \
  -H "apikey: SUA_ANON_KEY"
```

## Dockerfile

O projeto já inclui um Dockerfile otimizado:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Troubleshooting

### Build falha

1. Verifique os logs do build
2. Confirme que as variáveis de ambiente estão corretas
3. Teste o build localmente: `npm run build`

### Erro 502 Bad Gateway

1. Verifique se o container está rodando
2. Verifique os logs do container
3. Reinicie a aplicação

### Erro de CORS

Configure o CORS no Supabase:
1. Vá em **Settings > API**
2. Adicione seu domínio em **Additional Allowed Origins**

### Página em branco

1. Verifique o console do navegador
2. Confirme que as variáveis `VITE_*` foram passadas no build
3. Rebuild a aplicação

## Atualizações

Para atualizar a aplicação:

1. Push para o GitHub
2. No EasyPanel, clique em **Redeploy**
3. Ou configure Auto-deploy no GitHub

## Backup

### Banco de Dados

```bash
# Via pg_dump no container do Supabase
docker exec -it supabase-db pg_dump -U postgres > backup.sql
```

### Storage

Os arquivos estão no volume do MinIO/Storage do Supabase.

## Monitoramento

- Verifique os logs em **Logs** no EasyPanel
- Configure alertas de uptime
- Monitore uso de recursos
