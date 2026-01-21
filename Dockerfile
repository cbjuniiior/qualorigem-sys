# Build stage: compile the Vite project
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on the lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source and build it
COPY . .

# Build arguments para variáveis de ambiente
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Definir as variáveis de ambiente para o build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

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
