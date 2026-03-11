# Build stage: compile the Vite project
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on the lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source and build it
COPY . .

# Build arguments para variáveis de ambiente (preferencial)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Definir as variáveis de ambiente para o build
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Debug: Mostrar origem das variáveis
RUN echo "================================================" && \
    echo "🔍 Verificando variáveis de ambiente..." && \
    echo "================================================" && \
    if [ -n "$VITE_SUPABASE_URL" ]; then \
    echo "✅ VITE_SUPABASE_URL (via ARG): ${VITE_SUPABASE_URL:0:30}..."; \
    else \
    echo "⚠️  VITE_SUPABASE_URL não definida via ARG"; \
    if [ -f .env ]; then \
    echo "📄 Tentando ler de .env..."; \
    fi; \
    fi && \
    if [ -n "$VITE_SUPABASE_ANON_KEY" ]; then \
    echo "✅ VITE_SUPABASE_ANON_KEY (via ARG): ${VITE_SUPABASE_ANON_KEY:0:20}..."; \
    else \
    echo "⚠️  VITE_SUPABASE_ANON_KEY não definida via ARG"; \
    fi && \
    echo "================================================"

# Validação final antes do build
RUN if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then \
    echo "❌ ERRO: Variáveis de ambiente não configuradas!"; \
    echo ""; \
    echo "Configure no EasyPanel:"; \
    echo "1. Vá em 'Ambiente'"; \
    echo "2. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"; \
    echo "3. Salve e faça Rebuild"; \
    echo ""; \
    exit 1; \
    fi

RUN npm run build

# Production stage: serve via Node (injeta meta OG para crawlers)
FROM node:20-alpine AS production

WORKDIR /app

# Copiar apenas o necessário para produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY server ./server

ENV NODE_ENV=production
ENV STATIC_ROOT=/app/dist
ENV PORT=80

EXPOSE 80

CMD ["node", "server/og-server.js"]
