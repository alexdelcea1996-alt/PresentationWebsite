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
  await p.context().route('https://www.googleapis.com/**', (route) => {
    asked = route.request().url();
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

  // --- Straight into the form, with the address already filled ---------------
  await p.locator('[data-audit-result] [data-audit-cta]').click();
  await p.waitForTimeout(900);
  ck('the CTA carries the audited address into the form',
    (await p.locator('#field-website').inputValue()) === 'https://exemplu.ro/',
    await p.locator('#field-website').inputValue());
  const selected = await p.locator('#field-type').evaluate(
    (el) => el.options[el.selectedIndex].dataset.id);
  ck('and selects the audit option', selected === 'audit', String(selected));

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
