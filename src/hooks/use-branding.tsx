import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { systemConfigApi } from '@/services/api';
import { hexToHsl } from '@/lib/utils';

interface BrandingConfig {
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
  loading: boolean;
  refreshBranding: () => Promise<void>;
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
    // Tentar carregar do localStorage imediatamente para evitar o flash
    const cached = localStorage.getItem('geotrace_branding');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Aplicar variáveis CSS imediatamente no construtor do estado
        applyBrandingToDOM(parsed);
        return parsed;
      } catch (e) {
        return DEFAULT_BRANDING;
      }
    }
    applyBrandingToDOM(DEFAULT_BRANDING);
    return DEFAULT_BRANDING;
  });
  const [loading, setLoading] = useState(true);

  const refreshBranding = async () => {
    try {
      const config = await systemConfigApi.getBrandingConfig();
      setBranding(config);
      localStorage.setItem('geotrace_branding', JSON.stringify(config));
      applyBrandingToDOM(config);
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding }}>
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
