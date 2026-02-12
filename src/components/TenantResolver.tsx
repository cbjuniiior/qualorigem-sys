import { useEffect, useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import { TenantProvider, useTenant } from "@/hooks/use-tenant";
import { useBranding, BrandingConfig } from "@/hooks/use-branding";
import { systemConfigApi } from "@/services/api";

const TenantLoadingCheck = () => {
  const { isLoading, error, tenant } = useTenant();
  const { setBrandingConfig, resetBranding } = useBranding();
  const { tenantSlug } = useParams();
  const loadedForTenantId = useRef<string | null>(null);

  // Sincronizar branding do tenant - buscar de system_configurations (fonte da verdade)
  useEffect(() => {
    if (!tenant?.id) {
      if (!isLoading) {
        resetBranding();
        loadedForTenantId.current = null;
      }
      return;
    }

    // Evitar carregamento duplicado para o mesmo tenant
    if (loadedForTenantId.current === tenant.id) return;

    let cancelled = false;

    async function loadBranding() {
      try {
        // 1. Tentar carregar de system_configurations (fonte primária, onde a personalização salva)
        const savedConfig = await systemConfigApi.getByKey('branding_settings', tenant!.id);
        
        if (cancelled) return;

        if (savedConfig?.config_value) {
          // Existe configuração salva em system_configurations - usar esta
          setBrandingConfig(savedConfig.config_value as unknown as BrandingConfig);
          loadedForTenantId.current = tenant!.id;
          return;
        }
        
        // 2. Fallback: usar tenant.branding se existir
        if (tenant!.branding) {
          const brandingData = tenant!.branding as unknown as BrandingConfig;
          setBrandingConfig(brandingData);
          loadedForTenantId.current = tenant!.id;
          return;
        }
        
        // 3. Nenhum branding encontrado - usa default (já é o default do provider)
        loadedForTenantId.current = tenant!.id;
      } catch (err) {
        if (cancelled) return;
        console.warn("Erro ao carregar branding de system_configurations, usando fallback:", err);
        // Fallback: usar tenant.branding se disponível
        if (tenant!.branding) {
          const brandingData = tenant!.branding as unknown as BrandingConfig;
          setBrandingConfig(brandingData);
        }
        loadedForTenantId.current = tenant!.id;
      }
    }

    loadBranding();

    return () => { cancelled = true; };
  }, [tenant, isLoading, setBrandingConfig, resetBranding]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || (!tenant && tenantSlug !== 'platform')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Organização não encontrada</h1>
        <p className="text-muted-foreground">
          Não foi possível encontrar a organização "{tenantSlug}".
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export const TenantResolver = () => {
  return (
    <TenantProvider>
      <TenantLoadingCheck />
    </TenantProvider>
  );
};
