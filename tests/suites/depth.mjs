/**
 * Depth: the page has distances, and the scroll is the camera.
 *
 * Three effects, all of them scroll-driven CSS and none of them with a line of
 * JavaScript behind it:
 *  - the hero's decorative layers sit at real distances inside a perspective,
 *    and the vanishing point pans as the section crosses the viewport;
 *  - cards arrive out of the page and settle flat before they are read;
 *  - the framed example site turns to face the reader, and ends exactly square.
 *
 * Every one of them fails silently. A scroll-driven animation that never runs
 * throws nothing, logs nothing and looks precisely like a page that was never
 * given the effect — which is also, deliberately, what Firefox gets. So the
 * checks below do not ask whether the rule is in the stylesheet. They scroll,
 * and they read what actually changed.
 *
 * Two traps are pinned here because both cost real time to find:
 *
 *  1. `animation: name linear both` sets `animation-duration` to 0s. On a clock
 *     that is harmless. On a scroll timeline it is an animation that never
 *     advances, and nothing anywhere reports it.
 *  2. `overflow: hidden` makes an element a scroll container. A `view()`
 *     timeline resolves against the nearest scrollport, so every animation
 *     inside an overflow-hidden box silently attaches to a container that never
 *     scrolls. `overflow: clip` clips identically and creates no scrollport.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, checks } from '../harness.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ck = checks();
const b = await launch();

const sheet = readdirSync(join(root, 'dist', '_astro'))
  .filter((file) => file.endsWith('.css'))
  .map((file) => readFileSync(join(root, 'dist', '_astro', file), 'utf8'))
  .join('\n');

/** Scroll there in steps, so the reveal observer and lazy frames both fire. */
const scrollTo = async (page, y) => {
  await page.evaluate(async (target) => {
    for (let at = window.scrollY; at < target; at += 400) {
      window.scrollTo({ top: at, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 16));
    }
    window.scrollTo({ top: target, behavior: 'instant' });
  }, y);
  await page.waitForTimeout(250);
};

/** How far a computed transform is from doing nothing. */
const OFF_IDENTITY = `(t) => {
  if (!t || t === 'none') return 0;
  const m = new DOMMatrixReadOnly(t).toFloat64Array();
  const id = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  return Math.max(...m.map((v, i) => Math.abs(v - id[i])));
}`;

// --- The rules ship, and they ship in the form that works --------------------
{
  ck('the hero parallax survives minification', sheet.includes('@keyframes plane-drift'));
  ck('the card arrival survives minification', sheet.includes('@keyframes card-arrive'));
  /*
    The frame's rule is a component-scoped style, inlined into the page rather
    than bundled with the site stylesheet — so it ships with the page that has
    a frame on it. That used to be the landing page; since the sections moved
    out to pages of their own, the framed example lives with the case studies.

    Measured while writing this: it also still ships to the landing page, which
    imports the portfolio section and therefore the frame component, even though
    a prop stops the frame from rendering there. Astro collects a page's styles
    from its module graph, not from what it ends up drawing — so a component
    that is imported and not used still costs its CSS. Four hundred bytes here,
    and not worth contorting the components over, but worth knowing before
    somebody writes a check asserting the opposite and cannot make it pass.
  */
  const projects = readFileSync(join(root, 'dist', 'proiecte', 'index.html'), 'utf8');
  ck('the frame turning ships too', projects.includes('frame-face'));
  ck('all of it is gated on scroll-driven support',
    /@supports\s*\(animation-timeline:\s*view\(\)\)/.test(sheet));

  /*
    The shorthand trap, caught in the delivered bytes.

    Lightning CSS folds a shorthand and its longhands back together, so a rule
    written as `animation: x linear both` next to `animation-timeline: view()`
    comes out as `animation:linear both x view()` — with the duration still at
    the 0s the shorthand set, and the animation therefore inert. Any rule that
    names a timeline inside the `animation` shorthand is that mistake.
  */
  const folded = [...sheet.matchAll(/animation:[^;}]*\bview\(\)/g)].map((m) => m[0]);
  ck('no scroll-driven rule went through the animation shorthand',
    folded.length === 0, folded.join(' | '));
}

