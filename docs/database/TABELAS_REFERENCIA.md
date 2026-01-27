# 📋 Referência de Tabelas

## Visão Geral

Esta documentação descreve todas as tabelas do banco de dados do QualOrigem-Sys.

---

## 1. user_profiles

**Descrição:** Perfis de usuários administrativos sincronizados com auth.users.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | - | PK, FK para auth.users |
| `email` | TEXT | ❌ | - | Email do usuário |
| `full_name` | TEXT | ✅ | - | Nome completo |
| `role` | TEXT | ✅ | 'admin' | Papel do usuário |
| `is_active` | BOOLEAN | ✅ | true | Se está ativo |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 2. producers

**Descrição:** Produtores cadastrados no sistema.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `name` | TEXT | ❌ | - | Nome do produtor |
| `document_number` | TEXT | ✅ | - | CPF/CNPJ |
| `phone` | TEXT | ✅ | - | Telefone |
| `email` | TEXT | ✅ | - | Email |
| `property_name` | TEXT | ❌ | - | Nome da propriedade |
| `property_description` | TEXT | ✅ | - | Descrição da propriedade |
| `address` | TEXT | ✅ | - | Endereço |
| `city` | TEXT | ❌ | - | Cidade |
| `state` | TEXT | ❌ | - | Estado |
| `cep` | TEXT | ✅ | - | CEP |
| `altitude` | INTEGER | ✅ | - | Altitude em metros |
| `average_temperature` | NUMERIC | ✅ | - | Temperatura média |
| `latitude` | DOUBLE PRECISION | ✅ | - | Latitude |
| `longitude` | DOUBLE PRECISION | ✅ | - | Longitude |
| `photos` | TEXT[] | ✅ | '{}' | URLs das fotos |
| `use_coordinates` | BOOLEAN | ✅ | false | Usar coordenadas no mapa |
| `lot_prefix_mode` | TEXT | ✅ | 'auto' | Modo de prefixo (auto/manual) |
| `custom_prefix` | TEXT | ✅ | - | Prefixo customizado |
| `profile_picture_url` | TEXT | ✅ | - | Foto de perfil |
| `address_internal_only` | BOOLEAN | ✅ | false | Endereço interno |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 3. associations

**Descrição:** Associações e cooperativas.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `name` | TEXT | ❌ | - | Nome da associação |
| `type` | TEXT | ✅ | - | Tipo (Associação/Cooperativa) |
| `description` | TEXT | ✅ | - | Descrição |
| `logo_url` | TEXT | ✅ | - | URL do logo |
| `contact_info` | JSONB | ✅ | '{}' | Informações de contato |
| `city` | TEXT | ✅ | - | Cidade |
| `state` | TEXT | ✅ | - | Estado |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 4. brands

**Descrição:** Marcas vinculadas a produtores.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `producer_id` | UUID | ❌ | - | FK para producers |
| `name` | TEXT | ❌ | - | Nome da marca |
| `slug` | TEXT | ❌ | - | Slug único |
| `logo_url` | TEXT | ✅ | - | URL do logo |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

**Índices:** UNIQUE(producer_id, slug)

---

## 5. industries

**Descrição:** Indústrias processadoras.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `name` | TEXT | ❌ | - | Nome da indústria |
| `document_number` | TEXT | ✅ | - | CNPJ |
| `address` | TEXT | ✅ | - | Endereço |
| `city` | TEXT | ✅ | - | Cidade |
| `state` | TEXT | ✅ | - | Estado |
| `zip_code` | TEXT | ✅ | - | CEP |
| `contact_phone` | TEXT | ✅ | - | Telefone |
| `contact_email` | TEXT | ✅ | - | Email |
| `logo_url` | TEXT | ✅ | - | URL do logo |
| `description` | TEXT | ✅ | - | Descrição |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 6. categories

**Descrição:** Categorias de produtos (Café, Erva-Mate, etc.).

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `name` | TEXT | ❌ | - | Nome (UNIQUE) |
| `description` | TEXT | ✅ | - | Descrição |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 7. characteristics

