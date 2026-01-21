# 📊 Documentação do Schema do Banco de Dados - Viva Rastrea

## 📋 Informações Gerais

- **Projeto**: SysRastreabilidade
- **ID do Projeto**: giomnnxpgjrpwyjrkkwr
- **URL**: https://giomnnxpgjrpwyjrkkwr.supabase.co
- **Região**: sa-east-1 (São Paulo, Brasil)
- **PostgreSQL**: 17.6.1.008
- **Status**: ACTIVE_HEALTHY
- **Data de Geração**: 2026-01-21

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **producers** (Produtores)
Armazena informações sobre os produtores cadastrados no sistema.

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome do produtor
- `document_number` (TEXT) - CPF/CNPJ
- `property_name` (TEXT) - Nome da propriedade
- `city`, `state` - Localização
- `latitude`, `longitude` - Coordenadas geográficas
- `profile_picture_url` (TEXT) - Foto de perfil
- `lot_prefix_mode` (TEXT) - Modo de prefixo de lotes (auto/manual)

**Total de registros**: 6

---

#### 2. **product_lots** (Lotes de Produtos)
Tabela central do sistema, armazena todos os lotes rastreáveis.

**Campos principais:**
- `id` (UUID) - Identificador único
- `code` (TEXT) - Código único do lote (para busca pública)
- `name` (TEXT) - Nome do produto
- `category` (TEXT) - Categoria do produto
- `producer_id` (UUID) - Referência ao produtor
- `brand_id` (UUID) - Referência à marca
- `industry_id` (UUID) - Referência à indústria
- `association_id` (UUID) - Referência à associação
- `views` (INTEGER) - Contador de visualizações
- `latitude`, `longitude` - Localização do lote
- `photos` (TEXT[]) - Array de URLs de fotos
- `video_description` (TEXT) - Descrição do vídeo

**Campos de análise sensorial (legados)**:
- `fragrance_score`, `flavor_score`, `finish_score`, `acidity_score`, `body_score`

**Total de registros**: 3

---

#### 3. **lot_components** (Componentes de Blend)
Para lotes que são compostos por múltiplos componentes (blends).

**Campos principais:**
- `id` (UUID) - Identificador único
- `lot_id` (UUID) - Referência ao lote principal
- `component_name` (TEXT) - Nome do componente
- `component_percentage` (NUMERIC) - Percentual no blend
- `producer_id` (UUID) - Produtor do componente
- `association_id` (UUID) - Associação do componente
- `latitude`, `longitude` - Localização do componente

**Total de registros**: 0

---

#### 4. **brands** (Marcas)
Marcas dos produtores.

**Campos principais:**
- `id` (UUID) - Identificador único
- `producer_id` (UUID) - Produtor dono da marca
- `name` (TEXT) - Nome da marca
- `slug` (TEXT) - Slug único (URL-friendly)
- `logo_url` (TEXT) - Logo da marca

**Total de registros**: 0

---

#### 5. **industries** (Indústrias)
Indústrias parceiras que processam os produtos.

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome da indústria
- `document_number` (TEXT) - CNPJ
- `logo_url` (TEXT) - Logo da indústria

**Total de registros**: 0

---

#### 6. **associations** (Associações)
Associações de produtores.

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome da associação
- `type` (TEXT) - Tipo de associação
- `logo_url` (TEXT) - Logo da associação

**Total de registros**: 0

---

#### 7. **categories** (Categorias)
Categorias de produtos (Café, Erva-Mate, Cacau, etc.).

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome da categoria (único)
- `description` (TEXT) - Descrição

**Categorias padrão**:
- Café
- Erva-Mate
- Cacau
- Açaí
- Outros

**Total de registros**: 0

---

#### 8. **characteristics** (Características)
Características que podem ser atribuídas aos produtos.

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome da característica (único)
- `description` (TEXT) - Descrição

**Características padrão**:
- Variedade
- Processamento
- Torra
- Peneira
- Altitude

**Total de registros**: 0

---

#### 9. **product_lot_characteristics** (Características dos Lotes)
Tabela de junção entre lotes e características.

