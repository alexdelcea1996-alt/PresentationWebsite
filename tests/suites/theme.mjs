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
/*
  Both of these used to name #ffffff outright. The light theme is warm paper
  now, and a literal in a test is a third place for a colour to live — the
  palette moved once and this file did not, which is the whole failure mode.

  So the token is the source and the test derives from it: the browser resolves
  `--color-surface`, and both the painted body and the `theme-color` the OS uses
  for its chrome have to equal that. Change the palette and this follows;
  change only one of the three and it fails.
*/
const surface = await p.evaluate(() => {
  const token = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
  // Resolve whatever notation the token is written in into rgb(), so the
  // comparison does not depend on the author's syntax.
  const probe = document.createElement('span');
  probe.style.color = token;
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return { token, resolved };
});
ck('the light surface token is a real colour', /^rgb/.test(surface.resolved), JSON.stringify(surface));
ck('page background is the paper surface, not white',
  (await p.evaluate(() => getComputedStyle(document.body).backgroundColor)) === surface.resolved,
  `${await p.evaluate(() => getComputedStyle(document.body).backgroundColor)} vs token ${surface.resolved}`);
ck('theme-color meta matches the surface the page actually paints',
  await p.evaluate((expected) => {
    const meta = document.querySelector('meta[name=theme-color]')?.getAttribute('content') ?? '';
    const probe = document.createElement('span');
    probe.style.color = meta;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return resolved === expected;
  }, surface.resolved),
  `${await p.locator('meta[name=theme-color]').getAttribute('content')} vs ${surface.resolved}`);

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
