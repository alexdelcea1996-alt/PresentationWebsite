/**
 * The site stopped being one page.
 *
 * For a long time everything lived on the landing page and the header linked to
 * anchors inside it. That has now been split into five pages — services,
 * projects, pricing, estimate, contact — and this suite guards the three things
 * that split can quietly get wrong.
 *
 * IT HAS TO BE REACHABLE. A page nobody links to is a page nobody visits, and
 * the header is the only navigation most readers will use. Every one of the
 * five is checked to exist in both languages, to be linked from the header, and
 * to say which one you are on.
 *
 * NOTHING MAY BE PUBLISHED TWICE AT FULL LENGTH. Splitting a document is the
 * easiest way to end up with the same words on two indexable addresses — one
 * search result competing with another, and two copies of a price to keep in
 * step. Two sections are teased on the landing page on purpose, so the rule is
 * measured rather than absolute: a section that appears twice must be markedly
 * shorter in one of the two places, or it is not a summary.
 *
 * THE OLD LINKS HAVE TO STILL WORK. `/#pricing` and `/?from=store#contact` are
 * in published articles, in sent emails and in bookmarks, and none of them can
 * be edited. They are forwarded, with their query string intact — and the two
 * sections that did NOT move must not be forwarded anywhere.
 *
 * The fourth thing is the hand-over. The configurator and the audit band used
 * to write straight into a form three sections below them; they now have to get
 * the same information across a navigation, which is a great deal easier to
 * break and impossible to notice by looking at the page.
 */
import { launch, BASE, PAGE, checks } from '../harness.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ck = checks();
const b = await launch();
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VIEWPORT = { viewport: { width: 1280, height: 1000 } };

// --- The addresses are the ones the site itself builds --------------------------
/*
  `PAGE` in the harness is a convenience for the suites; `src/data/pages.ts` is
  what the site actually renders links from. Two lists of URLs is one list too
  many, so the copy used by the checks is compared against the source of truth.
*/
{
  const source = readFileSync(join(root, 'src', 'data', 'pages.ts'), 'utf8');
  const declared = Object.fromEntries(
    [...source.matchAll(/export const (\w+Path|\w+IndexPath) = \(locale: Locale\) =>\s*withBase\(locale === 'en' \? '([^']*)' : '([^']*)'\);/g)]
      .map(([, name, en, ro]) => [name, { ro: `/${ro}`, en: `/${en}` }]),
  );
  const pairs = [
    ['services', 'servicesIndexPath'],
    ['projects', 'projectsPath'],
    ['pricing', 'pricingPath'],
    ['estimate', 'estimatePath'],
    ['contact', 'contactPagePath'],
  ];
  const wrong = pairs.filter(([key, fn]) =>
    declared[fn]?.ro !== PAGE[key].ro || declared[fn]?.en !== PAGE[key].en);
  ck('the suites and the site agree on where every page is', wrong.length === 0,
    wrong.map(([key, fn]) => `${key}: suite ${PAGE[key].ro}/${PAGE[key].en} vs site ${declared[fn]?.ro}/${declared[fn]?.en}`).join(' | '));
}

// --- Each page is served, singular, and knows where it sits ---------------------
for (const [key, paths] of Object.entries(PAGE)) {
  if (key === 'home') continue;
  for (const [locale, path] of Object.entries(paths)) {
    const p = await b.newPage(VIEWPORT);
    const res = await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    ck(`${locale} ${key}: served`, res?.status() === 200, `${path} → ${res?.status()}`);

    // Exactly one h1, and it is the section's own heading rather than a title
    // bolted above it that repeats what the section already says.
    const h1 = await p.locator('main h1').allInnerTexts();
    ck(`${locale} ${key}: exactly one h1`, h1.length === 1, `${h1.length}: ${h1.join(' / ')}`);

    // Linked from the header, and marked as the page you are on.
    const nav = p.locator(`header nav a[href^="${path}"]`).first();
    ck(`${locale} ${key}: the header links it`, (await nav.count()) > 0);
    ck(`${locale} ${key}: and marks it as the current page`,
      (await nav.getAttribute('aria-current')) === 'page');

    // Its own title and description, not the site-wide default.
    const title = await p.title();
    const description = await p.locator('meta[name="description"]').getAttribute('content');
    ck(`${locale} ${key}: its own title, short enough to be shown whole`,
      title.length > 10 && title.length <= 60, `${title.length}: ${title}`);
    ck(`${locale} ${key}: its own description`,
      (description ?? '').length >= 50 && (description ?? '').length <= 160,
      `${(description ?? '').length}`);

    // The other language points at the same page, not at its home page.
    const other = locale === 'ro' ? 'en' : 'ro';
    const alternate = await p
      .locator(`link[rel="alternate"][hreflang^="${other}"]`)
      .getAttribute('href');
    ck(`${locale} ${key}: hreflang points at the same page in ${other}`,
      new URL(alternate ?? BASE).pathname === paths[other],
      `${new URL(alternate ?? BASE).pathname} vs ${paths[other]}`);

    // A breadcrumb, so a search result shows the trail rather than a bare URL.
    const crumbs = await p.$$eval('script[type="application/ld+json"]', (nodes) =>
      nodes.map((n) => JSON.parse(n.textContent ?? '{}')));
    const trail = crumbs.find((entry) => entry['@type'] === 'BreadcrumbList');
    ck(`${locale} ${key}: it carries a breadcrumb`,
      trail?.itemListElement?.length === 2, `${trail?.itemListElement?.length}`);

    await p.close();
  }
}

