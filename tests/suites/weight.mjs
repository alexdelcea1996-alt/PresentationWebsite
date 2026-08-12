/**
 * Byte budgets, asserted.
 *
 * The a11y suite already *reports* what each page weighs, which is useful for
 * diagnosis and useless as a guard: a slow drift upward passes green forever.
 * This suite fails instead.
 *
 * It reads `dist/` directly — no browser, no server, no timing — so a failure
 * always means the artefacts changed, never that the machine was busy. Brotli is
 * computed here with `node:zlib` because the build does not emit `.br` files;
 * Cloudflare compresses on the fly, and quality 11 is what it uses for static
 * assets, so these numbers are what a visitor actually downloads.
 *
 * Every threshold carries the measurement it was set from. They are today's
 * figures plus roughly 10-15%: enough air for ordinary content growth, tight
 * enough that a stray dependency or an un-subsetted font is caught the same day.
 * When a budget is exceeded on purpose, raise it deliberately and update the
 * "today" comment — that edit is the record of the decision.
 */
import { readFile, readdir } from 'node:fs/promises';
import { brotliCompressSync, constants } from 'node:zlib';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const KB = 1024;
const kb = (bytes) => `${(bytes / KB).toFixed(1)} kB`;

/** Quality 11 — what a CDN serves for a static file it can compress once. */
const brotli = (buffer) =>
  brotliCompressSync(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else found.push(path);
  }
  return found;
}

const files = await walk(dist);
const named = (path) => `/${relative(dist, path).replace(/\\/g, '/')}`;

/** Fail loudly rather than pass vacuously when a category disappears. */
const pick = (test) => files.filter((file) => test(named(file)));

/**
 * The example sites framed by the demos are separate documents with their own
 * tiny stylesheet, no share card and no sitemap entry. They are weighed like any
 * other page below, but the share-image budget has to know they are exempt.
 */
const isExample = (name) => name.includes('/exemplu/') || name.includes('/example/');

// --- HTML --------------------------------------------------------------------
const pages = pick((name) => name.endsWith('.html'));
const shared = pages.filter((file) => !isExample(named(file)));
ck('there are pages to weigh', pages.length >= 25, `${pages.length} page(s)`);
// Eight today: one landing example and a three-page site example, per language.
ck('the framed examples are all there',
  pages.length - shared.length === 8, `${pages.length - shared.length}`);

const weighed = [];
for (const page of pages) {
  const buffer = await readFile(page);
  weighed.push({ name: named(page), raw: buffer.length, br: brotli(buffer) });
}
weighed.sort((a, b) => b.raw - a.raw);

// The landing page is by far the heaviest document: every section of the site
// is on it. Today: 22.0 kB brotli, 158 kB raw — up from 19.7/138.5 when the
// portfolio gained a second framed example and the contact form became
// stepped. Raised deliberately, in the commits that spent it.
const home = weighed.find((page) => page.name === '/index.html');
ck('the landing page compresses under budget', home.br <= 25 * KB, `${kb(home.br)} brotli`);
ck('and its markup stays under budget', home.raw <= 175 * KB, `${kb(home.raw)} raw`);

// No page may quietly become a second landing page. Today the largest after the
// two home pages is a service page at 45.4 kB raw / 8.4 kB brotli.
const inner = weighed.filter((page) => !/^\/(en\/)?index\.html$/.test(page.name));
const heaviestInner = inner[0];
ck('no sub-page approaches the landing page in weight',
  heaviestInner.raw <= 60 * KB, `${heaviestInner.name} at ${kb(heaviestInner.raw)} raw`);
const INNER_BROTLI_BUDGET = 11 * KB;
ck('and none of them compresses badly',
  inner.every((page) => page.br <= INNER_BROTLI_BUDGET),
  inner.filter((page) => page.br > INNER_BROTLI_BUDGET)
    .map((page) => `${page.name} ${kb(page.br)}`).join(' '));

// --- CSS ---------------------------------------------------------------------
// Still one stylesheet for the whole site, shared across every page. The example
// sites bring their own, but it is small enough that Astro inlines it into those
// pages rather than emitting a file — which is why the count stays at one.
// Today: 56.0 kB raw, 9.1 kB brotli.
const stylesheets = pick((name) => name.endsWith('.css'));
ck('the site ships one stylesheet', stylesheets.length === 1, `${stylesheets.length}`);
const css = await readFile(stylesheets[0]);
ck('the stylesheet compresses under budget', brotli(css) <= 10.5 * KB, `${kb(brotli(css))} brotli`);
ck('and stays under budget uncompressed', css.length <= 64 * KB, `${kb(css.length)} raw`);

// The examples must not start pulling the main stylesheet in: their whole point
// is that they do not inherit this site's design. Today: 4.8 kB of inline CSS on
// the heaviest of them, and no link to the shared sheet.
for (const file of pages.filter((f) => isExample(named(f)))) {
  const html = await readFile(file, 'utf8');
  ck(`${named(file)} carries its own styles, not the site's`,
    !html.includes('/_astro/') || !/<link[^>]+\.css/.test(html));
}

