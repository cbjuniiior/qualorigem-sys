import { systemConfigApi } from "@/services/api";

interface QRCodeConfig {
  mode: 'individual' | 'generic';
  generic_categories: string[];
}

/**
 * Gera a URL do QR Code baseado na configuração do sistema e no tenant atual
 */
export async function generateQRCodeUrl(lotCode: string, category: string | null): Promise<string> {
  try {
    // Tenta obter o slug do tenant da URL atual
    const pathParts = window.location.pathname.split('/');
    // Assumindo que a URL é /:tenantSlug/...
    // Se estiver na raiz, pode ser vazio ou 'platform'
    let tenantSlug = pathParts[1];
    
    // Se o slug for inválido ou 'auth' ou 'lote', tenta pegar do localStorage ou fallback para 'default'
    if (!tenantSlug || tenantSlug === 'auth' || tenantSlug === 'lote' || tenantSlug === 'platform') {
      tenantSlug = 'default';
    }

    // Precisamos do tenantId para buscar a configuração correta
    // Como esta função é utilitária e não um hook, não podemos usar useTenant diretamente
    // Vamos assumir que a configuração já foi carregada ou usar um padrão seguro
    
    // TODO: Idealmente, passar o tenantId como argumento para esta função
    // Por enquanto, vamos construir a URL com o slug que temos
    
    return `${window.location.origin}/${tenantSlug}/lote/${lotCode}`;
    
    /* 
    // Lógica antiga de configuração (precisaria do tenantId para funcionar corretamente)
    // Se precisarmos reativar o modo genérico, teremos que passar o tenantId para esta função
    
    const config = await systemConfigApi.getQRCodeConfig(tenantId);
    
    if (config.mode === 'individual') {
      return `${window.location.origin}/${tenantSlug}/lote/${lotCode}`;
    }
    
    if (config.mode === 'generic' && category) {
      if (config.generic_categories.includes(category)) {
        return `${window.location.origin}/${tenantSlug}/?categoria=${encodeURIComponent(category)}`;
      }
    }
    */

  } catch (error) {
    console.error('Erro ao gerar URL do QR Code:', error);
    return `${window.location.origin}/default/lote/${lotCode}`;
  }
}
