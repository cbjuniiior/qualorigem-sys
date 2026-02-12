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

const DEFAULT_BRANDING: BrandingConfig = {
  preset: 'default',
  primaryColor: '#16a34a',
  secondaryColor: '#22c55e',
  accentColor: '#10b981',
  logoUrl: null,
  siteTitle: 'GeoTrace - Sistema de Rastreabilidade',
  siteDescription: 'Plataforma premium para rastreabilidade de produtos de origem.'
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const applyBrandingToDOM = (config: BrandingConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(config.primaryColor));
  root.style.setProperty('--secondary', hexToHsl(config.secondaryColor));
  root.style.setProperty('--accent', hexToHsl(config.accentColor));
  root.style.setProperty('--ring', hexToHsl(config.primaryColor));
  
  if (config.siteTitle) {
    document.title = config.siteTitle;
  }
  
  if (config.logoUrl) {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = config.logoUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = config.logoUrl;
      document.head.appendChild(newFavicon);
    }
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
