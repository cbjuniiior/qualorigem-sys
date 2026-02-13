import { useEffect } from "react";
import { platformSettingsApi } from "@/services/api";

const DEFAULT_PLATFORM_TITLE = "QualOrigem - Painel Admin";
const DEFAULT_PLATFORM_DESCRIPTION = "Sistema de rastreabilidade de origem.";

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

/**
 * Aplica título, meta description, favicon e Open Graph (SEO/redes sociais) da plataforma.
 * Usar em PlatformLayout, PlatformLogin e na página raiz (RootPlaceholder).
 */
export function usePlatformBranding() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await platformSettingsApi.get();
        if (cancelled) return;
        const title = data?.site_title || DEFAULT_PLATFORM_TITLE;
        const description = data?.site_description ?? DEFAULT_PLATFORM_DESCRIPTION;
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
        setMetaProperty("og:url", window.location.origin + window.location.pathname);
        if (data?.og_image_url) {
          setMetaProperty("og:image", data.og_image_url);
          let twitterImg = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
          if (twitterImg) twitterImg.content = data.og_image_url;
          else {
            twitterImg = document.createElement("meta");
            twitterImg.name = "twitter:image";
            twitterImg.content = data.og_image_url;
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

        const faviconUrl = data?.favicon_url ?? null;
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
        if (faviconUrl) {
          if (link) link.href = faviconUrl;
          else {
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
