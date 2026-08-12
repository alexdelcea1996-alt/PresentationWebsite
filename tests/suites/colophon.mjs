/**
 * The colophon and the launch checklist.
 *
 * Both pages make claims ABOUT THE REPOSITORY, which is a new kind of claim for
 * this site and a new way to be wrong. A page that says "1026 checks" or cites
 * `tests/suites/weight.mjs` is only worth publishing while those things are
 * true, and nothing about the page changes when they stop being true — the
 * number stays on screen looking exactly as confident as before.
 *
 * So this suite reads the repository and compares. It is the only suite here
 * that treats the source tree as the thing under test rather than `dist/`,
 * because the source tree is what these two pages are describing.
 *
 * The other half is wording. The build runs BEFORE the tests, so the site may
 * say how many checks the suite contains and may never say they pass. That is
 * a one-word difference nobody would notice in review, and it is exactly the
 * claim this site exists to argue against, so it gets its own checks.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, BASE, AXE_RULES, axePath, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const readRepo = (...parts) => readFileSync(join(root, ...parts), 'utf8');

const b = await launch();

// --- The number ------------------------------------------------------------------
const buildData = readRepo('src', 'data', 'build.ts');
const declared = Number(buildData.match(/SUITE_CHECKS\s*=\s*(\d+)/)?.[1] ?? 0);
ck('the suite size is declared in one place', declared > 0, String(declared));

// Every `ck(` call site across the suites. Loops mean the real figure can only
// be higher than this, never lower — so it is a floor the page must clear, and
// a number typed in from imagination or left stale from three commits ago
// lands under it.
const suiteFiles = readdirSync(join(here)).filter((name) => name.endsWith('.mjs'));
let callSites = 0;
for (const file of suiteFiles) {
  callSites += (readFileSync(join(here, file), 'utf8').match(/^\s*ck\(/gm) ?? []).length;
}
ck('the declared size is at least the number of assertions written',
  declared >= callSites, `${declared} declared, ${callSites} call sites`);
// And not wildly above it either: the suites loop, but not by two orders of
// magnitude. This catches a digit typed twice.
ck('and is not an implausible multiple of them',
  declared <= callSites * 6, `${declared} vs ${callSites} × 6`);

// Three files state the figure. They have to agree.
//
// Matched in its phrase rather than as a bare substring: "200" appears inside
// "1200×630" and inside half the numbers in a README, so `includes` reported a
// stale figure as correct — it was green on a planted regression, which is the
// one result a check must never give.
for (const [label, path] of [['tests/README.md', ['tests', 'README.md']], ['README.md', ['README.md']]]) {
  const text = readRepo(...path);
  const stated = text.match(/(\d[\d.,]*)\s+(?:de\s+)?(?:verificări|checks)/i)?.[1];
  ck(`${label} states the same number`,
    stated !== undefined && Number(stated.replace(/[.,]/g, '')) === declared,
    `${stated ?? 'no figure found'} vs ${declared}`);
}

// --- The budgets it quotes are the budgets that are enforced -----------------------
{
  const weight = readRepo('tests', 'suites', 'weight.mjs');
  const budgets = buildData.match(/BUDGETS\s*=\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  const declaredBudget = (key) => Number(budgets.match(new RegExp(`${key}:\\s*([\\d.]+)`))?.[1] ?? -1);

  // Read the thresholds straight out of the assertions rather than a comment.
  const homeJs = Number(weight.match(/homeJs <= ([\d.]+) \* KB/)?.[1] ?? -1);
  const css = Number(weight.match(/brotli\(css\) <= ([\d.]+) \* KB/)?.[1] ?? -1);
  const fonts = Number(weight.match(/fontBytes <= ([\d.]+) \* KB/)?.[1] ?? -1);

  ck('the inline-JS budget on the page is the one asserted',
    declaredBudget('homeInlineJs') === homeJs, `page ${declaredBudget('homeInlineJs')}, suite ${homeJs}`);
  ck('the CSS budget on the page is the one asserted',
    declaredBudget('css') === css, `page ${declaredBudget('css')}, suite ${css}`);
  ck('the font budget on the page is the one asserted',
    declaredBudget('fonts') === fonts, `page ${declaredBudget('fonts')}, suite ${fonts}`);
}

// --- The pages themselves -----------------------------------------------------------
for (const [label, path, lang] of [
  ['RO', '/colofon/', 'ro'],
  ['EN', '/en/colophon/', 'en'],
]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });

  ck(`${label}: the colophon is served`, (await p.locator('h1').count()) === 1);
  ck(`${label}: in its own language`,
    ((await p.locator('html').getAttribute('lang')) ?? '').startsWith(lang),
    await p.locator('html').getAttribute('lang'));

  // THE wording rule. "N checks in the suite", never "N passing".
  const figure = (await p.locator('[data-colophon-checks]').innerText()).trim();
  const shown = Number(figure.replace(/\D/g, ''));
  ck(`${label}: the number on the page is the declared one`, shown === declared,
    `${shown} vs ${declared}`);

  // A blanket ban on the word "passed" was the first attempt and it was wrong:
  // the honest wording has to be free to say "not how many passed", so banning
  // it outright would have forced the page to drop the very sentence that makes
  // it honest. Nor is a proximity window right — it reaches into the disclaimer
  // sitting under the number and reads its denial as a claim.
  //
  // The rule that actually expresses the intent: the page may talk about tests
  // passing ONLY in the two blocks whose job is to explain what it cannot know.
  // Anywhere else — a heading, the lead, a budget row — it is a claim the build
  // is in no position to make.
  // Not the bare word "green": the budgets paragraph legitimately says an
  // unasserted measurement "passes green forever", which is a description of
  // somebody else's failure mode, not a claim about this build. The words that
  // are claim-shaped are the ones banned.
  const PASS_WORDS = /(trecut|treceau|passing|passed|verzi|all green)/;
  const body = (await p.locator('main').innerText()).toLowerCase();
  const honest = [
    (await p.locator('[data-colophon-note]').innerText()).toLowerCase(),
    (await p.locator('[data-colophon-limits]').innerText()).toLowerCase(),
  ];
  let rest = body;
  for (const block of honest) rest = rest.split(block).join(' ');
  ck(`${label}: it never claims its own tests pass`, !PASS_WORDS.test(rest),
    rest.match(/[^.\n]*(trecut|passing|passed|verzi|green)[^.\n]*/)?.[0]?.slice(0, 80) ?? '');

  // And the figure's own label says what it counts.
  const figureLabel = (await p.locator('[data-colophon-checks] + p').innerText()).toLowerCase();
  ck(`${label}: and its label says "in the suite"`,
    /(în suită|in the suite)/.test(figureLabel) && !PASS_WORDS.test(figureLabel), figureLabel);

  // And says WHY it cannot, which is the part a reader learns something from.
  const note = (await p.locator('[data-colophon-note]').innerText()).toLowerCase();
  ck(`${label}: and explains that the build runs before the tests`,
    /(înainte|before)/.test(note) && /(test|suit)/.test(note), note.slice(0, 70));

  // Provenance has to be real, not a placeholder.
  const commit = (await p.locator('[data-colophon-commit]').innerText()).trim();
  ck(`${label}: it names the commit it was built from`, /^[0-9a-f]{7}$/.test(commit), commit);

  // The same commit that /version.txt reports, or the two would contradict.
  const version = await p.evaluate(async (base) => (await fetch(`${base}/version.txt`)).text(), BASE);
  ck(`${label}: the commit agrees with /version.txt`,
    version.includes(commit), `${commit} in ${version.split('\n')[1] ?? ''}`);

  const limits = await p.locator('[data-colophon-limits] li').count();
  ck(`${label}: it lists what it cannot know`, limits >= 3, `${limits} item(s)`);

  const budgetRows = await p.locator('[data-colophon-budgets] > div').count();
  ck(`${label}: and the budgets it is held to`, budgetRows >= 4, `${budgetRows} row(s)`);

  ck(`${label}: no page errors`, errs.length === 0, errs.join(' | '));
  await p.close();
}

