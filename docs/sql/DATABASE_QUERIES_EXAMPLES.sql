-- =====================================================
-- QUERIES ÚTEIS - VIVA RASTREA
-- Exemplos de consultas SQL para o sistema
-- =====================================================

-- =====================================================
-- 1. CONSULTAS BÁSICAS
-- =====================================================

-- Listar todos os produtores
SELECT id, name, city, state, property_name
FROM producers
ORDER BY name;

-- Listar todos os lotes com informações do produtor
SELECT 
    pl.code,
    pl.name AS product_name,
    pl.category,
    p.name AS producer_name,
    p.city,
    p.state,
    pl.views,
    pl.created_at
FROM product_lots pl
LEFT JOIN producers p ON pl.producer_id = p.id
ORDER BY pl.created_at DESC;

-- Buscar lote por código (como consumidor faria)
SELECT 
    pl.*,
    p.name AS producer_name,
    p.property_name,
    p.city,
    p.state,
    b.name AS brand_name,
    i.name AS industry_name,
    a.name AS association_name
FROM product_lots pl
LEFT JOIN producers p ON pl.producer_id = p.id
LEFT JOIN brands b ON pl.brand_id = b.id
LEFT JOIN industries i ON pl.industry_id = i.id
LEFT JOIN associations a ON pl.association_id = a.id
WHERE pl.code = 'SEU_CODIGO_AQUI';

-- =====================================================
-- 2. ESTATÍSTICAS E MÉTRICAS
-- =====================================================

-- Total de produtores, lotes e visualizações
SELECT 
    (SELECT COUNT(*) FROM producers) AS total_producers,
    (SELECT COUNT(*) FROM product_lots) AS total_lots,
    (SELECT SUM(views) FROM product_lots) AS total_views;

-- Lotes mais visualizados
SELECT 
    pl.code,
    pl.name,
    pl.views,
    p.name AS producer_name
FROM product_lots pl
LEFT JOIN producers p ON pl.producer_id = p.id
ORDER BY pl.views DESC
LIMIT 10;

-- Produtores com mais lotes
SELECT 
    p.name,
    p.city,
    p.state,
    COUNT(pl.id) AS total_lots
FROM producers p
LEFT JOIN product_lots pl ON p.id = pl.producer_id
GROUP BY p.id, p.name, p.city, p.state
ORDER BY total_lots DESC;

-- Lotes por categoria
SELECT 
    category,
    COUNT(*) AS total,
    SUM(views) AS total_views
FROM product_lots
GROUP BY category
ORDER BY total DESC;

-- =====================================================
-- 3. ANÁLISE SENSORIAL
-- =====================================================

-- Análise sensorial completa de um lote
SELECT 
    pl.code,
    pl.name,
    sa.name AS attribute_name,
    sa.type AS attribute_type,
    pls.value,
    sa.show_radar
FROM product_lots pl
JOIN product_lot_sensory pls ON pl.id = pls.lot_id
JOIN sensory_attributes sa ON pls.sensory_attribute_id = sa.id
WHERE pl.code = 'SEU_CODIGO_AQUI'
ORDER BY sa.name;

-- Média de atributos sensoriais por categoria
SELECT 
    pl.category,
    sa.name AS attribute_name,
    ROUND(AVG(pls.value), 2) AS average_value
FROM product_lots pl
JOIN product_lot_sensory pls ON pl.id = pls.lot_id
JOIN sensory_attributes sa ON pls.sensory_attribute_id = sa.id
WHERE sa.type = 'quantitative'
GROUP BY pl.category, sa.name
ORDER BY pl.category, sa.name;

-- Lotes com melhor avaliação sensorial (média geral)
SELECT 
    pl.code,
    pl.name,
    p.name AS producer_name,
    ROUND(AVG(pls.value), 2) AS average_score
FROM product_lots pl
JOIN product_lot_sensory pls ON pl.id = pls.lot_id
JOIN producers p ON pl.producer_id = p.id
JOIN sensory_attributes sa ON pls.sensory_attribute_id = sa.id
WHERE sa.type = 'quantitative'
GROUP BY pl.id, pl.code, pl.name, p.name
ORDER BY average_score DESC
LIMIT 10;

-- =====================================================
-- 4. BLENDS E COMPONENTES
-- =====================================================

-- Lotes que são blends (têm componentes)
SELECT 
    pl.code,
    pl.name,
    COUNT(lc.id) AS num_components
FROM product_lots pl
JOIN lot_components lc ON pl.id = lc.lot_id
GROUP BY pl.id, pl.code, pl.name
ORDER BY num_components DESC;

-- Detalhes completos de um blend
SELECT 
    pl.code AS lot_code,
    pl.name AS lot_name,
    lc.component_name,
    lc.component_percentage,
    p.name AS component_producer,
    a.name AS component_association,
    lc.city,
    lc.state
