# 🚀 Guia Rápido - Banco de Dados Viva Rastrea

## 📦 Arquivos Gerados

Foram criados **6 arquivos** completos para você:

### 1. `database_complete_schema.sql` ⭐
**O arquivo principal!** Contém toda a estrutura do banco de dados.

**O que inclui:**
- ✅ Todas as 14 tabelas
- ✅ Todas as funções e triggers
- ✅ Todos os índices para performance
- ✅ Todas as políticas RLS (segurança)
- ✅ Todos os relacionamentos (Foreign Keys)
- ✅ **2 Storage Buckets** (propriedades e branding)
- ✅ Políticas RLS para Storage
- ✅ Dados iniciais (categorias, características, atributos sensoriais)

**Como usar:**
```bash
# No Supabase SQL Editor
# Cole o conteúdo completo e execute

# Ou via psql
psql -U postgres -d seu_banco < database_complete_schema.sql
```

---

### 2. `DATABASE_SCHEMA_README.md` 📖
Documentação completa do banco de dados.

**O que inclui:**
- 📊 Descrição detalhada de cada tabela
- 🔗 Todos os relacionamentos
- 🔒 Políticas de segurança (RLS)
- ⚡ Funções e triggers
- 📈 Índices e otimizações
- 💡 Notas importantes e recomendações

---

### 3. `DATABASE_DIAGRAMS.md` 🎨
Diagramas visuais do banco de dados.

**O que inclui:**
- 🗺️ Diagrama ER (Entity Relationship) completo
- 🔄 Fluxos de dados
- 🏗️ Arquitetura de segurança
- 📊 Estrutura de análise sensorial
- 🌍 Relacionamentos de localização
- 🎯 Sistema de prefixos de lote