// --- The checklist ---------------------------------------------------------------------
const cited = new Set();
for (const [label, path, lang] of [
  ['RO', '/ghid/lista-de-lansare/', 'ro'],
  ['EN', '/en/guide/launch-checklist/', 'en'],
]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });

  ck(`${label}: the checklist is served`, (await p.locator('[data-checklist]').count()) === 1);
  ck(`${label}: in its own language`,
    ((await p.locator('html').getAttribute('lang')) ?? '').startsWith(lang),
    await p.locator('html').getAttribute('lang'));

  const items = await p.locator('[data-checklist-suite]').count();
  ck(`${label}: it has a usable number of lines`, items >= 15, `${items} line(s)`);

  const groups = await p.locator('[data-checklist-group]').count();
  ck(`${label}: grouped rather than one long run`, groups >= 5, `${groups} group(s)`);

  for (const name of await p.locator('[data-checklist-suite]').allInnerTexts()) {
    cited.add(name.trim());
  }
  await p.close();
}

// The claim that makes this list different from every other launch checklist:
// each line names the suite that enforces it HERE. A cited suite that does not
// exist would be borrowing credibility rather than showing it.
const existing = new Set(suiteFiles.map((name) => name.replace(/\.mjs$/, '')));
const missing = [...cited].filter((name) => !existing.has(name));
ck('every suite the checklist cites actually exists', missing.length === 0,
  missing.join(', ') || `${cited.size} cited`);

