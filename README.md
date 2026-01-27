# 🌱 QualOrigem-Sys

Sistema de Rastreabilidade para Produtos com Indicação Geográfica.

## 📋 Sobre o Projeto

O **QualOrigem-Sys** é um sistema completo de rastreabilidade para produtos com Indicação Geográfica (IG), desenvolvido com tecnologias modernas para garantir transparência e confiança na cadeia produtiva.

### 🎯 Objetivos

- **Rastreabilidade Completa**: Acompanhar produtos desde a origem até o consumidor final
- **Transparência**: Informações detalhadas sobre produtores, lotes e processos
- **QR Codes**: Sistema de códigos QR para acesso rápido às informações
- **Dashboard Administrativo**: Gestão completa de produtores e lotes
- **Multi-Categoria**: Suporte para diversos produtos (Café, Erva-Mate, Cacau, etc.)

## 🛠️ Tecnologias

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Estilização** | Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Formulários** | React Hook Form, Zod |
| **Gráficos** | Recharts |
| **Mapas** | Leaflet |

## 🚀 Início Rápido

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/qualorigem-sys.git
cd qualorigem-sys
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
# Windows
setup-env.bat

# Linux/Mac
chmod +x setup-env.sh && ./setup-env.sh
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

## 📚 Documentação

A documentação completa está disponível na pasta `docs/`:

- [📖 Índice da Documentação](./docs/README.md)
- [🔧 Guia de Instalação](./docs/INSTALLATION.md)
- [⚙️ Configuração do Supabase](./docs/SUPABASE_SETUP.md)
- [🏗️ Arquitetura](./docs/ARCHITECTURE.md)
- [🛠️ Stack Tecnológico](./docs/TECH_STACK.md)
- [🚢 Deploy com EasyPanel](./docs/DEPLOY_EASYPANEL.md)
- [🔐 Variáveis de Ambiente](./docs/ENV_VARIABLES.md)

### Banco de Dados

- [📊 Schema Completo SQL](./docs/database/SCHEMA_COMPLETO.sql)
- [📋 Diagrama ER](./docs/database/DIAGRAMA_ER.md)
- [📑 Referência de Tabelas](./docs/database/TABELAS_REFERENCIA.md)

## 📁 Estrutura do Projeto

```
qualorigem-sys/
├── src/
│   ├── components/          # Componentes React
│   │   ├── layout/         # Layouts (Admin, Produtor)
│   │   ├── lots/           # Componentes de lotes
│   │   └── ui/             # Componentes base
│   ├── hooks/              # Custom Hooks
│   ├── integrations/       # Supabase client e types
│   ├── pages/              # Páginas da aplicação
│   │   ├── admin/          # Área administrativa
│   │   ├── produtor/       # Área do produtor
│   │   └── auth/           # Autenticação
│   ├── services/           # Serviços de API
│   ├── types/              # Tipos TypeScript
│   └── utils/              # Utilitários
├── docs/                   # Documentação
│   └── database/           # Schema e diagramas
├── supabase/               # Configurações Supabase
└── public/                 # Arquivos estáticos
```

## 🔒 Segurança

- **Row Level Security (RLS)** em todas as tabelas
- **Autenticação** via Supabase Auth
- **JWT** para sessões
- **Políticas de acesso** granulares

## 📱 Funcionalidades

### Área Pública
- ✅ Homepage com busca de lotes
- ✅ Página de detalhes do lote (via QR Code)
- ✅ Visualização de análise sensorial
- ✅ Mapa de localização
- ✅ Vídeo institucional

### Área Administrativa
- ✅ Dashboard com métricas
- ✅ Gestão de produtores
- ✅ Gestão de lotes (incluindo blends)
- ✅ Gestão de associações/cooperativas
- ✅ Gestão de indústrias
- ✅ Gestão de categorias e características
- ✅ Gestão de atributos sensoriais
- ✅ Gestão de usuários
- ✅ Configurações do sistema
- ✅ Relatórios

### Área do Produtor
- ✅ Dashboard personalizado
- ✅ Gestão de lotes próprios
- ✅ Geração de QR Codes
- ✅ Métricas de visualização
- ✅ Configurações de perfil

## 🗄️ Banco de Dados

O sistema utiliza **16 tabelas** organizadas em 4 domínios:

| Domínio | Tabelas |
|---------|---------|
| **Autenticação** | user_profiles |
| **Entidades** | producers, associations, brands, industries |
| **Produtos** | product_lots, lot_components, seal_controls, product_lot_characteristics, product_lot_sensory |
| **Configuração** | categories, characteristics, sensory_attributes, system_configurations, tasks, producers_associations |

Para setup completo, execute o arquivo `docs/database/SCHEMA_COMPLETO.sql` no SQL Editor do Supabase.

## 🚢 Deploy

### EasyPanel (Recomendado)

1. Configure o Supabase Self-Hosted
2. Execute o schema SQL
3. Crie a aplicação com Dockerfile
4. Configure as variáveis de ambiente
5. Deploy!

Consulte o [Guia de Deploy](./docs/DEPLOY_EASYPANEL.md) para instruções detalhadas.

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para a rastreabilidade de produtos com Indicação Geográfica**