FROM product_lots pl
JOIN lot_components lc ON pl.id = lc.lot_id
LEFT JOIN producers p ON lc.producer_id = p.id
LEFT JOIN associations a ON lc.association_id = a.id
WHERE pl.code = 'SEU_CODIGO_AQUI'
ORDER BY lc.component_percentage DESC;

-- Verificar se percentuais de blend somam 100%
SELECT 
    pl.code,
    pl.name,
    SUM(lc.component_percentage) AS total_percentage
FROM product_lots pl
JOIN lot_components lc ON pl.id = lc.lot_id
GROUP BY pl.id, pl.code, pl.name
HAVING SUM(lc.component_percentage) != 100;

-- =====================================================
-- 5. MARCAS E INDÚSTRIAS
-- =====================================================

-- Lotes por marca
SELECT 
    b.name AS brand_name,
    COUNT(pl.id) AS total_lots,
    p.name AS producer_name
FROM brands b
LEFT JOIN product_lots pl ON b.id = pl.brand_id
LEFT JOIN producers p ON b.producer_id = p.id
GROUP BY b.id, b.name, p.name
ORDER BY total_lots DESC;

-- Lotes processados por indústria
SELECT 
    i.name AS industry_name,
    i.city,
    COUNT(pl.id) AS total_lots
FROM industries i
LEFT JOIN product_lots pl ON i.id = pl.industry_id
GROUP BY i.id, i.name, i.city
ORDER BY total_lots DESC;

-- =====================================================
-- 6. GEOLOCALIZAÇÃO
-- =====================================================

-- Lotes com coordenadas geográficas
SELECT 
    pl.code,
    pl.name,
    pl.latitude,
    pl.longitude,
    pl.altitude,
    pl.city,
    pl.state
FROM product_lots pl
WHERE pl.latitude IS NOT NULL 
  AND pl.longitude IS NOT NULL
ORDER BY pl.state, pl.city;

-- Produtores por região (agrupados por estado)
SELECT 
    state,
    COUNT(*) AS total_producers,
    COUNT(DISTINCT city) AS total_cities
FROM producers
GROUP BY state
ORDER BY total_producers DESC;

-- Calcular distância entre dois pontos (exemplo simplificado)
-- Nota: Para cálculos precisos, use a extensão PostGIS
SELECT 
    p1.name AS producer1,
    p2.name AS producer2,
    SQRT(
        POWER(p1.latitude - p2.latitude, 2) + 
        POWER(p1.longitude - p2.longitude, 2)
    ) AS distance_approximation
FROM producers p1
CROSS JOIN producers p2
WHERE p1.id < p2.id
  AND p1.latitude IS NOT NULL
  AND p2.latitude IS NOT NULL
ORDER BY distance_approximation
LIMIT 10;

-- =====================================================
-- 7. CONTROLE DE SELOS
-- =====================================================

-- Selos gerados por produtor
SELECT 
    p.name AS producer_name,
    COUNT(sc.id) AS total_seal_batches,
    SUM(sc.quantity) AS total_seals
FROM producers p
LEFT JOIN seal_controls sc ON p.id = sc.producer_id
GROUP BY p.id, p.name
ORDER BY total_seals DESC;

-- Selos por lote
SELECT 
    pl.code,
    pl.name,
    sc.seal_number_start,
    sc.seal_number_end,
    sc.quantity,
    sc.generation_date
FROM product_lots pl
JOIN seal_controls sc ON pl.id = sc.lot_id
ORDER BY sc.generation_date DESC;

-- =====================================================
-- 8. CARACTERÍSTICAS DOS PRODUTOS
-- =====================================================

-- Características de um lote específico
SELECT 
    pl.code,
    pl.name,
    c.name AS characteristic_name,
    plc.value
FROM product_lots pl
JOIN product_lot_characteristics plc ON pl.id = plc.lot_id
JOIN characteristics c ON plc.characteristic_id = c.id
WHERE pl.code = 'SEU_CODIGO_AQUI'
ORDER BY c.name;

-- Características mais usadas
SELECT 
    c.name AS characteristic_name,
    COUNT(plc.id) AS usage_count
FROM characteristics c
LEFT JOIN product_lot_characteristics plc ON c.id = plc.characteristic_id
GROUP BY c.id, c.name
ORDER BY usage_count DESC;

-- =====================================================
-- 9. RELATÓRIOS TEMPORAIS
-- =====================================================

-- Lotes criados por mês
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS total_lots
FROM product_lots
GROUP BY month
ORDER BY month DESC;

-- Crescimento de visualizações ao longo do tempo
SELECT 
    DATE_TRUNC('day', created_at) AS day,
    SUM(views) AS total_views
FROM product_lots
GROUP BY day
ORDER BY day DESC
LIMIT 30;

-- Produtores mais recentes
SELECT 
    name,
    city,
    state,
    created_at
FROM producers
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 10. QUERIES DE MANUTENÇÃO
-- =====================================================

-- Verificar integridade: lotes sem produtor
SELECT 
    code,
    name,
    producer_id
FROM product_lots
WHERE producer_id IS NULL;

