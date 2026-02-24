/**
 * Helpers para exibir localização (cidade, UF) de lotes e componentes.
 * Suporta tanto relação "producer" (singular) quanto "producers" (plural) do PostgREST.
 */

export interface ComponentLike {
  city?: string | null;
  state?: string | null;
  producer?: { city?: string | null; state?: string | null } | null;
  producers?: { city?: string | null; state?: string | null } | null | Array<{ city?: string | null; state?: string | null }>;
}

/** Produtor único (objeto ou primeiro elemento se for array). */
function getProducerFromComponent(c: ComponentLike): { city?: string | null; state?: string | null } | null | undefined {
  if (c.producer && typeof c.producer === "object") return c.producer;
  const p = c.producers;
  if (Array.isArray(p) && p[0] != null) return p[0];
  if (p && typeof p === "object" && !Array.isArray(p)) return p;
  return undefined;
}

/**
 * Retorna { city, state } a partir de um componente de blend (lot_components).
 * Ordem: producer (singular) -> producers (plural ou array) -> colunas do componente.
 */
export function getComponentLocation(c: ComponentLike | null | undefined): { city: string; state: string } {
  if (!c) return { city: "", state: "" };
  const prod = getProducerFromComponent(c);
  const city = (prod?.city ?? c.city ?? "").toString().trim() || "";
  const state = (prod?.state ?? c.state ?? "").toString().trim() || "";
  return { city, state };
}

const DEFAULT_FALLBACK = "Local não inf.";

/**
 * Retorna string "Cidade, UF" para exibição, ou fallback quando não houver dados.
 */
export function getComponentLocationDisplay(
  c: ComponentLike | null | undefined,
  fallback: string = DEFAULT_FALLBACK
): string {
  const { city, state } = getComponentLocation(c);
  if (city || state) return [city, state].filter(Boolean).join(", ");
  return fallback;
}

/**
 * Para um lote (product_lots): retorna a localização do lote direto ou do primeiro componente com dados.
 * Útil para card/lista/Dashboard.
 */
export function getLotLocationDisplay(
  lot: {
    city?: string | null;
    state?: string | null;
    lot_components?: ComponentLike[] | null;
    components?: ComponentLike[] | null;
  } | null | undefined,
  fallback: string = DEFAULT_FALLBACK
): string {
  if (!lot) return fallback;
  if (lot.city || lot.state) {
    const c = (lot.city ?? "").toString().trim();
    const s = (lot.state ?? "").toString().trim();
    if (c || s) return [c, s].filter(Boolean).join(", ");
  }
  const comps = lot.lot_components ?? lot.components ?? [];
  for (const c of comps) {
    const display = getComponentLocationDisplay(c, "");
    if (display) return display;
  }
  return (lot.city || lot.state || fallback).toString().trim() || fallback;
}
