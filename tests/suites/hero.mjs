/**
 * The two cursor effects: the hero's parallax washes and the site-wide glow.
 *
 * They used to be one thing — a spotlight that lived inside the hero and
 * stopped at its bottom edge. The glow is now global and lives in `Base.astro`,
 * so it is checked here on a page that has no hero at all as well as on the
 * landing page; the parallax stayed where it was.
 *
 * What matters in both cases is not that they look nice but that they cost
 * nothing they should not: no frame touches layout, the loop stops when the
 * cursor does, and neither runs for a coarse pointer or for someone who asked
 * for reduced motion.
 */
import { launch, BASE } from '../harness.mjs';
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

/**
 * Frame counter, kept as printed detail rather than as an assertion.
 *
 * This suite used to claim it proved "the animation loop stops when the
 * pointer leaves". It could not, and never could — a fact worth writing down
 * so nobody trusts it again. Chromium stops producing frames once nothing on
 * the page changes visually, so rAF goes quiet whether the loop asked to stop
 * or not. Verified twice with deliberately broken code: an unconditional
 * `requestAnimationFrame(render)`, and an easing that never marks itself
 * settled. Both froze the counter exactly like healthy code, in both themes.
 * The transform string stops changing too, because the easing converges to
 * the same sub-pixel value.
 *
 * From outside the page, a converged-but-running loop is indistinguishable
 * from a stopped one. So the check below asserts only what is observable —
 * motion settles and stays settled, which catches oscillation, a target that
 * never converges, and a wrong easing — and no longer claims the rest.
 */
const countFrames = `
  window.__frames = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { window.__frames++; return raf(cb); };
`;

