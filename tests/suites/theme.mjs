import { launch, BASE } from '../harness.mjs';
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const browser = await launch();

// --- defaults follow the OS when nothing is stored ---
for (const [scheme, expected] of [['light', 'light'], ['dark', 'dark']]) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  ck(`OS ${scheme} gives the ${expected} theme`, (await p.evaluate(() => document.documentElement.dataset.theme)) === expected);
  await ctx.close();
}

// --- toggling, persistence, and no flash on reload ---
const ctx = await browser.newContext({ colorScheme: 'dark' });
const p = await ctx.newPage();
await p.goto(BASE, { waitUntil: 'domcontentloaded' });

const toggle = p.locator('[data-theme-toggle]').first();
ck('toggle is visible in the header', await toggle.isVisible());
const labelBefore = await toggle.getAttribute('aria-label');

await toggle.click();
await p.waitForTimeout(150);
ck('click switches to light', (await p.evaluate(() => document.documentElement.dataset.theme)) === 'light');
ck('choice is stored', (await p.evaluate(() => localStorage.getItem('theme'))) === 'light');
ck('label flips after switching', (await toggle.getAttribute('aria-label')) !== labelBefore, await toggle.getAttribute('aria-label'));
ck('theme-color meta follows', (await p.locator('meta[name=theme-color]').getAttribute('content')) === '#ffffff');
ck('page background is actually light',
  (await p.evaluate(() => getComputedStyle(document.body).backgroundColor)) === 'rgb(255, 255, 255)');

// Reload: the stored choice must win over the OS, before first paint.
await p.reload({ waitUntil: 'commit' });
const atCommit = await p.evaluate(() => document.documentElement.dataset.theme);
ck('stored theme is applied before paint (no flash)', atCommit === 'light', `at commit: ${atCommit}`);

await p.goto(BASE + '/blog/', { waitUntil: 'domcontentloaded' });
ck('choice carries across pages', (await p.evaluate(() => document.documentElement.dataset.theme)) === 'light');

// Switch back
await p.locator('[data-theme-toggle]').first().click();
await p.waitForTimeout(150);
ck('switches back to dark', (await p.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
ck('theme-color meta returns', (await p.locator('meta[name=theme-color]').getAttribute('content')) === '#0b0f1a');

// --- both toggles stay in sync on mobile ---
const m = await ctx.newPage();
await m.setViewportSize({ width: 390, height: 844 });
await m.goto(BASE, { waitUntil: 'domcontentloaded' });
await m.locator('[data-menu-toggle]').click();
await m.waitForTimeout(200);
const toggles = m.locator('[data-theme-toggle]');
ck('header and mobile menu each have a toggle', (await toggles.count()) === 2);
await toggles.nth(1).click();
await m.waitForTimeout(150);
const labels = await toggles.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
ck('both toggles show the same state', new Set(labels).size === 1, labels.join(' | '));

console.log(R.join('\n'));
await browser.close();

if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
