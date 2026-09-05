import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { launch, BASE } from '../harness.mjs';

/** Mean R, G, B of a PNG buffer — the site's own dependency, no new one. */
const mean = async (png) => {
  const { channels } = await sharp(png).stats();
  return channels.slice(0, 3).map((channel) => channel.mean);
};

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

// --- The aperture ----------------------------------------------------------
// The outgoing page is cut open in the shape of the site's own mark and the
// light behind it shows through the hole. Everything about that is declarative,
// which means every part of it can be deleted without anything throwing.

/** The body of the first at-rule block whose header matches, braces balanced. */
const blockAfter = (text, needle) => {
  const at = text.indexOf(needle);
  if (at < 0) return '';
  let depth = 0;
  for (let i = at; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    else if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(at, i + 1);
    }
  }
  return '';
};

const calmGate = blockAfter(sheet, '@media (prefers-reduced-motion:no-preference)');
ck('the reduced-motion gate is a real block, not a stray string', calmGate.length > 400,
  `${calmGate.length} chars`);
ck('the aperture lives inside that gate', calmGate.includes('@keyframes spark-part'));

const cutRule = blockAfter(sheet, '::view-transition-old(root){');
ck('the hole is cut into the OUTGOING page', /mask-image:/.test(cutRule));
ck('and it is cut with the site mark itself, not a copy of it',
  cutRule.includes('var(--spark)'), cutRule.slice(0, 160));
ck('the mark is subtracted, not added — otherwise there is no hole',
  /mask-composite:\s*subtract/.test(cutRule) || /-webkit-mask-composite:\s*source-out/.test(cutRule),
  cutRule.slice(0, 200));
ck('the ellipse that finishes the reveal ships too',
  /radial-gradient\(ellipse closest-side/.test(cutRule));

// A spark scaled to 900% asks the compositor for an eleven-thousand-pixel
// texture on every frame. The ellipse is what makes the reveal finish, and it
// is cheap; the bound below is the note in the stylesheet, enforced.
const spark = blockAfter(sheet, '@keyframes spark-part');
const sizes = [...spark.matchAll(/(\d+)%(?=[\s,;}])/g)].map((m) => Number(m[1]));
ck('no mask layer is ever scaled past the bound the comment sets',
  sizes.length > 0 && Math.max(...sizes) <= 400, `largest ${Math.max(...sizes)}%`);

// The other end of the same bound. A declared-but-never-grown ellipse is the
// failure that hides best: the spark still opens, the mark is still visible in
// the middle of the screen, and every other check here still passes — while
// the outgoing page never clears and the second half of the transition is two
// pages read at once. 141% of the snapshot reaches its corners and the opaque
// core stops at 82% of that, so anything under 172% leaves some of the old
// page standing.
const lastFrame = [...spark.matchAll(/mask-size:([^};]+)/g)].at(-1)?.[1] ?? '';
const layers = lastFrame.split(',').map((layer) => Number.parseFloat(layer));
ck('the aperture ends with three mask layers, as written', layers.length === 3, lastFrame);
ck('and the ellipse ends wide enough to have cleared the outgoing page',
  layers[2] >= 172, `${layers[2]}%`);
ck('and the spark itself ends wider than it was held at',
  layers[1] > 72, `${layers[1]}%`);

ck('the light behind the opening is painted on the image pair',
  /::view-transition-image-pair\(root\)\{[^}]*background/.test(sheet));
ck('the snapshots do not blend additively over each other',
  /::view-transition-old\(root\),::view-transition-new\(root\)\{[^}]*mix-blend-mode:normal/.test(sheet));

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
// adds inline script and stays put otherwise. Today: 5.2 kB on this page, up
// from 4.2 when the theme toggle stopped hard-coding the palette and started
// reading `--color-surface` instead — about a hundred bytes, on every page,
// bought by deleting two hex literals that had already drifted once. A
// client-side router would be several times this, which is what the check is
// really watching for.
const jsBytes = await p.evaluate(() =>
  [...document.querySelectorAll('script')]
    .filter((s) => !s.src && s.type !== 'application/ld+json')
    .reduce((sum, s) => sum + new TextEncoder().encode(s.textContent ?? '').length, 0));