// --- The hero's layers lag by exactly as much as they are far ----------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await p.waitForTimeout(400);

  /*
    `overflow: hidden` here would leave every check below green in the
    stylesheet and dead on the page: it makes the hero a scroll container, and a
    `view()` timeline inside one attaches to a scrollport that never scrolls.
  */
  const overflow = await p.evaluate(() => getComputedStyle(document.querySelector('[data-hero]')).overflow);
  ck('the hero clips without becoming a scroll container', overflow.startsWith('clip'), overflow);

  const running = await p.evaluate(() =>
    [...document.querySelectorAll('.hero-plane')]
      .flatMap((el) => el.getAnimations().map((a) => a.animationName)));
  ck('every plane is on the scroll timeline',
    running.length >= 2 && running.every((name) => name === 'plane-drift'), JSON.stringify(running));

  const drift = async () =>
    p.evaluate(() => Object.fromEntries([...document.querySelectorAll('.hero-plane')].map((el) => [
      el.dataset.plane,
      Number.parseFloat((getComputedStyle(el).translate.split(/\s+/)[1] ?? '0').replace('px', '')) || 0,
    ])));

  const before = await drift();
  await p.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
  await p.waitForTimeout(300);
  const after = await drift();

  const moved = Object.fromEntries(Object.keys(after).map((k) => [k, after[k] - before[k]]));
  ck('the layers actually move as the hero scrolls',
    Math.abs(moved.far) > 10, JSON.stringify(moved));

  /*
    The point of the whole exercise, asserted rather than described: the far
    layer lags further behind the text than the near one, and by the ratio of
    their declared distances. Hand-tuned parallax passes the check above and
    fails this one, which is the difference between depth and two numbers that
    happen to differ.
  */
  const depths = await p.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('.hero-plane')].map((el) => [
      el.dataset.plane,
      Number.parseFloat(getComputedStyle(el).getPropertyValue('--z')) || 0,
    ])));
  ck('they are at declared, different distances',
    depths.far < depths.mid && depths.mid < 0, JSON.stringify(depths));

  const driftRatio = Math.abs(moved.far / moved.mid);
  const depthRatio = Math.abs(depths.far / depths.mid);
  ck('and each lags in proportion to how far away it is',
    Math.abs(driftRatio - depthRatio) < 0.05,
    `drift ${driftRatio.toFixed(3)} vs depth ${depthRatio.toFixed(3)}`);

  await p.close();
}

// --- Cards arrive, and the frame turns — both landing exactly square ---------
/*
  Swept, not sampled.

  The first version of these two blocks scrolled to a coordinate worked out from
  the element's position and then read the transform there. It kept lying: this
  page has a lazy iframe and a screenful of reveals, so everything below the
  fold moves while you are on the way to it, and a card reported as "still
  tilted" had in truth never entered the viewport at all. Arithmetic about where
  something will be is the wrong tool on a page that is still growing.

  Walking the whole document and keeping the extremes needs no arithmetic and
  says something stronger than any single sample could: somewhere in the scroll
  this element was genuinely turned, and somewhere else it was exactly flat.
*/
/**
 * Walk a page top to bottom and keep, per selector, how far from identity its
 * transform ever got and how close to identity it ever came.
 *
 * Takes a path because the two things swept no longer live together: cards are
 * on every page, and the framed example is on the one about proof.
 */
