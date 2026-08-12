import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

/**
 * The instant check only exists when a PageSpeed key was set at build time, so
 * this suite tests whichever state the build is actually in. Today that is the
 * fallback; the moment the key is configured the same suite starts exercising
 * the tool, with no edit here.
 */
const probe = await b.newPage();
await probe.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const live = (await probe.locator('[data-psi-endpoint]').count()) > 0;
const csp = await probe.evaluate(async (base) =>
  (await fetch(base + '/')).headers.get('content-security-policy'), BASE);
await probe.close();

console.log(`# audit tool is ${live ? 'ENABLED (key configured)' : 'DISABLED (no key)'}`);

// Whichever state we are in, the policy must match it: no wider than needed,
// no narrower than the page requires.
ck('connect-src matches whether the tool is on',
  csp.includes('https://www.googleapis.com') === live,
  live ? 'expected googleapis allowed' : 'expected googleapis absent');

// --- What a slow site costs ------------------------------------------------
// Lives in the audit band but needs no key: the arithmetic is the visitor's own
// two numbers. The danger here is not a wrong sum, it is false precision — so
// the checks are as much about how the answer is framed as about the maths.
{
  const c = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await c.goto(`${BASE}/#audit`, { waitUntil: 'load' });

  ck('the cost calculator is there with or without a key',
    (await c.locator('[data-cost-calc]').count()) === 1);
  ck('it shows no number before it is asked', await c.locator('[data-cost-result]').isHidden());

  const submit = async (visitors, value) => {
    await c.locator('[data-cost-visitors]').fill(visitors);
    await c.locator('[data-cost-value]').fill(value);
    await c.locator('[data-cost-form] button[type="submit"]').click();
    await c.waitForTimeout(250);
    return (await c.locator('[data-cost-amount]').innerText()).trim();
  };

  // 1000 visitors × 2% enquiry rate × 500 lei = 10 000 lei of enquiry value;
  // 5-15% of that is 500-1500.
  const answer = await submit('1000', '500');
  ck('the arithmetic is the one documented in the code',
    /(^|\D)500(\D|$)/.test(answer) && /1[ ..]?500/.test(answer), answer);
  ck('and it answers with a range, never a single figure',
    (answer.match(/\d[\d.,\s]*/g) ?? []).length >= 2, answer);
  ck('no template placeholder survives', !answer.includes('{low}') && !answer.includes('{high}'));

  // Rounding is the honesty control: nothing here supports "415,86 lei". These
  // inputs are deliberately awkward — 1234 × 2% × 337 = 8 317,16, so the raw
  // band is 415,86-1 247,57 and only rounding can produce whole figures.
  const awkward = await submit('1234', '337');
  const figures = (awkward.match(/\d[\d.\s]*/g) ?? []).map((n) => Number(n.replace(/\D/g, '')));
  ck('the figures are rounded, not precise to the leu',
    figures.length >= 2 && figures.every((n) => n % 50 === 0), `${awkward} -> ${figures.join(' / ')}`);

  const caveat = await c.locator('[data-cost-caveat]').innerText();
  ck('the caveat is shown with the result, not hidden',
    await c.locator('[data-cost-caveat]').isVisible());
  ck('it says this is an estimate, not a prediction',
    /(estimare|estimate)/i.test(caveat) && /(nu (e )?o predicție|not a prediction)/i.test(caveat),
    caveat.slice(0, 70));
  ck('and says what it cannot know',
    /(nu știe nimic|knows nothing)/i.test(caveat));
  ck('the percentages are sourced', ((await c.locator('[data-cost-source]').getAttribute('href')) ?? '')
    .startsWith('https://'));

  // Nonsense in, nothing out — better than a confident zero. The last valid
  // answer stays on screen untouched.
  await c.locator('[data-cost-visitors]').fill('0');
  await c.locator('[data-cost-form] button[type="submit"]').click();
  await c.waitForTimeout(200);
  ck('zero visitors produces no new claim',
    (await c.locator('[data-cost-amount]').innerText()).trim() === awkward, awkward);

  await c.close();
}