**Descrição:** Características de produtos (Variedade, Processamento, etc.).

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `name` | TEXT | ❌ | - | Nome (UNIQUE) |
| `description` | TEXT | ✅ | - | Descrição |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 8. sensory_attributes

**Descrição:** Atributos de análise sensorial.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `name` | TEXT | ❌ | - | Nome (UNIQUE) |
| `description` | TEXT | ✅ | - | Descrição |
| `type` | TEXT | ❌ | - | Tipo (quantitative/qualitative) |
| `show_radar` | BOOLEAN | ✅ | true | Mostrar no gráfico radar |
| `show_average` | BOOLEAN | ✅ | true | Mostrar média |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 9. product_lots

**Descrição:** Lotes de produtos rastreados.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `code` | TEXT | ❌ | - | Código único do lote |
| `name` | TEXT | ❌ | - | Nome do lote |
| `category` | TEXT | ✅ | - | Categoria do produto |
| `variety` | TEXT | ✅ | - | Variedade |
| `harvest_year` | TEXT | ✅ | - | Ano de colheita |
| `quantity` | NUMERIC(10,2) | ✅ | - | Quantidade |
| `unit` | TEXT | ✅ | - | Unidade (kg, L, etc.) |
| `image_url` | TEXT | ✅ | - | Imagem principal |
| `producer_id` | UUID | ✅ | - | FK para producers |
| `brand_id` | UUID | ✅ | - | FK para brands |
| `industry_id` | UUID | ✅ | - | FK para industries |
| `association_id` | UUID | ✅ | - | FK para associations |
| `views` | INTEGER | ❌ | 0 | Contador de visualizações |
| `sensory_type` | TEXT | ✅ | 'nota' | Tipo de análise |
| `fragrance_score` | NUMERIC(3,1) | ✅ | - | Nota fragrância (legado) |
| `flavor_score` | NUMERIC(3,1) | ✅ | - | Nota sabor (legado) |
| `finish_score` | NUMERIC(3,1) | ✅ | - | Nota finalização (legado) |
| `acidity_score` | NUMERIC(3,1) | ✅ | - | Nota acidez (legado) |
| `body_score` | NUMERIC(3,1) | ✅ | - | Nota corpo (legado) |
| `sensory_notes` | TEXT | ✅ | - | Notas sensoriais |
| `latitude` | NUMERIC | ✅ | - | Latitude |
| `longitude` | NUMERIC | ✅ | - | Longitude |
| `altitude` | INTEGER | ✅ | - | Altitude |
| `average_temperature` | NUMERIC | ✅ | - | Temperatura média |
| `property_name` | TEXT | ✅ | - | Nome da propriedade |
| `property_description` | TEXT | ✅ | - | Descrição da propriedade |
| `photos` | TEXT[] | ✅ | '{}' | Fotos do lote |
| `address` | TEXT | ✅ | - | Endereço |
| `city` | TEXT | ✅ | - | Cidade |
| `state` | TEXT | ✅ | - | Estado |
| `cep` | TEXT | ✅ | - | CEP |
| `address_internal_only` | BOOLEAN | ✅ | false | Endereço interno |
| `lot_observations` | TEXT | ✅ | - | Observações |
| `seals_quantity` | INTEGER | ✅ | - | Quantidade de selos |
| `video_delay_seconds` | INTEGER | ✅ | 3 | Delay do popup de vídeo |
| `video_description` | TEXT | ✅ | - | Descrição do vídeo |
| `youtube_video_url` | TEXT | ✅ | - | URL do vídeo YouTube |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

**Índices:** UNIQUE(code)

---

## 10. lot_components

