import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

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
  '/servicii/landing-page/', '/en/services/landing-page/',
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
ck('70 questions published across the 10 service pages', faqTotal === 70, String(faqTotal));

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
// The generator annotates a few URLs itself but never emits x-default, and the
// top-up used to skip exactly those — leaving the sitemap contradicting the
// pages' own <head>.
ck('every sitemap entry names a default language',
  urls.every((u) => u.links.some((l) => l.tag === 'x-default')),
  `${urls.filter((u) => !u.links.some((l) => l.tag === 'x-default')).length} without`);

ck('a translated slug pairs across languages',
  optim?.links.some((l) => l.href.endsWith('/en/services/site-optimisation/')),
  optim?.links.map((l) => `${l.tag}=${new URL(l.href).pathname}`).join(' '));

// --- The landing page answers its own questions ---------------------------------
// Kept apart from the service-page FAQ counts below: those assert 7 per page and
// 70 in total, and folding the home page into them would make both meaningless.
for (const [label, path] of [['RO', '/'], ['EN', '/en/']]) {
  const f = await b.newPage();
  await f.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

  const onPage = await f.$$eval('#faq [data-faq-item]', (nodes) =>
    nodes.map((n) => ({
      question: n.querySelector('summary')?.textContent.trim() ?? '',
      answer: n.querySelector('p')?.textContent.trim() ?? '',
    })),
  );
  ck(`${label} home: the FAQ is on the page`, onPage.length === 6, `${onPage.length}`);
  ck(`${label} home: every answer says something`,
    onPage.every((item) => item.answer.length > 80),
    `shortest ${Math.min(...onPage.map((item) => item.answer.length))}`);

  const blocks = await f.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => JSON.parse(n.textContent)),
  );
  const faq = blocks.find((entry) => entry['@type'] === 'FAQPage');
  ck(`${label} home: FAQPage is emitted`, Boolean(faq));
  ck(`${label} home: the schema matches what is rendered`,
    faq?.mainEntity?.length === onPage.length &&
      faq.mainEntity.every((q, i) => onPage[i].question.startsWith(q.name)),
    `${faq?.mainEntity?.length} vs ${onPage.length}`);
  // Two documents describing two different things — not merged into the business.
  ck(`${label} home: it is its own block, not folded into the business entity`,
    blocks.filter((entry) => entry['@type'] === 'FAQPage').length === 1 &&
      !('mainEntity' in (blocks.find((e) => e['@type'] === 'ProfessionalService') ?? {})));

  // The "what do I need to prepare" answer promises an article; it has to exist.
  const prep = f.locator('[data-faq-prep-link]');
  ck(`${label} home: the preparation answer links a real article`, (await prep.count()) === 1);
  const href = await prep.getAttribute('href');
  const res = await f.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded' });
  ck(`${label} home: and that article is served`, res?.status() === 200, `${href} → ${res?.status()}`);
  await f.close();
}

// --- One business, seen many times ---------------------------------------------
// The entity used to be emitted with `url: canonical.href` and no `@id`, which
// described twenty-odd separate businesses that shared a name. Nothing asserted
// it, so the regression would have been invisible.
{
  const pages = [
    '/', '/en/', '/demo/', '/demo/magazin/',
    '/servicii/landing-page/', '/blog/de-ce-se-incarca-greu-site-ul-tau/',
    '/confidentialitate/', '/studii-de-caz/acest-site/',
  ];
  const seen = [];
  for (const path of pages) {
    const s = await b.newPage();
    await s.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    const blocks = await s.$$eval('script[type="application/ld+json"]', (nodes) =>
      nodes.map((n) => JSON.parse(n.textContent)),
    );
    await s.close();
    const business = blocks.find((entry) => entry['@type'] === 'ProfessionalService');
    seen.push({ path, id: business?.['@id'], url: business?.url, catalog: business?.hasOfferCatalog });
  }

  ck('every page declares the business', seen.every((entry) => entry.id),
    seen.filter((entry) => !entry.id).map((entry) => entry.path).join(' '));
  ck('all under one identifier', new Set(seen.map((entry) => entry.id)).size === 1,
    [...new Set(seen.map((entry) => entry.id))].join(' '));
  ck('pointing at one address, not each page', new Set(seen.map((entry) => entry.url)).size === 1,
    [...new Set(seen.map((entry) => entry.url))].join(' '));

  // The catalogue belongs where the prices are shown, not on every blog post.
  const withCatalog = seen.filter((entry) => entry.catalog).map((entry) => entry.path);
  ck('the price list rides on the landing pages only',
    withCatalog.length === 2 && withCatalog.every((path) => path === '/' || path === '/en/'),
    withCatalog.join(' '));

  const floors = (seen.find((entry) => entry.path === '/')?.catalog?.itemListElement ?? []).map(
    (offer) => offer.priceSpecification?.minPrice,
  );
  // Same four figures the pricing cards show — `offers` asserts those against
  // the service pages and the configurator, so this closes the loop.
  ck('four offers, priced from the same numbers as the cards',
    JSON.stringify(floors) === JSON.stringify([400, 900, 2200, 2500]), floors.join(', '));
  // Every price on the site reads "from X"; a flat `price` would claim otherwise.
  const specs = seen.find((entry) => entry.path === '/')?.catalog?.itemListElement ?? [];
  ck('offers quote a minimum, never a fixed price',
    specs.every((offer) => offer.priceSpecification?.minPrice && !('price' in offer)));
}