**Como visualizar:**
- GitHub (renderiza automaticamente)
- VS Code com extensão Mermaid Preview
- [Mermaid Live Editor](https://mermaid.live/)

---

### 4. `DATABASE_QUERIES_EXAMPLES.sql` 💻
Exemplos práticos de queries SQL.

**O que inclui:**
- 🔍 Consultas básicas
- 📊 Estatísticas e métricas
- 🎯 Análise sensorial
- 🔀 Blends e componentes
- 🏷️ Marcas e indústrias
- 🌍 Geolocalização
- 🎫 Controle de selos
- 📅 Relatórios temporais
- 🔧 Queries de manutenção

---

### 5. `STORAGE_BUCKETS_GUIDE.md` 📦
Guia completo sobre Storage Buckets.

**O que inclui:**
- 🗂️ Configuração dos 2 buckets (propriedades e branding)
- 🔒 Políticas de segurança RLS
- 📤 Funções de upload
- 📏 Limites e restrições
- 🌐 URLs públicas
- 🛠️ Gerenciamento de arquivos
- ⚠️ Troubleshooting
- ✅ Checklist de configuração

---

## 🎯 Como Usar Este Schema

### Opção 1: Criar Novo Banco (Recomendado)

1. **Acesse o Supabase SQL Editor**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto
   - Clique em "SQL Editor"

2. **Cole o Schema Completo**
   - Abra o arquivo `database_complete_schema.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em "Run"

3. **Verifique a Instalação**
   ```sql
   -- Listar todas as tabelas criadas
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### Opção 2: Usar em Outro Editor SQL

```bash
# PostgreSQL local
psql -U postgres -d nome_do_banco < database_complete_schema.sql

# Via pgAdmin
# 1. Abra o pgAdmin
# 2. Conecte ao banco de dados
# 3. Tools > Query Tool
# 4. File > Open > Selecione database_complete_schema.sql
# 5. Execute (F5)
```

---

## 📊 Estrutura Resumida

### Tabelas Principais (14)

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| **producers** | 6 | Produtores cadastrados |
| **product_lots** | 3 | Lotes de produtos |
| **lot_components** | 0 | Componentes de blend |
| **brands** | 0 | Marcas dos produtores |
| **industries** | 0 | Indústrias parceiras |
| **associations** | 0 | Associações de produtores |
| **categories** | 0 | Categorias de produtos |
| **characteristics** | 0 | Características dos produtos |
| **product_lot_characteristics** | 0 | Características dos lotes |
| **sensory_attributes** | 1 | Atributos sensoriais |
| **product_lot_sensory** | 6 | Análise sensorial |
| **seal_controls** | 0 | Controle de selos |
| **system_configurations** | 1 | Configurações do sistema |
| **tasks** | 0 | Sistema de tarefas |

---

## 🔑 Funcionalidades Principais

### 1. Rastreabilidade Completa
```sql
-- Buscar lote por código QR
SELECT * FROM product_lots WHERE code = 'CAFE001';
```

### 2. Sistema de Blend
```sql
-- Lote com múltiplos componentes
INSERT INTO lot_components (lot_id, component_name, component_percentage)
VALUES ('uuid-do-lote', 'Café Arábica', 60);
```

### 3. Análise Sensorial Flexível
```sql
-- Nova análise sensorial
INSERT INTO product_lot_sensory (lot_id, sensory_attribute_id, value)
VALUES ('uuid-do-lote', 'uuid-do-atributo', 8.5);
```

### 4. Geolocalização
```sql
-- Lotes com coordenadas
SELECT code, name, latitude, longitude 
FROM product_lots 
WHERE latitude IS NOT NULL;
```

### 5. Controle de Selos
```sql
-- Gerar lote de selos
INSERT INTO seal_controls (lot_id, producer_id, seal_number_start, seal_number_end, quantity)
VALUES ('uuid-lote', 'uuid-produtor', 1000, 1999, 1000);
```

---

## 🔒 Segurança (RLS)

### Políticas Implementadas

**Leitura Pública** ✅
- Qualquer pessoa pode ver produtores, lotes e análises
- Perfeito para consumidores consultarem via QR Code

**Escrita Autenticada** 🔐
- Apenas usuários autenticados podem criar/editar
- Protege contra modificações não autorizadas

### Exemplo de Uso

```sql
-- Público pode fazer:
SELECT * FROM product_lots WHERE code = 'CAFE001';

-- Apenas autenticado pode fazer:
INSERT INTO product_lots (code, name, producer_id)
VALUES ('CAFE002', 'Café Premium', 'uuid-produtor');
```

---

## 📈 Dados Iniciais Incluídos

### Categorias (5)
- ☕ Café
- 🌿 Erva-Mate
- 🍫 Cacau
- 🫐 Açaí
- 📦 Outros

### Características (5)
- 🌱 Variedade
- ⚙️ Processamento
- 🔥 Torra
- 📏 Peneira
- ⛰️ Altitude

### Atributos Sensoriais (7)
- 👃 Fragrância (quantitativo)
- 👅 Sabor (quantitativo)
- 🎯 Finalização (quantitativo)
- 🍋 Acidez (quantitativo)
- 💪 Corpo (quantitativo)
- 🍯 Doçura (qualitativo)
- ☕ Amargor (qualitativo)

---

## 🎯 Casos de Uso Comuns

### 1. Criar um Novo Lote Simples

```sql
-- 1. Inserir o lote
INSERT INTO product_lots (code, name, category, producer_id)
VALUES ('CAFE001', 'Café Especial', 'Café', 'uuid-do-produtor')
RETURNING id;

-- 2. Adicionar análise sensorial
INSERT INTO product_lot_sensory (lot_id, sensory_attribute_id, value)
VALUES 
  ('uuid-do-lote', 'uuid-fragrancia', 9.0),
  ('uuid-do-lote', 'uuid-sabor', 8.5);
```

### 2. Criar um Lote Blend

```sql
-- 1. Criar lote principal
INSERT INTO product_lots (code, name, category)
VALUES ('BLEND001', 'Blend Premium', 'Café')
RETURNING id;

-- 2. Adicionar componentes
INSERT INTO lot_components (lot_id, component_name, component_percentage, producer_id)
VALUES 
  ('uuid-lote', 'Arábica Bourbon', 60, 'uuid-produtor-1'),
  ('uuid-lote', 'Arábica Catuaí', 40, 'uuid-produtor-2');
```

### 3. Consultar Lote Completo

```sql
SELECT 
    pl.*,
    p.name AS producer_name,
    (
        SELECT json_agg(json_build_object(
            'name', lc.component_name,
            'percentage', lc.component_percentage
        ))
        FROM lot_components lc
        WHERE lc.lot_id = pl.id
    ) AS components,
    (
        SELECT json_agg(json_build_object(
            'attribute', sa.name,
            'value', pls.value
        ))
        FROM product_lot_sensory pls
        JOIN sensory_attributes sa ON pls.sensory_attribute_id = sa.id
        WHERE pls.lot_id = pl.id
    ) AS sensory_analysis
FROM product_lots pl
LEFT JOIN producers p ON pl.producer_id = p.id
WHERE pl.code = 'CAFE001';
```

---

## ⚡ Performance

### Índices Criados

- ✅ `idx_product_lots_code` - Busca rápida por código
- ✅ `idx_product_lots_producer` - Filtro por produtor
- ✅ `idx_product_lots_category` - Filtro por categoria
- ✅ E mais 10 índices adicionais

### Triggers Automáticos

- ✅ Atualização automática de `updated_at`
- ✅ Incremento de visualizações
- ✅ Validações de integridade

---

## 🔧 Manutenção

### Verificar Saúde do Banco

```sql
-- Tamanho das tabelas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Número de registros
SELECT 
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Backup Recomendado

```bash
# Backup completo
pg_dump -U postgres -d nome_do_banco > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U postgres -d nome_do_banco < backup_20260121.sql
```

---

## 📞 Próximos Passos

1. ✅ Execute o `database_complete_schema.sql`
2. ✅ Verifique se todas as tabelas foram criadas
3. ✅ Teste com as queries de exemplo
4. ✅ Consulte a documentação quando necessário
5. ✅ Use os diagramas para entender relacionamentos

---

## 💡 Dicas Importantes

### ✅ Faça
- Use os índices criados para buscas rápidas
- Aproveite as políticas RLS para segurança
- Consulte os exemplos de queries
- Mantenha backups regulares

### ❌ Evite
- Modificar estrutura sem backup
- Desabilitar RLS em produção
- Fazer queries sem WHERE em tabelas grandes
- Ignorar os índices criados

---

## 🎓 Recursos Adicionais

- 📖 [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- 🔒 [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- 🎨 [Mermaid Diagrams](https://mermaid.js.org/)
- 💻 [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

## ✨ Resumo

Você agora tem:
- ✅ Schema SQL completo e pronto para usar
- ✅ **2 Storage Buckets** configurados (propriedades e branding)
- ✅ Documentação detalhada
- ✅ Diagramas visuais
- ✅ Exemplos práticos de queries
- ✅ Guia completo de Storage
- ✅ Sistema de segurança configurado (RLS)
- ✅ Performance otimizada com índices
- ✅ Dados iniciais incluídos

**Tudo pronto para criar seu banco de dados completo em qualquer SQL Editor!** 🚀

---

**Última atualização**: 2026-01-21  
**Versão**: 1.0  
**Compatível com**: PostgreSQL 12+, Supabase
