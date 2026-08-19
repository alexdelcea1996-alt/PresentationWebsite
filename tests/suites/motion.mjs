/**
 * The two small movements the page makes on its own.
 *
 *  1. The headline sets itself once on load — the words drop into place the way
 *     sorts drop into a chase.
 *  2. Each figure in the measurement band turns over as its number lands.
 *
 * Both are pure CSS. There is no script anywhere that starts them, which is
 * exactly why they need testing: nothing throws when a selector stops matching,
 * and a movement that silently never happens looks identical to one that was
 * never built. Every check below either watches the animation actually run or
 * reads the rule out of the delivered stylesheet.
 *
 * The rules that must NOT be broken are as load-bearing as the movement:
 *  - nothing here may animate opacity. The headline is the LCP element and the
 *    figures are the site's evidence; both must be readable in every frame.
 *  - nothing here may shift layout. The colophon publishes CLS 0.
 *  - a comma may not start a line, which is what happened the first time the
 *    headline was cut into per-word boxes.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, checks } from '../harness.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const ck = checks();
const b = await launch();

/**
 * Watches, from the very first frame, how far a set of elements ever gets from
 * the identity transform.
 *
 * A sample taken once, half a second in, cannot see the bug this is here for:
 * the blanket reduced-motion rule crushes `animation-duration` and leaves
 * `animation-delay` alone, so an element with a 180ms delay and `both` fill
 * sits in its `from` state — a headline word low, a figure on its side — for
 * that whole delay and then snaps. Only something running every frame from
 * navigation start catches it.
 *
 * Deviation is measured against the identity matrix rather than compared as a
 * string: a keyframe written with `perspective()` leaves the finished element
 * holding a `matrix3d(...)` whose off-diagonal terms are 1.2e-16, which is
 * upright to any eye and to any pixel and not the string `matrix(1, 0, 0, 1,
 * 0, 0)`.
 */
