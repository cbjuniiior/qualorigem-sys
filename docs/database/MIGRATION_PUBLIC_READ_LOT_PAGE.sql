-- =====================================================
-- Leitura pública para página pública do lote
-- =====================================================
-- Permite que visitantes anônimos (sem login) vejam produtor,
-- associações, indústrias, análise sensorial e características
-- na página pública do lote (QR code, link compartilhado).
-- =====================================================

-- Producers (dados do produtor exibidos na página do lote)
DROP POLICY IF EXISTS "Tenant Read" ON public.producers;
CREATE POLICY "Public Read" ON public.producers FOR SELECT USING (true);

-- Associations (associações vinculadas ao lote)
DROP POLICY IF EXISTS "Tenant Read" ON public.associations;
CREATE POLICY "Public Read" ON public.associations FOR SELECT USING (true);

-- Industries (indústria parceira exibida na página do lote)
DROP POLICY IF EXISTS "Tenant Read" ON public.industries;
CREATE POLICY "Public Read" ON public.industries FOR SELECT USING (true);

-- Sensory attributes (nomes dos atributos da análise sensorial)
DROP POLICY IF EXISTS "Tenant Read" ON public.sensory_attributes;
CREATE POLICY "Public Read" ON public.sensory_attributes FOR SELECT USING (true);

-- Product lot sensory (valores da análise sensorial do lote)
DROP POLICY IF EXISTS "Tenant Read" ON public.product_lot_sensory;
CREATE POLICY "Public Read" ON public.product_lot_sensory FOR SELECT USING (true);

-- Characteristics (nomes das características)
DROP POLICY IF EXISTS "Tenant Read" ON public.characteristics;
CREATE POLICY "Public Read" ON public.characteristics FOR SELECT USING (true);

-- Product lot characteristics (valores das características do lote)
DROP POLICY IF EXISTS "Tenant Read" ON public.product_lot_characteristics;
CREATE POLICY "Public Read" ON public.product_lot_characteristics FOR SELECT USING (true);

-- Product lot associations (associações vinculadas ao lote - múltiplas)
DROP POLICY IF EXISTS "Tenant Read" ON public.product_lot_associations;
CREATE POLICY "Public Read" ON public.product_lot_associations FOR SELECT USING (true);

-- Product lot industries (indústrias vinculadas ao lote - múltiplas)
DROP POLICY IF EXISTS "Tenant Read" ON public.product_lot_industries;
CREATE POLICY "Public Read" ON public.product_lot_industries FOR SELECT USING (true);
