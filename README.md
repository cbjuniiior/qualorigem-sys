# 🌱 Raízes Acre - Sistema de Rastreabilidade para Produtos com Indicação Geográfica

## 📋 Sobre o Projeto

O **Raízes Acre** é um sistema completo de rastreabilidade para produtos com Indicação Geográfica, desenvolvido com tecnologias modernas para garantir transparência e confiança na cadeia produtiva.

### 🎯 Objetivos
- **Rastreabilidade Completa**: Acompanhar produtos desde a origem até o consumidor final
- **Transparência**: Informações detalhadas sobre produtores, lotes e processos
- **QR Codes**: Sistema de códigos QR para acesso rápido às informações
- **Dashboard Administrativo**: Gestão completa de produtores e lotes
- **Painel do Produtor**: Interface específica para produtores gerenciarem seus lotes

## 🚀 Status do Projeto

### ✅ **Fase 1: Banco de Dados e Autenticação** - CONCLUÍDA
- Sistema de autenticação com Supabase
- Banco de dados com tabelas de produtores e lotes
- Políticas de segurança (RLS)
- Tipos TypeScript completos
- Serviços de API integrados

### ✅ **Fase 2: Dashboard Administrativo** - CONCLUÍDA
- Dashboard principal com métricas
- Gestão completa de produtores (CRUD)
- Gestão completa de lotes (CRUD)
- Sistema de relatórios e gráficos
- Interface responsiva e moderna

### ✅ **Fase 3: Painel do Produtor** - CONCLUÍDA
- Dashboard específico para produtores
- Gestão de lotes próprios
- Sistema de QR Codes
- Métricas e análises individuais
- Configurações de perfil

### 🔄 **Fase 4: Funcionalidades Avançadas** - EM DESENVOLVIMENTO
- Sistema de notificações em tempo real
- API pública para consulta
- Integração com mapas
- Relatórios avançados

### 📋 **Fase 5: Polimento e Deploy** - PENDENTE
- Testes automatizados
- Otimizações de performance
- Deploy em produção
- Documentação completa

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **React Router** para navegação
- **React Hook Form** para formulários
- **Zod** para validação
- **Lucide React** para ícones
- **Recharts** para gráficos

### Backend
- **Supabase** para banco de dados e autenticação
- **PostgreSQL** como banco de dados
- **Row Level Security (RLS)** para segurança
- **Storage** para upload de arquivos

### Ferramentas
- **TypeScript** para tipagem estática
- **ESLint** para linting
- **Prettier** para formatação
- **Git** para versionamento

## 📁 Estrutura do Projeto

