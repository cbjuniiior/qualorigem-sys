import { useEffect, useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import { TenantProvider, useTenant } from "@/hooks/use-tenant";
import { useBranding, BrandingConfig, DEFAULT_BRANDING } from "@/hooks/use-branding";
import { systemConfigApi, platformSettingsApi } from "@/services/api";
import TenantNotFound from "@/pages/TenantNotFound";
import TenantSuspended from "@/pages/TenantSuspended";

const DEFAULT_PLATFORM_NAME = "QualOrigem";

/** Normaliza objeto de branding (pode vir com logo_url ou logoUrl). */
function normalizeTenantBranding(raw: unknown): BrandingConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const logoUrl = (o.logoUrl ?? o.logo_url) != null ? String(o.logoUrl ?? o.logo_url).trim() || null : null;
  const siteTitle = o.siteTitle != null ? String(o.siteTitle).trim() || undefined : undefined;
  if (!logoUrl && !siteTitle && !o.primaryColor && !o.secondaryColor) return null;
  return { ...DEFAULT_BRANDING, ...o, logoUrl: logoUrl ?? null, siteTitle } as BrandingConfig;
}

/** Considera que o tenant "personalizou" se tiver logo ou nome definidos. */
function tenantHasPersonalization(b: BrandingConfig | null): boolean {
  if (!b) return false;
  return Boolean((b.logoUrl && b.logoUrl.trim()) || (b.siteTitle && b.siteTitle.trim()));
}

/**
 * Regra: por padrão sempre nome e favicon da plataforma (Super Admin).
 * Só usa nome/logo do tenant quando ele configurou personalização (logo ou nome).
 * Cores e demais opções do tenant são sempre mescladas quando existirem.
 */
function mergeBranding(
  platform: { site_title?: string | null; favicon_url?: string | null; site_description?: string | null; og_image_url?: string | null } | null,
  tenantBranding: BrandingConfig | null
): BrandingConfig {
  const platformName = platform?.site_title?.trim() || DEFAULT_PLATFORM_NAME;
  const platformFavicon = platform?.favicon_url?.trim() || null;
  const platformDescription = platform?.site_description?.trim() ?? DEFAULT_BRANDING.siteDescription;
  const platformOgImage = platform?.og_image_url?.trim() || null;

  const base: BrandingConfig = {
    ...DEFAULT_BRANDING,
    siteTitle: platformName,
    logoUrl: platformFavicon,
    siteDescription: platformDescription,
    ogImageUrl: platformOgImage,
  };

  if (!tenantBranding) return base;

  const t = tenantBranding;
  const useTenantNameAndLogo = tenantHasPersonalization(tenantBranding);
  const tenantHeaderImage = (t.headerImageUrl && t.headerImageUrl.trim()) || null;

  return {
    ...base,
    ...t,
    siteTitle: (t.siteTitle && t.siteTitle.trim()) ? t.siteTitle.trim() : platformName,
    logoUrl: useTenantNameAndLogo && t.logoUrl?.trim() ? t.logoUrl.trim() : platformFavicon,
    siteDescription: (t.siteDescription && String(t.siteDescription).trim()) ? t.siteDescription : platformDescription,
    ogImageUrl: tenantHeaderImage ?? platformOgImage,
  };
}

const TenantLoadingCheck = () => {
  const { isLoading, error, tenant } = useTenant();
  const { setBrandingConfig, resetBranding } = useBranding();
  const { tenantSlug } = useParams();
  const loadedForTenantId = useRef<string | null>(null);

  useEffect(() => {
    if (!tenant?.id) {
      if (!isLoading) {
        resetBranding();
        loadedForTenantId.current = null;
      }
      return;
    }

    if (loadedForTenantId.current === tenant.id) return;

    let cancelled = false;

    async function loadBranding() {
      try {
        const [platformSettings, savedConfig] = await Promise.all([
          platformSettingsApi.get(),
          systemConfigApi.getByKey("branding_settings", tenant!.id),
        ]);
        if (cancelled) return;

        const tenantFromConfig = normalizeTenantBranding(savedConfig?.config_value);
        const tenantFromRow = normalizeTenantBranding(tenant!.branding);
        const tenantBranding = tenantFromConfig ?? tenantFromRow;

        const merged = mergeBranding(platformSettings ?? null, tenantBranding);
        setBrandingConfig(merged);
        loadedForTenantId.current = tenant!.id;
      } catch (err) {
        if (cancelled) return;
        console.warn("Erro ao carregar branding, usando plataforma como fallback:", err);
        try {
          const platformSettings = await platformSettingsApi.get();
          if (!cancelled) {
            setBrandingConfig(mergeBranding(platformSettings ?? null, null));
          }
        } catch (_) {
          setBrandingConfig({
            ...DEFAULT_BRANDING,
            siteTitle: DEFAULT_PLATFORM_NAME,
            logoUrl: null,
          });
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

  if (error || (!tenant && tenantSlug !== "platform")) {
    return <TenantNotFound />;
  }

  // Tenant existe mas está suspenso (inativo): bloquear acesso e mostrar mensagem amigável
  if (tenant && tenant.status === "suspended") {
    return <TenantSuspended />;
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
