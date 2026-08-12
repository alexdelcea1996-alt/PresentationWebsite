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

// Count animation frames so we can prove the loop stops when idle.
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
  await p.waitForTimeout(4000); // headless runs well under 60fps; allow the drift to finish
  const before = await p.evaluate(() => window.__frames);
  await p.waitForTimeout(2000);
  const after = await p.evaluate(() => window.__frames);
  ck('animation loop stops when the pointer settles', after === before, `${before} → ${after} frames`);

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
