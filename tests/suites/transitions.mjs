import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE } from '../harness.mjs';

const distCss = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist', '_astro');

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

/** Records what happened on each arriving document. */
const watcher = () => {
  window.__vt = { fired: false, transition: null, theme: null, inView: 0, invisible: 0 };
  window.addEventListener('pagereveal', (event) => {
    const inView = [...document.querySelectorAll('[data-reveal]')].filter((el) => {
      const box = el.getBoundingClientRect();
      return box.top < innerHeight && box.bottom > 0;
    });
    window.__vt = {
      fired: true,
      transition: Boolean(event.viewTransition),
      theme: document.documentElement.dataset.theme,
      inView: inView.length,
      invisible: inView.filter((el) => getComputedStyle(el).opacity === '0').length,
    };
  });
};

// --- The stylesheet actually ships the rule -------------------------------
// Lightning CSS (Tailwind v4's minifier) could drop an at-rule it did not know,
// and the failure would be invisible: the site would just navigate normally.
const sheet = readdirSync(distCss)
  .filter((file) => file.endsWith('.css'))
  .map((file) => readFileSync(join(distCss, file), 'utf8'))
  .join('\n');
ck('@view-transition survives minification', sheet.includes('@view-transition'));
ck('the transition is gated on prefers-reduced-motion',
  /prefers-reduced-motion:\s*no-preference/.test(sheet));
ck('the header is named so it does not cross-fade', sheet.includes('view-transition-name:site-header'));

// --- A real navigation runs a real transition ------------------------------
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) =>
    window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
});
await p.addInitScript(watcher);

ck('browser under test supports cross-document transitions',
  await p.goto(`${BASE}/`, { waitUntil: 'load' }).then(() =>
    p.evaluate(() => 'onpagereveal' in window && CSS.supports('view-transition-name: x'))));

// --- The hero owes nothing to JavaScript -----------------------------------
// It used to carry `data-reveal`, so the biggest text on the page was painted at
// opacity 0 and waited for a deferred module at the very end of the body to
// un-hide it. Assert the attributes are gone, not just that the text ends up
// visible — the check further down would pass vacuously if they came back.
{
  const hidden = await p.locator('[data-hero] [data-reveal]').count();
  ck('the hero does not start hidden behind JavaScript', hidden === 0, `${hidden} found`);
  const opacity = await p.evaluate(() => {
    const el = document.querySelector('[data-hero] h1');
    return el ? getComputedStyle(el).opacity : 'no hero headline found';
  });
  ck('the headline is opaque from the start', opacity === '1', opacity);
}

await p.locator('header nav a[href$="/blog/"]').first().click();
await p.waitForLoadState('load');
await p.waitForTimeout(500);

let seen = await p.evaluate(() => window.__vt);
ck('navigating from the header runs a view transition', seen.fired && seen.transition, JSON.stringify(seen));

// Zero JavaScript is the whole point — the effect must not have shipped a router.
// The ceiling is a proxy for that, so it moves when something else legitimately
// adds inline script and stays put otherwise. Today: 4.2 kB on this page, up
// from 3.3 kB when the site-wide cursor glow arrived. A client-side router
// would be several times this, which is what the check is really watching for.
const jsBytes = await p.evaluate(() =>
  [...document.querySelectorAll('script')]
    .filter((s) => !s.src && s.type !== 'application/ld+json')
    .reduce((sum, s) => sum + new TextEncoder().encode(s.textContent ?? '').length, 0));
ck('no router was shipped to buy the effect', jsBytes < 5000, `${jsBytes} B of inline JS on this page`);
ck('no external script bundles', (await p.locator('script[src]').count()) === 0);

// --- The arriving page is not left blank -----------------------------------
// Below-the-fold content still starts at opacity 0 for the scroll reveal, so the
// incoming snapshot could in principle fade to an empty page. Verify it resolves.
// The reveal fade itself runs 0.6s, so wait for it rather than sampling mid-way.
const settled = await p
  .waitForFunction(
    () =>
      [...document.querySelectorAll('[data-reveal]')]
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.top < innerHeight && box.bottom > 0;
        })
        .every((el) => getComputedStyle(el).opacity === '1'),
    null,
    { timeout: 3000 },
  )
  .then(() => true)
  .catch(() => false);
ck('above-the-fold content ends up visible, not stranded at opacity 0', settled);

// --- Deep link, then back --------------------------------------------------
await p.locator('main a[href*="/blog/"]').first().click();
await p.waitForLoadState('load');
await p.waitForTimeout(400);
seen = await p.evaluate(() => window.__vt);
ck('navigating deeper transitions too', seen.fired && seen.transition, JSON.stringify(seen));

await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(400);
seen = await p.evaluate(() => window.__vt);
ck('going back transitions as well', seen.fired && seen.transition, JSON.stringify(seen));

ck('no CSP violations while navigating', (await p.evaluate(() => window.__csp)).length === 0,
  (await p.evaluate(() => window.__csp)).join(' | '));
ck('no page errors', errs.length === 0, errs.join(' | '));
await p.close();

// --- The theme must already be right on the arriving page ------------------
// The old page stays on screen until the new one is ready, so a theme resolved
// late would show as a flash of the wrong palette mid-transition.
const themed = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
await themed.addInitScript(watcher);
await themed.goto(`${BASE}/`, { waitUntil: 'load' });
await themed.locator('[data-theme-toggle]').first().click();
await themed.waitForTimeout(300);
await themed.locator('header nav a[href$="/blog/"]').first().click();
await themed.waitForLoadState('load');
await themed.waitForTimeout(400);
const arrived = await themed.evaluate(() => window.__vt);
ck('the chosen theme is already applied when the new page is revealed',
  arrived.theme === 'light', `data-theme=${arrived.theme}`);
await themed.close();

// --- Reduced motion opts out entirely --------------------------------------
const calm = await b.newPage({ viewport: { width: 1280, height: 900 } });
await calm.emulateMedia({ reducedMotion: 'reduce' });
await calm.addInitScript(watcher);
await calm.goto(`${BASE}/`, { waitUntil: 'load' });
await calm.locator('header nav a[href$="/blog/"]').first().click();
await calm.waitForLoadState('load');
await calm.waitForTimeout(400);
const quiet = await calm.evaluate(() => window.__vt);
ck('reduced motion gets a plain navigation, no transition',
  quiet.fired && quiet.transition === false, JSON.stringify(quiet));
ck('reduced motion still lands on the right page', calm.url().endsWith('/blog/'), calm.url());
await calm.close();

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