**Campos principais:**
- `id` (UUID) - Identificador único
- `lot_id` (UUID) - Referência ao lote
- `characteristic_id` (UUID) - Referência à característica
- `value` (TEXT) - Valor da característica

**Total de registros**: 0

---

#### 10. **sensory_attributes** (Atributos Sensoriais)
Atributos para análise sensorial dos produtos.

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome do atributo (único)
- `type` (TEXT) - Tipo: 'quantitative' ou 'qualitative'
- `show_radar` (BOOLEAN) - Mostrar no gráfico radar
- `show_average` (BOOLEAN) - Mostrar média

**Atributos padrão**:
- Fragrância (quantitativo)
- Sabor (quantitativo)
- Finalização (quantitativo)
- Acidez (quantitativo)
- Corpo (quantitativo)
- Doçura (qualitativo)
- Amargor (qualitativo)

**Total de registros**: 1

---

#### 11. **product_lot_sensory** (Análise Sensorial dos Lotes)
Tabela de junção entre lotes e atributos sensoriais.

**Campos principais:**
- `id` (UUID) - Identificador único
- `lot_id` (UUID) - Referência ao lote
- `sensory_attribute_id` (UUID) - Referência ao atributo
- `value` (NUMERIC) - Valor numérico (0-10 ou 0-100)

**Total de registros**: 6

---

#### 12. **seal_controls** (Controle de Selos)
Sistema de controle de selos de rastreabilidade.

**Campos principais:**
- `id` (UUID) - Identificador único
- `lot_id` (UUID) - Referência ao lote
- `producer_id` (UUID) - Referência ao produtor
- `seal_number_start` (INTEGER) - Número inicial do selo
- `seal_number_end` (INTEGER) - Número final do selo
- `quantity` (INTEGER) - Quantidade de selos

**Total de registros**: 0

---

#### 13. **system_configurations** (Configurações do Sistema)
Configurações gerais da plataforma.

**Campos principais:**
- `id` (UUID) - Identificador único
- `key` (TEXT) - Chave da configuração (único)
- `value` (JSONB) - Valor em formato JSON
- `description` (TEXT) - Descrição

**Total de registros**: 1

---

#### 14. **tasks** (Tarefas)
Sistema de gerenciamento de tarefas.

**Campos principais:**
- `id` (UUID) - Identificador único
- `title` (TEXT) - Título da tarefa
- `status` (TEXT) - Status (pending, in_progress, completed)
- `priority` (TEXT) - Prioridade (low, medium, high)
- `assigned_to` (UUID) - Usuário responsável

**Total de registros**: 0

---

## 🔗 Relacionamentos (Foreign Keys)

```
brands.producer_id → producers.id (CASCADE)
lot_components.lot_id → product_lots.id (CASCADE)
lot_components.producer_id → producers.id (SET NULL)
lot_components.association_id → associations.id (SET NULL)
product_lots.producer_id → producers.id (CASCADE)
product_lots.brand_id → brands.id (SET NULL)
product_lots.industry_id → industries.id
product_lots.association_id → associations.id
product_lot_characteristics.lot_id → product_lots.id (CASCADE)
product_lot_characteristics.characteristic_id → characteristics.id (CASCADE)
product_lot_sensory.lot_id → product_lots.id (CASCADE)
product_lot_sensory.sensory_attribute_id → sensory_attributes.id (CASCADE)
seal_controls.lot_id → product_lots.id (CASCADE)
seal_controls.producer_id → producers.id (CASCADE)
```

---

## 🔒 Segurança (Row Level Security)

### Políticas Implementadas

**Leitura Pública** (SELECT):
- ✅ Todas as tabelas permitem leitura pública
- Permite que consumidores vejam informações dos produtos

**Escrita Autenticada** (INSERT/UPDATE/DELETE):
- ✅ Apenas usuários autenticados podem modificar dados
- Protege contra modificações não autorizadas

### Tabelas com RLS Habilitado

Todas as 14 tabelas principais têm RLS habilitado:
- producers
- product_lots
- brands
- lot_components
- seal_controls
- system_configurations
- associations
- industries
- categories
- characteristics
- product_lot_characteristics
- sensory_attributes
- product_lot_sensory
- tasks

---

## ⚡ Funções e Triggers

### Funções

