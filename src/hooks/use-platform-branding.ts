import { useEffect } from "react";
import { platformSettingsApi } from "@/services/api";

const DEFAULT_PLATFORM_TITLE = "QualOrigem - Painel Admin";
const DEFAULT_PLATFORM_DESCRIPTION = "Sistema de rastreabilidade de origem.";

/**
 * Aplica título, meta description e favicon da plataforma.
 * Usar em PlatformLayout, PlatformLogin e na página raiz (RootPlaceholder).
 */
export function usePlatformBranding() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await platformSettingsApi.get();
        if (cancelled) return;
        if (data?.site_title) {
          document.title = data.site_title;
        } else {
          document.title = DEFAULT_PLATFORM_TITLE;
        }
        const description = data?.site_description ?? DEFAULT_PLATFORM_DESCRIPTION;
        let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (metaDesc) {
          metaDesc.content = description;
        } else {
          metaDesc = document.createElement("meta");
          metaDesc.name = "description";
          metaDesc.content = description;
          document.head.appendChild(metaDesc);
        }
        const faviconUrl = data?.favicon_url ?? null;
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
        if (faviconUrl) {
          if (link) {
            link.href = faviconUrl;
          } else {
            link = document.createElement("link");
            link.rel = "icon";
            link.href = faviconUrl;
            document.head.appendChild(link);
          }
        } else {
          if (link) link.href = "/favicon.ico";
        }
      } catch {
        if (!cancelled) document.title = DEFAULT_PLATFORM_TITLE;
      }
    })();
    return () => { cancelled = true; };
  }, []);
}
