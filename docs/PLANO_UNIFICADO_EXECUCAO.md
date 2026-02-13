# Plano unificado de execução — QualOrigem

Este documento reúne as tarefas pendentes dos planos **Menu ativo** e **Marca Coletiva UX** para execução em sequência.

---

## Parte 1 — Menu admin: item ativo correto

**Objetivo:** Em Marca Coletiva, ao estar em "Produtores Internos", não destacar também "Cooperativas" no menu.

**Arquivo:** `src/components/layout/AdminLayout.tsx`

**Problema:** Na linha ~124, `isActive` usa `pathname.startsWith(item.href)`. Assim, `/admin/produtores-internos` faz match em `href=/admin/produtores` e os dois itens ficam ativos.

**Alteração (desktop, ~linha 124):**

- De:  
  `const isActive = location.pathname === item.href || (item.href !== baseUrl && location.pathname.startsWith(item.href));`
- Para:  
  `const isActive = location.pathname === item.href || (item.href !== baseUrl && location.pathname.startsWith(item.href + "/"));`

**Mobile (~linha 272):** Manter `location.pathname === item.href` (já está correto). Se no futuro usar `startsWith` no mobile, aplicar a mesma regra com `item.href + "/"`.

---

## Parte 2 — Marca Coletiva: labels e UX

Usar `useTenantLabels()` em todos os pontos abaixo. Em `marca_coletiva`, o hook retorna `producer` = "Cooperativa", `producers` = "Cooperativas", `association` = "Parceiro", `associations` = "Parceiros".

### 2.1 Dashboard (admin)

**Arquivo:** `src/pages/admin/Dashboard.tsx`

- Importar `useTenantLabels`.
- Botão de atalho: "Novo Produtor" → `Novo ${labels.producer}`.
- Sheet: título "Novo Produtor" → `Novo ${labels.producer}`; descrição → usar `labels.producer` (ex.: "Cadastre as informações da cooperativa e sua propriedade.").
- Toast: "Produtor cadastrado com sucesso!" → `${labels.producer} cadastrado com sucesso!`.

### 2.2 Relatórios

**Arquivo:** `src/pages/admin/Relatorios.tsx`

- Importar `useTenantLabels()`.
- "Filtrar por Produtor" → `Filtrar por ${labels.producer}`.
- "Todos os produtores" / "Todos os Produtores" → usar `labels.producers` (minúscula/plural onde fizer sentido).
- "Total Produtores" → `Total ${labels.producers}`.
- "Top Produtores" → `Top ${labels.producers}`.
- "Crescimento de lotes e produtores" → usar label (ex.: "Crescimento de lotes e " + labels.producers.toLowerCase()).

### 2.3 Lotes (admin)

**Arquivo:** `src/pages/admin/Lotes.tsx`

- Importar `useTenantLabels`.
- "Selecione um produtor!" → `Selecione um(a) ${labels.producer.toLowerCase()}!`.
- Na listagem: "Produtor não vinculado" → `${labels.producer} não vinculado(a)`.

### 2.4 Associações

**Arquivo:** `src/pages/admin/Associacoes.tsx`

- Importar `useTenantLabels`.
- Título: usar `labels.associations` (ex.: "Parceiros" em Marca Coletiva).
- Subtítulo: "Entidades que organizam e apoiam os produtores" → "... apoiam os(as) " + labels.producers.toLowerCase() + ".".
- Empty state: "Cadastre associações para organizar seus produtores" → usar `labels.associations` e `labels.producers`.
- Contagem nos cards: "{n} Produtores" → `{n} ${labels.producers}`.

### 2.5 Detalhes do produtor/cooperativa (ProducerDetails)

**Arquivo:** `src/pages/admin/ProducerDetails.tsx`

- Mensagem de erro: "Erro ao carregar produtor" → `Erro ao carregar ${labels.producer.toLowerCase()}`.

### 2.6 Gestão da plataforma (GestaoPlataforma)

**Arquivo:** `src/pages/admin/GestaoPlataforma.tsx`

- Opção de código: "Produtor / Marca + Lote" → `${labels.producer} / Marca + Lote`.
- Textos explicativos que mencionem "produtor" → usar `labels.producer.toLowerCase()` onde fizer sentido.

### 2.7 Área do produtor (role produtor)

**Arquivo:** `src/pages/produtor/Dashboard.tsx`

- Fallback no cumprimento: `|| "Produtor"` → usar um label. Opções:
  - **Mínimo:** adicionar em `use-tenant-labels.ts` algo como `producerGreeting: "Produtor" | "Cooperado"` e usar aqui.
  - **Alternativa:** usar `labels.producer` (em Marca Coletiva ficará "Cooperativa" no fallback).

### 2.8 Verificações rápidas

- **Certificacoes.tsx / Industria:** Trocar qualquer "produtor" ou "cooperativa" em textos de UI por `labels.producer` / `labels.producers`.
- **Configuracoes (tenant):** Se houver copy com "produtor" ou "cooperativa", usar labels.
- **LoteDetails (público):** Já usa labels em ProducersSection; conferir se não resta "Produtor" fixo.

---

## Ordem sugerida de execução

1. **AdminLayout** — correção do `isActive` (Parte 1).
2. **Dashboard, Relatorios, Lotes, Associacoes, ProducerDetails** — Parte 2.1 a 2.5.
3. **GestaoPlataforma** — Parte 2.6.
4. **Produtor Dashboard** — Parte 2.7 (e, se fizer sentido, `producerGreeting` no hook).
5. **Varredura final** — Parte 2.8 (Certificacoes, Industria, Configuracoes, LoteDetails).

---

## Observações

- A migration **MIGRATION_V3_MARCA_COLETIVA.sql** deve estar aplicada para Produtores Internos e Certificações funcionarem por completo.
- Rotas e tabelas não precisam ser alteradas; apenas textos e lógica de menu na UI.