// --- Nothing is published twice at full length -------------------------------------
/*
  Splitting a page is the easiest way to end up with the same words on two
  indexable addresses, competing with each other and needing to be kept in step
  by hand. Two of the sections deliberately appear twice — services and the
  portfolio are summarised on the landing page and given in full on their own —
  so the rule is not "never twice" but "never twice at the same length".

  Measured on the rendered text rather than on markup. The threshold is the
  measured shape of the thing: with the summaries as they are, services reads
  0.69 of its own page and the portfolio 0.35, while dropping the `compact`
  prop puts either straight to 1.0 — the same component, the same words, twice.
  0.8 sits between those and catches the failure that actually happens, which
  is somebody rendering the full section on both pages and not noticing.
*/
{
  const seen = new Map();
  for (const [locale, paths] of [['ro', Object.values(PAGE).map((p2) => p2.ro)],
                                 ['en', Object.values(PAGE).map((p2) => p2.en)]]) {
    for (const path of paths) {
      const p = await b.newPage(VIEWPORT);
      await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      const sections = await p.$$eval('main > section[id]', (nodes) =>
        nodes.map((node) => ({ id: node.id, length: (node.textContent ?? '').replace(/\s+/g, ' ').trim().length })));
      for (const { id, length } of sections) {
        const key = `${locale}:${id}`;
        seen.set(key, [...(seen.get(key) ?? []), { path, length }]);
      }
      await p.close();
    }
  }

  const copies = [...seen.entries()].filter(([, where]) => where.length > 1);
  const notSummaries = copies.filter(([, where]) => {
    const lengths = where.map((entry) => entry.length).sort((a, c) => a - c);
    return lengths[0] > lengths[lengths.length - 1] * 0.8;
  });
  ck('a section that appears twice is a summary and its page, not two copies',
    notSummaries.length === 0,
    notSummaries.map(([key, where]) =>
      `${key}: ${where.map((entry) => `${entry.path} ${entry.length}`).join(' vs ')}`).join(' | '));
  ck('and the only sections repeated at all are the two the landing page teases',
    copies.every(([key]) => key.endsWith(':services') || key.endsWith(':portfolio')),
    copies.map(([key]) => key).join(' '));

  // Each section exists in both languages: one present in Romanian and missing
  // in English is a page that quietly says less.
  const ro = new Set([...seen.keys()].filter((k) => k.startsWith('ro:')).map((k) => k.slice(3)));
  const en = new Set([...seen.keys()].filter((k) => k.startsWith('en:')).map((k) => k.slice(3)));
  const lopsided = [...ro].filter((id) => !en.has(id)).concat([...en].filter((id) => !ro.has(id)));
  ck('every section exists in both languages', lopsided.length === 0, lopsided.join(' '));
}

