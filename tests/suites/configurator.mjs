import { launch, BASE } from '../harness.mjs';
import { mkdirSync } from 'node:fs';
// Debug screenshots, handy when a check fails. Gitignored.
const out = new URL('../screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await launch();
const results = [];
const check = (name, pass, detail = '') =>
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on('pageerror', (e) => consoleErrors.push(e.message));
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

const cfg = page.locator('[data-configurator]');
check('configurator renders when JS is on', await cfg.isVisible());

// --- Step 1 gating ---
const next = cfg.locator('[data-action="next"]');
check('next is blocked before a type is chosen', await next.isDisabled());

await cfg.locator('input[data-type-input][value="presentation"]').check({ force: true });
check('next unlocks after choosing a type', !(await next.isDisabled()));

// --- Feature filtering ---
await next.click();
await page.waitForTimeout(250);

const visibleFeatures = await cfg.evaluate((root) =>
  Array.from(root.querySelectorAll('[data-feature-card]'))
    .filter((card) => !card.hidden)
    .map((card) => card.dataset.featureCard)
    .sort(),
);
check(
  'only add-ons valid for a business site are offered',
  JSON.stringify(visibleFeatures) ===
    JSON.stringify(['blog', 'booking', 'cms', 'copywriting', 'maintenance', 'multilang', 'seo']),
  visibleFeatures.join(','),
);
const hiddenShopOnly = await cfg.evaluate(
  (root) => root.querySelector('[data-feature-card="payments"]').hidden,
);
check('shop-only add-ons stay hidden', hiddenShopOnly);

// --- Estimate maths: 900 base + 500 cms + 350 blog = 1750; high = round50(1750*1.3)=2300 ---
await cfg.locator('input[data-feature-input][value="cms"]').check({ force: true });
await cfg.locator('input[data-feature-input][value="blog"]').check({ force: true });
await next.click();
await page.waitForTimeout(300);

const priceText = (await cfg.locator('[data-result-price]').textContent()).trim();
const timeText = (await cfg.locator('[data-result-time]').textContent()).trim();
const [lowText, highText] = priceText.split('–').map((part) => part.replace(/\D/g, ''));
check('price range is computed correctly', lowText === '1750' && highText === '2300', priceText);
check('price uses the € symbol, not the ISO code', priceText.includes('€') && !priceText.includes('EUR'), priceText);
check('timeline is shown', /\d+–\d+/.test(timeText), timeText);

const summary = await cfg.locator('[data-result-summary] li').allTextContents();
check(
  'summary lists the picks',
  summary.length === 3 && summary.some((s) => s.includes('blog') || s.includes('Blog')),
  summary.join(' | '),
);

await page.screenshot({ path: `${out}/configurator-result.png`, clip: await cfg.boundingBox() });

// --- Prefill into the contact form ---
await cfg.locator('[data-action="send"]').click();
await page.waitForTimeout(700);

const typeValue = await page.locator('#field-type').inputValue();
const budgetValue = await page.locator('#field-budget').inputValue();
const messageValue = await page.locator('#field-message').inputValue();

check('contact form preselects the project type', typeValue === 'Site de prezentare', typeValue);
check('contact form preselects a matching budget', budgetValue === '1.500 – 3.000 €', budgetValue);
check(
  'message is prefilled with the picks and the estimate',
  messageValue.includes('Site de prezentare') &&
    messageValue.includes('Interval de preț') &&
    !messageValue.includes('{details}'),
  messageValue.slice(0, 60).replace(/\n/g, ' '),
);

// --- Changing type clears now-invalid add-ons ---
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await cfg.locator('input[data-type-input][value="presentation"]').check({ force: true });
await cfg.locator('[data-action="next"]').click();
await cfg.locator('input[data-feature-input][value="blog"]').check({ force: true });
await cfg.locator('[data-action="back"]').click();
await cfg.locator('input[data-type-input][value="shop"]').check({ force: true });
const blogStillChecked = await cfg
  .locator('input[data-feature-input][value="blog"]')
  .isChecked();
check('switching project type drops inapplicable add-ons', !blogStillChecked);

// --- Restart ---
await cfg.locator('[data-action="next"]').click();
await cfg.locator('[data-action="next"]').click();
await page.waitForTimeout(200);
await cfg.locator('[data-action="restart"]').click();
await page.waitForTimeout(200);
const anyTypeChecked = await cfg.evaluate((root) =>
  Array.from(root.querySelectorAll('[data-type-input]')).some((i) => i.checked),
);
check('restart clears every選 selection', !anyTypeChecked);

// --- Audit lead magnet ---
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.locator('[data-audit-cta]').click();
await page.waitForTimeout(900);
const auditType = await page.locator('#field-type').inputValue();
check('audit CTA preselects the audit option', auditType.includes('Audit'), auditType);
const focused = await page.evaluate(() => document.activeElement?.id);
check('audit CTA focuses the website field', focused === 'field-website', String(focused));

// --- Comparison section is present in both layouts ---
const rowsDesktop = await page.locator('#comparison table tbody tr').count();
const cardsMobile = await page.locator('#comparison .md\\:hidden article').count();
check('comparison table has all rows', rowsDesktop === 9, `${rowsDesktop} (8 + spacer)`);
check('comparison has a mobile card per row', cardsMobile === 8, String(cardsMobile));

check('no page errors', consoleErrors.length === 0, consoleErrors.join(' | '));

console.log(results.join('\n'));
await browser.close();

if (results.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