// --- JavaScript --------------------------------------------------------------
// Astro inlines the small scripts and emits a bundle above ~4 kB. Both matter
// for different reasons: inline bytes are paid by every visitor to that page,
// bundle bytes only by whoever reaches the section that needs them.
//
// Today: 5.6 kB (store), 5.0 kB (bookings), 4.9 kB (configurator), 4.3 kB
// (audit), raw. The frame switch and the example forms stay inline. Two
// sections have crossed the threshold on purpose: the configurator when
// sharing was added to it, the audit band when the cost calculator was — the
// latter by 257 bytes. Both were accepted rather than shrunk back, because
// below-the-fold logic a visitor may never run is better as one cacheable,
// deferred request than as bytes in every landing-page response. Across the
// two moves the landing page's inline JS fell 18.1 → 12.5 kB.
//
// The check is an allowlist rather than a count: the regression worth catching
// is a bundle nobody decided to ship — a stray framework import, a demo
// leaking into a shared component — and a bare `length === 4` would wave that
// through as long as something else had shrunk. No DEMO bundle may load on the
// landing page; the demo and store suites assert that directly.
const EXPECTED_BUNDLES = ['Audit', 'BookingDemo', 'Configurator', 'StoreDemo'];
const bundles = pick((name) => name.endsWith('.js'));
const bundleNames = bundles.map((f) => named(f).replace(/^\/_astro\//, '').replace(/\..*$/, ''));
ck('exactly the four bundles we decided to ship',
  bundleNames.length === EXPECTED_BUNDLES.length &&
    EXPECTED_BUNDLES.every((name) => bundleNames.includes(name)),
  bundleNames.join(' ') || 'none');
for (const bundle of bundles) {
  const buffer = await readFile(bundle);
  const label = named(bundle).replace(/^\/_astro\//, '').replace(/\..*$/, '');
  ck(`the ${label} bundle is under budget`, buffer.length <= 7 * KB, `${kb(buffer.length)} raw`);
}

/** Inline script bytes, excluding JSON-LD — data blocks are never executed. */
async function inlineJs(page) {
  const html = await readFile(join(dist, page), 'utf8');
  let total = 0;
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\ssrc\s*=/i.test(attrs)) continue;
    if (/type\s*=\s*["']application\/ld\+json/i.test(attrs)) continue;
    total += Buffer.byteLength(body);
  }
  return total;
}

// Today: 12.5 kB on the landing page, 3.2 kB on a playable demo page, 3.5 kB on
// a framed one, 0.3 kB inside an example site. The landing figure went 14.6 →
// 18.1 kB when the contact form became stepped and the cursor glow arrived, and
// back down to 12.5 when the configurator and the audit band crossed Astro's
// inline threshold and moved into files of their own. The ceiling comes down
// with it: a 21 kB budget against 12.5 kB of actual bytes stops being a guard
// and starts being decoration. Raising it again is allowed — deliberately, in
// the commit that spends the bytes, with this paragraph rewritten.
const homeJs = await inlineJs('index.html');
ck('inline JS on the landing page is under budget', homeJs <= 15 * KB, `${kb(homeJs)} raw`);
const demoJs = await inlineJs(join('demo', 'index.html'));
ck('inline JS on a demo page is under budget', demoJs <= 5 * KB, `${kb(demoJs)} raw`);
const exampleJs = await inlineJs(join('demo', 'exemplu', 'atelier', 'index.html'));
ck('an example site ships almost no JavaScript', exampleJs <= 2 * KB, `${kb(exampleJs)} raw`);

// --- Fonts -------------------------------------------------------------------
// Four subsetted files: two families × latin and latin-ext. Today: 56.8 kB.
// The number that matters is the total, because all four are preloaded.
const fonts = pick((name) => name.endsWith('.woff2'));
ck('the fonts are still subsetted, not the full families', fonts.length === 4, `${fonts.length} file(s)`);
let fontBytes = 0;
for (const font of fonts) fontBytes += (await readFile(font)).length;
ck('the font payload is under budget', fontBytes <= 64 * KB, kb(fontBytes));

// --- Share images ------------------------------------------------------------
// Drawn at build time, one per page, and fetched by crawlers rather than
// visitors — so the budget is per file, not total. Today the largest is 90.9 kB;
// the figure moves with title length, so the budget is looser than the others.
const shareImages = pick((name) => name.startsWith('/og/'));
ck('every page still has a share image', shareImages.length >= shared.length - 1,
  `${shareImages.length} image(s) for ${shared.length} non-example page(s)`);
let largestShare = { name: '', size: 0 };
for (const image of shareImages) {
  const { length } = await readFile(image);
  if (length > largestShare.size) largestShare = { name: named(image), size: length };
}
ck('no share image is oversized', largestShare.size <= 120 * KB,
  `${largestShare.name} at ${kb(largestShare.size)}`);

console.log(R.join('\n'));
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
