import { systemConfigApi } from "@/services/api";

interface LotIdConfig {
  mode: 'auto' | 'manual' | 'producer_brand';
  prefix: string;
  auto_increment: boolean;
  current_number?: number;
}

/**
 * Gera um código único para o lote baseado na configuração do sistema
 */
export async function generateLotCode(tenantId: string, customPrefix?: string, increment: boolean = false): Promise<string> {
  try {
    const config = await systemConfigApi.getLotIdConfig(tenantId);
    
    // Se o modo for manual, retorna o prefixo personalizado ou vazio
    if (config.mode === 'manual') {
      return customPrefix ? `${customPrefix}-` : '';
    }
    
    // Modo automático ou baseado em Produtor/Marca (se solicitado auto)
    if (config.mode === 'auto' || config.mode === 'producer_brand') {
      const prefix = customPrefix || config.prefix || 'GT';
      let currentNumber = config.current_number || 1;
      
      // Se auto_increment estiver habilitado E for solicitado o incremento definitivo
      if (increment && config.auto_increment) {
        // Atualiza o número atual no banco para o próximo uso
        await systemConfigApi.upsert({
          tenant_id: tenantId,
          config_key: 'lot_id_mode',
          config_value: {
            ...config,
            current_number: currentNumber + 1
          },
          description: 'Configuração de geração de ID de lotes'
        });
      }
      
      // Formata o código: PREFIXO-0001
      const formattedNumber = currentNumber.toString().padStart(4, '0');
      return `${prefix}-${formattedNumber}`;
    }
    
    // Fallback: gera código aleatório
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PROD-${year}-${timestamp}-${rand}`;
  } catch (error) {
    console.error('Erro ao gerar código do lote:', error);
    // Fallback em caso de erro
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PROD-${year}-${timestamp}-${rand}`;
  }
}

