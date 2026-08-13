import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, axePath, runAxe, settleAnimations, PRODUCTION_URL, PRODUCTION_HOST } from '../harness.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = join(root, 'dist');
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

/**
 * The rasterised icons must wear the palette the stylesheet declares.
 *
 * This is not hypothetical tidiness. The accent pair changed, `favicon.svg`
 * changed with it, and every PNG in the set silently stayed on the old
 * indigo-and-cyan for a full day — because they are generated by hand with
 * `npm run icons` and nothing anywhere noticed the gap. The tab showed one
 * brand and the phone home screen showed the previous one.
 *
 * BOTH ends of the gradient are sampled, and the tolerance is measured rather
 * than guessed. The first attempt checked one corner against one stop with a
 * limit of 60, which sounded generous and was: replaying the exact drift that
 * prompted the check, the stale indigo landed 49 away from the new iris and
 * sailed straight through. Two blue-violets are simply close together.
 *
 * Measured against the real rasteriser at 15% in from each corner: a correctly
 * generated icon sits 21-22 away from the declared stop — it is a gradient
 * being sampled, not a flat fill — while the previous palette sits at 45 on the
 * accent end and 78 on the jade end. A limit of 32 separates them with room on
 * both sides, and the jade end is what makes it decisive, which is why one
 * corner was never enough.
 */
