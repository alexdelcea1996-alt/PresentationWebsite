/**
 * Adds the missing `hreflang` annotations to the sitemap.
 *
 * `@astrojs/sitemap` pairs translations by URL pattern, which works only while
 * the two languages share a path shape. Ours deliberately do not — the Romanian
 * page is `/servicii/optimizare-site/` and the English one is
 * `/en/services/site-optimisation/`, because a translated slug is worth more in
 * search than a tidy pattern. The result was that 14 of 18 URLs shipped with no
 * alternates at all.
 *
 * The pairing already exists and is already correct: every page emits
 * `<link rel="alternate" hreflang>` in its own <head>, computed from the content
 * collections. So rather than duplicating that logic here — or in
 * `astro.config.ts`, which cannot import `astro:content` anyway — this reads the
 * built HTML back and mirrors what the pages already claim. One source of truth,
 * and the two can never disagree.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const sitemaps = (await readdir(dist)).filter((file) => /^sitemap-\d+\.xml$/.test(file));
if (sitemaps.length === 0) {
  console.warn('sitemap: no sitemap-N.xml in dist, nothing to annotate');
  process.exit(0);
}

/** Turn an absolute page URL into the file that was built for it. */
function fileFor(loc) {
  const { pathname } = new URL(loc);
  const candidates = [
    join(dist, pathname, 'index.html'),
    join(dist, pathname.replace(/\/$/, '') + '.html'),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

let annotated = 0;
let alreadyHad = 0;
let noAlternates = 0;

for (const name of sitemaps) {
  const path = join(dist, name);
  const xml = await readFile(path, 'utf8');
  const blocks = [];

  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const [whole, inner] = match;

    if (inner.includes('xhtml:link')) {
      alreadyHad += 1;
      continue;
    }

    const loc = inner.match(/<loc>(.*?)<\/loc>/)?.[1];
    const file = loc && fileFor(loc);
    if (!file) continue;

    const html = await readFile(file, 'utf8');
    const links = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\s*\/?>/g)]
      .map(([, hreflang, href]) => `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`);

    if (links.length === 0) {
      noAlternates += 1;
      continue;
    }

    blocks.push([whole, `<url>${inner}${links.join('')}</url>`]);
    annotated += 1;
  }

  let updated = xml;
  for (const [from, to] of blocks) updated = updated.replace(from, to);
  await writeFile(path, updated);
}

console.log(
  `sitemap: ${annotated} URL(s) annotated with hreflang` +
    `, ${alreadyHad} already had them` +
    (noAlternates ? `, ${noAlternates} have none to add` : ''),
);
