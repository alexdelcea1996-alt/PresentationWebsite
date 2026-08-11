import { launch, BASE } from '../harness.mjs';
const b = await launch();
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);

const pages = ['/', '/en/', '/servicii/site-de-prezentare/', '/blog/',
  '/blog/de-ce-se-incarca-greu-site-ul-tau/', '/studii-de-caz/acest-site/'];

let totalViolations = 0;
for (const path of pages) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const violations = [];
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI} ${(e.sourceFile||'')}`));
  });
  p.on('console', (m) => { if (m.type() === 'error') violations.push('console: ' + m.text().slice(0, 120)); });
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  violations.push(...(await p.evaluate(() => window.__csp ?? [])));
  totalViolations += violations.length;
  ck(`no CSP violation on ${path}`, violations.length === 0, violations.slice(0, 3).join(' | '));
  await p.close();
}

// The scripts that CSP would most plausibly have broken must still work.
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
ck('pre-paint theme script ran', (await p.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
await p.locator('[data-theme-toggle]').first().click();
await p.waitForTimeout(200);
ck('theme toggle still works under CSP', (await p.evaluate(() => document.documentElement.dataset.theme)) === 'light');

const cfg = p.locator('[data-configurator]');
await cfg.locator('input[data-type-input][value="presentation"]').check({ force: true });
await cfg.locator('[data-action="next"]').click();
await cfg.locator('[data-action="next"]').click();
await p.waitForTimeout(300);
ck('configurator still computes under CSP',
  /\d/.test(await cfg.locator('[data-result-price]').textContent()),
  (await cfg.locator('[data-result-price]').textContent()).trim());

ck('fonts loaded from own origin',
  (await p.evaluate(() => performance.getEntriesByType('resource')
     .filter((r) => r.name.includes('.woff2')).every((r) => new URL(r.name).origin === location.origin))));

console.log(R.join('\n'));
console.log(`\ntotal violations: ${totalViolations}`);
await b.close();
if (totalViolations || R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
