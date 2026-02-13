import { useMemo } from "react";
import { useTenant } from "./use-tenant";

export interface TenantLabels {
  // Entidade principal (Produtor vs Cooperativa)
  producer: string;
  producers: string;
  producerPlural: string;
  producerDescription: string;
  propertyName: string;
  propertyDescription: string;

  // Associações (pode virar "Parceiros" em marca_coletiva)
  association: string;
  associations: string;

  // Propriedade (nome curto para uso em "Galeria da X", "Sobre a X")
  property: string;

  /** Saudação quando não há nome do usuário (ex: "Produtor" ou "Cooperado") */
  producerGreeting: string;

  // Flags
  isMarcaColetiva: boolean;
  isIG: boolean;
  tenantType: string;
}

/**
 * Hook que retorna labels dinâmicos baseados em tenant.type.
 * Quando tenant.type === 'marca_coletiva', todas as referências
 * a "Produtor" são substituídas por "Cooperativa", etc.
 * 
 * O backend continua usando "producers" como nome de tabela.
 * Apenas a UI/labels mudam.
 */
export function useTenantLabels(): TenantLabels {
  const { tenant } = useTenant();

  return useMemo(() => {
    const tenantType = tenant?.type || "ig";
    const isMarcaColetiva = tenantType === "marca_coletiva";
    const isIG = tenantType === "ig";

    if (isMarcaColetiva) {
      return {
        producer: "Cooperativa",
        producers: "Cooperativas",
        producerPlural: "Cooperativas",
        producerDescription: "Cooperativa vinculada",
        propertyName: "Nome da Cooperativa",
        propertyDescription: "Informações da cooperativa",
        association: "Parceiro",
        associations: "Parceiros",
        property: "Cooperativa",
        producerGreeting: "Cooperado",
        isMarcaColetiva: true,
        isIG: false,
        tenantType,
      };
    }

    // Default (ig, privado, etc.)
    return {
      producer: "Produtor",
      producers: "Produtores",
      producerPlural: "Produtores",
      producerDescription: "Produtor responsável",
      propertyName: "Nome da Propriedade",
      propertyDescription: "Informações da propriedade",
      association: "Associação",
      associations: "Associações",
      property: "Propriedade",
      producerGreeting: "Produtor",
      isMarcaColetiva: false,
      isIG,
      tenantType,
    };
  }, [tenant?.type]);
}
