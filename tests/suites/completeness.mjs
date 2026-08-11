import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, axePath, runAxe } from '../harness.mjs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

// --- 404 --------------------------------------------------------------------
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
const response = await p.goto(`${BASE}/o-pagina-care-nu-exista/`, { waitUntil: 'load' });

ck('a missing address returns a 404 status', response.status() === 404, String(response.status()));
ck('the 404 page renders, not a bare server message',
  (await p.locator('h1').innerText()).includes('nu există'), await p.locator('h1').innerText());
ck('the 404 keeps the site header', await p.locator('header').isVisible());
ck('the 404 keeps the site footer', await p.locator('footer').isVisible());

const head404 = await p.content();
ck('the 404 is marked noindex', /<meta name="robots" content="noindex/.test(head404));
// A 404 answers to every wrong URL there is, so claiming a canonical or an
// hreflang pair would be asserting things about addresses that do not exist.
ck('the 404 claims no canonical', !head404.includes('rel="canonical"'));
// Only <link rel="alternate"> counts: the language switcher marks up its own
// anchors with hreflang, which is correct and unrelated.
ck('the 404 claims no hreflang alternates',
  !/<link[^>]+rel="alternate"[^>]+hreflang/.test(head404));
// The switcher rewrites its own hrefs from the head alternates. With none
// present it must fall back quietly to the server-rendered links, not throw and
// not leave a dead href behind.
const switcherHrefs = await p.$$eval('[data-lang-switcher] a', (as) => as.map((a) => a.getAttribute('href')));
ck('the language switcher still has working links without alternates',
  switcherHrefs.length > 0 && switcherHrefs.every((href) => href && href !== '#'),
  switcherHrefs.join(' '));
ck('no script errors on the 404', errs.length === 0, errs.join(' | '));
ck('the 404 offers a way back', await p.locator('main a[href="/"]').first().isVisible());
ck('the 404 speaks English too', (await p.locator('main').innerText()).includes('does not exist'));

await p.locator('main a[href="/"]').first().click();
await p.waitForLoadState('load');
ck('the way back actually works', new URL(p.url()).pathname === '/', p.url());

const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
ck('the 404 is kept out of the sitemap', !sitemap.includes('404'));

// --- Icons and manifest ------------------------------------------------------
for (const [label, path] of [['home', '/'], ['service', '/servicii/site-de-prezentare/'], ['404', '/nope/']]) {
  const page = await b.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  ck(`${label}: declares an apple-touch-icon`, html.includes('rel="apple-touch-icon"'));
  ck(`${label}: declares the manifest`, html.includes('rel="manifest"'));
  ck(`${label}: keeps the SVG favicon`, html.includes('type="image/svg+xml"'));
  await page.close();
}

const icons = await b.newPage();
await icons.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const manifest = await icons.evaluate(async (base) => {
  const res = await fetch(base + '/site.webmanifest');
  return { status: res.status, type: res.headers.get('content-type'), body: await res.json() };
}, BASE);
ck('the manifest is served', manifest.status === 200, `${manifest.status} ${manifest.type}`);
ck('the manifest names the app', Boolean(manifest.body.name && manifest.body.short_name));
ck('the manifest is installable (standalone + start_url)',
  manifest.body.display === 'standalone' && manifest.body.start_url === '/');
ck('the manifest declares a maskable icon',
  manifest.body.icons.some((i) => i.purpose === 'maskable'),
  manifest.body.icons.map((i) => `${i.sizes}:${i.purpose}`).join(' '));

// Every icon the manifest promises must actually exist, at the size it claims.
for (const icon of manifest.body.icons) {
  const probe = await icons.evaluate(async ([base, src, sizes]) => {
    const res = await fetch(base + src);
    if (!res.ok) return { ok: false, why: `HTTP ${res.status}` };
    const bitmap = await createImageBitmap(await res.blob());
    const [w] = sizes.split('x').map(Number);
    return { ok: bitmap.width === w && bitmap.height === w, why: `${bitmap.width}x${bitmap.height}` };
  }, [BASE, icon.src, icon.sizes]);
  ck(`${icon.src} exists at ${icon.sizes}`, probe.ok, probe.why);
}

const touch = await icons.evaluate(async (base) => {
  const res = await fetch(base + '/apple-touch-icon.png');
  if (!res.ok) return { ok: false, why: `HTTP ${res.status}` };
  const bitmap = await createImageBitmap(await res.blob());
  return { ok: bitmap.width === 180, why: `${bitmap.width}x${bitmap.height}` };
}, BASE);
ck('apple-touch-icon exists at 180x180', touch.ok, touch.why);
await icons.close();

// --- FAQ structured data -----------------------------------------------------
const servicePaths = [
  '/servicii/site-de-prezentare/', '/servicii/magazin-online/',
  '/servicii/aplicatie-web/', '/servicii/optimizare-site/',
  '/en/services/business-website/', '/en/services/online-store/',
  '/en/services/web-application/', '/en/services/site-optimisation/',
];

let faqTotal = 0;
for (const path of servicePaths) {
  const page = await b.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

  const blocks = (await page.locator('script[type="application/ld+json"]').allInnerTexts())
    .map((raw) => JSON.parse(raw));
  const faq = blocks.find((entry) => entry['@type'] === 'FAQPage');

  // Questions are rendered as <summary> inside collapsible <details>.
  const rendered = await page.locator('main details summary').allInnerTexts();
  const questions = faq?.mainEntity.map((q) => q.name) ?? [];
  // The schema has to describe the page, not a parallel set of invented Q&As.
  const onPage = questions.every((q) => rendered.some((r) => r.trim() === q.trim()));

  ck(`${path} emits FAQPage with questions`, Boolean(faq) && questions.length === 7,
    `${questions.length} question(s)`);
  ck(`${path} schema matches the visible questions`, onPage);
  faqTotal += questions.length;
  await page.close();
}
ck('56 questions published across the 8 service pages', faqTotal === 56, String(faqTotal));

// --- Sitemap hreflang --------------------------------------------------------
const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, inner]) => ({
  loc: inner.match(/<loc>(.*?)<\/loc>/)[1],
  links: [...inner.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(([, tag, href]) => ({ tag, href })),
}));