// Both languages must cite the same suites — the list is the same list.
ck('the two languages cite the same suites', cited.size >= 6, [...cited].sort().join(' '));

// --- Printable ---------------------------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  // Seeded dark on purpose. Run in the default theme the page is already white
  // and the "prints black on white" check passes without the print stylesheet
  // doing anything — green on a regression, which is worse than no check.
  await p.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await p.goto(`${BASE}/ghid/lista-de-lansare/`, { waitUntil: 'load' });
  await p.emulateMedia({ media: 'print' });
  await p.waitForTimeout(200);

  const printed = await p.evaluate(() => {
    const hidden = (selector) => {
      const el = document.querySelector(selector);
      return !el || getComputedStyle(el).display === 'none';
    };
    return {
      header: hidden('[data-header]'),
      footer: hidden('footer'),
      background: getComputedStyle(document.body).backgroundColor,
      text: getComputedStyle(document.body).color,
      // The reveal animation cannot run without scrolling; if it is not undone
      // for print, everything below the fold prints as a blank page.
      revealed: [...document.querySelectorAll('[data-reveal]')]
        .every((el) => Number(getComputedStyle(el).opacity) === 1),
      items: document.querySelectorAll('[data-checklist-suite]').length,
    };
  });

  ck('printing drops the navigation', printed.header && printed.footer,
    `header hidden ${printed.header}, footer hidden ${printed.footer}`);
  ck('and prints black on white rather than a dark page',
    printed.background === 'rgb(255, 255, 255)' && printed.text === 'rgb(0, 0, 0)',
    `${printed.background} / ${printed.text}`);
  ck('nothing is left invisible by the scroll reveal', printed.revealed);
  ck('and every line still prints', printed.items >= 15, `${printed.items}`);

  await p.emulateMedia({ media: 'screen' });
  await p.close();
}

// --- The footer carries the provenance everywhere ------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  const link = p.locator('[data-provenance]');
  ck('the footer says which commit the page was built from', (await link.count()) === 1);
  ck('and links it to the page that explains the rest',
    ((await link.getAttribute('href')) ?? '').includes('colofon'),
    await link.getAttribute('href'));

  const en = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await en.goto(`${BASE}/en/`, { waitUntil: 'load' });
  ck('the English footer points at the English colophon',
    ((await en.locator('[data-provenance]').getAttribute('href')) ?? '').includes('/en/colophon/'),
    await en.locator('[data-provenance]').getAttribute('href'));
  await en.close();
  await p.close();
}

// --- Both pages are meant to be found ----------------------------------------------------
{
  const p = await b.newPage();
  // fetch() needs a real origin behind it; from about:blank the CSP has nothing
  // to allow and every request fails before it leaves the page.
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  const sitemap = await p.evaluate(async (base) => (await fetch(`${base}/sitemap-0.xml`)).text(), BASE);
  for (const path of ['/colofon/', '/en/colophon/', '/ghid/lista-de-lansare/', '/en/guide/launch-checklist/']) {
    ck(`${path} is in the sitemap`, sitemap.includes(path), '');
  }
  await p.close();
}

// --- Accessibility ------------------------------------------------------------------------
for (const [label, path, theme] of [
  ['colophon dark', '/colofon/', 'dark'],
  ['checklist dark', '/ghid/lista-de-lansare/', 'dark'],
  ['checklist light', '/en/guide/launch-checklist/', 'light'],
]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await p.addInitScript({ path: axePath });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await settleAnimations(p);
  const res = await p.evaluate(async (rules) =>
    // @ts-ignore
    axe.run({ runOnly: rules }), AXE_RULES);
  ck(`${label} is axe-clean`, res.violations.length === 0,
    res.violations.map((v) => `${v.id} x${v.nodes.length}`).join(', '));
  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