// The caveat is the part that keeps the number honest, so it has to survive
// translation — an English visitor must not get the figure without the hedge.
{
  const e = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await e.goto(`${BASE}/en/#audit`, { waitUntil: 'load' });
  await e.locator('[data-cost-visitors]').fill('1000');
  await e.locator('[data-cost-value]').fill('500');
  await e.locator('[data-cost-form] button[type="submit"]').click();
  await e.waitForTimeout(250);

  const enAnswer = (await e.locator('[data-cost-amount]').innerText()).trim();
  ck('EN: the same arithmetic, in English number format',
    /500/.test(enAnswer) && /1,?500/.test(enAnswer), enAnswer);
  const enCaveat = await e.locator('[data-cost-caveat]').innerText();
  ck('EN: the hedge travels with the number',
    /not a prediction/i.test(enCaveat) && /knows nothing/i.test(enCaveat),
    enCaveat.slice(0, 60));
  ck('EN: and so does the source',
    ((await e.locator('[data-cost-source]').getAttribute('href')) ?? '').startsWith('https://'));
  await e.close();
}

if (!live) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/#audit`, { waitUntil: 'load' });

  ck('no dead input is shown without a key', (await p.locator('[data-audit-form]').count()) === 0);
  const cta = p.locator('#audit [data-audit-cta]');
  ck('the plain call to action stands in', await cta.isVisible());

  // It must still do its one job: send the visitor to the form, audit selected.
  await cta.click();
  await p.waitForTimeout(900);
  const selected = await p.locator('#field-type').evaluate(
    (el) => el.options[el.selectedIndex].dataset.id);
  ck('the CTA preselects the audit option', selected === 'audit', String(selected));
  await p.close();
} else {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
  });

  // Google is not reachable from a test run, and hammering it would be rude
  // anyway. Serve a response shaped like theirs.
  let asked = null;
  const requests = [];
  await p.context().route('https://www.googleapis.com/**', (route) => {
    asked = route.request().url();
    requests.push(asked);
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        lighthouseResult: {
          categories: {
            performance: { score: 0.42 },
            accessibility: { score: 0.88 },
            'best-practices': { score: 0.96 },
            seo: { score: 1 },
          },
          audits: {
            'unused-javascript': {
              title: 'Reduce unused JavaScript',
              displayValue: 'Potential savings of 2.1 s',
              numericValue: 2100,
              details: { type: 'opportunity' },
            },
            'uses-optimized-images': {
              title: 'Efficiently encode images',
              displayValue: 'Potential savings of 1.4 s',
              numericValue: 1400,
              details: { type: 'opportunity' },
            },
            'render-blocking-resources': {
              title: 'Eliminate render-blocking resources',
              displayValue: 'Potential savings of 0.6 s',
              numericValue: 600,
              details: { type: 'opportunity' },
            },
            'server-response-time': {
              title: 'Small fry',
              numericValue: 10,
              details: { type: 'opportunity' },
            },
            'first-contentful-paint': { title: 'Not an opportunity', details: { type: 'table' } },
          },
        },
      }),
    });
  });

  await p.goto(`${BASE}/#audit`, { waitUntil: 'load' });
  // The result scrolls itself into view, and with `scroll-behavior: smooth` that
  // animation fights Playwright's own scroll-into-view: it lands, the page keeps
  // gliding, and the click times out on a moving target. A CSSOM write turns it
  // off for the run (a <style> tag would be refused by the CSP).
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const form = p.locator('[data-audit-form]');
  ck('the tool renders when a key is configured', await form.isVisible());
  ck('results are hidden until asked for', await p.locator('[data-audit-result]').isHidden());

  // --- A typo should not reach Google at all --------------------------------
  await p.locator('#audit-url').fill('not a url');
  await p.locator('[data-audit-submit]').click();
  await p.waitForTimeout(400);
  ck('a bad address is rejected before any request', asked === null);
  ck('and the reason is shown', await p.locator('[data-audit-error]').isVisible());

  // --- The real path ---------------------------------------------------------
  await p.locator('#audit-url').fill('exemplu.ro');
  await p.locator('[data-audit-submit]').click();
  await p.waitForSelector('[data-audit-result]:not(.hidden)', { timeout: 5000 });

  const requested = new URL(asked);
  ck('a bare domain is turned into a URL',
    requested.searchParams.get('url') === 'https://exemplu.ro/', requested.searchParams.get('url'));
  ck('it asks for the mobile result', requested.searchParams.get('strategy') === 'mobile');
  ck('it sends the key', Boolean(requested.searchParams.get('key')));
  ck('it asks for all four categories',
    requested.searchParams.getAll('category').length === 4,
    requested.searchParams.getAll('category').join(','));
  ck('it asks in the visitor\'s language', requested.searchParams.get('locale') === 'ro',
    requested.searchParams.get('locale'));

  const dials = await p.$$eval('[data-audit-scores] .score-gauge', (els) =>
    els.map((el) => ({
      score: Number(el.dataset.score),
      band: el.dataset.band,
      shown: Number(el.querySelector('span').textContent.trim()),
      label: el.querySelector('p').textContent.trim(),
      offset: parseFloat(getComputedStyle(el.querySelector('.gauge-arc')).strokeDashoffset),
    })));

  ck('all four scores are drawn', dials.length === 4, `${dials.length} dial(s)`);
  ck('scores match what Google returned',
    dials.map((d) => d.score).join(',') === '42,88,96,100', dials.map((d) => d.score).join(','));
  ck('the number in each dial matches its score', dials.every((d) => d.shown === d.score));
  // Runtime scores cannot come from a hashed <style> block, so the arc is set
  // through CSSOM. If that ever broke, every dial would read empty.
  ck('each arc is swept to its score',
    dials.every((d) => Math.abs(d.offset - (100 - d.score)) < 0.5),
    dials.map((d) => `${d.score}->${d.offset}`).join(' '));
  ck('a poor score is not painted as a good one',
    dials.find((d) => d.score === 42)?.band === 'poor' &&
      dials.find((d) => d.score === 88)?.band === 'ok' &&
      dials.find((d) => d.score === 96)?.band === 'good');
  ck('the dials are labelled in Romanian',
    dials.map((d) => d.label).join(',') === 'Performanță,Accesibilitate,Bune practici,SEO',
    dials.map((d) => d.label).join(','));

  const listed = await p.$$eval('[data-audit-issues] li', (els) => els.map((el) => el.innerText));
  ck('the three costliest problems are listed', listed.length === 3, `${listed.length} listed`);
  ck('they are ordered by how much time they cost',
    listed[0].includes('unused JavaScript') && listed[2].includes('render-blocking'),
    listed.map((l) => l.split('\n')[0]).join(' | '));
  ck('non-opportunities are left out', !listed.join(' ').includes('Not an opportunity'));
  ck('the trivial one is dropped by the top-three cut', !listed.join(' ').includes('Small fry'));

  ck('the audited host is named back to the visitor',
    (await p.locator('[data-audit-target]').innerText()).includes('exemplu.ro'));

  // --- The device the score belongs to ---------------------------------------
  // Google returns very different numbers for phone and desktop. A score shown
  // without saying which one it is is half a fact, and the missing half is the
  // one that explains a low number.
  const stamp = await p.locator('[data-audit-stamp]').innerText();
  ck('the result says which device it was measured on',
    /telefon/i.test(stamp), stamp);
  ck('and when', /\d{1,2}[:.]\d{2}/.test(stamp), stamp);
  ck('no template placeholder survives in the stamp',
    !stamp.includes('{device}') && !stamp.includes('{time}'), stamp);

  // A second run of the SAME address on the SAME device must not spend another
  // call on somebody's quota — and must say that it did not.
  // The result scrolls itself into view smoothly, so the button is still moving
  // for a moment after it appears; clicking into a moving target times out.
  await p.waitForTimeout(900);
  const callsBefore = requests.length;
  await p.locator('[data-audit-submit]').click();
  await p.waitForTimeout(600);
  ck('asking again for the same thing does not re-measure',
    requests.length === callsBefore, `${requests.length - callsBefore} extra call(s)`);
  ck('and the page says the answer was remembered',
    await p.locator('[data-audit-cached]').isVisible());

  // Switching device is a different measurement, so it must go out again.
  // The radio itself is `sr-only` (the label carries the visible chip), so a
  // visitor clicks the label — and so does this.
  await p.locator('[data-audit-strategy] label:has(input[value="desktop"])').click();
  ck('choosing a device actually selects it',
    await p.locator('[data-audit-strategy] input[value="desktop"]').isChecked());
  await p.waitForTimeout(300);
  await p.locator('[data-audit-submit]').click();
  await p.waitForSelector('[data-audit-result]:not(.hidden)', { timeout: 5000 });
  await p.waitForTimeout(400);
  ck('switching to desktop measures again', requests.length > callsBefore,
    `${requests.length - callsBefore} call(s)`);
  ck('and asks Google for the desktop result',
    new URL(requests.at(-1)).searchParams.get('strategy') === 'desktop',
    new URL(requests.at(-1)).searchParams.get('strategy'));
  ck('and the stamp follows the device',
    /desktop/i.test(await p.locator('[data-audit-stamp]').innerText()),
    await p.locator('[data-audit-stamp]').innerText());
  ck('a fresh measurement is not labelled as remembered',
    await p.locator('[data-audit-cached]').isHidden());


  // --- Straight into the form, with the address already filled ---------------
  await p.locator('[data-audit-result] [data-audit-cta]').click();
  await p.waitForTimeout(900);
  ck('the CTA carries the audited address into the form',
    (await p.locator('#field-website').inputValue()) === 'https://exemplu.ro/',
    await p.locator('#field-website').inputValue());
  const selected = await p.locator('#field-type').evaluate(
    (el) => el.options[el.selectedIndex].dataset.id);
  ck('and selects the audit option', selected === 'audit', String(selected));

  // --- "Measure this site too" -------------------------------------------------
  // The comparison a visitor actually wants: their number is meaningless until
  // something sits beside it.
  await p.waitForTimeout(900);
  await p.locator('[data-audit-self]').click();
  await p.waitForTimeout(900);
  const self = new URL(requests.at(-1)).searchParams.get('url');
  ck('the self-test measures this site',
    self === 'https://presentationwebsite.alexdelcea1996.workers.dev/', self);
  // The canonical, not location.href — a visit carrying ?from= or a hash must
  // not measure a different address than the one that is indexed.
  ck('and asks for the canonical address, not the current one',
    !self.includes('#') && !self.includes('?'), self);

  // Measuring this site must not have disturbed what the CTA already carried.

  ck('no CSP violations during the audit', (await p.evaluate(() => window.__csp)).length === 0,
    (await p.evaluate(() => window.__csp)).join(' | '));
  ck('no page errors', errs.length === 0, errs.join(' | '));
  await p.close();

  // --- Failure paths ---------------------------------------------------------
  for (const [label, status, expect] of [
    ['rate limiting', 429, 'Prea multe'],
    ['a server error', 500, 'Nu am putut'],
  ]) {
    const f = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await f.context().route('https://www.googleapis.com/**', (route) =>
      route.fulfill({ status, contentType: 'application/json', body: '{}' }));
    await f.goto(`${BASE}/#audit`, { waitUntil: 'load' });
    await f.locator('#audit-url').fill('exemplu.ro');
    await f.locator('[data-audit-submit]').click();
    await f.waitForTimeout(1200);
    ck(`${label} is explained, not swallowed`,
      (await f.locator('[data-audit-error]').innerText()).includes(expect),
      await f.locator('[data-audit-error]').innerText());
    ck(`the button is usable again after ${label}`,
      await f.locator('[data-audit-submit]').isEnabled());
    await f.close();
  }

  // --- Accessibility of the result --------------------------------------------
  const a = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await a.addInitScript({ path: axePath });
  await a.context().route('https://www.googleapis.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        lighthouseResult: {
          categories: { performance: { score: 0.42 }, accessibility: { score: 0.88 },
            'best-practices': { score: 0.96 }, seo: { score: 1 } },
          audits: {},
        },
      }),
    }));
  await a.goto(`${BASE}/#audit`, { waitUntil: 'load' });
  await a.locator('#audit-url').fill('exemplu.ro');
  await a.locator('[data-audit-submit]').click();
  await a.waitForSelector('[data-audit-result]:not(.hidden)', { timeout: 5000 });
  await settleAnimations(a);
  const axeResult = await runAxe(a, '#audit');
  ck('the audit band is axe-clean with results shown', axeResult.violations.length === 0,
    axeResult.violations.map((v) => v.id).join(', '));
  await a.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