**Descrição:** Componentes de blends.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `lot_id` | UUID | ✅ | - | FK para product_lots |
| `component_name` | TEXT | ❌ | - | Nome do componente |
| `component_variety` | TEXT | ✅ | - | Variedade |
| `component_percentage` | NUMERIC | ✅ | - | Percentual |
| `component_quantity` | NUMERIC | ✅ | - | Quantidade |
| `component_unit` | TEXT | ✅ | - | Unidade |
| `component_origin` | TEXT | ✅ | - | Origem |
| `component_harvest_year` | TEXT | ✅ | - | Ano de colheita |
| `producer_id` | UUID | ✅ | - | FK para producers |
| `association_id` | UUID | ✅ | - | FK para associations |
| `latitude` | NUMERIC | ✅ | - | Latitude |
| `longitude` | NUMERIC | ✅ | - | Longitude |
| `altitude` | INTEGER | ✅ | - | Altitude |
| `property_name` | TEXT | ✅ | - | Nome da propriedade |
| `property_description` | TEXT | ✅ | - | Descrição |
| `photos` | TEXT[] | ✅ | '{}' | Fotos |
| `address` | TEXT | ✅ | - | Endereço |
| `city` | TEXT | ✅ | - | Cidade |
| `state` | TEXT | ✅ | - | Estado |
| `cep` | TEXT | ✅ | - | CEP |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 11. product_lot_characteristics

**Descrição:** Relação entre lotes e características.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `lot_id` | UUID | ✅ | - | FK para product_lots |
| `characteristic_id` | UUID | ✅ | - | FK para characteristics |
| `value` | TEXT | ✅ | - | Valor da característica |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |

---

## 12. product_lot_sensory

**Descrição:** Análise sensorial dos lotes.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `lot_id` | UUID | ✅ | - | FK para product_lots |
| `sensory_attribute_id` | UUID | ✅ | - | FK para sensory_attributes |
| `value` | NUMERIC(5,2) | ❌ | - | Valor (0-100) |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |

---

## 13. seal_controls

**Descrição:** Controle de geração de selos.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `lot_id` | UUID | ✅ | - | FK para product_lots |
| `producer_id` | UUID | ✅ | - | FK para producers |
| `seal_type` | TEXT | ❌ | - | Tipo do selo |
| `package_size` | NUMERIC | ❌ | - | Tamanho da embalagem |
| `package_unit` | TEXT | ❌ | - | Unidade da embalagem |
| `total_packages` | INTEGER | ❌ | - | Total de embalagens |
| `total_seals_generated` | INTEGER | ❌ | - | Total de selos gerados |
| `notes` | TEXT | ✅ | - | Observações |
| `generation_date` | TIMESTAMPTZ | ✅ | now() | Data de geração |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 14. producers_associations

**Descrição:** Relação M:N entre produtores e associações.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `producer_id` | UUID | ❌ | - | FK para producers (PK) |
| `association_id` | UUID | ❌ | - | FK para associations (PK) |
| `since` | TIMESTAMPTZ | ✅ | now() | Membro desde |
| `role` | TEXT | ✅ | - | Papel na associação |

**Chave Primária:** (producer_id, association_id)

---

## 15. system_configurations

**Descrição:** Configurações do sistema.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `config_key` | TEXT | ❌ | - | Chave (UNIQUE) |
| `config_value` | JSONB | ❌ | - | Valor JSON |
| `description` | TEXT | ✅ | - | Descrição |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |

---

## 16. tasks

**Descrição:** Tarefas internas do sistema.

| Coluna | Tipo | Nulo | Default | Descrição |
|--------|------|------|---------|-----------|
| `id` | UUID | ❌ | gen_random_uuid() | PK |
| `title` | TEXT | ❌ | - | Título |
| `description` | TEXT | ✅ | - | Descrição |
| `status` | TEXT | ✅ | 'pending' | Status |
| `priority` | TEXT | ✅ | 'medium' | Prioridade |
| `assigned_to` | UUID | ✅ | - | Responsável |
| `due_date` | TIMESTAMPTZ | ✅ | - | Data limite |
| `completed_at` | TIMESTAMPTZ | ✅ | - | Data de conclusão |
| `created_at` | TIMESTAMPTZ | ✅ | now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | ✅ | now() | Data de atualização |