1. **update_updated_at_column()**
   - Atualiza automaticamente o campo `updated_at`
   - Usado em triggers de todas as tabelas

2. **handle_updated_at()**
   - Função alternativa para updated_at
   - Compatibilidade com diferentes padrões

3. **increment_lot_views(lot_code TEXT)**
   - Incrementa o contador de visualizações de um lote
   - Usado quando alguém acessa a página do lote

### Triggers

Todas as tabelas principais têm triggers para atualizar `updated_at`:
- update_producers_updated_at
- update_product_lots_updated_at
- update_brands_updated_at
- update_lot_components_updated_at
- update_categories_updated_at
- update_characteristics_updated_at
- update_sensory_attributes_updated_at
- update_seal_controls_updated_at
- update_system_configurations_updated_at
- update_industries_updated_at
- update_associations_updated_at
- update_tasks_updated_at

---

## 📊 Índices para Performance

### Índices Principais

**product_lots**:
- `idx_product_lots_code` - Busca por código
- `idx_product_lots_producer` - Filtro por produtor
- `idx_product_lots_category` - Filtro por categoria
- `idx_product_lots_brand` - Filtro por marca
- `idx_product_lots_industry` - Filtro por indústria
- `idx_product_lots_association` - Filtro por associação

**lot_components**:
- `idx_lot_components_lot` - Busca componentes de um lote
- `idx_lot_components_producer` - Filtro por produtor
- `idx_lot_components_association` - Filtro por associação

**brands**:
- `idx_brands_producer` - Marcas de um produtor
- `idx_brands_slug` - Busca por slug

**seal_controls**:
- `idx_seal_controls_lot` - Selos de um lote
- `idx_seal_controls_producer` - Selos de um produtor

**Características e Análise Sensorial**:
- `idx_lot_characteristics_lot` - Características de um lote
- `idx_lot_sensory_lot` - Análise sensorial de um lote

---

## 🚀 Como Usar Este Schema

### 1. Criar Novo Banco de Dados

```bash
# No Supabase SQL Editor ou qualquer PostgreSQL
psql -U postgres -d seu_banco < database_complete_schema.sql
```

### 2. Verificar Instalação

```sql
-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### 3. Dados Iniciais

O schema já inclui dados iniciais:
- 5 categorias padrão (Café, Erva-Mate, Cacau, Açaí, Outros)
- 5 características padrão (Variedade, Processamento, Torra, Peneira, Altitude)
- 7 atributos sensoriais padrão (Fragrância, Sabor, Finalização, etc.)

---

## 📝 Notas Importantes

### Campos Legados

A tabela `product_lots` mantém campos de análise sensorial legados para compatibilidade:
- `fragrance_score`
- `flavor_score`
- `finish_score`
- `acidity_score`
- `body_score`
- `sensory_notes`

**Recomendação**: Use as tabelas `sensory_attributes` e `product_lot_sensory` para nova análise sensorial, pois são mais flexíveis.

### Campos de Propriedade

Os campos de propriedade foram movidos de `producers` para `product_lots`:
- `property_name`
- `property_description`
- `photos`
- `altitude`
- `average_temperature`
- `address`, `city`, `state`, `cep`
- `latitude`, `longitude`

Isso permite que cada lote tenha sua própria localização, útil para blends de múltiplas propriedades.

### Sistema de Blend

Para criar um lote blend:
1. Crie o lote principal em `product_lots`
2. Adicione os componentes em `lot_components`
3. Cada componente pode ter seu próprio produtor e localização

---

## 🔄 Migrações Aplicadas

Total de **23 migrações** aplicadas no banco de dados original:

1. Segurança e Performance
2. Funcionalidades Core
3. Features Avançadas (YouTube, Blend, Selos)
4. Gestão de Marcas e Localização
5. Otimizações Recentes (Plataforma, Análise Sensorial)

---

## 📞 Suporte

Para dúvidas sobre o schema:
1. Consulte este documento
2. Verifique o arquivo `database_complete_schema.sql`
3. Revise as migrações em `supabase/migrations/`

---

**Última atualização**: 2026-01-21  
**Versão do Schema**: 1.0  
**PostgreSQL**: 17.6.1.008
