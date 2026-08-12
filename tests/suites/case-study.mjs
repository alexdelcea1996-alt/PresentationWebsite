import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const PATH = '/studii-de-caz/acest-site/';

const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) =>
    window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
});
await p.goto(`${BASE}${PATH}`, { waitUntil: 'load' });

// --- Screenshots -------------------------------------------------------------
const shot = p.locator('figure img').first();
ck('the case study shows a screenshot', await shot.isVisible());
ck('screenshots are served as AVIF', (await shot.getAttribute('src'))?.endsWith('.avif'),
  await shot.getAttribute('src'));
ck('the screenshot offers several widths', ((await shot.getAttribute('srcset')) ?? '').split(',').length >= 3);
ck('dimensions are in the markup, so nothing shifts',
  Boolean(await shot.getAttribute('width')) && Boolean(await shot.getAttribute('height')),
  `${await shot.getAttribute('width')}x${await shot.getAttribute('height')}`);
ck('the screenshot has real alt text', ((await shot.getAttribute('alt')) ?? '').length > 20,
  await shot.getAttribute('alt'));

// The decorative phone must not be announced twice; it repeats the desktop shot.
const phone = p.locator('figure img').nth(1);
ck('the phone inset is not announced separately', (await phone.getAttribute('alt')) === '');

// The frame should show where the site actually lives, not an invented address.
const chrome = await p.locator('figure').first().innerText();
ck('the browser frame shows the real host', chrome.includes('presentationwebsite.alexdelcea1996.workers.dev'),
  chrome.trim());

// --- Score dials -------------------------------------------------------------
await p.locator('.score-gauge').first().scrollIntoViewIfNeeded();
await settleAnimations(p);
await p.waitForTimeout(1400);

const dials = await p.$$eval('.score-gauge', (els) =>
  els.map((el) => {
    const arc = el.querySelector('.gauge-arc');
    const style = getComputedStyle(arc);
    return {
      score: Number(el.dataset.score),
      band: el.dataset.band,
      shown: Number(el.querySelector('span')?.textContent?.trim()),
      offset: parseFloat(style.strokeDashoffset),
      dasharray: style.strokeDasharray,
      pathLength: arc.getAttribute('pathLength'),
    };
  }));

ck('both measured scores get a dial', dials.length === 2, `${dials.length} dial(s)`);
ck('the number in the middle is the score', dials.every((d) => d.shown === d.score),
  dials.map((d) => `${d.shown}/${d.score}`).join(' '));
ck('dials normalise the circle with pathLength', dials.every((d) => d.pathLength === '100'));
ck('the dash scale is the normalised 100', dials.every((d) => d.dasharray === '100px'),
  dials.map((d) => d.dasharray).join(' '));

// The whole point: the arc must actually be drawn to the score. An inline style
// attribute cannot deliver this — the CSP drops it — so this check is what
// proves the hashed <style> route is working.
ck('each arc is swept to its own score',
  dials.every((d) => Math.abs(d.offset - (100 - d.score)) < 0.5),
  dials.map((d) => `score ${d.score} -> offset ${d.offset} (want ${100 - d.score})`).join('; '));
ck('a 100 fills the ring completely', dials.some((d) => d.score === 100 && d.offset === 0));
ck('a 98 leaves a visible gap', dials.some((d) => d.score === 98 && d.offset > 0));
ck('scores in the good band wear the brand colour', dials.every((d) => d.band === 'good'));

ck('no CSP violations on the case study', (await p.evaluate(() => window.__csp)).length === 0,
  (await p.evaluate(() => window.__csp)).join(' | '));
ck('no page errors', errs.length === 0, errs.join(' | '));
await p.close();

// --- Without JavaScript the dials are simply drawn full ----------------------
const noJs = await b.newPage({ javaScriptEnabled: false, viewport: { width: 1280, height: 1000 } });
await noJs.goto(`${BASE}${PATH}`, { waitUntil: 'domcontentloaded' });
const staticDials = await noJs.$$eval('.score-gauge', (els) =>
  els.map((el) => ({
    score: Number(el.dataset.score),
    offset: parseFloat(getComputedStyle(el.querySelector('.gauge-arc')).strokeDashoffset),
  })));
ck('dials still show their value with scripting off',
  staticDials.length === 2 && staticDials.every((d) => Math.abs(d.offset - (100 - d.score)) < 0.5),
  staticDials.map((d) => `${d.score}->${d.offset}`).join(' '));
await noJs.close();

// --- Accessibility -----------------------------------------------------------
const a = await b.newPage({ viewport: { width: 1280, height: 1000 } });
await a.addInitScript({ path: axePath });
await a.goto(`${BASE}${PATH}`, { waitUntil: 'load' });
await settleAnimations(a);
const axeResult = await runAxe(a);
ck('the case study page is axe-clean', axeResult.violations.length === 0,
  axeResult.violations.map((v) => v.id).join(', '));

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
