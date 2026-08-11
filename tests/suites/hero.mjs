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

  const spot = p.locator('[data-hero-spotlight]');
  ck(
    'spotlight is idle before any pointer movement',
    !(await spot.evaluate((e) => e.hasAttribute('data-active'))),
  );

  await p.mouse.move(400, 300);
  await p.mouse.move(600, 350);
  await p.waitForTimeout(400);
  ck('spotlight activates on pointer move', await spot.evaluate((e) => e.hasAttribute('data-active')));

  const t1 = await spot.evaluate((e) => e.style.transform);
  await p.mouse.move(900, 500);
  await p.waitForTimeout(400);
  const t2 = await spot.evaluate((e) => e.style.transform);
  ck('spotlight follows the cursor', t1 !== t2 && /translate3d/.test(t2), t2);

  const glowT = await p.locator('[data-hero-glow]').first().evaluate((e) => e.style.transform);
  ck('glows parallax too', /translate3d/.test(glowT), glowT);

  const props = await p
    .locator('[data-hero-glow]')
    .first()
    .evaluate((e) => Array.from(e.style).join(','));
  ck('only transform is animated (no layout properties)', props === 'transform', props);

  await p.mouse.move(600, 1200);
  await p.dispatchEvent('[data-hero]', 'pointerleave');
  await p.waitForTimeout(4000); // headless runs well under 60fps; allow the drift to finish
  const before = await p.evaluate(() => window.__frames);
  await p.waitForTimeout(2000);
  const after = await p.evaluate(() => window.__frames);
  ck('animation loop stops when the pointer leaves', after === before, `${before} → ${after} frames`);
  ck(
    'spotlight fades out on leave',
    !(await spot.evaluate((e) => e.hasAttribute('data-active'))),
  );

  ck('no CSP violations', (await p.evaluate(() => window.__csp)).length === 0);
  ck('no page errors', errs.length === 0, errs.join(' | '));
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
    .locator('[data-hero-spotlight]')
    .evaluate((e) => e.hasAttribute('data-active'));
  const moved = await p.locator('[data-hero-glow]').first().evaluate((e) => e.style.transform);
  ck('reduced motion: spotlight never activates', !active);
  ck('reduced motion: glows never move', moved === '', `"${moved}"`);
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
    .locator('[data-hero-spotlight]')
    .evaluate((e) => e.hasAttribute('data-active'));
  ck('touch device: effect stays off', !active);
  await ctx.close();
}

console.log(R.join('\n'));
await b.close();

if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
