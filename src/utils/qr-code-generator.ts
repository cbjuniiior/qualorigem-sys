import { systemConfigApi } from "@/services/api";

interface QRCodeConfig {
  mode: 'individual' | 'generic';
  generic_categories: string[];
}

/**
 * Gera a URL do QR Code baseado na configuração do sistema
 */
export async function generateQRCodeUrl(lotCode: string, category: string | null): Promise<string> {
  try {
    const config = await systemConfigApi.getQRCodeConfig();
    
    // Se o modo for individual, retorna URL específica do lote
    if (config.mode === 'individual') {
      return `${window.location.origin}/lote/${lotCode}`;
    }
    
    // Modo genérico por categoria
    if (config.mode === 'generic' && category) {
      // Verifica se a categoria está na lista de categorias genéricas
      if (config.generic_categories.includes(category)) {
        // Retorna URL de busca por categoria
        return `${window.location.origin}/?categoria=${encodeURIComponent(category)}`;
      }
    }
    
    // Fallback: retorna URL individual se não for categoria genérica
    return `${window.location.origin}/lote/${lotCode}`;
  } catch (error) {
    console.error('Erro ao gerar URL do QR Code:', error);
    // Fallback: retorna URL individual
    return `${window.location.origin}/lote/${lotCode}`;
  }
}