const sweepPage = async (path, selectors) => {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });

  /*
    One pass down first, unmeasured. The page has a lazy iframe and a screenful
    of scroll reveals, and measuring on the way down the first time reads a
    document that is still assembling itself under the measurement.
  */
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await p.waitForTimeout(2500);

  const sweep = await p.evaluate(async ([expr, selectors]) => {
    // eslint-disable-next-line no-new-func
    const off = new Function(`return (${expr})`)();
    const seen = Object.fromEntries(selectors.map((s) => [s, { min: Infinity, max: 0, opacity: 0 }]));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += 140) {
      /*
        `behavior: 'instant'`, and it is load-bearing.

        The site sets `scroll-behavior: smooth`, so a plain `scrollTo` in a
        measuring loop does not jump — it starts an animation, and the next
        call restarts it from wherever it got to. A sweep written without this
        crawls forty pixels a step, never reaches anything below the fold, and
        reports a perfectly working effect as absent.
      */
      window.scrollTo({ top: y, behavior: 'instant' });
      // Two frames: a scroll timeline updates on the frame after the scroll,
      // and a style read taken in the same frame is the value from before it.
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (!el) continue;
        const box = el.getBoundingClientRect();
        // Only while it is actually on screen; off-screen readings are the
        // fill state at either end of the range and prove nothing.
        if (box.bottom < 0 || box.top > innerHeight) continue;
        const style = getComputedStyle(el);
        const value = off(style.transform);
        const at = seen[selector];
        at.min = Math.min(at.min, value);
        at.max = Math.max(at.max, value);
        at.opacity = Math.max(at.opacity, Number(style.opacity));
      }
    }
    return seen;
  }, [OFF_IDENTITY, selectors]);

  await p.close();
  return sweep;
};

{
  const sweep = await sweepPage('/', ['.card']);
  const card = sweep['.card'];
  ck('a card is genuinely tilted somewhere on the way in', card.max > 0.02, `${card.max.toFixed(2)}`);
  ck('and is exactly square by the time it is being read', card.min < 1e-6, `${card.min}`);
  ck('and is fully opaque once it has arrived', card.opacity > 0.99, `${card.opacity}`);

  /*
    The depth must never be the reason something cannot be read, so none of
    these keyframes may touch opacity at all — checked in the delivered rule
    rather than sampled, because the reveal system legitimately holds a card at
    zero before it scrolls in and sampling cannot tell the two apart.
  */
  const arriving = sheet.match(/@keyframes card-arrive\{[^}]*\{([^}]*)\}\}/)?.[1] ?? '';
  ck('the card arrival moves the card and nothing else',
    arriving.length > 0 && /^transform:[^;]+$/.test(arriving.trim()), arriving);

  /*
    An iframe is rasterised through whatever transform it carries, so a rotation
    left on at rest is a permanently soft screenshot of a working site. This is
    also the check that catches `entry` being used on an element taller than the
    viewport, where the range never completes and the frame never straightens.
  */
  const frame = (await sweepPage('/proiecte/', ['.demo-frame-shell']))['.demo-frame-shell'];
  ck('the example frame is turned away as you come to it', frame.max > 0.05, `${frame.max.toFixed(2)}`);
  ck('and lands exactly square, so the live page inside stays sharp',
    frame.min < 1e-6, `${frame.min}`);
}

