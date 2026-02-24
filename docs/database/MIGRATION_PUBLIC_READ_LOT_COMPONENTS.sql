-- =====================================================
-- Leitura pública para componentes do blend (lot_components)
-- =====================================================
-- Permite que visitantes anônimos (sem login) vejam a composição
-- e origens do blend na página pública do lote (QR code, link compartilhado).
-- Execute após MIGRATION_PUBLIC_READ_LOT_PAGE.sql se aplicável.
-- =====================================================

-- Lot components (composição e origens do blend na página do lote)
DROP POLICY IF EXISTS "Tenant Read" ON public.lot_components;
CREATE POLICY "Public Read" ON public.lot_components FOR SELECT USING (true);
