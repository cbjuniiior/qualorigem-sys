-- =====================================================
-- MIGRATION: is_blend em product_lots
-- =====================================================
-- Data: Fevereiro 2026
-- Descrição: Adiciona coluna is_blend para identificar lotes
-- blend (mais de um produtor) e permitir listagem correta.
-- =====================================================

-- 1. Adicionar coluna
ALTER TABLE public.product_lots
ADD COLUMN IF NOT EXISTS is_blend boolean NOT NULL DEFAULT false;

-- 2. Backfill: marcar como blend os lotes que já têm componentes
UPDATE public.product_lots
SET is_blend = true
WHERE EXISTS (
  SELECT 1 FROM public.lot_components lc
  WHERE lc.lot_id = product_lots.id
);

-- 3. Comentário na coluna
COMMENT ON COLUMN public.product_lots.is_blend IS 'True quando o lote é blend (mais de um produtor via lot_components)';