// --- The card arrival stays off the phone ------------------------------------
/*
  A scroll timeline per element is not free to set up, and there are 31 cards on
  the front page. With all of them armed, Lighthouse's mobile profile sat at
  85-89 across six runs and never once reached the band the page sits in
  without them. Gated, it reaches 98.

  Worth saying plainly: mobile scores on the machine this suite runs on swing by
  about six points run to run, so the two bands overlap and the exact cost is
  not resolvable here. What is resolvable, and what this check pins, is that the
  gate exists — because the version without it was reliably outside the band,
  and because thirty-one cards tilting one after another down a single column is
  the wrong amount of movement on the smallest screen anyway.
*/
{
  // Lightning CSS rewrites `min-width: 48rem` into the range form `width>=48rem`.
  const gate = sheet.match(/@media \((?:min-width:\s*48rem|width>=48rem)\)\{[^@]*?\.card\{[^}]*animation-name:card-arrive/);
  ck('the card arrival is gated to wide screens', Boolean(gate),
    gate ? 'gated' : 'no min-width gate around .card');

  const phone = await b.newPage({ viewport: { width: 390, height: 844 } });
  await phone.goto(`${BASE}/`, { waitUntil: 'load' });
  await phone.waitForTimeout(400);
  const armed = await phone.evaluate(() =>
    [...document.querySelectorAll('.card')].reduce((sum, el) => sum + el.getAnimations().length, 0));
  ck('and no card on a phone is carrying one', armed === 0, `${armed} armed`);

  // The hero still has its depth there: two timelines, not thirty-one.
  const planes = await phone.evaluate(() =>
    [...document.querySelectorAll('.hero-plane')].reduce((sum, el) => sum + el.getAnimations().length, 0));
  ck('while the hero keeps its depth on a phone', planes >= 2, `${planes}`);
  await phone.close();
}

// --- Clipping, not scrolling: no page grew a horizontal scrollbar ------------
{
  const wide = [];
  for (const width of [1440, 1280, 768, 390, 320]) {
    const p = await b.newPage({ viewport: { width, height: 900 } });
    await p.goto(`${BASE}/`, { waitUntil: 'load' });
    await p.waitForTimeout(300);
    const over = await p.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 0) wide.push(`${width}px by ${over}`);
    await p.close();
  }
  ck('swapping hidden for clip did not let anything spill sideways',
    wide.length === 0, wide.join(', '));
}

// --- Nothing here is allowed to move layout ----------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await scrollTo(p, 4000);
  await p.waitForTimeout(500);
  const cls = await p.evaluate(() => window.__cls);
  ck('scrolling the whole page through the depth shifts nothing', cls === 0, `CLS ${cls}`);
  await p.close();
}

// --- Reduced motion gets the flat page ---------------------------------------
{
  const calm = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await calm.emulateMedia({ reducedMotion: 'reduce' });
  await calm.goto(`${BASE}/`, { waitUntil: 'load' });
  await calm.waitForTimeout(300);
  const flat = await calm.evaluate(() => ({
    planes: [...new Set([...document.querySelectorAll('.hero-plane')].map((e) => getComputedStyle(e).translate))],
    card: getComputedStyle(document.querySelector('.card')).transform,
    running: [...document.querySelectorAll('.hero-plane, .card')]
      .reduce((sum, el) => sum + el.getAnimations().length, 0),
  }));
  ck('and no plane has drifted anywhere', flat.planes.join() === 'none', JSON.stringify(flat.planes));
  ck('and no card is tilted', flat.card === 'none', flat.card);
  ck('and nothing is animating', flat.running === 0, `${flat.running}`);
  await calm.close();
}

// --- The depth is free, or it is not worth having ----------------------------
/*
  Measured against the same page with the effects switched off, in the same
  process, seconds apart — an absolute frame count would only be reporting how
  busy the machine running the suite is. The floor is generous because that is
  not what this is watching for: it is watching for somebody putting a filter or
  a box-shadow on a plane and turning a composited scroll into a repainted one.
*/
{
  const count = async (reduced) => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 },
      reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'load' });
    await p.waitForTimeout(600);
    const frames = await p.evaluate(async () => {
      const seen = [];
      let y = 0;
      const tick = (t) => { seen.push(t); y += 12; window.scrollTo({ top: y, behavior: 'instant' }); if (y < 900) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      await new Promise((r) => setTimeout(r, 1800));
      return seen.length;
    });
    await ctx.close();
    return frames;
  };

  const withDepth = await count(false);
  const without = await count(true);
  /*
    The floor is 0.85, chosen against the regression it exists for rather than
    picked to look strict. The first build of this animated `perspective-origin`
    and cost 28% of the frames scrolling the hero; a floor of 0.7 let that
    through at 0.72, which is a check that would have watched the mistake
    happen. Both numbers come from the same process seconds apart, so the noise
    this has to tolerate is small.
  */
  ck('scrolling through the depth costs no frames worth counting',
    withDepth >= without * 0.85, `${withDepth} frames with, ${without} without`);
}

await b.close();
ck.report();
