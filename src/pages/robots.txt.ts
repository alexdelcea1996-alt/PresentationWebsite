import type { APIRoute } from 'astro';

/**
 * Generated rather than a static file in `public/`, so the sitemap URL always
 * matches the domain the site was actually built for.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemapPath = `${import.meta.env.BASE_URL}/sitemap-index.xml`.replace(/\/{2,}/g, '/');
  const sitemap = new URL(sitemapPath, site).href;

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
