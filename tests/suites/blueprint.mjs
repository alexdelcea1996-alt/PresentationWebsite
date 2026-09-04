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

  /*
    Read the page to the bottom before opening the drawing, and let what that
    pulls in finish arriving.

    The control is in the footer, so reaching it scrolls past a lazily loaded
    screenshot — five kilobytes that land AFTER the panel has taken its
    measurement and BEFORE this suite recomputes it. The overlay was right both
    times; the check was comparing two different moments. A reader who presses
    the control has scrolled there too, so this is also the honest state to
    measure in.
  */
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  await p.waitForLoadState('networkidle');

  await p.locator('[data-blueprint-toggle]').click();
  await p.waitForTimeout(400);

  ck('pressing it draws the page', await p.evaluate(() => document.documentElement.hasAttribute('data-blueprint')));
  ck('the panel is announced as open',
    (await p.locator('[data-blueprint-toggle]').getAttribute('aria-expanded')) === 'true');

  const rows = ['nodes', 'page', 'styles', 'scripts', 'fonts', 'shift', 'contrast', 'layers'];

  /*
    The guard against a frozen figure: every number is recomputed from a source
    the panel does not touch, so one typed into the markup — or one that stopped
    being recalculated — cannot match by luck.

    Both halves are taken in ONE pass through the page, and that is not tidiness.
    Read separately, a resource that arrives between the two reads lands in the
    recomputed figure and not in the panel's, and the check fails by five
    kilobytes for a reason that has nothing to do with the overlay.
  */
  const { values, truth } = await p.evaluate((keys) => {
    const values = Object.fromEntries(
      keys.map((key) => [key, (document.querySelector(`[data-blueprint="${key}"]`)?.textContent ?? '').trim()]),
    );
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
      values,
      truth: {
        nodes: document.querySelectorAll('*').length,
        page: Math.round(total / 1024),
        styles: Math.round(styles / 1024),
        fonts: Math.round(fonts / 1024),
      },
    };
  }, rows);

  ck('every row is filled in', Object.values(values).every((v) => v && v !== '—'),
    JSON.stringify(values));

  const num = (s) => Number(String(s).replace(/[^\d]/g, ''));

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

