import { useEffect, useState, useMemo } from "react";
import { useTenant } from "./use-tenant";
import { fieldSettingsApi, type TenantFieldSetting } from "@/services/api";

export interface FieldSettings {
  /** Verifica se um campo está habilitado (default: true) */
  isEnabled: (fieldKey: string) => boolean;
  /** Verifica se um campo é obrigatório (default: false) */
  isRequired: (fieldKey: string) => boolean;
  /** Retorna todas as configurações carregadas */
  settings: TenantFieldSetting[];
  /** Se as configurações já foram carregadas */
  loaded: boolean;
}

/**
 * Hook que carrega as configurações de campos do tenant.
 * Permite controlar visibilidade e obrigatoriedade de campos
 * no formulário de lote baseado em configurações do tenant.
 * 
 * Campos típicos: seal, weight, sensory_attributes, radar_chart,
 * certifications, internal_producers
 */
export function useFieldSettings(): FieldSettings {
  const { tenant } = useTenant();
  const [settings, setSettings] = useState<TenantFieldSetting[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;
    
    fieldSettingsApi.getAll(tenant.id)
      .then(data => {
        setSettings(data || []);
        setLoaded(true);
      })
      .catch(err => {
        console.error("Erro ao carregar field settings:", err);
        setLoaded(true);
      });
  }, [tenant?.id]);

  const settingsMap = useMemo(() => {
    const map = new Map<string, TenantFieldSetting>();
    settings.forEach(s => map.set(s.field_key, s));
    return map;
  }, [settings]);

  return {
    isEnabled: (fieldKey: string) => {
      const setting = settingsMap.get(fieldKey);
      return setting?.enabled ?? true; // default: habilitado
    },
    isRequired: (fieldKey: string) => {
      const setting = settingsMap.get(fieldKey);
      return setting?.required ?? false; // default: não obrigatório
    },
    settings,
    loaded,
  };
}
