import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, PAGE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

// Printed beside the prices, where somebody deciding whether to ask for a quote
// is actually standing — not eight sections down a landing page.
for (const [label, path, yes, no, homePath] of [
  ['RO', PAGE.pricing.ro, 'Îți garantez', 'Nu îți garantez', PAGE.home.ro],
  ['EN', PAGE.pricing.en, 'I guarantee', 'I do not guarantee', PAGE.home.en],
]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

  const section = p.locator('#guarantees');
  ck(`${label}: the guarantees section is on the page`, (await section.count()) === 1);

  const yesCol = section.locator('[data-guarantee-column="yes"]');
  const noCol = section.locator('[data-guarantee-column="no"]');
  ck(`${label}: six commitments`, (await yesCol.locator('li').count()) === 6);
  ck(`${label}: four deliberate non-commitments`, (await noCol.locator('li').count()) === 4);
  // innerText reflects the CSS `uppercase`, so compare case-insensitively.
  const heading = async (col) => (await col.locator('h3').innerText()).trim().toLocaleLowerCase('ro');
  ck(`${label}: the columns are labelled`,
    (await heading(yesCol)) === yes.toLocaleLowerCase('ro') &&
      (await heading(noCol)) === no.toLocaleLowerCase('ro'),
    `${await heading(yesCol)} / ${await heading(noCol)}`);

  // The second column is the reason this section is worth having; if it ever
  // gets quietly dropped the section becomes the same as everyone else's.
  ck(`${label}: it still says what it will not promise`,
    (await noCol.innerText()).toLowerCase().includes('google'));

  // Each row must actually say something, not just carry a heading.
  const bodies = await yesCol.locator('li p:nth-of-type(2)').allInnerTexts();
  ck(`${label}: every commitment is explained`, bodies.length === 6 && bodies.every((t) => t.trim().length > 40),
    `shortest ${Math.min(...bodies.map((t) => t.trim().length))} chars`);

  /*
    What the landing page calls guaranteed has to be in this list.

    For a long time it was not: "95+ — guaranteed" sat under the headline while
    the guarantees promised only a Lighthouse report, with no number in it. The
    figure is read from the hero rather than typed here, so changing either page
    alone fails — and the written promise has to say how it is measured and on
    which screen, because a threshold nobody can check is not a promise.
  */
  const home = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await home.goto(`${BASE}${homePath}`, { waitUntil: 'domcontentloaded' });
  const promised = await home.$$eval('[data-hero-stats] > div', (cells) =>
    cells
      .map((cell) => ({
        figure: cell.querySelector('dd')?.textContent.trim() ?? '',
        term: cell.querySelector('dt')?.textContent.trim() ?? '',
      }))
      .filter((stat) => /garantat|guaranteed/i.test(stat.term)));
  await home.close();

  const commitments = await yesCol.locator('li').allInnerTexts();
  const limits = await noCol.locator('li').allInnerTexts();
  ck(`${label}: the hero calls something guaranteed`, promised.length > 0,
    promised.map((stat) => `${stat.figure} ${stat.term}`).join(' | ') || 'nothing');
  for (const { figure, term } of promised) {
    const number = figure.match(/\d+/)?.[0] ?? '(none)';
    const written = commitments.find((text) => new RegExp(`\\b${number}\\b`).test(text));
    ck(`${label}: "${figure} ${term}" is written in the guarantees`, Boolean(written),
      written ? written.split('\n')[0] : `no commitment mentions ${number}`);
    ck(`${label}: with the test named and the phone included`,
      Boolean(written) && /pagespeed|lighthouse/i.test(written) && /mobil/i.test(written),
      (written ?? '').replace(/\s+/g, ' ').slice(0, 90));
    ck(`${label}: and the column beside it says where it stops`,
      limits.some((text) => /scor|score/i.test(text)),
      limits.map((text) => text.split('\n')[0]).join(' | '));
  }

  await p.close();
}

