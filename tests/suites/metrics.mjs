import { launch, BASE, axePath, settleAnimations } from '../harness.mjs';
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);

const b = await launch();

// --- RO home, scripting on ---
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) =>
    window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
  // Cumulative layout shift, so the numbers landing cannot push the page around.
  window.__cls = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
});

await p.goto(`${BASE}/`, { waitUntil: 'load' });
const band = p.locator('[data-live-metrics]');
const card = p.locator('[data-live-metrics] [data-reveal]');
ck('band renders on the home page', await band.isVisible());

// isVisible() is true at opacity 0, so it cannot tell a revealed band from one
// still waiting on the scroll observer. Check the painted opacity instead.
await card.scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
const opacity = await card.evaluate((el) => Number(getComputedStyle(el).opacity));
ck('band is actually painted once scrolled to', opacity === 1, `opacity ${opacity}`);

// Every value must sit on the same baseline, whatever the label wrapping does.
const baselines = await p.$$eval('[data-live-metrics] dd', (cells) =>
  cells.map((c) => Math.round(c.getBoundingClientRect().bottom)));
ck('the three values share a baseline', new Set(baselines).size === 1, baselines.join(' / '));

// It must actually finish measuring, not sit on the placeholder.
await band.waitFor({ state: 'visible' });
await p.waitForFunction(() => document.querySelector('[data-live-metrics]')?.dataset.ready === 'true', null,
  { timeout: 5000 }).catch(() => {});
ck('measurement completes', (await band.getAttribute('data-ready')) === 'true');

const read = async (name) => (await p.locator(`[data-metric="${name}"]`).innerText()).trim();
const [lcp, weight, js] = [await read('lcp'), await read('weight'), await read('js')];

ck('LCP is filled in and looks like seconds', /^\d+,\d{2} s$/.test(lcp), lcp);
ck('weight is filled in and looks like kB', /^[\d.]+ kB$/.test(weight), weight);
ck('JS size is filled in and looks like kB', /^[\d.]+ kB$/.test(js), js);
ck('no placeholder left behind', ![lcp, weight, js].includes('—'), `${lcp} | ${weight} | ${js}`);

const num = (s) => Number(s.replace(/[^\d]/g, ''));
ck('weight is in a plausible range (100-400 kB)', num(weight) >= 100 && num(weight) <= 400, weight);
ck('JS is a small slice of the page (< 25 kB)', num(js) > 0 && num(js) < 25, js);
ck('JS is counted as part of the page, not on top of it', num(js) < num(weight), `${js} < ${weight}`);

// The claim is "measured in your browser" — so it must track reality, including
// stragglers like the favicon that land after the page goes idle. The band keeps
// a resource observer running for a few seconds to catch them; give it that long.
await p.waitForTimeout(1500);
const truth = await p.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  let total = nav.decodedBodySize;
  for (const r of performance.getEntriesByType('resource')) total += r.decodedBodySize || 0;
  return Math.round(total / 1024);
});
// Re-read: the value on screen may have been corrected since the first look.
const finalWeight = await read('weight');
ck('the number shown equals what the browser reports', num(finalWeight) === truth,
  `shown ${num(finalWeight)}, actual ${truth}`);

// --- The verify link ---
const verify = band.locator('a[href*="pagespeed"]');
const href = await verify.getAttribute('href');
const target = new URL(href).searchParams.get('url');
ck('verify link goes to PageSpeed', new URL(href).host === 'pagespeed.web.dev', new URL(href).host);
ck(
  'verify link carries the canonical production URL, not localhost',
  target === 'https://presentationwebsite.alexdelcea1996.workers.dev/',
  target,
);
ck(
  'verify link opens safely in a new tab',
  (await verify.getAttribute('target')) === '_blank' &&
    ((await verify.getAttribute('rel')) ?? '').includes('noopener'),
);

// --- No layout shift from the numbers landing ---
const cls = await p.evaluate(() => window.__cls);
ck('numbers land without shifting the layout', cls < 0.01, `CLS ${cls.toFixed(4)}`);

ck('no CSP violations', (await p.evaluate(() => window.__csp)).length === 0,
  (await p.evaluate(() => window.__csp)).join(' | '));
ck('no page errors', errs.length === 0, errs.join(' | '));

// --- EN formats numbers for its own locale ---
const en = await b.newPage({ viewport: { width: 1440, height: 900 } });
await en.goto(`${BASE}/en/`, { waitUntil: 'load' });
await en.waitForFunction(() => document.querySelector('[data-live-metrics]')?.dataset.ready === 'true', null,
  { timeout: 5000 }).catch(() => {});
const enLcp = (await en.locator('[data-metric="lcp"]').innerText()).trim();
ck('EN uses a decimal point, RO a comma', /^\d+\.\d{2} s$/.test(enLcp) && lcp.includes(','),
  `en "${enLcp}" vs ro "${lcp}"`);
ck('EN label is translated', (await en.locator('#live-metrics-title').innerText()).includes('measured'),
  await en.locator('#live-metrics-title').innerText());

// --- Without scripting there is nothing to show, so nothing is shown ---
const noJs = await b.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
await noJs.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
ck('band is hidden when scripting is off', await noJs.locator('[data-live-metrics]').isHidden());
ck('no dangling placeholder visible without JS',
  !(await noJs.locator('body').innerText()).includes('Conținut afișat în'));

// --- Only on the landing page ---
const blog = await b.newPage();
await blog.goto(`${BASE}/blog/`, { waitUntil: 'domcontentloaded' });
ck('band does not appear on sub-pages', (await blog.locator('[data-live-metrics]').count()) === 0);

// --- Accessibility of the new section ---
const a = await b.newPage({ viewport: { width: 1440, height: 900 } });
await a.addInitScript({ path: axePath });
await a.goto(`${BASE}/`, { waitUntil: 'load' });
await settleAnimations(a);
const res = await a.evaluate(async () =>
  // @ts-ignore
  axe.run('[data-live-metrics]', {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  }));
ck('band is axe-clean', res.violations.length === 0, res.violations.map((v) => v.id).join(', '));

console.log(R.join('\n'));
await b.close();

if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