// --- The exploded plate --------------------------------------------------------
/*
  The drawing comes apart, and the order it comes apart in is the page's real
  stacking order.

  That last part is the whole claim, and it is the one that can quietly stop
  being true: nothing about a `translateZ` distance forces it to agree with the
  `z-index` it is supposed to be drawing. So the ranks are checked against the
  z-indexes read straight off the painted elements, and the labels are checked
  against them too. A hand-written distance, or a plane moved in the list
  without its z-index moving with it, fails here.
*/
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await settleAnimations(p);

  const toggle = p.locator('[data-blueprint-toggle]');
  const explode = p.locator('[data-explode-toggle]');
  await toggle.click();
  await p.waitForTimeout(300);

  ck('the drawing opens flat', (await p.evaluate(() => document.documentElement.hasAttribute('data-explode'))) === false);
  ck('and offers to pull the layers apart', await explode.isVisible());
  ck('which it says it has not done yet', (await explode.getAttribute('aria-pressed')) === 'false');

  const flatLabel = (await explode.innerText()).trim();

  await explode.click();
  await p.waitForTimeout(800);

  ck('pressing it pulls them apart', await p.evaluate(() => document.documentElement.hasAttribute('data-explode')));
  ck('the control now offers to put them back', (await explode.getAttribute('aria-pressed')) === 'true');
  ck('and says so', (await explode.innerText()).trim() !== flatLabel,
    `${flatLabel} -> ${(await explode.innerText()).trim()}`);

  // Every labelled plane, with the rank it was given and the z-index it really
  // has — read here from the browser, not from anything the overlay wrote.
  const planes = await p.$$eval('[data-blueprint-layer]', (nodes) =>
    nodes.map((node) => ({
      label: node.dataset.blueprintLayer ?? '',
      rank: Number(node.style.getPropertyValue('--bp-z')),
      z: Number(getComputedStyle(node).zIndex) || 0,
      transform: getComputedStyle(node).transform,
    })));

  ck('more than one plane is drawn', planes.length > 1, `${planes.length} planes`);
  ck('the read-out counts the planes it drew',
    Number((await p.locator('[data-blueprint="layers"]').innerText()).trim()) === planes.length);

  const byRank = [...planes].sort((a, b2) => a.rank - b2.rank).map((l) => l.z);
  const byZ = [...planes].map((l) => l.z).sort((a, b2) => a - b2);
  ck('the planes are stacked in the page\'s real paint order',
    JSON.stringify(byRank) === JSON.stringify(byZ), `${byRank} vs ${byZ}`);

  const mislabelled = planes.filter((l) => !l.label.endsWith(`z-index ${l.z}`));
  ck('and each one is labelled with the z-index it actually has',
    mislabelled.length === 0, mislabelled.map((l) => `${l.label} is really ${l.z}`).join(' | '));

  ck('every plane is turned', planes.every((l) => l.transform !== 'none'));
  ck('and the planes stand at different distances',
    new Set(planes.map((l) => l.transform)).size === planes.length,
    planes.map((l) => l.transform.slice(0, 24)).join(' | '));

  // The dials are the only source of the two angles, so turning one has to move
  // the drawing — and be the thing that moved it.
  const before = planes[0].transform;
  const dial = async (which, value) => {
    await p.locator(`[data-explode-${which}]`).evaluate((el, v) => {
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
  };
  await dial('turn', 40);
  await p.waitForTimeout(700);
  const after = await p.$eval('[data-blueprint-layer]', (n) => getComputedStyle(n).transform);
  ck('turning the dial turns the drawing', before !== after);

  /*
    A drawing that hands the document a horizontal scrollbar has broken the page
    it is drawing.

    Nothing clips this — measured at both ends of both dials and at three
    viewport widths, `overflow-x: clip` on the root changed nothing and was
    deleted. It holds for a better reason: the only plane still in the document
    flow is the CONTENT, and the content is the plane every distance is measured
    from, so its rank is zero and it is never moved sideways at all. Everything
    that does move sideways is fixed-positioned and cannot extend a scroll area.

    Which is exactly what this checks. Give the content plane a rank of its own
    and the whole document slides; the sweep catches it at 1290 against 1280.
    Clipping would have hidden that rather than prevented it.
  */
  for (const [turn, tilt] of [[45, 55], [-45, -10], [45, -10], [0, 55]]) {
    await dial('turn', turn);
    await dial('tilt', tilt);
    await p.waitForTimeout(120);
    const grew = await p.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    ck(`at ${turn}°/${tilt}° the drawing does not widen the page`, grew[0] <= grew[1],
      `${grew[0]} vs ${grew[1]}`);
  }
  await dial('turn', -24);
  await dial('tilt', 16);
  await p.waitForTimeout(120);

  // The section labels were measured before any of this; a transform must not
  // have rewritten what the page says its own boxes are.
  const sections = await p.$$eval('main > section[data-blueprint-note]', (nodes) =>
    nodes.map((n) => n.dataset.blueprintNote ?? ''));
  ck('the measurements are still the flat page\'s', sections.every((note) => /\d+ × \d+$/.test(note)),
    sections.slice(0, 2).join(' | '));

  await explode.click();
  await p.waitForTimeout(700);
  ck('pressing it again puts the layers back',
    (await p.evaluate(() => document.documentElement.hasAttribute('data-explode'))) === false);
  ck('and nothing is left turned',
    await p.$$eval('[data-blueprint-layer]', (nodes) =>
      nodes.every((n) => getComputedStyle(n).transform === 'none')));

  // A dial is a control, not a decoration: moving one while the page is flat
  // pulls it apart rather than doing nothing anybody can see.
  await p.locator('[data-explode-tilt]').evaluate((el) => {
    el.value = '30';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await p.waitForTimeout(200);
  ck('moving a dial on a flat page pulls it apart',
    await p.evaluate(() => document.documentElement.hasAttribute('data-explode')));

  await p.close();
}

// --- Closing it leaves nothing behind ------------------------------------------
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const toggle = p.locator('[data-blueprint-toggle]');
  await toggle.click();
  await p.waitForTimeout(300);
  // Closed from the exploded state, which is the state that has the most to
  // leave behind: an attribute on every section and a custom property on each.
  await p.locator('[data-explode-toggle]').click();
  await p.waitForTimeout(300);
  await toggle.click();
  await p.waitForTimeout(200);

  ck('the drawing is put away', (await p.evaluate(() => document.documentElement.hasAttribute('data-blueprint'))) === false);
  ck('no section is left annotated',
    (await p.locator('main > section[data-blueprint-note]').count()) === 0);
  ck('no plane is left marked', (await p.locator('[data-bp-plane]').count()) === 0);
  ck('no layer is left labelled', (await p.locator('[data-blueprint-layer]').count()) === 0);
  ck('the explosion is put away with it',
    (await p.evaluate(() => document.documentElement.hasAttribute('data-explode'))) === false);
  ck('and the control offers to explode it again',
    (await p.locator('[data-explode-toggle]').getAttribute('aria-pressed')) === 'false');
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

  await p.locator('[data-explode-toggle]').click();
  await p.waitForTimeout(800);
  const exploded = await runAxe(p);
  ck(`${theme}: and with the layers pulled apart`, exploded.violations.length === 0,
    exploded.violations.map((v) => `${v.id} (${v.nodes[0]?.html?.slice(0, 60)})`).join(', '));
  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