ck('every sitemap URL carries hreflang', urls.every((u) => u.links.length > 0),
  `${urls.filter((u) => !u.links.length).length} without`);
ck('each entry references itself, as the spec requires',
  urls.every((u) => u.links.some((l) => l.href === u.loc)),
  urls.filter((u) => !u.links.some((l) => l.href === u.loc)).map((u) => u.loc).join(', '));
ck('each entry names both languages',
  urls.every((u) => u.links.some((l) => l.tag === 'ro-RO') && u.links.some((l) => l.tag === 'en-US')));
ck('every hreflang target is itself a page in the sitemap',
  urls.every((u) => u.links.filter((l) => l.tag !== 'x-default')
    .every((l) => urls.some((other) => other.loc === l.href))),
  'a target outside the sitemap would be a dead pair');

// The translated slugs are the reason the built-in pairing failed; prove the
// pairs really do cross languages rather than pointing at themselves twice.
const optim = urls.find((u) => u.loc.endsWith('/servicii/optimizare-site/'));
ck('a translated slug pairs across languages',
  optim?.links.some((l) => l.href.endsWith('/en/services/site-optimisation/')),
  optim?.links.map((l) => `${l.tag}=${new URL(l.href).pathname}`).join(' '));

// --- Accessibility of the new page -------------------------------------------
const a = await b.newPage({ viewport: { width: 1280, height: 900 } });
await a.addInitScript({ path: axePath });
await a.goto(`${BASE}/missing/`, { waitUntil: 'load' });
await a.waitForTimeout(600);
const axeResult = await runAxe(a);
ck('the 404 page is axe-clean', axeResult.violations.length === 0,
  axeResult.violations.map((v) => v.id).join(', '));

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