// --- Links published before the split still arrive --------------------------------
for (const [from, want, why] of [
  ['/#contact', PAGE.contact.ro, 'the form'],
  ['/#pricing', PAGE.pricing.ro, 'the prices'],
  ['/#estimate', PAGE.estimate.ro, 'the estimate'],
  ['/#audit', PAGE.estimate.ro, 'the audit'],
  ['/#guarantees', PAGE.pricing.ro, 'the guarantees'],
  ['/#about', PAGE.contact.ro, 'the person'],
  ['/#process', PAGE.services.ro, 'the process'],
  ['/en/#estimate', PAGE.estimate.en, 'the estimate in English'],
  ['/en/#contact', PAGE.contact.en, 'the form in English'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${from}`, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  ck(`an old link to ${why} still arrives`, new URL(p.url()).pathname === want,
    `${from} → ${new URL(p.url()).pathname}`);
  await p.close();
}

// The query string is what the form reads to preselect an offer and stamp the
// lead with where it came from; a forward that dropped it would look like it
// worked and quietly lose the context.
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/?from=shop&via=demo-store#contact`, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  const url = new URL(p.url());
  ck('and it brings its context with it',
    url.pathname === PAGE.contact.ro && url.searchParams.get('from') === 'shop' &&
      url.searchParams.get('via') === 'demo-store',
    url.pathname + url.search);
  ck('which the form acts on',
    (await p.locator('[data-prefill-note]').isVisible()) &&
      (await p.locator('input[name="origin"]').inputValue()) === 'demo-store');
  await p.close();
}

// The two sections that stayed must not be sent anywhere.
for (const id of ['services', 'portfolio']) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/#${id}`, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  ck(`#${id} stayed on the landing page and is not forwarded`,
    new URL(p.url()).pathname === '/' && (await p.locator(`#${id}`).count()) === 1,
    new URL(p.url()).pathname);
  await p.close();
}

// --- The hand-over across the navigation -------------------------------------------
/*
  The configurator used to fill in the form by reaching down the page. It now
  has to carry an offer, a budget bracket and a written summary across a
  navigation — and then the form has to forget it, so that a later visit is not
  haunted by an estimate from an hour ago.
*/
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${PAGE.estimate.ro}`, { waitUntil: 'networkidle' });
  const cfg = p.locator('[data-configurator]');
  await cfg.locator('input[data-type-input][value="presentation"]').check({ force: true });
  await cfg.locator('[data-action="next"]').click();
  await cfg.locator('input[data-feature-input][value="cms"]').check({ force: true });
  await cfg.locator('[data-action="next"]').click();
  await p.waitForTimeout(200);

  const send = cfg.locator('[data-action="send"]');
  ck('the estimate offers to become an enquiry', await send.isVisible());
  ck('and the offer is a link to the form, not a jump down the page',
    ((await send.getAttribute('href')) ?? '').startsWith(PAGE.contact.ro),
    String(await send.getAttribute('href')));

  await send.click();
  await p.waitForURL((url) => url.pathname === PAGE.contact.ro, { timeout: 8000 });
  await p.waitForTimeout(700);

  const type = await p.locator('#field-type').inputValue();
  const budget = await p.locator('#field-budget').inputValue();
  const message = await p.locator('#field-message').inputValue();
  ck('the offer survived the navigation', /prezentare|business/i.test(type), type);
  ck('so did the budget bracket', budget.length > 0 && /\d/.test(budget), budget);
  ck('and the itemised summary was written for them',
    message.includes('•') && message.length > 60, `${message.length} chars`);
  ck('the lead is stamped with where it came from',
    (await p.locator('input[name="origin"]').inputValue()) === 'configurator');
  // Step 3 is the message; landing on step 1 would hide what was just written.
  ck('and they land on the step that was filled in',
    await p.locator('#field-message').isVisible());

  ck('the hand-over is consumed rather than kept',
    (await p.evaluate(() => sessionStorage.getItem('ad:contact-handover'))) === null);

  // Reloading must not refill: the estimate belonged to that walk through the
  // wizard, and a form that fills itself from stale state is a form that sends
  // somebody else's answers.
  await p.goto(`${BASE}${PAGE.contact.ro}`, { waitUntil: 'networkidle' });
  ck('and a later visit starts on an empty form',
    (await p.locator('#field-message').inputValue()).trim() === '');
  await p.close();
}

{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${PAGE.estimate.ro}`, { waitUntil: 'networkidle' });
  const cta = p.locator('[data-audit-cta]').first();
  ck('the audit band points at the form',
    ((await cta.getAttribute('href')) ?? '').startsWith(PAGE.contact.ro),
    String(await cta.getAttribute('href')));
  await cta.click();
  await p.waitForURL((url) => url.pathname === PAGE.contact.ro, { timeout: 8000 });
  await p.waitForTimeout(500);
  ck('and asking for an audit preselects the audit',
    /audit/i.test(await p.locator('#field-type').inputValue()),
    await p.locator('#field-type').inputValue());
  await p.close();
}

ck.report();
await b.close();