// --- fine pointer, motion allowed ---
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript(countFrames);
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective));
  });
  await p.goto(BASE, { waitUntil: 'networkidle' });

  const glow = p.locator('[data-cursor-glow]');
  ck(
    'the glow is idle before any pointer movement',
    !(await glow.evaluate((e) => e.hasAttribute('data-active'))),
  );

  await p.mouse.move(400, 300);
  await p.mouse.move(600, 350);
  await p.waitForTimeout(400);
  ck('the glow activates on pointer move', await glow.evaluate((e) => e.hasAttribute('data-active')));

  const t1 = await glow.evaluate((e) => e.style.transform);
  await p.mouse.move(900, 500);
  await p.waitForTimeout(400);
  const t2 = await glow.evaluate((e) => e.style.transform);
  ck('the glow follows the cursor', t1 !== t2 && /translate3d/.test(t2), t2);

  // It must never come between the cursor and anything clickable.
  ck('the glow is not hit-testable',
    (await glow.evaluate((e) => getComputedStyle(e).pointerEvents)) === 'none');

  const glowT = await p.locator('[data-hero-glow]').first().evaluate((e) => e.style.transform);
  ck('hero washes parallax too', /translate3d/.test(glowT), glowT);

  for (const [what, selector] of [
    ['the hero washes', '[data-hero-glow]'],
    ['the cursor glow', '[data-cursor-glow]'],
  ]) {
    const props = await p.locator(selector).first().evaluate((e) => Array.from(e.style).join(','));
    ck(`only transform is animated on ${what} (no layout properties)`, props === 'transform', props);
  }

  await p.mouse.move(600, 1200);
  await p.dispatchEvent('[data-hero]', 'pointerleave');

  // Poll for quiet rather than sleeping a fixed time and measuring once: how
  // long the easing takes to settle depends on how loaded the machine is, and
  // a fixed 4s window passed alone but failed once under a full suite run —
  // that is a flaky test, not a broken loop.
  const readState = () =>
    p.evaluate(() => ({
      frames: window.__frames,
      glow: document.querySelector('[data-cursor-glow]')?.style.transform ?? '',
      wash: document.querySelector('[data-hero-glow]')?.style.transform ?? '',
    }));

  // Two consecutive identical reads, not one. A single one is not evidence: on
  // a loaded machine one poll interval can pass with no frame produced, which
  // reads exactly like settled — and then motion resumes and the check below
  // fails for a reason that has nothing to do with the code under test.
  let prev = await readState();
  let now = prev;
  let stable = 0;
  for (let i = 0; i < 40; i += 1) {
    await p.waitForTimeout(400);
    now = await readState();
    const same = now.glow === prev.glow && now.wash === prev.wash && now.frames === prev.frames;
    stable = same ? stable + 1 : 0;
    prev = now;
    if (stable >= 2) break;
  }

  const settledOnce = { ...now };
  await p.waitForTimeout(1200);
  const stillSettled = await readState();
  ck(
    'motion settles after the pointer leaves, and stays settled',
    stillSettled.glow === settledOnce.glow && stillSettled.wash === settledOnce.wash,
    `glow ${settledOnce.glow} → ${stillSettled.glow}; ` +
      `${settledOnce.frames} → ${stillSettled.frames} frames (see the note above)`,
  );

  // Divergence is the failure the settle check cannot see: an easing that
  // overshoots flings the element off-screen, where it stops painting and so
  // stops looking like it is moving. The coordinates have to stay plausible.
  const coords = [...stillSettled.glow.matchAll(/(-?[\d.]+)px/g)].map(([, n]) => Number(n));
  ck(
    'and it settles somewhere on the screen, not flung off it',
    coords.length >= 2 && coords.every((n) => Math.abs(n) < 4000),
    stillSettled.glow || 'no transform',
  );

  // Leaving the window entirely, as opposed to moving between elements in it.
  await p.dispatchEvent('body', 'mouseout', { relatedTarget: null });
  await p.waitForTimeout(300);
  ck(
    'the glow fades out when the cursor leaves the window',
    !(await glow.evaluate((e) => e.hasAttribute('data-active'))),
  );

  ck('no CSP violations', (await p.evaluate(() => window.__csp)).length === 0);
  ck('no page errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- the glow is site-wide, not a hero effect ---
// The whole point of moving it: it used to stop at the hero's bottom edge, and
// pages without a hero never had it at all.
for (const path of ['/blog/de-ce-se-incarca-greu-site-ul-tau/', '/servicii/magazin-online/', '/en/']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await p.mouse.move(400, 300);
  await p.mouse.move(650, 420);
  await p.waitForTimeout(400);
  const glow = p.locator('[data-cursor-glow]');
  ck(`${path}: the glow is there and follows`,
    (await glow.evaluate((e) => e.hasAttribute('data-active'))) &&
      /translate3d/.test(await glow.evaluate((e) => e.style.transform)));
  await ctx.close();
}

// --- night only ---
// Asked for explicitly, and right on its own terms: screen blending does
// nothing on a white page, so the light theme hides it in CSS.
for (const [theme, expected] of [
  ['dark', true],
  ['light', false],
]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.mouse.move(400, 300);
  await p.mouse.move(650, 420);
  await p.waitForTimeout(400);
  const shown = await p
    .locator('[data-cursor-glow]')
    .evaluate((e) => getComputedStyle(e).display !== 'none');
  ck(`${theme} theme: the glow is ${expected ? 'shown' : 'hidden'}`, shown === expected);
  await ctx.close();
}

// --- reduced motion ---
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.mouse.move(500, 300);
  await p.mouse.move(700, 400);
  await p.waitForTimeout(400);
  const active = await p
    .locator('[data-cursor-glow]')
    .evaluate((e) => e.hasAttribute('data-active'));
  const moved = await p.locator('[data-hero-glow]').first().evaluate((e) => e.style.transform);
  ck('reduced motion: the glow never activates', !active);
  ck('reduced motion: hero washes never move', moved === '', `"${moved}"`);
  await ctx.close();
}

// --- coarse pointer (touch) ---
{
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.touchscreen.tap(200, 300);
  await p.waitForTimeout(300);
  const active = await p
    .locator('[data-cursor-glow]')
    .evaluate((e) => e.hasAttribute('data-active'));
  ck('touch device: the effect stays off', !active);
  await ctx.close();
}

console.log(R.join('\n'));
await b.close();

if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