// --- The same threshold wherever the promise is repeated -----------------------
/*
  The speed promise is stated in more than one place — the guarantees, the
  principles under the contact form, the service pages — because that is where
  different readers meet it. Repeated promises drift: the principle used to say
  "I measure with Lighthouse before delivery" with no number, beside a list that
  now says 95. So every paragraph on the built site that pairs the speed test
  with handing the site over has to carry the threshold the landing page calls
  guaranteed — read from the hero, like the checks above, never typed here.
*/
{
  const pages = (dir) =>
    readdirSync(join(dist, dir), { withFileTypes: true }).flatMap((entry) => {
      const rel = dir ? `${dir}/${entry.name}` : entry.name;
      return entry.isDirectory() ? pages(rel) : entry.name.endsWith('.html') ? [rel] : [];
    });
  const text = (markup) =>
    markup.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

  const threshold = (rel) =>
    readFileSync(join(dist, rel), 'utf8')
      .match(/<dt[^>]*>[^<]*(?:garantat|guaranteed)[^<]*<\/dt>\s*<dd[^>]*>\s*(\d+)/)?.[1];
  const figure = { ro: threshold('index.html'), en: threshold('en/index.html') };
  ck('the guaranteed figure is read off both landing pages', Boolean(figure.ro && figure.en),
    JSON.stringify(figure));

  const stated = new Map();
  const unnumbered = [];
  for (const rel of pages('')) {
    const html = readFileSync(join(dist, rel), 'utf8');
    const expected = rel.startsWith('en/') ? figure.en : figure.ro;
    for (const [, block] of html.matchAll(/<(?:p|dd)\b[^>]*>([\s\S]*?)<\/(?:p|dd)>/g)) {
      const words = text(block);
      if (!/pagespeed|lighthouse/i.test(words)) continue;
      if (!/predare|predau|livrare|handover|hand it over|delivery/i.test(words)) continue;
      const address = `/${rel.replace(/index\.html$/, '')}`;
      stated.set(address, (stated.get(address) ?? 0) + 1);
      if (!new RegExp(`\\b${expected}\\b`).test(words)) unnumbered.push(`${address}: "${words.slice(0, 60)}…"`);
    }
  }
  ck('every paragraph that promises the speed test at handover names the same threshold',
    stated.size > 0 && unnumbered.length === 0,
    unnumbered.join(' | ') || `${[...stated.values()].reduce((a, n) => a + n, 0)} paragraph(s) on ${stated.size} page(s)`);

  // Where it has to be stated at all: the list itself, the principles beside
  // the contact form, and the two service pages that talk about speed.
  for (const address of [
    PAGE.pricing.ro, PAGE.pricing.en, PAGE.contact.ro, PAGE.contact.en,
    '/servicii/landing-page/', '/en/services/landing-page/',
    '/servicii/site-de-prezentare/', '/en/services/business-website/',
  ]) {
    ck(`${address} states the threshold`, (stated.get(address) ?? 0) > 0, `${stated.get(address) ?? 0} paragraph(s)`);
  }
}

// --- The empty testimonial boxes are gone ------------------------------------
for (const [label, path] of [['landing page', PAGE.home.ro], ['contact page', PAGE.contact.ro]]) {
  const page = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  ck(`no empty dashed slots left on the ${label}`,
    (await page.locator('.card-placeholder').count()) === 0);
  ck(`the testimonials section is absent on the ${label} while there are none`,
    (await page.locator('#testimonials').count()) === 0);
  await page.close();
}
const home = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await home.goto(`${BASE}${PAGE.pricing.ro}`, { waitUntil: 'domcontentloaded' });
ck('the guarantees section took its place',
  (await home.locator('#guarantees').count()) === 1);

// --- Accessibility -----------------------------------------------------------
const a = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await a.addInitScript({ path: axePath });
await a.goto(`${BASE}${PAGE.pricing.ro}`, { waitUntil: 'load' });
await a.locator('#guarantees').scrollIntoViewIfNeeded();
await settleAnimations(a);
const axeResult = await runAxe(a, '#guarantees');
ck('the section is axe-clean', axeResult.violations.length === 0,
  axeResult.violations.map((v) => v.id).join(', '));

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