-- Verificar lotes sem categoria
SELECT 
    code,
    name,
    category
FROM product_lots
WHERE category IS NULL OR category = '';

-- Listar tabelas e número de registros
SELECT 
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Verificar tamanho das tabelas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 11. QUERIES AVANÇADAS
-- =====================================================

-- Lotes completos com todas as informações relacionadas
SELECT 
    pl.code,
    pl.name AS product_name,
    pl.category,
    pl.views,
    p.name AS producer_name,
    p.city AS producer_city,
    p.state AS producer_state,
    b.name AS brand_name,
    i.name AS industry_name,
    a.name AS association_name,
    (
        SELECT COUNT(*) 
        FROM lot_components lc 
        WHERE lc.lot_id = pl.id
    ) AS num_components,
    (
        SELECT ROUND(AVG(pls.value), 2)
        FROM product_lot_sensory pls
        JOIN sensory_attributes sa ON pls.sensory_attribute_id = sa.id
        WHERE pls.lot_id = pl.id AND sa.type = 'quantitative'
    ) AS avg_sensory_score,
    pl.created_at
FROM product_lots pl
LEFT JOIN producers p ON pl.producer_id = p.id
LEFT JOIN brands b ON pl.brand_id = b.id
LEFT JOIN industries i ON pl.industry_id = i.id
LEFT JOIN associations a ON pl.association_id = a.id
ORDER BY pl.created_at DESC;

-- Ranking de produtores por qualidade sensorial média
SELECT 
    p.name AS producer_name,
    p.city,
    p.state,
    COUNT(DISTINCT pl.id) AS total_lots,
    ROUND(AVG(pls.value), 2) AS avg_quality_score
FROM producers p
JOIN product_lots pl ON p.id = pl.producer_id
JOIN product_lot_sensory pls ON pl.id = pls.lot_id
JOIN sensory_attributes sa ON pls.sensory_attribute_id = sa.id
WHERE sa.type = 'quantitative'
GROUP BY p.id, p.name, p.city, p.state
HAVING COUNT(DISTINCT pl.id) >= 1
ORDER BY avg_quality_score DESC;

-- Análise de diversidade de produtos por produtor
SELECT 
    p.name AS producer_name,
    COUNT(DISTINCT pl.category) AS num_categories,
    STRING_AGG(DISTINCT pl.category, ', ') AS categories,
    COUNT(pl.id) AS total_lots
FROM producers p
LEFT JOIN product_lots pl ON p.id = pl.producer_id
GROUP BY p.id, p.name
ORDER BY num_categories DESC, total_lots DESC;

-- =====================================================
-- 12. FUNÇÕES ÚTEIS
-- =====================================================

-- Incrementar visualizações de um lote
SELECT increment_lot_views('SEU_CODIGO_AQUI');

-- Buscar lotes por texto (busca em múltiplos campos)
SELECT 
    code,
    name,
    category
FROM product_lots
WHERE 
    name ILIKE '%termo_busca%' OR
    code ILIKE '%termo_busca%' OR
    category ILIKE '%termo_busca%' OR
    variety ILIKE '%termo_busca%'
ORDER BY views DESC;

-- =====================================================
-- 13. VIEWS ÚTEIS (CRIAR PARA FACILITAR CONSULTAS)
-- =====================================================

-- View: Lotes com informações completas
CREATE OR REPLACE VIEW vw_lots_complete AS
SELECT 
    pl.id,
    pl.code,
    pl.name,
    pl.category,
    pl.views,
    pl.created_at,
    p.name AS producer_name,
    p.city AS producer_city,
    p.state AS producer_state,
    b.name AS brand_name,
    i.name AS industry_name,
    a.name AS association_name
FROM product_lots pl
LEFT JOIN producers p ON pl.producer_id = p.id
LEFT JOIN brands b ON pl.brand_id = b.id
LEFT JOIN industries i ON pl.industry_id = i.id
LEFT JOIN associations a ON pl.association_id = a.id;

-- Usar a view
SELECT * FROM vw_lots_complete WHERE code = 'SEU_CODIGO_AQUI';

-- =====================================================
-- 14. BACKUP E EXPORTAÇÃO
-- =====================================================

-- Exportar todos os lotes para CSV (via psql)
-- \copy (SELECT * FROM product_lots) TO 'lotes.csv' CSV HEADER;

-- Exportar produtores para CSV
-- \copy (SELECT * FROM producers) TO 'produtores.csv' CSV HEADER;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. Substitua 'SEU_CODIGO_AQUI' pelo código real do lote
-- 2. Para queries de geolocalização precisa, instale PostGIS
-- 3. Use EXPLAIN ANALYZE antes de queries complexas para verificar performance
-- 4. Sempre teste queries de UPDATE/DELETE em ambiente de desenvolvimento primeiro
-- 5. Para buscas de texto completo, considere usar índices GIN ou pg_trgm

-- Exemplo de análise de performance:
-- EXPLAIN ANALYZE
-- SELECT * FROM product_lots WHERE code = 'TESTE001';