```
geo-trace-origin-link/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx          # Layout do dashboard admin
│   │   │   └── ProducerLayout.tsx       # Layout do painel produtor
│   │   ├── ui/                          # Componentes shadcn/ui
│   │   ├── ProtectedRoute.tsx           # Proteção de rotas
│   │   └── SensorialRadarChart.tsx      # Gráfico radar sensorial
│   ├── pages/
│   │   ├── Index.tsx                    # Homepage pública
│   │   ├── LoteDetails.tsx              # Detalhes do lote público
│   │   ├── auth/
│   │   │   ├── Login.tsx                # Página de login
│   │   │   └── Register.tsx             # Página de cadastro
│   │   ├── admin/                       # Páginas do admin
│   │   │   ├── Dashboard.tsx            # Dashboard principal
│   │   │   ├── Produtores.tsx           # Gestão de produtores
│   │   │   ├── Lotes.tsx                # Gestão de lotes
│   │   │   └── Relatorios.tsx           # Relatórios e métricas
│   │   └── produtor/                    # Páginas do produtor
│   │       ├── Dashboard.tsx            # Dashboard do produtor
│   │       ├── Lotes.tsx                # Gestão de lotes próprios
│   │       ├── QRCodes.tsx              # Sistema de QR codes
│   │       ├── Metricas.tsx             # Métricas e análises
│   │       └── Configuracoes.tsx        # Configurações do produtor
│   ├── services/
│   │   └── api.ts                       # Serviços de API
│   ├── hooks/
│   │   └── use-auth.tsx                 # Hook de autenticação
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts                # Cliente Supabase
│   │       └── types.ts                 # Tipos TypeScript
│   ├── data/
│   │   └── sample-data.ts               # Dados de exemplo
│   └── scripts/
│       └── seed-database.ts             # Script para popular banco
├── supabase/
│   ├── config.toml                      # Configuração Supabase
│   └── migrations/
│       └── 001_initial_schema.sql       # Schema inicial
├── public/                              # Arquivos estáticos
├── package.json                         # Dependências
├── tailwind.config.ts                   # Configuração Tailwind
├── vite.config.ts                       # Configuração Vite
└── README.md                            # Documentação
```

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ e npm
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd geo-trace-origin-link
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   - Crie um projeto no [Supabase](https://supabase.com)
   - Configure as variáveis de ambiente (veja abaixo)
   - Execute as migrações do banco de dados

4. **Configure as variáveis de ambiente**

   **Opção 1: Script Automático (Recomendado)**
   ```bash
   # Windows
   setup-env.bat
   
   # Linux/Mac
   chmod +x setup-env.sh
   ./setup-env.sh
   ```

   **Opção 2: Manual**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas credenciais do Supabase
   ```

   Você precisará das seguintes variáveis:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave pública (anon key)

   📚 **Para deploy em produção (EasyPanel, Vercel, etc.)**, consulte o guia completo:    **[EASYPANEL_SETUP.md](./docs/EASYPANEL_SETUP.md)**

5. **Execute as migrações**
```bash
npx supabase db push
```

6. **Popule o banco com dados de exemplo**
```bash
npm run seed
```

7. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

8. **Acesse o projeto**
   - Abra [http://localhost:5173](http://localhost:5173)

## 📱 Funcionalidades Principais

### 🌐 **Homepage Pública**
- Busca por código de lote
- Informações sobre o sistema
- Design responsivo e moderno

### 🔐 **Sistema de Autenticação**
- Login e cadastro de usuários
- Proteção de rotas
- Gerenciamento de sessão

### 👨‍💼 **Dashboard Administrativo**
- Visão geral do sistema
- Gestão completa de produtores
- Gestão completa de lotes
- Relatórios e métricas
- Gráficos interativos

### 👨‍🌾 **Painel do Produtor**
- Dashboard específico para produtores
- Gestão de lotes próprios
- Geração de QR Codes
- Métricas individuais
- Configurações de perfil

### 📦 **Sistema de Lotes**
- Códigos únicos para cada lote
- Informações detalhadas do produto
- Análise sensorial
- Rastreabilidade completa

### 🎯 **QR Codes**
- Geração automática de QR codes
- Links diretos para informações do lote
- Download e impressão
- Instruções de uso

## 🔧 Configuração do Supabase

### 1. Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie uma nova conta ou faça login
- Crie um novo projeto

### 2. Configure as variáveis de ambiente
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Execute as migrações
```bash
npx supabase db push
```

### 4. Configure as políticas RLS
As políticas de segurança já estão incluídas no arquivo de migração.

## 📊 Banco de Dados

### Tabelas Principais

#### `producers`
- Informações dos produtores
- Dados da propriedade
- Localização e características

#### `product_lots`
- Informações dos lotes
- Análise sensorial
- Relacionamento com produtores

### Políticas de Segurança (RLS)
- Produtores só veem seus próprios lotes
- Administradores têm acesso total
- Dados públicos para consulta de lotes

## 🎨 Design System

O projeto utiliza o **shadcn/ui** como base de componentes, com:
- Design consistente e moderno
- Componentes acessíveis
- Tema personalizado
- Responsividade completa

## 📈 Próximos Passos

### Fase 4: Funcionalidades Avançadas
- [ ] Sistema de notificações em tempo real
- [ ] API pública para consulta de lotes
- [ ] Integração com mapas e geolocalização
- [ ] Relatórios avançados e exportação
- [ ] Sistema de backup e recuperação

### Fase 5: Polimento e Deploy
- [ ] Testes automatizados
- [ ] Otimizações de performance
- [ ] Deploy em produção
- [ ] Documentação completa da API
- [ ] Monitoramento e analytics

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para a rastreabilidade de produtos com Indicação Geográfica**
