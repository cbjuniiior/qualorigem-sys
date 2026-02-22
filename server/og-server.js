/**
 * Servidor que serve os arquivos estáticos e injeta meta tags OG
 * do tenant quando o User-Agent for de crawler (WhatsApp, Facebook, etc.).
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CRAWLER_AGENTS = [
  "facebookexternalhit",
  "WhatsApp",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "TelegramBot",
  "Googlebot",
  "bingbot",
  "Pinterest",
  "Discordbot",
];

const RESERVED_PATHS = ["platform", "assets", "favicon", "og-default"];

const STATIC_ROOT = process.env.STATIC_ROOT || path.join(__dirname, "../dist");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

function getTenantSlugFromPath(pathname) {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  const first = segments[0];
  if (!first || RESERVED_PATHS.includes(first.toLowerCase())) return null;
  return first;
}

async function fetchTenantOgMeta(slug) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/rpc/get_tenant_og_meta`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_slug: slug }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Erro ao buscar OG meta:", err.message);
    return null;
  }
}

function makeAbsoluteImageUrl(image, origin) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  const base = origin.replace(/\/$/, "");
  return image.startsWith("/") ? `${base}${image}` : `${base}/${image}`;
}

function injectMetaIntoHtml(html, meta, origin) {
  const title = meta?.title || "QualOrigem";
  const description = meta?.description || "Sistema de rastreabilidade de origem.";
  const image = makeAbsoluteImageUrl(meta?.image, origin) || `${origin}/og-default.png`;

  return html
    .replace(
      /<title>[^<]*<\/title>/i,
      `<title>${escapeHtml(title)}</title>`
    )
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"/i,
      `<meta name="description" content="${escapeHtml(description)}"`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"/i,
      `<meta property="og:title" content="${escapeHtml(title)}"`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"/i,
      `<meta property="og:description" content="${escapeHtml(description)}"`
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"/i,
      `<meta property="og:image" content="${escapeHtml(image)}"`
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"/i,
      `<meta name="twitter:image" content="${escapeHtml(image)}"`
    );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function serveFile(filePath, res, contentType) {
  const stream = fs.createReadStream(filePath);
  res.setHeader("Content-Type", contentType || "application/octet-stream");
  stream.pipe(res);
  stream.on("error", (err) => {
    if (err.code === "ENOENT") {
      res.statusCode = 404;
      res.end("Not found");
    } else {
      res.statusCode = 500;
      res.end("Internal error");
    }
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return types[ext] || "application/octet-stream";
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname;
  const host = req.headers.host || "qualorigem.com.br";
  const proto = req.headers["x-forwarded-proto"] || "http";
  const origin = `${proto}://${host}`.replace(/:80$/, "");

  const slug = getTenantSlugFromPath(pathname);
  const crawler = isCrawler(req.headers["user-agent"]);

  if (crawler && slug) {
    const meta = await fetchTenantOgMeta(slug);
    const indexPath = path.join(STATIC_ROOT, "index.html");
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, "utf-8");
      html = injectMetaIntoHtml(html, meta, origin);
      res.setHeader("Content-Type", "text/html");
      res.end(html);
      return;
    }
  }

  let filePath = path.join(STATIC_ROOT, pathname === "/" ? "index.html" : pathname);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(STATIC_ROOT, "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(filePath, res, getContentType(filePath));
  } else {
    res.statusCode = 404;
    res.end("Not found");
  }
});

const PORT = parseInt(process.env.PORT || "80", 10);
server.listen(PORT, () => {
  console.log(`OG server listening on port ${PORT} (static: ${STATIC_ROOT})`);
});
