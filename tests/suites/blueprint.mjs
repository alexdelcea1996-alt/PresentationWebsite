/**
 * The blueprint overlay — the page's own technical drawing, on request.
 *
 * Two things make this worth shipping rather than a gimmick, and both are the
 * kind of claim that rots quietly, so both are checked here.
 *
 * It is OPT-IN and leaves nothing behind. A drawing that is always half-on, or
 * that forgets to clean up after itself, is a costume rather than an
 * invitation — and a stray attribute would keep sections outlined for a reader
 * who closed it.
 *
 * Every figure is MEASURED IN THE BROWSER, not written at build time. That is
 * the whole claim the panel makes about itself, and the failure it guards
 * against is precise: the colophon published stale byte figures for a week
 * because they were prose. So the numbers here are cross-checked against what
 * the browser independently reports, which a frozen constant cannot survive.
 */
import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const VIEWPORT = { viewport: { width: 1280, height: 900 } };

// --- Off until asked ----------------------------------------------------------
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });

  ck('the control is in the footer', await p.locator('[data-blueprint-toggle]').isVisible());
  ck('nothing is drawn before it is asked for',
    (await p.evaluate(() => document.documentElement.hasAttribute('data-blueprint'))) === false);
  ck('the panel starts hidden', await p.locator('[data-blueprint-panel]').isHidden());
  ck('and the grid with it', await p.locator('[data-blueprint-grid]').isHidden());
  ck('the control says what it will do',
    (await p.locator('[data-blueprint-toggle]').getAttribute('aria-expanded')) === 'false');
  await p.close();
}

// --- What it reports is what the browser reports -------------------------------
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await settleAnimations(p);
  await p.locator('[data-blueprint-toggle]').click();
  await p.waitForTimeout(400);

  ck('pressing it draws the page', await p.evaluate(() => document.documentElement.hasAttribute('data-blueprint')));
  ck('the panel is announced as open',
    (await p.locator('[data-blueprint-toggle]').getAttribute('aria-expanded')) === 'true');

  const read = async (key) =>
    (await p.locator(`[data-blueprint="${key}"]`).innerText()).trim();
  const rows = ['nodes', 'page', 'styles', 'scripts', 'fonts', 'shift', 'contrast'];
  const values = {};
  for (const key of rows) values[key] = await read(key);
  ck('every row is filled in', Object.values(values).every((v) => v && v !== '—'),
    JSON.stringify(values));

  const num = (s) => Number(String(s).replace(/[^\d]/g, ''));

  /*
    The guard against a frozen figure. Each of these is recomputed here from a
    source the panel does not touch, so a number typed into the markup — or one
    that stopped being recalculated — cannot match by luck.
  */
  const truth = await p.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    let total = nav.decodedBodySize;
    let styles = 0;
    let fonts = 0;
    for (const r of performance.getEntriesByType('resource')) {
      const size = r.decodedBodySize || 0;
      total += size;
      if (r.initiatorType === 'css' || r.name.endsWith('.css')) styles += size;
      else if (/\.woff2?($|\?)/.test(r.name)) fonts += size;
    }
    return {
      nodes: document.querySelectorAll('*').length,
      page: Math.round(total / 1024),
      styles: Math.round(styles / 1024),
      fonts: Math.round(fonts / 1024),
    };
  });

  ck('the element count is the real one', num(values.nodes) === truth.nodes,
    `${values.nodes} vs ${truth.nodes}`);
  ck('the page weight is the one the browser reports', num(values.page) === truth.page,
    `${values.page} vs ${truth.page} kB`);
  ck('the stylesheet figure is the real one', num(values.styles) === truth.styles,
    `${values.styles} vs ${truth.styles} kB`);
  ck('the font figure is the real one', num(values.fonts) === truth.fonts,
    `${values.fonts} vs ${truth.fonts} kB`);

  // The contrast row is arithmetic on the painted colours, so it must both look
  // like a ratio and be a plausible one for a page that passes AA everywhere.
  const ratio = Number((values.contrast.match(/[\d.]+/) ?? [0])[0]);
  ck('the contrast row is a real ratio', /:1$/.test(values.contrast) && ratio >= 4.5,
    values.contrast);

  // The site's own headline claim, reported by the overlay about itself.
  ck('layout shift is reported and is zero', /^0\.0/.test(values.shift), values.shift);

  // Sections are labelled with their real, measured size.
  const sections = await p.$$eval('main > section[data-blueprint-note]', (nodes) =>
    nodes.map((n) => ({
      note: n.dataset.blueprintNote ?? '',
      width: Math.round(n.getBoundingClientRect().width),
      height: Math.round(n.getBoundingClientRect().height),
    })));
  ck('every section is measured', sections.length > 5, `${sections.length} labelled`);
  const wrong = sections.filter((s) => !s.note.includes(`${s.width} × ${s.height}`));
  ck('and each label matches the box it is on', wrong.length === 0,
    wrong.slice(0, 2).map((s) => `${s.note} vs ${s.width}×${s.height}`).join(' | '));

  await p.close();
}

// --- Closing it leaves nothing behind ------------------------------------------
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const toggle = p.locator('[data-blueprint-toggle]');
  await toggle.click();
  await p.waitForTimeout(300);
  await toggle.click();
  await p.waitForTimeout(200);

  ck('the drawing is put away', (await p.evaluate(() => document.documentElement.hasAttribute('data-blueprint'))) === false);
  ck('no section is left annotated',
    (await p.locator('main > section[data-blueprint-note]').count()) === 0);
  ck('the panel is hidden again', await p.locator('[data-blueprint-panel]').isHidden());
  ck('and the control offers to show it again',
    (await toggle.getAttribute('aria-expanded')) === 'false');
  // Not remembered: a drawing that comes back on the next page would be a mode,
  // not a look.
  await p.reload({ waitUntil: 'domcontentloaded' });
  ck('it does not come back on reload',
    (await p.evaluate(() => document.documentElement.hasAttribute('data-blueprint'))) === false);
  await p.close();
}

// --- Only where it belongs ------------------------------------------------------
{
  for (const [label, path, expected] of [
    ['RO home', '/', 1],
    ['EN home', '/en/', 1],
    ['RO colophon', '/colofon/', 1],
    ['EN colophon', '/en/colophon/', 1],
    ['a blog post', '/blog/de-ce-se-incarca-greu-site-ul-tau/', 0],
    ['a service page', '/servicii/site-de-prezentare/', 0],
  ]) {
    const p = await b.newPage(VIEWPORT);
    await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    const count = await p.locator('[data-blueprint-toggle]').count();
    ck(`${label}: carries the control ${expected ? 'as intended' : 'nowhere'}`, count === expected,
      `${count} found`);
    await p.close();
  }
}

// --- Axe-clean with the drawing switched on, in both themes ---------------------
for (const theme of ['dark', 'light']) {
  const p = await b.newPage(VIEWPORT);
  await p.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await p.addInitScript({ path: axePath });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await settleAnimations(p);
  await p.locator('[data-blueprint-toggle]').click();
  await p.waitForTimeout(400);
  const result = await runAxe(p);
  ck(`${theme}: the page is axe-clean with the drawing on`, result.violations.length === 0,
    result.violations.map((v) => `${v.id} (${v.nodes[0]?.html?.slice(0, 60)})`).join(', '));
  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
