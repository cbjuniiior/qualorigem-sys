# 📊 Diagrama do Banco de Dados - Viva Rastrea

## Diagrama ER (Entity Relationship)

```mermaid
erDiagram
    producers ||--o{ product_lots : "produz"
    producers ||--o{ brands : "possui"
    producers ||--o{ seal_controls : "controla"
    producers ||--o{ lot_components : "fornece componente"
    producers }o--o{ associations : "participa"
    
    product_lots ||--o{ lot_components : "contém"
    product_lots ||--o{ seal_controls : "rastreado por"
    product_lots ||--o{ product_lot_characteristics : "tem"
    product_lots ||--o{ product_lot_sensory : "avaliado por"
    product_lots }o--|| brands : "pertence a"
    product_lots }o--|| industries : "processado por"
    product_lots }o--|| associations : "vinculado a"
    
    characteristics ||--o{ product_lot_characteristics : "define"
    sensory_attributes ||--o{ product_lot_sensory : "mede"
    associations ||--o{ lot_components : "fornece componente"
    
    producers {
        uuid id PK
        text name
        text document_number
        text property_name
        text city
        text state
        double latitude
        double longitude
        text profile_picture_url
        text lot_prefix_mode
        timestamp created_at
    }
    
    product_lots {
        uuid id PK
        text code UK "Código único para busca"
        text name
        text category
        uuid producer_id FK
        uuid brand_id FK
        uuid industry_id FK
        uuid association_id FK
        integer views "Contador de visualizações"
        numeric latitude
        numeric longitude
        text[] photos
        timestamp created_at
    }
    
    lot_components {
        uuid id PK
        uuid lot_id FK
        text component_name
        numeric component_percentage
        uuid producer_id FK
        uuid association_id FK
        numeric latitude
        numeric longitude
        timestamp created_at
    }
    
    brands {
        uuid id PK
        uuid producer_id FK
        text name
        text slug UK
        text logo_url
        timestamp created_at
    }
    
    industries {
        uuid id PK
        text name
        text document_number
        text logo_url
        timestamp created_at
    }
    
    associations {
        uuid id PK
        text name
        text type
        text logo_url
        timestamp created_at
    }
    
    categories {
        uuid id PK
        text name UK
        text description
        timestamp created_at
    }
    
    characteristics {
        uuid id PK
        text name UK
        text description
        timestamp created_at
    }
    
    product_lot_characteristics {
        uuid id PK
        uuid lot_id FK
        uuid characteristic_id FK
        text value
        timestamp created_at
    }
    
    sensory_attributes {
        uuid id PK
        text name UK
        text type "quantitative/qualitative"
        boolean show_radar
        boolean show_average
        timestamp created_at
    }
    
    product_lot_sensory {
        uuid id PK
        uuid lot_id FK
        uuid sensory_attribute_id FK
        numeric value "0-10 ou 0-100"
        timestamp created_at
    }
    
    seal_controls {
        uuid id PK
        uuid lot_id FK
        uuid producer_id FK
        integer seal_number_start
        integer seal_number_end
        integer quantity
        timestamp generation_date
    }
    
    system_configurations {
        uuid id PK
        text key UK
        jsonb value
        text description
        timestamp created_at
    }
```

## Fluxo de Dados Principal

```mermaid
flowchart TD
    A[Produtor] -->|Cadastra| B[Lote de Produto]
    B -->|Pode ter| C[Marca]
    B -->|Pode ser processado por| D[Indústria]
    B -->|Pode pertencer a| E[Associação]
    B -->|Contém| F[Componentes de Blend]
    F -->|Fornecido por| A
    F -->|Pode ser de| E
    B -->|Tem| G[Características]
    B -->|Avaliado por| H[Análise Sensorial]
    B -->|Rastreado por| I[Selos]
    B -->|Visualizado por| J[Consumidor Final]
    J -->|Acessa via| K[Código QR/Busca]
    K -->|Incrementa| L[Contador de Views]
```

## Arquitetura de Segurança (RLS)

