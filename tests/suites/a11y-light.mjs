import { launch, BASE, axePath, checks, settleAnimations } from '../harness.mjs';

const check = checks();
const browser = await launch();

for (const [label, path] of [
  ['home', '/'],
  ['service', '/servicii/site-de-prezentare/'],
  ['blog index', '/blog/'],
  ['post', '/blog/de-ce-se-incarca-greu-site-ul-tau/'],
  ['post with a table', '/blog/landing-page-sau-site-de-prezentare/'],
  ['thanks', '/multumesc/'],
  ['landing demo', '/demo/landing-page/'],
  ['site demo', '/demo/site-de-prezentare/'],
  ['case study', '/studii-de-caz/acest-site/'],
  ['privacy', '/confidentialitate/'],
  ['demo', '/demo/'],
  ['store demo', '/demo/magazin/'],
]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  await page.addInitScript({ path: axePath });
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await settleAnimations(page);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  const result = await page.evaluate(async () =>
    // @ts-ignore
    axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }),
  );
  // Assert the theme actually resolved to light, or the whole run proves nothing.
  check(`light theme applied on ${label}`, theme === 'light', `data-theme=${theme}`);
  const summary = result.violations.map((v) => `${v.id} (${v.impact})`).join(', ');
  check(`light: ${label}`, result.violations.length === 0, summary);
  for (const v of result.violations) {
    for (const n of v.nodes.slice(0, 4)) console.log(`      ${n.html.slice(0, 110)}`);
  }
  await page.close();
}
await browser.close();
check.report();
