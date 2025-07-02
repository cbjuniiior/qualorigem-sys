# 🚀 Setup do Projeto GeoTrace

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd geo-trace-origin-link
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   - Acesse o [dashboard do Supabase](https://supabase.com/dashboard)
   - Crie um novo projeto ou use um existente
   - Copie as credenciais do projeto

4. **Execute o SQL no Supabase**
   - Vá para o SQL Editor no dashboard do Supabase
   - Execute o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`

```sql
-- Remover as tabelas específicas de café e criar versões genéricas
DROP TABLE IF EXISTS public.coffee_lots CASCADE;
DROP TABLE IF EXISTS public.coffee_producers CASCADE;

-- Criar tabela genérica de produtores
CREATE TABLE public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_number TEXT, -- CPF/CNPJ
  phone TEXT,
  email TEXT,
  property_name TEXT NOT NULL,
  property_description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  altitude INTEGER,
  average_temperature DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela genérica de produtos/lotes
CREATE TABLE public.product_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- Código do lote para busca
  name TEXT NOT NULL,
  category TEXT, -- Ex: "Café", "Vinho", "Queijo", etc.
  variety TEXT, -- Variedade do produto
  harvest_year TEXT,
  quantity DECIMAL(10,2),
  unit TEXT, -- Kg, L, unidades, etc.
  image_url TEXT,
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  
  -- Análise sensorial genérica
  fragrance_score DECIMAL(3,1) CHECK (fragrance_score >= 0 AND fragrance_score <= 10),
  flavor_score DECIMAL(3,1) CHECK (flavor_score >= 0 AND flavor_score <= 10),
  finish_score DECIMAL(3,1) CHECK (finish_score >= 0 AND finish_score <= 10),
  acidity_score DECIMAL(3,1) CHECK (acidity_score >= 0 AND acidity_score <= 10),
  body_score DECIMAL(3,1) CHECK (body_score >= 0 AND body_score <= 10),
  sensory_notes TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;

-- Políticas para produtores (públicas para leitura, autenticadas para escrita)
CREATE POLICY "Anyone can view producers" 
  ON public.producers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert producers" 
  ON public.producers FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update producers" 
  ON public.producers FOR UPDATE 
  TO authenticated 
  USING (true);

-- Políticas para lotes de produtos (públicas para leitura, autenticadas para escrita)
CREATE POLICY "Anyone can view product lots" 
  ON public.product_lots FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert product lots" 
  ON public.product_lots FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product lots" 
  ON public.product_lots FOR UPDATE 
  TO authenticated 
  USING (true);

-- Índices para melhor performance
CREATE INDEX idx_product_lots_code ON public.product_lots(code);
CREATE INDEX idx_product_lots_producer ON public.product_lots(producer_id);
CREATE INDEX idx_product_lots_category ON public.product_lots(category);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_producers_updated_at 
  BEFORE UPDATE ON public.producers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_lots_updated_at 
  BEFORE UPDATE ON public.product_lots 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Popule o banco com dados de exemplo**
   - Abra o console do navegador (F12)
   - Execute o comando:
```javascript
await window.seedDatabase()
```

## 🎯 Funcionalidades Implementadas

### ✅ **Fase 1: Banco de Dados e Autenticação**
- [x] Estrutura de tabelas no Supabase
- [x] Políticas RLS configuradas
- [x] Sistema de autenticação
- [x] Páginas de login/cadastro
- [x] Proteção de rotas
- [x] Integração com dados reais

### ✅ **Fase 2: Dashboard Administrativo**
- [x] Layout base do dashboard com sidebar
- [x] Dashboard principal com métricas
- [x] CRUD completo de produtores
- [x] CRUD completo de lotes
- [x] Sistema de relatórios e métricas
- [x] Formulários com validações
- [x] Design responsivo e moderno

### ✅ **Funcionalidades Públicas**
- [x] Homepage com busca por código
- [x] Página de detalhes do lote
- [x] Gráfico radar da análise sensorial
- [x] Design responsivo e moderno

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   ├── SensorialRadarChart.tsx
│   └── ProtectedRoute.tsx
├── hooks/              # Hooks personalizados
│   └── use-auth.tsx
├── pages/              # Páginas da aplicação
│   ├── auth/           # Páginas de autenticação
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Index.tsx       # Homepage pública
│   └── LoteDetails.tsx # Detalhes do lote
├── services/           # Serviços de API
│   └── api.ts
├── data/               # Dados de exemplo
│   └── sample-data.ts
└── scripts/            # Scripts utilitários
    └── seed-database.ts
```

## 🚀 Próximos Passos

### ✅ **Fase 3: Painel do Produtor** - CONCLUÍDA
- [x] Layout específico para produtores
- [x] Dashboard do produtor com métricas próprias
- [x] Gestão de lotes próprios (CRUD)
- [x] Sistema de QR Codes
- [x] Métricas e análises individuais
- [x] Configurações de perfil
- [x] Interface responsiva e moderna

### 🔄 **Fase 4: Funcionalidades Avançadas** - EM DESENVOLVIMENTO
- [ ] Sistema de notificações em tempo real
- [ ] API pública para consulta de lotes
- [ ] Integração com mapas e geolocalização
- [ ] Relatórios avançados e exportação
- [ ] Sistema de backup e recuperação

### 📋 **Fase 5: Polimento e Deploy** - PENDENTE
- [ ] Testes automatizados
- [ ] Otimizações de performance
- [ ] Deploy em produção
- [ ] Documentação completa
- [ ] Monitoramento e analytics
- [ ] Dashboard específico para produtores
- [ ] Visualização dos próprios lotes
- [ ] Geração automática de QR Codes
- [ ] Sistema de primeira senha obrigatória

### **Fase 4: Funcionalidades Avançadas**
- [ ] Scanner QR real
- [ ] Upload de imagens
- [ ] Integração com API de CEP
- [ ] Máscaras para CPF/CNPJ
- [ ] Sistema de links públicos para compartilhamento

## 🧪 Testando

1. **Acesse a homepage**: `http://localhost:5173`
2. **Teste a busca**: Use os códigos `CAFE001`, `CAFE002`, `CAFE003`, `VINHO001`, `QUEIJO001`
3. **Teste o login**: Acesse `/auth/login` e crie uma conta
4. **Acesse o dashboard**: Após o login, você será redirecionado para `/admin`
5. **Teste o CRUD**: Crie, edite e exclua produtores e lotes
6. **Verifique os relatórios**: Acesse `/admin/relatorios` para ver as métricas
7. **Verifique os dados**: Confirme se os dados estão sendo carregados do Supabase

## 📝 Notas

- O sistema está configurado para permitir leitura pública dos lotes
- A escrita (criar/editar) requer autenticação
- Os dados de exemplo incluem diferentes categorias de produtos
- O design é totalmente responsivo e mobile-first 