const WATCH_TILT = () => {
  const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const groups = { headline: '[data-hero] h1 > span', figures: '.metric-figure' };
  window.__tilt = { headline: 0, figures: 0 };
  const sample = () => {
    for (const [name, selector] of Object.entries(groups)) {
      for (const el of document.querySelectorAll(selector)) {
        const value = getComputedStyle(el).transform;
        if (!value || value === 'none') continue;
        const m = new DOMMatrixReadOnly(value).toFloat64Array();
        const off = Math.max(...m.map((v, i) => Math.abs(v - IDENTITY[i])));
        if (off > window.__tilt[name]) window.__tilt[name] = off;
      }
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
};

/** Let the headline finish setting itself before measuring where the lines are. */
const settle = (page) =>
  page.waitForFunction(
    () =>
      [...document.querySelectorAll('[data-hero] h1 > span')].every((span) => {
        const t = getComputedStyle(span).transform;
        return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';
      }),
    null,
    { timeout: 4000 },
  ).catch(() => {});

const sheet = readdirSync(join(root, 'dist', '_astro'))
  .filter((file) => file.endsWith('.css'))
  .map((file) => readFileSync(join(root, 'dist', '_astro', file), 'utf8'))
  .join('\n');

/**
 * The headline copy, read from the source rather than from the page.
 *
 * The point of the check it feeds is that the built markup says exactly what
 * the content file says — compare the page against itself and the whitespace
 * bug this is here to catch would agree with itself perfectly.
 */
const headline = (locale) => {
  const file = readFileSync(join(root, 'src', 'i18n', `${locale}.ts`), 'utf8');
  const field = (name) => file.match(new RegExp(`${name}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1];
  const unescape = (text) => text?.replace(/\\(.)/g, '$1');
  return `${unescape(field('titleLead'))} ${unescape(field('titleAccent'))}${unescape(field('titleTail'))}`;
};

// --- The rule ships, and it moves nothing but the transform ------------------
{
  const keyframes = sheet.match(/@keyframes type-set\{[^}]*\{([^}]*)\}\}/)?.[1] ?? '';
  ck('the headline animation survives minification', keyframes.length > 0, keyframes);
  ck('it moves the words and nothing else',
    /^transform:translateY\([^)]+\)$/.test(keyframes.trim()), keyframes);
  // Lightning CSS drops the universal selector: `[data-stagger]>:nth-child(2)`.
  ck('the stagger ladder ships too', /\[data-stagger\]>\*?:nth-child\(2\)/.test(sheet));
  ck('and it clamps rather than running on',
    /\[data-stagger\]>\*?:nth-child\(n\s*\+\s*11\)/.test(sheet));
}

// --- The markup says what the content file says ------------------------------
for (const [locale, path] of [['ro', '/'], ['en', '/en/']]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });

  const text = await p.locator('[data-hero] h1').innerText();
  ck(`${locale}: cutting the headline into sorts did not change a character`,
    text.replace(/\s+/g, ' ').trim() === headline(locale),
    `${JSON.stringify(text)} vs ${JSON.stringify(headline(locale))}`);

  ck(`${locale}: the accent phrase is still one gradient, not one per word`,
    (await p.locator('[data-hero] h1 .text-gradient').count()) === 1);

  // Two adjacent inline-blocks are a line-break opportunity even with no space
  // between them. Before the punctuation was glued to the word in front of it,
  // the Romanian headline wrapped onto a line that began ", nu doar vizite."
  // Only once the sorts have landed: mid-settle every word is at its own
  // offset, and grouping by `top` would report nine lines of one word each.
  await settle(p);
  for (const width of [1280, 768, 390]) {
    await p.setViewportSize({ width, height: 900 });
    await settle(p);
    const openers = await p.evaluate(() => {
      const rows = new Map();
      for (const span of document.querySelectorAll('[data-hero] h1 > span')) {
        const top = Math.round(span.getBoundingClientRect().top);
        if (!rows.has(top)) rows.set(top, span.textContent ?? '');
      }
      return [...rows.values()];
    });
    ck(`${locale} @${width}: no line starts on punctuation`,
      openers.every((line) => !/^[,.;:!?…)\]]/.test(line)), JSON.stringify(openers));
    ck(`${locale} @${width}: the headline still fits in four lines or fewer`,
      openers.length <= 4, `${openers.length} lines`);
  }
  await p.close();
}

// --- It actually runs, staggered, and it finishes ----------------------------
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  // Slow the animation clock rather than racing it: at full speed the whole
  // settle is over in half a second and a screenshot-shaped test would be
  // deciding whether it saw the movement or a scheduling hiccup.
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.05 });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.waitForTimeout(2000);

  const midFlight = await p.evaluate(() =>
    [...document.querySelectorAll('[data-hero] h1 > span')].map((span) => ({
      y: Number(new DOMMatrixReadOnly(getComputedStyle(span).transform).m42.toFixed(2)),
      opacity: getComputedStyle(span).opacity,
      delay: getComputedStyle(span).animationDelay,
    })),
  );
  ck('every word is on its way to somewhere', midFlight.length >= 8, `${midFlight.length} sorts`);
  ck('the words are staggered, not moving as one block',
    new Set(midFlight.map((sort) => sort.y)).size > 3,
    JSON.stringify(midFlight.map((sort) => sort.y)));
  ck('the first word is ahead of the last',
    midFlight[0].y < midFlight[midFlight.length - 1].y,
    `${midFlight[0].y} vs ${midFlight[midFlight.length - 1].y}`);
  ck('every word is fully opaque the whole way',
    midFlight.every((sort) => sort.opacity === '1'),
    JSON.stringify(midFlight.map((sort) => sort.opacity)));
  ck('the stagger stays inside a third of a second',
    midFlight.every((sort) => Number.parseFloat(sort.delay) <= 0.26),
    JSON.stringify(midFlight.map((sort) => sort.delay)));

  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
  await p.waitForTimeout(1200);
  const settled = await p.evaluate(() =>
    [...new Set([...document.querySelectorAll('[data-hero] h1 > span')]
      .map((span) => getComputedStyle(span).transform))]);
  ck('and every one of them arrives', settled.length === 1 && settled[0] === 'matrix(1, 0, 0, 1, 0, 0)',
    JSON.stringify(settled));
  await ctx.close();
}

// --- Nothing it does counts as a layout shift --------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  const cls = await p.evaluate(() => window.__cls);
  ck('the settling headline shifts nothing', cls === 0, `CLS ${cls}`);
  await p.close();
}

// --- The measurement figures turn over as they land --------------------------
{
  const flip = sheet.match(/@keyframes metric-set\{[^}]*\{([^}]*)\}\}/)?.[1] ?? '';
  ck('the figure animation survives minification', flip.length > 0, flip);
  ck('it turns the figures and nothing else',
    /^transform:perspective\([^)]+\)\s*rotateX\([^)]+\)$/.test(flip.trim()), flip);
  // The rule that ARMS it, not merely a mention of the selector: the
  // reduced-motion opt-out further down names the same selector to switch the
  // animation off, so a substring search alone would be green on a version
  // that had dropped `[data-ready]` from the trigger.
  ck('it is armed by measurement AND by being on screen, not by either alone',
    /\[data-live-metrics\]\[data-ready\] \[data-reveal\]\.is-visible \.metric-figure\{[^}]*animation:metric-set/
      .test(sheet));

  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.06 });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.locator('[data-live-metrics]').scrollIntoViewIfNeeded();

  const ran = await p
    .waitForFunction(
      () => [...document.querySelectorAll('.metric-figure')].some((f) => f.getAnimations().length > 0),
      null,
      { timeout: 20000 },
    )
    .then(() => true)
    .catch(() => false);
  ck('the figures turn once the browser has finished measuring', ran);

  const flying = await p.evaluate(() =>
    [...document.querySelectorAll('.metric-figure')].map((cell) => ({
      delay: getComputedStyle(cell).animationDelay,
      opacity: getComputedStyle(cell).opacity,
      text: (cell.textContent ?? '').trim(),
    })));
  ck('they turn one after another, not together',
    JSON.stringify(flying.map((cell) => cell.delay)) === JSON.stringify(['0s', '0.09s', '0.18s']),
    JSON.stringify(flying.map((cell) => cell.delay)));
  ck('none of them is invisible while it turns',
    flying.every((cell) => cell.opacity === '1'), JSON.stringify(flying.map((c) => c.opacity)));
  // A figure that turns while it still reads "—" is animating a placeholder.
  ck('each one is showing its measurement by the time it turns',
    flying.every((cell) => /\d/.test(cell.text)), JSON.stringify(flying.map((c) => c.text)));

  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
  await p.waitForTimeout(1200);
  const leftover = await p.evaluate(() => {
    const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    return Math.max(0, ...[...document.querySelectorAll('.metric-figure')].map((cell) => {
      const value = getComputedStyle(cell).transform;
      if (!value || value === 'none') return 0;
      const m = new DOMMatrixReadOnly(value).toFloat64Array();
      return Math.max(...m.map((v, i) => Math.abs(v - IDENTITY[i])));
    }));
  });
  ck('and none of them is left lying on its side', leftover < 1e-6, `${leftover} off identity`);

  /*
    Both halves of the trigger, tested by taking each one away.

    The band is measured and on screen by now, so re-arming it is just a matter
    of removing `is-visible` and putting it back — a CSS animation starts when
    the element starts matching the rule. With `data-ready` gone as well,
    nothing may start: a figure that turns on visibility alone would do it
    below the fold on a page nobody has scrolled, which is the same as not
    doing it at all.
  */
  const rearm = async (withReady) =>
    p.evaluate((ready) => {
      const band = document.querySelector('[data-live-metrics]');
      const row = band.querySelector('[data-reveal]');
      row.classList.remove('is-visible');
      if (ready) band.dataset.ready = 'true';
      else delete band.dataset.ready;
      void band.offsetWidth;
      row.classList.add('is-visible');
      return [...document.querySelectorAll('.metric-figure')]
        .reduce((sum, cell) => sum + cell.getAnimations().length, 0);
    }, withReady);

  ck('re-arming with the measurement in place turns them again', (await rearm(true)) === 3);
  ck('without the measurement, nothing turns', (await rearm(false)) === 0);
  await ctx.close();
}

// --- Reduced motion gets both of them finished, from the first frame ---------
{
  const calm = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await calm.emulateMedia({ reducedMotion: 'reduce' });
  await calm.addInitScript(WATCH_TILT);
  await calm.goto(`${BASE}/`, { waitUntil: 'load' });

  const state = await calm.evaluate(() =>
    [...document.querySelectorAll('[data-hero] h1 > span')].map((span) => getComputedStyle(span).animationName));
  ck('reduced motion runs no headline animation at all',
    state.every((name) => name === 'none'), JSON.stringify([...new Set(state)]));

  await calm.locator('[data-live-metrics]').scrollIntoViewIfNeeded();
  await calm
    .waitForFunction(() => document.querySelector('[data-live-metrics]')?.dataset.ready === 'true',
      null, { timeout: 15000 })
    .catch(() => {});
  await calm.waitForTimeout(800);

  const tilt = await calm.evaluate(() => window.__tilt);
  ck('the headline was never once out of place', tilt.headline < 1e-6, `${tilt.headline} off identity`);
  ck('and no figure was ever caught on its side', tilt.figures < 1e-6, `${tilt.figures} off identity`);
  await calm.close();
}

await b.close();
ck.report();
