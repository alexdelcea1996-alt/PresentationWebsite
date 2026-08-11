import { readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deployment target — Cloudflare, serving from the domain root.
//
// The fallback is the live Workers URL. It has to be spelled out because
// CF_PAGES_URL is injected only by Cloudflare *Pages* builds, not by Workers
// ones, and a wrong value here silently poisons every canonical link, hreflang,
// og:url and the sitemap.
//
// Set SITE_URL in the Cloudflare project settings when moving to a custom domain.
const SITE_URL =
  process.env.SITE_URL ??
  process.env.CF_PAGES_URL ??
  'https://presentationwebsite.alexdelcea1996.workers.dev';
const BASE_PATH = process.env.BASE_PATH ?? '/';

interface FontVariantManifest {
  file: string;
  weight: string;
  style: 'normal';
  unicodeRange: string;
}

interface FontFamilyManifest {
  name: string;
  slug: 'space-grotesk' | 'inter';
  variants: FontVariantManifest[];
}

/**
 * Brand fonts are committed under `src/assets/fonts/` (regenerate with
 * `npm run fonts`), so the build never needs to reach Google at deploy time.
 */
const fontManifest: FontFamilyManifest[] = JSON.parse(
  readFileSync(new URL('./src/assets/fonts/fonts.json', import.meta.url), 'utf8'),
);

const cssVariableBySlug: Record<FontFamilyManifest['slug'], string> = {
  'space-grotesk': '--ff-display',
  inter: '--ff-body',
};

const toVariant = (variant: FontVariantManifest) => ({
  src: [`./src/assets/fonts/${variant.file}`] as [string],
  weight: variant.weight,
  style: variant.style,
  unicodeRange: [variant.unicodeRange] as [string],
});

// Self-hosted variable fonts. Each family ships two files split by
// unicode-range, so `latin-ext` (the Romanian ș/ț/ă/â/î) is downloaded only by
// pages that actually contain those characters.
const fonts = fontManifest.map((family) => {
  // Destructured rather than cast: Astro types `variants` as a non-empty tuple.
  const [firstVariant, ...otherVariants] = family.variants.map(toVariant);
  if (!firstVariant) throw new Error(`No font variants declared for ${family.name}`);

  return {
    provider: fontProviders.local(),
    name: family.name,
    cssVariable: cssVariableBySlug[family.slug],
    fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    options: { variants: [firstVariant, ...otherVariants] as [ReturnType<typeof toVariant>] },
  };
});

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',

  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: {
      // Romanian lives at the root (/), English under /en/
      prefixDefaultLocale: false,
    },
  },

  fonts,

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ro',
        locales: { ro: 'ro-RO', en: 'en-US' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
