import { launch, BASE } from '../harness.mjs';
import { mkdirSync } from 'node:fs';
// Debug screenshots, handy when a check fails. Gitignored.
const out = new URL('../screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await launch();
const results = [];
const check = (name, pass, detail = '') =>
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);

// --- Mobile menu ---
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const menu = mobile.locator('[data-mobile-menu]');
check('mobile menu starts hidden', await menu.isHidden());
await mobile.locator('[data-menu-toggle]').click();
await mobile.waitForTimeout(200);
check('mobile menu opens on tap', await menu.isVisible());
await mobile.screenshot({ path: `${out}/mobile-menu.png` });
await mobile.locator('[data-mobile-menu] [data-menu-link]').first().click();
await mobile.waitForTimeout(300);
check('mobile menu closes after navigating', await menu.isHidden());
await mobile.keyboard.press('Escape');

// --- Language switcher carries the hash ---
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(`${BASE}/#pricing`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(400);
const enHref = await desktop
  .locator('[data-lang-switcher] a:not([aria-current])')
  .first()
  .getAttribute('href');
check('language switch keeps the anchor', enHref?.endsWith('/en/#pricing') ?? false, String(enHref));

// --- Anchor navigation actually lands on the section ---
await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle' });
// Header anchors are absolute (`/#pricing`) so they also work from sub-pages.
await desktop.locator('header nav a[href$="#pricing"]').first().click();
await desktop.waitForTimeout(900);
const pricingTop = await desktop.evaluate(
  () => document.getElementById('pricing')?.getBoundingClientRect().top ?? -999,
);
// Header is ~72px tall; the section heading must clear it and stay on screen.
check('anchor clears the sticky header', pricingTop >= 0 && pricingTop < 140, `top=${Math.round(pricingTop)}px`);

// --- Contact form: mailto fallback when no form service is configured ---
await desktop.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
const accessKey = await desktop.locator('[data-contact-form]').getAttribute('data-access-key');
check('no form key configured yet (mailto fallback path)', accessKey === '', `key="${accessKey}"`);

await desktop.locator('#field-name').fill('Test SRL');
await desktop.locator('#field-email').fill('test@example.com');
await desktop.locator('#field-message').fill('Vreau un site de prezentare.');
await desktop.locator('[data-submit]').click();
await desktop.waitForTimeout(500);
check(
  'mailto fallback confirms to the visitor',
  await desktop.locator('[data-form-success]').isVisible(),
);

// --- Contact form: the real Web3Forms path, once a key is configured ---
await desktop.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
let posted = null;
await desktop.route('https://api.web3forms.com/submit', async (route) => {
  posted = route.request().postData();
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
});
await desktop.evaluate(() => {
  document.querySelector('[data-contact-form]').dataset.accessKey = 'test-key-123';
});
await desktop.locator('#field-name').fill('Test SRL');
await desktop.locator('#field-email').fill('test@example.com');
await desktop.locator('#field-message').fill('Vreau un site de prezentare.');
await desktop.locator('[data-submit]').click();
await desktop.waitForTimeout(700);

check('form posts to Web3Forms when a key is set', posted !== null);
for (const field of ['test-key-123', 'Test SRL', 'test@example.com', 'Site de prezentare']) {
  check(`  payload carries "${field}"`, (posted ?? '').includes(field));
}
check('success message shown', await desktop.locator('[data-form-success]').isVisible());
check('form cleared after a successful send', (await desktop.locator('#field-name').inputValue()) === '');

// --- Required-field validation blocks an empty submit ---
await desktop.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
await desktop.locator('[data-submit]').click();
await desktop.waitForTimeout(300);
const emptyStillHidden = await desktop.locator('[data-form-success]').isHidden();
check('empty form does not report success', emptyStillHidden);

console.log(results.join('\n'));
await browser.close();

if (results.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
