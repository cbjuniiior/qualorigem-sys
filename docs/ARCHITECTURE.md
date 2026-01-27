# 🏗️ Arquitetura do Sistema

## Visão Geral

O **QualOrigem-Sys** é um sistema de rastreabilidade para produtos com Indicação Geográfica (IG). A arquitetura segue o padrão de aplicação Single Page Application (SPA) com backend serverless.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      React + Vite                           ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ ││
│  │  │ Pages   │  │Components│ │ Hooks   │  │    Services     │ ││
│  │  │         │  │         │  │         │  │ (API Layer)     │ ││
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ ││
│  │       │            │            │                │          ││
│  │       └────────────┴────────────┴────────────────┘          ││
│  │                           │                                  ││
│  │                    Supabase Client                          ││
│  └───────────────────────────┬─────────────────────────────────┘│
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐│
│  │     Auth      │  │   Database    │  │       Storage         ││
│  │               │  │  (PostgreSQL) │  │   (S3 Compatible)     ││
│  │  - Login      │  │               │  │                       ││
│  │  - Register   │  │  - Tables     │  │  - propriedades/      ││
│  │  - Sessions   │  │  - RLS        │  │  - branding/          ││
│  │               │  │  - Triggers   │  │                       ││
│  └───────────────┘  └───────────────┘  └───────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
qualorigem-sys/
├── src/
│   ├── components/              # Componentes React
│   │   ├── layout/             # Layouts (Admin, Produtor)
│   │   ├── lote-details/       # Componentes da página de lote
│   │   ├── lots/               # Componentes de gestão de lotes
│   │   └── ui/                 # Componentes base (shadcn/ui)
│   │
│   ├── hooks/                   # Custom Hooks
│   │   ├── use-auth.tsx        # Autenticação
│   │   ├── use-branding.tsx    # Branding dinâmico
│   │   ├── use-cep.tsx         # Busca de CEP
│   │   ├── use-mobile.tsx      # Detecção mobile
│   │   └── use-toast.ts        # Notificações
│   │
│   ├── integrations/            # Integrações externas
│   │   └── supabase/
│   │       ├── client.ts       # Cliente Supabase
│   │       └── types.ts        # Tipos TypeScript do DB
│   │
│   ├── pages/                   # Páginas da aplicação
│   │   ├── admin/              # Área administrativa
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Produtores.tsx
│   │   │   ├── Lotes.tsx
│   │   │   ├── Associacoes.tsx
│   │   │   ├── Industria.tsx
│   │   │   ├── Relatorios.tsx
│   │   │   ├── Configuracoes.tsx
│   │   │   ├── Usuarios.tsx
│   │   │   └── GestaoPlataforma.tsx
│   │   │
│   │   ├── produtor/           # Área do produtor
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Lotes.tsx
│   │   │   ├── QRCodes.tsx
│   │   │   ├── Metricas.tsx
│   │   │   └── Configuracoes.tsx
│   │   │
│   │   ├── auth/               # Autenticação
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ResetPassword.tsx
│   │   │
│   │   ├── Index.tsx           # Homepage pública
│   │   ├── LoteDetails.tsx     # Página de detalhes do lote
│   │   └── NotFound.tsx        # Página 404
│   │
│   ├── services/                # Serviços de API
│   │   ├── api.ts              # Camada de acesso ao Supabase
│   │   └── upload.ts           # Upload de arquivos
│   │
│   ├── types/                   # Tipos TypeScript
│   └── utils/                   # Funções utilitárias
│
├── docs/                        # Documentação
├── supabase/                    # Configurações Supabase
└── public/                      # Arquivos estáticos
```

## Fluxo de Dados

### 1. Autenticação

```
Login Page → useAuth Hook → Supabase Auth → Session Storage
      ↓
Protected Route → Verifica sessão → Redireciona ou permite
```

### 2. CRUD de Dados

```
Componente
    ↓
Service (api.ts) → Supabase Client → PostgreSQL
    ↓                    ↓
React Query Cache ← Resposta com dados
```

### 3. Upload de Imagens

```
Componente → uploadService → Supabase Storage
    ↓
URL pública retornada → Salva no registro
```

## Padrões de Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

- **SELECT**: Público (qualquer um pode ler)
- **INSERT/UPDATE/DELETE**: Apenas usuários autenticados

### Políticas Aplicadas

```sql
-- Leitura pública
CREATE POLICY "Public Select" ON tabela FOR SELECT USING (true);

-- Escrita autenticada
CREATE POLICY "Auth All" ON tabela FOR ALL TO authenticated USING (true);
```

## Módulos do Sistema

### 1. Módulo Público
- Homepage com busca de lotes
- Página de detalhes do lote (via QR Code)

### 2. Módulo Administrativo
- Dashboard com métricas gerais
- Gestão de produtores
- Gestão de lotes
- Gestão de associações/cooperativas
- Gestão de indústrias
- Gestão de categorias e características
- Gestão de atributos sensoriais
- Gestão de usuários
- Configurações do sistema
- Relatórios

### 3. Módulo do Produtor
- Dashboard com métricas pessoais
- Gestão de lotes próprios
- Geração de QR Codes
- Configurações de perfil

## Integrações

### Supabase
- Banco de dados PostgreSQL
- Autenticação
- Storage para imagens

### APIs Externas
- ViaCEP para busca de endereços
- YouTube para vídeos dos lotes

### Bibliotecas Principais
- React Query para cache e estado
- React Hook Form para formulários
- Zod para validação
- Recharts para gráficos
- Leaflet para mapas
