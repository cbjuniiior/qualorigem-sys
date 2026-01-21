# Build stage: compile the Vite project
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on the lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source and build it
COPY . .

# Build arguments para variáveis de ambiente
# Aceita tanto via ARG (build-time) quanto via ENV (runtime)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Definir as variáveis de ambiente para o build
# Se ARG não for fornecido, tenta usar ENV
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Debug: Mostrar se as variáveis foram definidas (remover em produção se necessário)
RUN echo "Building with VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:30}..." && \
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then \
    echo "ERROR: Environment variables not set!"; \
    echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"; \
    echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."; \
    exit 1; \
    fi

RUN npm run build

# Production stage: serve the built assets via nginx
FROM nginx:1.27-alpine AS production

# Copy a custom nginx configuration to handle client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
