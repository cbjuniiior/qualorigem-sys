import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { hexToHsl } from '@/lib/utils';

export interface BrandingConfig {
  preset: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  headerImageUrl?: string | null;
  videoBackgroundUrl?: string | null;
  siteTitle?: string;
  siteDescription?: string;
}

interface BrandingContextType {
  branding: BrandingConfig;
  setBrandingConfig: (config: BrandingConfig) => void;
  resetBranding: () => void;
}

/** Usado como fallback quando o tenant não tem personalização (nome e favicon da plataforma). */
export const DEFAULT_BRANDING: BrandingConfig = {
  preset: 'default',
  primaryColor: '#16a34a',
  secondaryColor: '#22c55e',
  accentColor: '#10b981',
  logoUrl: null,
  siteTitle: 'GeoTrace - Sistema de Rastreabilidade',
  siteDescription: 'Plataforma premium para rastreabilidade de produtos de origem.'
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

function setMetaProperty(property: string, content: string) {
  const selector = `meta[property="${property}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (el) {
    el.content = content;
  } else {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.content = content;
    document.head.appendChild(el);
  }
}

const applyBrandingToDOM = (config: BrandingConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(config.primaryColor));
  root.style.setProperty('--secondary', hexToHsl(config.secondaryColor));
  root.style.setProperty('--accent', hexToHsl(config.accentColor));
  root.style.setProperty('--ring', hexToHsl(config.primaryColor));

  const title = config.siteTitle || 'Portal de Rastreabilidade';
  const description = config.siteDescription || 'Sistema de rastreabilidade de produtos';

  document.title = title;

  let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (metaDesc) metaDesc.content = description;
  else {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    metaDesc.content = description;
    document.head.appendChild(metaDesc);
  }

  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:type", "website");
  setMetaProperty("og:url", typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");
  if (config.logoUrl) {
    setMetaProperty("og:image", config.logoUrl);
    let twitterImg = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
    if (twitterImg) twitterImg.content = config.logoUrl;
    else {
      twitterImg = document.createElement("meta");
      twitterImg.name = "twitter:image";
      twitterImg.content = config.logoUrl;
      document.head.appendChild(twitterImg);
    }
  }
  let twitterCard = document.querySelector('meta[name="twitter:card"]') as HTMLMetaElement | null;
  if (!twitterCard) {
    twitterCard = document.createElement("meta");
    twitterCard.name = "twitter:card";
    document.head.appendChild(twitterCard);
  }
  twitterCard.content = "summary_large_image";

  const faviconHref = config.logoUrl || '/favicon.ico';
  let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (favicon) {
    favicon.href = faviconHref;
  } else {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = faviconHref;
    document.head.appendChild(favicon);
  }
};

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    // Tentar carregar do localStorage (opcional, pode ser removido se quisermos sempre o default até carregar o tenant)
    // Para multi-tenant, talvez seja melhor iniciar com DEFAULT e deixar o TenantResolver atualizar
    return DEFAULT_BRANDING;
  });

  const setBrandingConfig = useCallback((config: BrandingConfig) => {
    const newConfig = { ...DEFAULT_BRANDING, ...config };
    setBranding(newConfig);
    applyBrandingToDOM(newConfig);
  }, []);

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
    applyBrandingToDOM(DEFAULT_BRANDING);
  }, []);

  // Aplica o branding inicial (default)
  React.useEffect(() => {
    applyBrandingToDOM(branding);
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, setBrandingConfig, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
