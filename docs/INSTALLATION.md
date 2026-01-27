# 🚀 Guia de Instalação

## Pré-requisitos

- **Node.js** 18+ e npm
- **Git** para versionamento
- **Supabase** (Self-Hosted ou Cloud)

## Instalação Local

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/qualorigem-sys.git
cd qualorigem-sys
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

**Opção 1: Script Automático (Recomendado)**

Windows:
```bash
setup-env.bat
```

Linux/Mac:
```bash
chmod +x setup-env.sh
./setup-env.sh
```

**Opção 2: Manual**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configure o Banco de Dados

Execute o schema completo no seu Supabase:
1. Acesse o SQL Editor do Supabase
2. Execute o arquivo `docs/database/SCHEMA_COMPLETO.sql`

### 5. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

### 6. Acesse a Aplicação

Abra [http://localhost:5173](http://localhost:5173)

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run build:dev` | Gera build de desenvolvimento |
| `npm run preview` | Preview da build de produção |
| `npm run lint` | Executa o linter |

## Estrutura do Projeto

```
qualorigem-sys/
├── src/
│   ├── components/          # Componentes React
│   ├── hooks/               # Custom Hooks
│   ├── integrations/        # Integrações (Supabase)
│   ├── pages/               # Páginas da aplicação
│   ├── services/            # Serviços de API
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Utilitários
├── docs/                    # Documentação
├── supabase/               # Configurações Supabase
└── public/                 # Arquivos estáticos
```

## Próximos Passos

- Consulte [Configuração do Supabase](./SUPABASE_SETUP.md) para setup completo
- Consulte [Deploy com EasyPanel](./DEPLOY_EASYPANEL.md) para deploy em produção
