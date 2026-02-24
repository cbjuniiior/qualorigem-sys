-- =====================================================
-- Backfill: city e state em lot_components a partir de producers
-- =====================================================
-- Preenche lot_components.city e lot_components.state quando estão NULL
-- usando os dados do produtor vinculado (producer_id).
-- Execute uma vez no ambiente para corrigir lotes blend já existentes.
-- =====================================================

UPDATE public.lot_components lc
SET
  city = COALESCE(lc.city, p.city),
  state = COALESCE(lc.state, p.state),
  updated_at = NOW()
FROM public.producers p
WHERE lc.producer_id = p.id
  AND (lc.city IS NULL OR lc.state IS NULL)
  AND (p.city IS NOT NULL OR p.state IS NOT NULL);
