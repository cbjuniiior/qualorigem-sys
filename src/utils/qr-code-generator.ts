const RESERVED_PATHS = ['auth', 'lote', 'platform', ''];

/**
 * Gera a URL do QR Code. Exige slug do tenant (passado pelo chamador).
 * Sem tenant válido, retorna a URL da raiz.
 */
export async function generateQRCodeUrl(
  lotCode: string,
  category: string | null,
  tenantSlugFromCaller?: string
): Promise<string> {
  const origin = window.location.origin;
  try {
    let tenantSlug = tenantSlugFromCaller;
    if (!tenantSlug || RESERVED_PATHS.includes(tenantSlug)) {
      const pathParts = window.location.pathname.split('/');
      tenantSlug = pathParts[1];
      if (!tenantSlug || RESERVED_PATHS.includes(tenantSlug)) {
        return `${origin}/`;
      }
    }
    return `${origin}/${tenantSlug}/lote/${lotCode}`;
  } catch (error) {
    console.error('Erro ao gerar URL do QR Code:', error);
    return `${origin}/`;
  }
}