// --- Breadcrumbs on the pages that sit under something ---------------------------
{
  for (const [path, expected] of [
    ['/servicii/landing-page/', 2],
    ['/blog/de-ce-se-incarca-greu-site-ul-tau/', 3],
    ['/demo/magazin/', 2],
    ['/confidentialitate/', 2],
  ]) {
    const s = await b.newPage();
    await s.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    const blocks = await s.$$eval('script[type="application/ld+json"]', (nodes) =>
      nodes.map((n) => JSON.parse(n.textContent)),
    );
    await s.close();
    const crumbs = blocks.find((entry) => entry['@type'] === 'BreadcrumbList')?.itemListElement ?? [];
    ck(`${path} has a ${expected}-step trail`, crumbs.length === expected, `${crumbs.length}`);
    ck(`${path} starts at the home page`, crumbs[0]?.position === 1 && /\/(en\/)?$/.test(crumbs[0]?.item ?? ''),
      crumbs[0]?.item ?? 'none');
  }

  // The landing page is the root of the trail, so it has none.
  const h = await b.newPage();
  await h.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  const types = await h.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => JSON.parse(n.textContent)['@type']),
  );
  ck('the landing page has no breadcrumb to itself', !types.includes('BreadcrumbList'), types.join(' '));
  await h.close();
}

// --- Headers that only exist if the build script wrote them --------------------
{
  const h = await b.newPage();
  const res = await h.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  const sent = res?.headers() ?? {};
  ck('HSTS is set', /max-age=\d+/.test(sent['strict-transport-security'] ?? ''),
    sent['strict-transport-security'] ?? 'absent');
  // Never `preload`: that submits the apex to a browser-baked list, and the
  // final domain is not decided yet.
  ck('HSTS does not claim preload', !/preload/.test(sent['strict-transport-security'] ?? ''));

  const og = await h.goto(`${BASE}/og/home.png`, { waitUntil: 'domcontentloaded' });
  ck('share images are cacheable but not forever',
    /max-age=3600/.test(og?.headers()['cache-control'] ?? ''),
    og?.headers()['cache-control'] ?? 'absent');

  // The file exists to answer "is what I am looking at current?". A cached copy
  // answers it wrongly.
  const version = await h.goto(`${BASE}/version.txt`, { waitUntil: 'domcontentloaded' });
  ck('version.txt is never cached', /no-store/.test(version?.headers()['cache-control'] ?? ''),
    version?.headers()['cache-control'] ?? 'absent');

  const icon = await h.goto(`${BASE}/favicon.svg`, { waitUntil: 'domcontentloaded' });
  ck('icons carry a cache rule', /max-age=86400/.test(icon?.headers()['cache-control'] ?? ''),
    icon?.headers()['cache-control'] ?? 'absent');
  await h.close();
}

// --- security.txt ----------------------------------------------------------------
{
  const s = await b.newPage();
  const res = await s.goto(`${BASE}/.well-known/security.txt`, { waitUntil: 'domcontentloaded' });
  const text = await s.evaluate(() => document.body.textContent ?? '');
  ck('security.txt is served', res?.status() === 200, String(res?.status()));
  ck('it gives a contact', /^Contact:\s*mailto:/m.test(text));
  // RFC 9116 requires Expires, and a date in the past is worse than no file.
  const expires = text.match(/^Expires:\s*(.+)$/m)?.[1]?.trim();
  ck('it has not expired', Boolean(expires) && Date.parse(expires) > Date.now(), String(expires));
  await s.close();
}

// --- The deployed build identifies itself ------------------------------------
// Without this there is no way to look at the live site and tell whether it is
// current — which is exactly how a page stayed missing through two green builds.
{
  const v = await b.newPage();
  const res = await v.goto(`${BASE}/version.txt`, { waitUntil: 'domcontentloaded' });
  const body = await v.evaluate(() => document.body.textContent ?? '');
  ck('version.txt is served', res?.status() === 200, String(res?.status()));
  ck('it names the commit', /^commit: [0-9a-f]{7,40}$/m.test(body), body.split('\n')[0]);
  ck('it carries a build time', /^built:  \d{4}-\d{2}-\d{2}T/m.test(body), body.split('\n')[2]);
  await v.close();
}

// --- Accessibility of the new page -------------------------------------------
const a = await b.newPage({ viewport: { width: 1280, height: 900 } });
await a.addInitScript({ path: axePath });
await a.goto(`${BASE}/missing/`, { waitUntil: 'load' });
await settleAnimations(a);
const axeResult = await runAxe(a);
ck('the 404 page is axe-clean', axeResult.violations.length === 0,
  axeResult.violations.map((v) => v.id).join(', '));

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