// The icons are a fixed asset: one file, painted once, so they carry the DARK
// theme's accent — the brand default on bare `:root`. Read the token from a
// page in that theme or the comparison is against the light palette and every
// icon looks wrong for a reason that has nothing to do with the icon.
const darkPage = await b.newPage();
await darkPage.addInitScript(() => localStorage.setItem('theme', 'dark'));
await darkPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const painted = await darkPage.evaluate(async (base) => {
  const token = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

  const sample = async (src) => {
    const res = await fetch(base + src);
    if (!res.ok) return null;
    const bitmap = await createImageBitmap(await res.blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    const read = (x, y) => [...context.getImageData(x, y, 1, 1).data].slice(0, 3);
    const near = Math.round(bitmap.width * 0.15);
    return { start: read(near, near), end: read(bitmap.width - near, bitmap.width - near) };
  };

  const results = {};
  for (const src of ['/favicon-32.png', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png']) {
    results[src] = await sample(src);
  }
  return {
    results,
    accent: rgb(token('--color-accent')),
    alt: rgb(token('--color-accent-alt')),
  };
}, BASE);
await darkPage.close();

const ICON_TOLERANCE = 32;
for (const [src, corners] of Object.entries(painted.results)) {
  const gap = (pixel, stop) =>
    pixel ? Math.round(Math.hypot(...pixel.map((v, i) => v - stop[i]))) : Infinity;
  const fromAccent = gap(corners?.start, painted.accent);
  const fromAlt = gap(corners?.end, painted.alt);
  ck(`${src} is painted in this season's palette`,
    fromAccent < ICON_TOLERANCE && fromAlt < ICON_TOLERANCE,
    `accent end ${fromAccent}, jade end ${fromAlt} (limit ${ICON_TOLERANCE})`);
}

/**
 * `/favicon.ico` at the fixed path, for everything that asks without reading
 * the HTML: feed readers, unfurlers, older clients. Without the file they get
 * the 404 page — a page of HTML in answer to a request for an icon.
 */
const ico = await icons.evaluate(async (base) => {
  const res = await fetch(base + '/favicon.ico');
  const buffer = new Uint8Array(await res.arrayBuffer());
  return {
    status: res.status,
    type: res.headers.get('content-type'),
    // ICONDIR: two reserved bytes, type 1, then the image count.
    reserved: buffer[0] | (buffer[1] << 8),
    kind: buffer[2] | (buffer[3] << 8),
    count: buffer[4] | (buffer[5] << 8),
    bytes: buffer.length,
  };
}, BASE);
/**
 * Meta lengths and feed discovery — the August 2026 audit's findings, held.
 *
 * An independent crawl found 15 titles over 60 characters and 12 descriptions
 * over 160 — all truncating in search results — plus feed autodiscovery
 * missing from the articles themselves. Nothing here asserted lengths, so the
 * copy drifted long one string at a time, each one reasonable on its own.
 * Aggregated checks rather than per-page, so adding a page does not change the
 * suite's size — the failure detail lists the offending URLs.
 */
{
  const walk = (dir) => readdirSync(join(dist, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) return walk(rel);
    return e.name.endsWith('.html') ? [rel] : [];
  });
  const isExample = (p) => p.includes('exemplu/') || p.includes('example/');

  const overTitle = [];
  const badDescription = [];
  const blogMissingFeed = [];
  for (const rel of walk('')) {
    if (isExample(rel)) continue;
    const html = readFileSync(join(dist, rel), 'utf8');
    const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
    const url = '/' + rel.replace(/index\.html$/, '');
    if (!noindex) {
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
      if (title.length > 60) overTitle.push(`${url} (${title.length})`);
      if (description.length < 50 || description.length > 160) {
        badDescription.push(`${url} (${description.length})`);
      }
    }
    if (/^(en\/)?blog\//.test(rel) && !html.includes('application/rss+xml')) {
      blogMissingFeed.push(url);
    }
  }

  ck('every indexable title fits a search result (≤60 chars)',
    overTitle.length === 0, overTitle.join(', '));
  ck('every indexable description fits the snippet (50-160 chars)',
    badDescription.length === 0, badDescription.join(', '));
  ck('every blog page advertises the RSS feed, articles included',
    blogMissingFeed.length === 0, blogMissingFeed.join(', '));
  ck('favicon.ico ships with a cache rule',
    /\/favicon\.ico\n\s*Cache-Control/.test(readFileSync(join(dist, '_headers'), 'utf8')));
}

ck('favicon.ico is served rather than 404ing into the error page',
  ico.status === 200, `${ico.status} ${ico.type}`);
ck('and is a real icon container, not a renamed PNG',
  ico.reserved === 0 && ico.kind === 1 && ico.count >= 1,
  `type ${ico.kind}, ${ico.count} image(s), ${ico.bytes} B`);

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

// --- The one human element -----------------------------------------------------
// The section exists to put a person behind the promises, which is exactly why
// it is the easiest place on the site for an unverifiable claim to appear. The
// number check below is the guard: the only figures allowed are the two the
// site already publishes everywhere (24 hours, 30 minutes). A line like "10
// years of experience" or "200 projects delivered" fails here.
for (const [label, path] of [['RO', '/'], ['EN', '/en/']]) {
  const a = await b.newPage();
  await a.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

  const about = a.locator('#about');
  ck(`${label} about: the section is on the page`, (await about.count()) === 1);

  const card = a.locator('#about [data-about-card]');
  ck(`${label} about: there is a name behind the promises`,
    (await card.count()) === 1 && (await card.innerText()).includes('Alex Delcea'));

  const facts = await a.$$eval('#about [data-about-card] li', (n) => n.length);
  const principles = await a.$$eval('#about [data-about-principle]', (n) =>
    n.map((node) => node.innerText.trim()),
  );
  ck(`${label} about: the card lists its facts`, facts === 3, `${facts}`);
  ck(`${label} about: three principles, each with a body`,
    principles.length === 3 && principles.every((text) => text.length > 120),
    `${principles.length}, shortest ${Math.min(...principles.map((t) => t.length))}`);

  const paragraphs = await a.$$eval('#about [data-about-body]', (n) =>
    n.map((node) => node.textContent.trim()).filter(Boolean),
  );
  ck(`${label} about: the introduction is written, not a stub`,
    paragraphs.length === 3 && paragraphs.every((text) => text.length > 150),
    `${paragraphs.length} paragraph(s)`);

  const numbers = [...(await about.innerText()).matchAll(/\d+/g)].map(([n]) => n);
  ck(`${label} about: no figure the site does not already publish`,
    numbers.every((n) => n === '24' || n === '30'),
    numbers.filter((n) => n !== '24' && n !== '30').join(' ') || 'only 24 and 30');

  // The portrait is optional; when one is added it must still be described.
  const photo = a.locator('#about [data-about-photo]');
  const alt = (await photo.count()) === 1 ? await photo.getAttribute('alt') : 'no portrait yet';
  ck(`${label} about: a portrait, if present, is described`, Boolean(alt && alt.length > 5), alt);

  // It has to lead somewhere, and the anchor it names has to be on this page.
  const cta = a.locator('#about [data-about-cta]');
  const href = await cta.getAttribute('href');
  ck(`${label} about: the section leads to the form`,
    href?.endsWith('#contact') && (await a.locator('#contact').count()) === 1, String(href));

  // Placement is the argument: promises first, then the person making them.
  const order = await a.$$eval('main section[id]', (n) => n.map((node) => node.id));
  ck(`${label} about: it stands between the guarantees and the form`,
    order.indexOf('about') > order.indexOf('guarantees') &&
      order.indexOf('about') < order.indexOf('contact'),
    order.join(' → '));

  await a.close();
}

// --- The thank-you pages are private, and only reachable honestly ----------------
// They exist for the second conversion: somebody who has just written is the
// most willing they will ever be to also book the call. But a thank-you page a
// failed send can reach is exactly the false success this form was fixed to
// stop showing, so only the confirmed path may lead here.
{
  const sitemap = await (await fetch(`${BASE}/sitemap-0.xml`)).text();
  for (const [label, path] of [['RO', '/multumesc/'], ['EN', '/en/thank-you/']]) {
    const p = await b.newPage();
    const res = await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    ck(`${label} thanks: the page is served`, res?.status() === 200, `${res?.status()}`);
    ck(`${label} thanks: it refuses indexing`,
      /noindex/.test((await p.locator('meta[name="robots"]').getAttribute('content')) ?? ''));
    ck(`${label} thanks: and stays out of the sitemap`, !sitemap.includes(path));

    // Only promises already published elsewhere on the site.
    const steps = await p.$$eval('[data-thanks-step]', (n) => n.map((el) => el.innerText));
    ck(`${label} thanks: it says what happens next`, steps.length === 3, `${steps.length}`);
    ck(`${label} thanks: with the same 24-hour promise`, /24/.test(steps.join(' ')));

    // The reason the page exists.
    ck(`${label} thanks: it offers the call as a second step`,
      (await p.locator('[data-thanks-booking]').count()) === 1);
    await p.close();
  }

  // The form must carry the address, and only the confirmed branch may use it.
  const f = await b.newPage();
  await f.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  ck('the form knows where to send a confirmed submission',
    (await f.locator('[data-contact-form]').getAttribute('data-thanks')) === '/multumesc/');
  await f.close();
}

// --- One reply promise, everywhere ----------------------------------------------
// The site promises an answer within 24 hours, usually the same working day.
// The 48-hour figure belongs to one thing only — the written audit — and must
// never leak into the contact section, where it would read as a slower promise
// sitting right next to the faster one.
for (const [label, path] of [['RO', '/'], ['EN', '/en/']]) {
  const r = await b.newPage();
  await r.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  // textContent, not innerText: the stepped form keeps the note on the last
  // step, so it is in the document but off screen until the visitor gets there.
  const contactText = await r.locator('#contact').evaluate((el) => el.textContent ?? '');
  ck(`${label} contact: the promise is at the button`, /24/.test(contactText));
  ck(`${label} contact: no 48-hour figure contradicts it`, !/48/.test(contactText));
  await r.close();
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
  // Two-sided, and that is the point. The RFC asks for less than a year out;
  // the lower bound is what catches a date that stopped being computed. A
  // constant passes the "not expired" check right up until the day it fails
  // for real, so this fails the build six months earlier instead.
  const months = (Date.parse(expires) - Date.now()) / (30 * 24 * 3600 * 1000);
  ck('the expiry is recomputed each build, not frozen',
    months > 6 && months < 12.2, `${months.toFixed(1)} months out`);
  // The canonical field names the address the file is served from. Wrong after
  // a domain move unless it is generated, which is why this file is a route.
  ck('the canonical field follows the build address',
    text.includes(`Canonical: ${PRODUCTION_URL}/.well-known/security.txt`),
    text.match(/^Canonical:.*$/m)?.[0] ?? 'absent');
  await s.close();
}

// --- Nothing types the domain by hand ----------------------------------------
// Tomorrow this site moves to its own domain. `SITE_URL` in the Cloudflare
// project settings is meant to be the one place that decides the address —
// every canonical, hreflang, og:url, sitemap entry, security.txt and case-study
// link derives from it. A hostname copied into a source file survives the move
// silently and points visitors at the old address, so the move has to be one
// setting, not a search.
{
  const skip = new Set(['node_modules', 'dist', '.git', '.astro']);
  const sources = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(astro|ts|tsx|mjs|js|json|md|css)$/.test(entry.name)) sources.push(path);
    }
  };
  walk(join(root, 'src'));
  walk(join(root, 'tests'));

  const offenders = sources.filter((path) => readFileSync(path, 'utf8').includes(PRODUCTION_HOST));
  ck('no source file spells out the production hostname',
    offenders.length === 0,
    offenders.map((path) => path.slice(root.length + 1)).join(', ') || `scanned ${sources.length} files`);
  // A guard that scanned nothing would pass forever.
  ck('the scan actually reached the source tree', sources.length > 100, `${sources.length} files`);
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