ck('no router was shipped to buy the effect', jsBytes < 5600, `${jsBytes} B of inline JS on this page`);
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

// --- The aperture is real, on the page, in both themes ----------------------
// Everything above reads the stylesheet. A stylesheet can be perfect and the
// effect still absent — a browser that quietly ignores `mask-composite` on a
// view-transition pseudo would leave the outgoing page whole and nothing would
// report it. So: read what the pseudo-elements actually computed to, and then
// look at the pixels.
for (const theme of ['dark', 'light']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript((wanted) => {
    try { localStorage.setItem('theme', wanted); } catch {}
    window.__pseudo = null;
    window.addEventListener('pagereveal', (event) => {
      /*
        Only when a transition is actually running.

        `pagereveal` also fires on the plain first load of the landing page,
        where there is no transition and therefore no `::view-transition-*`
        pseudo-elements to read. Asking Blink for the computed style of a
        pseudo-element that does not exist is what killed the renderer here:
        on this first navigation, in about three whole-suite runs out of four
        and never in isolation, which is why it passed for flakiness for so
        long. Found by breadcrumbs, not by theory — three earlier theories
        (the DevTools animation clock, disk, memory) each survived their own
        removal. With this guard the same reproduction ran clean four times
        out of four. The values the check needs are the ones captured on the
        page the transition lands on, where `event.viewTransition` is set.
      */
      if (!event.viewTransition) return;
      const cut = getComputedStyle(document.documentElement, '::view-transition-old(root)');
      const pair = getComputedStyle(document.documentElement, '::view-transition-image-pair(root)');
      window.__pseudo = {
        mask: cut.maskImage,
        composite: cut.maskComposite,
        animation: cut.animationName,
        light: pair.backgroundImage,
      };

      /*
        The transition is slowed rather than raced: at full speed the sample
        below would be deciding whether it caught 130ms or 260ms of a 420ms
        move. Slowed here, through the Web Animations API, and only the
        animations that belong to the transition — the first version set
        `Animation.setPlaybackRate(0.06)` on the whole page over the DevTools
        protocol, which also slowed every scroll-driven animation the landing
        page has. It was suspected of the renderer crash above for a while; it
        was not the cause (the crash survived its removal), but asking the
        transition's own animations to run slowly is what the check meant.
      */
      event.viewTransition?.ready.then(() => {
        for (const animation of document.getAnimations()) {
          if (animation.effect?.pseudoElement?.startsWith('::view-transition')) {
            animation.playbackRate = 0.06;
          }
        }
      });
    });
  }, theme);

  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const patch = { x: 620, y: 380, width: 40, height: 40 };
  const before = await mean(await page.screenshot({ clip: patch }));

  await page.locator('header nav a[href$="/blog/"]').first().click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(2200); // ~130ms of animation: the mark at full size
  const during = await mean(await page.screenshot({ clip: patch }));

  const pseudo = await page.evaluate(() => window.__pseudo);
  ck(`${theme}: the outgoing snapshot really is masked`,
    Boolean(pseudo) && pseudo.mask.includes('data:image/svg+xml'), JSON.stringify(pseudo?.mask?.slice(0, 40)));
  ck(`${theme}: and the browser really did subtract it`,
    pseudo?.composite?.startsWith('subtract'), pseudo?.composite);
  ck(`${theme}: the aperture keyframes are the ones running`,
    pseudo?.animation === 'spark-part', pseudo?.animation);
  ck(`${theme}: there is light behind the opening`,
    Boolean(pseudo?.light) && pseudo.light !== 'none', pseudo?.light?.slice(0, 30));

  // The middle of the screen is inside the mark at this point. Whatever it
  // looked like a moment ago, it does not look like that now — measured
  // against the page itself rather than a hard-coded colour, so the check
  // holds in both themes and survives the palette moving again.
  const shift = Math.max(...before.map((channel, i) => Math.abs(channel - during[i])));
  ck(`${theme}: the mark is visible in the middle of the screen mid-transition`,
    shift > 24, `channels ${before.map(Math.round)} -> ${during.map(Math.round)}`);

  await ctx.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
