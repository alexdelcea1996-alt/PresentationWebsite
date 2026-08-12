import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE } from '../harness.mjs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const pages = htmlFiles(dist).map((file) => {
  const html = readFileSync(file, 'utf8');
  const meta = (name, attr = 'property') =>
    html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1];
  return {
    file: relative(dist, file),
    image: meta('og:image'),
    twitter: meta('twitter:image', 'name'),
    width: meta('og:image:width'),
    height: meta('og:image:height'),
    alt: meta('og:image:alt'),
    title: meta('og:title'),
  };
});

// Hard-coded on purpose: a glob that quietly stops matching would otherwise
// shrink every check below to a subset and still report all green.
ck('every built page was found', pages.length === 25, `${pages.length} pages`);
ck('every page declares a share image', pages.every((p) => p.image));

// Crawlers do not resolve relative URLs in og:image; a relative one silently
// yields no preview at all.
ck('share image URLs are absolute',
  pages.every((p) => p.image?.startsWith('https://')),
  pages.filter((p) => !p.image?.startsWith('https://')).map((p) => p.file).join(', '));

ck('twitter:image matches og:image', pages.every((p) => p.twitter === p.image));
ck('every page declares alt text for its card', pages.every((p) => p.alt));

// --- The declared file has to actually be there -------------------------------
const missing = pages.filter((p) => !existsSync(join(dist, new URL(p.image).pathname)));
ck('every declared share image exists on disk', missing.length === 0,
  missing.map((p) => p.file).join(', '));

// --- One card per page, not one card reused ------------------------------------
const digests = new Map();
for (const page of pages) {
  const path = join(dist, new URL(page.image).pathname);
  if (!existsSync(path)) continue;
  const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
  digests.set(page.file, hash);
}
ck('each page has its own distinct card', new Set(digests.values()).size === pages.length,
  `${new Set(digests.values()).size} distinct of ${pages.length}`);

// --- Dimensions must match what the page claims --------------------------------
function pngSize(path) {
  const buffer = readFileSync(path);
  // PNG: 8-byte signature, then the IHDR chunk with width and height as u32be.
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const wrongSize = pages.filter((page) => {
  const path = join(dist, new URL(page.image).pathname);
  if (!existsSync(path)) return true;
  const { width, height } = pngSize(path);
  return width !== Number(page.width) || height !== Number(page.height);
});
ck('every card is the size its page advertises', wrongSize.length === 0,
  wrongSize.map((p) => p.file).join(', '));
ck('cards use the 1.91:1 ratio crawlers expect', pages.every((p) => p.width === '1200' && p.height === '630'));

// Facebook rejects images over 8 MB; anything near that is a mistake anyway.
const heaviest = Math.max(...[...digests.keys()].map((file) => {
  const page = pages.find((p) => p.file === file);
  return statSync(join(dist, new URL(page.image).pathname)).size;
}));
ck('cards stay small enough to be fetched quickly', heaviest < 400 * 1024,
  `heaviest ${(heaviest / 1024).toFixed(0)} kB`);

// --- The old generic card must be gone -----------------------------------------
ck('the single generic card is no longer shipped',
  !existsSync(join(dist, 'og-image.png')) && !existsSync(join(dist, 'og-image-en.png')));
ck('nothing still points at the old generic card',
  !pages.some((p) => p.image.includes('og-image')));

// --- Served correctly ----------------------------------------------------------
const b = await launch();
const p = await b.newPage();
await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

const served = await p.evaluate(async (base) => {
  const src = document.querySelector('meta[property="og:image"]').content;
  const res = await fetch(base + new URL(src).pathname);
  const bitmap = res.ok ? await createImageBitmap(await res.blob()) : null;
  return { status: res.status, type: res.headers.get('content-type'), w: bitmap?.width, h: bitmap?.height };
}, BASE);
ck('the card is served as a PNG', served.status === 200 && served.type === 'image/png',
  `${served.status} ${served.type}`);
ck('the served card decodes at 1200x630', served.w === 1200 && served.h === 630,
  `${served.w}x${served.h}`);

await b.close();
console.log(R.join('\n'));
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