```mermaid
flowchart LR
    A[Usuário Público] -->|SELECT| B[Todas as Tabelas]
    C[Usuário Autenticado] -->|SELECT| B
    C -->|INSERT/UPDATE/DELETE| B
    D[Políticas RLS] -->|Controla| B
    E[Supabase Auth] -->|Autentica| C
```

## Fluxo de Criação de Lote Blend

```mermaid
sequenceDiagram
    participant P as Produtor
    participant L as product_lots
    participant C as lot_components
    participant P2 as Outros Produtores
    participant A as Associações
    
    P->>L: Cria lote principal
    L->>C: Adiciona componente 1
    C->>P: Referencia produtor principal
    L->>C: Adiciona componente 2
    C->>P2: Referencia outro produtor
    L->>C: Adiciona componente 3
    C->>A: Referencia associação
    L-->>P: Lote blend completo
```

## Estrutura de Análise Sensorial

```mermaid
graph TD
    A[Lote de Produto] --> B{Tipo de Análise}
    B -->|Legado| C[Campos diretos no lote]
    C --> C1[fragrance_score]
    C --> C2[flavor_score]
    C --> C3[finish_score]
    C --> C4[acidity_score]
    C --> C5[body_score]
    
    B -->|Novo Sistema| D[Tabelas Relacionadas]
    D --> E[sensory_attributes]
    D --> F[product_lot_sensory]
    E --> G[Atributos Quantitativos]
    E --> H[Atributos Qualitativos]
    G --> I[Exibir em Radar]
    G --> J[Calcular Média]
```

## Relacionamentos de Localização

```mermaid
graph LR
    A[Produtor] -->|Tem localização base| B[latitude/longitude]
    C[Lote] -->|Pode ter localização própria| D[latitude/longitude]
    E[Componente de Blend] -->|Pode ter localização própria| F[latitude/longitude]
    
    C -.->|Herda se não definido| B
    E -.->|Herda se não definido| B
```

## Sistema de Prefixos de Lote

```mermaid
flowchart TD
    A[Produtor] --> B{Modo de Prefixo}
    B -->|auto| C[Sistema gera automaticamente]
    B -->|manual| D[Produtor define custom_prefix]
    C --> E[Código do Lote]
    D --> E
    E --> F[Formato: PREFIX-XXXX]
```

## Índices e Performance

```mermaid
graph TD
    A[Consultas Frequentes] --> B[Índices Criados]
    B --> C[idx_product_lots_code]
    B --> D[idx_product_lots_producer]
    B --> E[idx_product_lots_category]
    B --> F[idx_brands_slug]
    B --> G[idx_lot_components_lot]
    
    C -.->|Otimiza| H[Busca por código QR]
    D -.->|Otimiza| I[Lotes de um produtor]
    E -.->|Otimiza| J[Filtro por categoria]
    F -.->|Otimiza| K[Busca de marca]
    G -.->|Otimiza| L[Componentes de blend]
```

## Triggers Automáticos

```mermaid
flowchart LR
    A[UPDATE em qualquer tabela] --> B{Trigger ativo?}
    B -->|Sim| C[update_updated_at_column]
    C --> D[Atualiza campo updated_at]
    D --> E[NOW]
    
    F[Visualização de lote] --> G[increment_lot_views]
    G --> H[views = views + 1]
```

## Dados Iniciais Incluídos

```mermaid
mindmap
  root((Dados Iniciais))
    Categories
      Café
      Erva-Mate
      Cacau
      Açaí
      Outros
    Characteristics
      Variedade
      Processamento
      Torra
      Peneira
      Altitude
    Sensory Attributes
      Fragrância
      Sabor
      Finalização
      Acidez
      Corpo
      Doçura
      Amargor
```

## Legenda

- **PK**: Primary Key (Chave Primária)
- **FK**: Foreign Key (Chave Estrangeira)
- **UK**: Unique Key (Chave Única)
- **||--o{**: Um para Muitos
- **}o--||**: Muitos para Um
- **}o--o{**: Muitos para Muitos

---

**Nota**: Para visualizar os diagramas Mermaid, use:
- GitHub (renderiza automaticamente)
- VS Code com extensão Mermaid
- [Mermaid Live Editor](https://mermaid.live/)
- Qualquer visualizador Markdown que suporte Mermaid
