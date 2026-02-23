-- Pivot: lote <-> múltiplas associações (permite N associações por lote)
CREATE TABLE IF NOT EXISTS public.product_lot_associations (
  lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE CASCADE,
  association_id uuid NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  PRIMARY KEY (lot_id, association_id)
);

CREATE INDEX IF NOT EXISTS idx_pla_lot ON public.product_lot_associations(lot_id);
CREATE INDEX IF NOT EXISTS idx_pla_association ON public.product_lot_associations(association_id);
CREATE INDEX IF NOT EXISTS idx_pla_tenant ON public.product_lot_associations(tenant_id);

ALTER TABLE public.product_lot_associations ENABLE ROW LEVEL SECURITY;

-- Leitura: membros do tenant ou platform admin
CREATE POLICY "Tenant Read" ON public.product_lot_associations
FOR SELECT USING (
  tenant_id IN (SELECT public.get_user_tenant_ids())
  OR public.is_platform_admin()
);

-- Escrita: tenant admin ou platform admin
CREATE POLICY "Tenant Write" ON public.product_lot_associations
FOR ALL USING (
  tenant_id IN (SELECT public.get_user_admin_tenant_ids())
  OR public.is_platform_admin()
);
