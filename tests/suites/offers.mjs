/**
 * One offer, one price, everywhere it appears.
 *
 * The site quotes the same work in four separate places — the services grid,
 * the pricing cards, the quote configurator and the contact form — and each
 * list is written by hand in its own file. Nothing stopped them drifting apart,
 * and they did: the online store had a service page, a configurator entry and a
 * published starting price of €2,200, but no pricing card at all. A visitor
 * reading the prices concluded the store was not on offer, then found a whole
 * page about it.
 *
 * These checks assert the invariant that failure broke: an offer that appears
 * in more than one place must carry the same number in all of them, and must
 * not vanish from one of them.
 */
import { launch, BASE, PAGE } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const VIEWPORT = { viewport: { width: 1440, height: 1000 } };

/** First run of digits, with thousands separators stripped: "de la 2.200 €" → 2200. */
const amount = (text) => {
  const match = text.replace(/[.,  ](?=\d{3}\b)/g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
};

/*
  Four surfaces, and they no longer share a page.

  The packages, the configurator and the contact form used to sit one under the
  other on the landing page, so one `goto` reached all three. They now live on
  the pricing page, the estimate page and the contact page — which is the whole
  reason this suite matters more than before: three documents can disagree in
  ways one document could not.
*/
for (const [label, locale, priceLabel, services] of [
  [
    'RO',
    'ro',
    'preț',
    [
      ['landing page', '/servicii/landing-page/'],
      ['site de prezentare', '/servicii/site-de-prezentare/'],
      ['magazin online', '/servicii/magazin-online/'],
      ['aplicație web', '/servicii/aplicatie-web/'],
      ['optimizare', '/servicii/optimizare-site/'],
    ],
  ],
  [
    'EN',
    'en',
    'price',
    [
      ['landing page', '/en/services/landing-page/'],
      ['business website', '/en/services/business-website/'],
      ['online store', '/en/services/online-store/'],
      ['web application', '/en/services/web-application/'],
      ['optimisation', '/en/services/site-optimisation/'],
    ],
  ],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${PAGE.pricing[locale]}`, { waitUntil: 'domcontentloaded' });

  // --- The pricing cards ------------------------------------------------------
  // Read by name rather than by heading level: the section wears an `h1` on its
  // own page and an `h2` when it is one of several, and a check that hard-coded
  // `h3` would fail for a reason that has nothing to do with prices.
  const cards = await p.$$eval('#pricing article', (nodes) =>
    nodes.map((card) => ({
      name: card.querySelector('[data-plan-name]').textContent.trim(),
      price: card.querySelector('[data-plan-price]').textContent.trim(),
      note: card.querySelector('[data-plan-note]').textContent.trim(),
      bullets: card.querySelectorAll('li').length,
      featured: card.querySelector('.btn-primary') !== null,
    })),
  );

  ck(`${label}: four packages are priced`, cards.length === 4, `${cards.length}`);
  ck(
    `${label}: every package quotes a figure and a timeline`,
    cards.every((c) => amount(c.price) && c.note.length > 5),
    cards.map((c) => `${c.name}:${amount(c.price)}`).join(' '),
  );
  ck(
    `${label}: packages run cheapest to dearest`,
    cards.map((c) => amount(c.price)).every((value, i, all) => i === 0 || all[i - 1] < value),
    cards.map((c) => amount(c.price)).join(' → '),
  );
  ck(
    `${label}: exactly one package is highlighted`,
    cards.filter((c) => c.featured).length === 1,
  );
  ck(
    `${label}: no package is thinner than the rest`,
    cards.every((c) => c.bullets >= 5),
    cards.map((c) => `${c.name}:${c.bullets}`).join(' '),
  );

  const priced = new Map(cards.map((c) => [c.name.toLocaleLowerCase('ro'), amount(c.price)]));

  // --- Against the service pages ----------------------------------------------
  // Whatever a service page states as its starting price has to be the number on
  // the card: a visitor can have both open, and two figures read as a bait price.
  for (const [name, path] of services) {
    const s = await b.newPage(VIEWPORT);
    await s.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    const highlights = await s.$$eval('main dl > div', (nodes) =>
      nodes.map((n) => [n.querySelector('dt').textContent.trim(), n.querySelector('dd').textContent.trim()]),
    );
    await s.close();

    const stated = highlights.find(([term]) => term.toLocaleLowerCase('ro') === priceLabel);
    if (!stated) continue; // Optimisation quotes an audit and a per-case fee, not a package.

    const card = [...priced.entries()].find(([cardName]) => cardName.includes(name) || name.includes(cardName));
    ck(`${label}: "${name}" has a pricing card`, Boolean(card), `page says ${stated[1]}`);
    if (card) {
      ck(
        `${label}: "${name}" quotes one price, not two`,
        card[1] === amount(stated[1]),
        `card ${card[1]} vs page ${amount(stated[1])}`,
      );
    }
  }

  await p.close();

  // --- Against the configurator ------------------------------------------------
  // With no add-ons ticked the estimate's lower bound is the base price, so it
  // must land on a package. This is the check the missing store card failed.
  const cfgPage = await b.newPage(VIEWPORT);
  await cfgPage.goto(`${BASE}${PAGE.estimate[locale]}`, { waitUntil: 'domcontentloaded' });
  const types = await cfgPage.$$eval('input[data-type-input]', (inputs) => inputs.map((i) => i.value));
  ck(`${label}: the configurator offers four project types`, types.length === 4, types.join(','));

  for (const type of types) {
    const cfg = cfgPage.locator('[data-configurator]');
    await cfgPage.locator(`input[data-type-input][value="${type}"]`).check({ force: true });
    await cfg.locator('[data-action="next"]').click();
    await cfgPage.waitForTimeout(150);
    await cfg.locator('[data-action="next"]').click();
    await cfgPage.waitForTimeout(200);

    const base = amount((await cfg.locator('[data-result-price]').textContent()).split('–')[0]);
    ck(
      `${label}: the ${type} estimate starts at a published price`,
      [...priced.values()].includes(base),
      `${base} not among ${[...priced.values()].join(', ')}`,
    );

    await cfg.locator('[data-action="restart"]').click();
    await cfgPage.waitForTimeout(150);
  }
  await cfgPage.close();

  // --- Against the contact form -------------------------------------------------
  // The form may offer more than the cards do (an audit, "not sure"), but every
  // package has to be pickable — otherwise the button under it leads nowhere useful.
  const formPage = await b.newPage(VIEWPORT);
  await formPage.goto(`${BASE}${PAGE.contact[locale]}`, { waitUntil: 'domcontentloaded' });
  const options = await formPage.$$eval('#contact select[name="project_type"] option', (nodes) =>
    nodes.map((n) => n.textContent.trim().toLocaleLowerCase('ro')),
  );
  for (const name of priced.keys()) {
    ck(
      `${label}: "${name}" can be picked in the contact form`,
      options.some((option) => option.includes(name) || name.includes(option)),
      options.join(' | '),
    );
  }

  await formPage.close();
}

// --- A fifth surface: the articles ---------------------------------------------
// Blog posts quote prices in prose, which is the easiest place for a number to
// go stale — nothing renders it from the configurator, somebody typed it. The
// rule is not "these exact figures" but the invariant: every euro amount in an
// article has to be a price the site actually offers.
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${PAGE.pricing.ro}`, { waitUntil: 'domcontentloaded' });
  const published = new Set(
    (await p.$$eval('#pricing article', (nodes) =>
      nodes.map((card) => card.querySelector('[data-plan-price]').textContent.trim()),
    ))
      .map(amount)
      .filter(Boolean),
  );
  await p.close();

  ck('the published starting prices were found', published.size >= 3,
    [...published].join(', '));

  for (const [label, path] of [
    ['RO landing vs website', '/blog/landing-page-sau-site-de-prezentare/'],
    ['EN landing vs website', '/en/blog/landing-page-or-business-website/'],
    ['RO store costs', '/blog/cat-costa-un-magazin-online/'],
    ['EN store costs', '/en/blog/how-much-does-an-online-store-cost/'],
    ['RO website costs', '/blog/cat-costa-un-site-de-prezentare/'],
    ['EN website costs', '/en/blog/how-much-does-a-business-website-cost/'],
  ]) {
    const a = await b.newPage(VIEWPORT);
    const res = await a.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    ck(`${label} is published`, res?.status() === 200, `${res?.status()}`);

    const body = await a.locator('main').innerText();
    // "de la 2.200 €" and "from €2,200" — the currency sits on either side.
    const quoted = [...body.matchAll(/(?:€\s?([\d.,]+))|(?:([\d.,]+)\s?€)/g)]
      .map(([, before, after]) => amount(before ?? after))
      .filter(Boolean);

    ck(`${label} quotes at least one price`, quoted.length > 0, `${quoted.length} figure(s)`);
    ck(`${label} quotes no price the site does not offer`,
      quoted.every((value) => published.has(value)),
      quoted.filter((value) => !published.has(value)).join(', ') || 'all match');

    // Both articles send the reader somewhere; a dead link in a published
    // article is worse than no link, and markdown gives no compile-time check.
    const links = await a.$$eval('article a[href^="/"]', (nodes) =>
      [...new Set(nodes.map((n) => n.getAttribute('href')))],
    );
    ck(`${label} links onward`, links.length >= 2, links.join(' '));
    for (const href of links) {
      const target = await b.newPage();
      const hit = await target.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded' });
      ck(`${label}: ${href} is served`, hit?.status() === 200, `${hit?.status()}`);
      await target.close();
    }

    await a.close();
  }
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
