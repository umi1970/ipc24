import type { APIRoute } from "astro";

const SITE = "https://ipc24.de";

const staticPages = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/freelance/", priority: "0.9", changefreq: "monthly" },
  { url: "/websites/", priority: "0.9", changefreq: "monthly" },
  { url: "/web-apps/", priority: "0.9", changefreq: "monthly" },
  { url: "/referenzen/", priority: "0.8", changefreq: "monthly" },
  { url: "/ueber/", priority: "0.7", changefreq: "yearly" },
  { url: "/kontakt/", priority: "0.8", changefreq: "yearly" },
  { url: "/blog/", priority: "0.8", changefreq: "weekly" },
  { url: "/impressum/", priority: "0.3", changefreq: "yearly" },
  { url: "/datenschutz/", priority: "0.3", changefreq: "yearly" },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
