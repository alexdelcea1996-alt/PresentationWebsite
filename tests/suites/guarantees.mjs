import { launch, BASE, PAGE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

// Printed beside the prices, where somebody deciding whether to ask for a quote
// is actually standing — not eight sections down a landing page.
for (const [label, path, yes, no] of [
  ['RO', PAGE.pricing.ro, 'Îți garantez', 'Nu îți garantez'],
  ['EN', PAGE.pricing.en, 'I guarantee', 'I do not guarantee'],
]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

  const section = p.locator('#guarantees');
  ck(`${label}: the guarantees section is on the page`, (await section.count()) === 1);

  const yesCol = section.locator('[data-guarantee-column="yes"]');
  const noCol = section.locator('[data-guarantee-column="no"]');
  ck(`${label}: six commitments`, (await yesCol.locator('li').count()) === 6);
  ck(`${label}: three deliberate non-commitments`, (await noCol.locator('li').count()) === 3);
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

  await p.close();
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
