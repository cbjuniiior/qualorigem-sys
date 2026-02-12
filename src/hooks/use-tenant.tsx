import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Tipos auxiliares enquanto os types oficiais não são regenerados
// (Se você já rodou o gen types, isso será substituído pelos tipos reais automaticamente pelo TS se coincidirem,
// mas é bom ter aqui para garantir que não quebre antes)
export type Tenant = {
  id: string;
  slug: string;
  name: string;
  type: string;
  branding: any;
  status: string;
};

export type TenantModule = {
  module_key: string;
  enabled: boolean;
  config: any;
};

type TenantContextType = {
  tenant: Tenant | null;
  modules: TenantModule[];
  isLoading: boolean;
  error: Error | null;
  tenantId: string | null; // Atalho para tenant.id
};

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  modules: [],
  isLoading: true,
  error: null,
  tenantId: null,
});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ tenantSlug?: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [modules, setModules] = useState<TenantModule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // O slug pode vir da URL (rota /:tenantSlug/...) ou ser 'platform' ou vazio
  const slug = params.tenantSlug;

  useEffect(() => {
    async function loadTenant() {
      // Se não tem slug ou é uma rota de plataforma, não carregamos tenant específico aqui
      // (Rotas de plataforma terão seu próprio contexto ou layout)
      if (!slug || slug === 'platform') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. Buscar Tenant
        // Usamos 'any' no from() temporariamente até os types serem atualizados
        const { data: tenantData, error: tenantError } = await (supabase as any)
          .from("tenants")
          .select("*")
          .eq("slug", slug)
          .single();

        if (tenantError) throw tenantError;
        if (!tenantData) throw new Error("Tenant not found");

        setTenant(tenantData);

        // 2. Buscar Módulos do Tenant
        const { data: modulesData, error: modulesError } = await (supabase as any)
          .from("tenant_modules")
          .select("*")
          .eq("tenant_id", tenantData.id)
          .eq("enabled", true);

        if (modulesError) {
          console.error("Error loading modules:", modulesError);
          // Não falhamos tudo se modules falhar, apenas logamos
        }

        setModules(modulesData || []);

      } catch (err: any) {
        console.error("Error loading tenant:", err);
        setError(err);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadTenant();
  }, [slug]);

  const value = {
    tenant,
    modules,
    isLoading,
    error,
    tenantId: tenant?.id || null,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
