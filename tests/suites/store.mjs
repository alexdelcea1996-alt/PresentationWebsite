/**
 * The playable store demo.
 *
 * Exercised, not inspected: the page exists to prove the store works, so the
 * suite shops in it — picks variants, fills a basket, watches the delivery cost
 * appear, checks out, and comes back to find the basket where it left it.
 *
 * The arithmetic is asserted at every step. A store demo that quietly adds up
 * wrong is worse than no demo: it is a live illustration of the opposite of
 * what the service page promises.
 */
import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const STORE = 'demo-store-v1';
const VIEWPORT = { viewport: { width: 1440, height: 1100 } };

/** Seed catalogue: Ethiopia 45/155, Brazil 38/130, Colombia 42/(sold out), Kenya 52, House 34/115, Decaf (sold out). */
const DELIVERY = 20;
const FREE_OVER = 250;
const CASH_FEE = 5;

const amount = (text) => Number(text.replace(/[^\d]/g, ''));

async function open(path, options = {}) {
  const p = await b.newPage({ ...VIEWPORT, ...options });
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`),
    );
  });
  await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-store-catalogue] li').length > 0, null, {
    timeout: 5000,
  });
  return p;
}

const totals = async (p) => ({
  lines: await p.locator('[data-store-lines] li').count(),
  subtotal: amount(await p.locator('[data-store-subtotal]').innerText()),
  delivery: (await p.locator('[data-store-delivery]').innerText()).trim(),
  total: amount(await p.locator('[data-store-total]').innerText()),
});

// --- Both locales: catalogue, stock, basket maths -----------------------------
for (const [label, path, currency, freeWord] of [
  ['RO', '/demo/magazin/', 'lei', 'gratuită'],
  ['EN', '/en/demo/store/', 'RON', 'free'],
]) {
  const p = await open(path);

  ck(`${label}: six products render`, (await p.locator('[data-store-catalogue] li').count()) === 6);
  ck(
    `${label}: the basket starts empty and checkout is closed off`,
    (await p.locator('[data-store-empty]').isVisible()) &&
      (await p.locator('[data-store-checkout-btn]').isDisabled()),
  );
  ck(`${label}: no totals are shown for an empty basket`, !(await p.locator('[data-store-totals]').isVisible()));

  // A sold-out product cannot be bought — the claim on the service page.
  const decaf = p.locator('[data-store-catalogue] li').nth(5);
  ck(`${label}: a sold-out product cannot be added`, await decaf.locator('[data-add]').isDisabled());
  ck(
    `${label}: and it says why`,
    (await decaf.innerText()).toLocaleLowerCase('ro').includes(label === 'RO' ? 'epuizat' : 'out of stock'),
  );

  // A sold-out *variant* of an otherwise available product.
  const colombia = p.locator('[data-store-catalogue] li').nth(2);
  ck(`${label}: its available variant can be bought`, !(await colombia.locator('[data-add]').isDisabled()));
  await colombia.locator('[data-variant="1"]').click();
  ck(
    `${label}: switching to the sold-out variant blocks the button`,
    await colombia.locator('[data-add]').isDisabled(),
  );
  ck(
    `${label}: the variant chip shows as chosen`,
    (await colombia.locator('[data-variant="1"]').getAttribute('aria-pressed')) === 'true',
  );
  await colombia.locator('[data-variant="0"]').click();

  // Add one Ethiopia 250 g at 45.
  await p.locator('[data-add="0"]').click();
  let t = await totals(p);
  ck(`${label}: the first item lands in the basket`, t.lines === 1 && t.subtotal === 45, `${t.subtotal}`);
  ck(
    `${label}: delivery is priced immediately, not at the end`,
    t.delivery.includes(String(DELIVERY)) && t.total === 45 + DELIVERY,
    `${t.delivery} / ${t.total}`,
  );
  ck(
    `${label}: it says how far off free delivery is`,
    amount(await p.locator('[data-store-progress]').innerText()) === FREE_OVER - 45,
    await p.locator('[data-store-progress]').innerText(),
  );

  // Quantity controls.
  await p.locator('[data-store-lines] li').first().locator('button').last().click();
  t = await totals(p);
  ck(`${label}: adding one more doubles the line`, t.subtotal === 90 && t.lines === 1, `${t.subtotal}`);
  await p.locator('[data-store-lines] li').first().locator('button').first().click();
  t = await totals(p);
  ck(`${label}: taking one off halves it again`, t.subtotal === 45, `${t.subtotal}`);

  // Stock is finite: Kenya has three, and the fourth press must not happen.
  for (let i = 0; i < 5; i += 1) {
    const button = p.locator('[data-add="3"]');
    if (await button.isDisabled()) break;
    await button.click();
  }
  const kenya = await p.locator('[data-store-lines] li').nth(1).innerText();
  ck(`${label}: stock caps the quantity`, /\b3\b/.test(kenya), kenya.replace(/\n/g, ' '));
  ck(`${label}: and the button locks once it is gone`, await p.locator('[data-add="3"]').isDisabled());

  // 45 + 156 = 201, still short of free delivery.
  t = await totals(p);
  ck(`${label}: the running total adds up`, t.subtotal === 45 + 52 * 3, `${t.subtotal}`);
  ck(`${label}: still paying for delivery under the threshold`, t.total === t.subtotal + DELIVERY);

  // Cross the threshold: one House blend at 34 takes it to 235, two to 269.
  await p.locator('[data-add="4"]').click();
  await p.locator('[data-add="4"]').click();
  t = await totals(p);
  ck(
    `${label}: over the threshold delivery becomes free`,
    t.subtotal === 269 && t.delivery.includes(freeWord) && t.total === 269,
    `${t.subtotal} / ${t.delivery} / ${t.total}`,
  );
  ck(
    `${label}: and it says so`,
    (await p.locator('[data-store-progress]').innerText()).length > 0 &&
      !/\d/.test(await p.locator('[data-store-progress]').innerText()),
    await p.locator('[data-store-progress]').innerText(),
  );

  ck(`${label}: money carries the currency`, (await p.locator('[data-store-total]').innerText()).includes(currency));

  const csp = await p.evaluate(() => window.__csp ?? []);
  ck(`${label}: no CSP violation while shopping`, csp.length === 0, csp.slice(0, 2).join(' | '));

  await p.close();
}

// --- Checkout ------------------------------------------------------------------
{
  const p = await open('/demo/magazin/');
  await p.locator('[data-add="0"]').click();
  const before = await totals(p);

  await p.locator('[data-store-checkout-btn]').click();
  ck('checkout opens on one screen', await p.locator('[data-store-checkout]').isVisible());
  ck('the catalogue steps aside', !(await p.locator('[data-store-catalogue]').isVisible()));
  ck('the basket stays in view', await p.locator('[data-store-totals]').isVisible());
  ck(
    'focus lands in the first field',
    await p.evaluate(() => document.activeElement?.getAttribute('name') === 'name'),
  );
  ck('there are four fields and no account', (await p.locator('[data-store-checkout] input[type]:not([type=radio])').count()) === 4);

  // Cash on delivery costs what it says it costs, and says it before the order.
  await p.locator('[data-store-checkout] [value="cash"]').check();
  let t = await totals(p);
  ck(
    'cash on delivery adds its fee to the total',
    t.total === before.total + CASH_FEE && (await p.locator('[data-store-fee-row]').isVisible()),
    `${t.total} vs ${before.total}`,
  );
  await p.locator('[data-store-checkout] [value="card"]').check();
  t = await totals(p);
  ck(
    'switching back to card removes it again',
    t.total === before.total && !(await p.locator('[data-store-fee-row]').isVisible()),
    `${t.total}`,
  );

  // Required fields are required.
  await p.locator('[data-store-checkout] button[type="submit"]').click();
  ck('an empty form is refused', await p.locator('[data-store-checkout]').isVisible());

  for (const [name, value] of [
    ['name', 'Test Testescu'],
    ['phone', '0721 000 111'],
    ['city', 'Cluj-Napoca'],
    ['address', 'Str. Exemplu 1'],
  ]) {
    await p.fill(`[data-store-checkout] [name="${name}"]`, value);
  }
  await p.locator('[data-store-checkout] button[type="submit"]').click();

  ck('the confirmation is shown', await p.locator('[data-store-done]').isVisible());
  ck('it carries an order number', /#\d+/.test(await p.locator('[data-store-order-id]').innerText()));
  ck('it lists what happens next', (await p.locator('[data-store-done] li').count()) === 3);
  ck(
    'focus moves to the confirmation',
    await p.evaluate(() => document.activeElement?.tagName === 'H2'),
  );
  ck('the basket is emptied', await p.locator('[data-store-empty]').isVisible());
  ck('checkout locks again', await p.locator('[data-store-checkout-btn]').isDisabled());

  await p.locator('[data-store-again]').click();
  ck('you can shop again', await p.locator('[data-store-catalogue]').isVisible());

  // Going back from checkout must not lose the basket.
  await p.locator('[data-add="1"]').click();
  await p.locator('[data-store-checkout-btn]').click();
  await p.locator('[data-store-back]').click();
  ck(
    'stepping back keeps the basket',
    (await p.locator('[data-store-lines] li').count()) === 1 &&
      (await p.locator('[data-store-catalogue]').isVisible()),
  );

  await p.close();
}

// --- It survives a reload, and recovers from nonsense --------------------------
{
  const p = await open('/demo/magazin/');
  await p.locator('[data-add="0"]').click();
  await p.locator('[data-add="1"]').click();
  const before = await totals(p);

  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-store-catalogue] li').length > 0);
  const after = await totals(p);
  ck(
    'the basket survives a reload',
    after.lines === before.lines && after.subtotal === before.subtotal,
    `${after.subtotal} vs ${before.subtotal}`,
  );

  // A line pointing at a product that no longer exists must be dropped, not crash.
  await p.evaluate(
    (store) => localStorage.setItem(store, JSON.stringify([{ product: 99, variant: 0, qty: 1 }])),
    STORE,
  );
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-store-catalogue] li').length > 0);
  ck('a line for a vanished product is dropped', await p.locator('[data-store-empty]').isVisible());

  await p.evaluate((store) => localStorage.setItem(store, 'not json at all'), STORE);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-store-catalogue] li').length > 0);
  ck('corrupt storage falls back to an empty basket', await p.locator('[data-store-empty]').isVisible());

  await p.locator('[data-add="0"]').click();
  await p.locator('[data-store-reset]').click();
  ck('reset empties the basket', await p.locator('[data-store-empty]').isVisible());

  await p.evaluate((store) => localStorage.removeItem(store), STORE);
  await p.close();
}

// --- The two demos know about each other ----------------------------------------
for (const [label, here, there, current] of [
  ['RO', '/demo/magazin/', '/demo/', 'store'],
  ['EN', '/en/demo/store/', '/en/demo/', 'store'],
  ['RO', '/demo/', '/demo/magazin/', 'bookings'],
  ['EN', '/en/demo/', '/en/demo/store/', 'bookings'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${here}`, { waitUntil: 'domcontentloaded' });
  const tabs = p.locator('[data-demo-tab]');
  ck(`${label} ${here}: both demos are offered`, (await tabs.count()) === 2);
  ck(
    `${label} ${here}: this one is marked as current`,
    (await p.locator(`[data-demo-tab="${current}"]`).getAttribute('aria-current')) === 'page',
  );
  const other = await p.locator(`[data-demo-tab]:not([aria-current])`).getAttribute('href');
  ck(`${label} ${here}: the other one is one click away`, other === there, String(other));
  await p.close();
}

// --- Neither demo weighs on the landing page ------------------------------------
{
  const p = await b.newPage(VIEWPORT);
  const scripts = [];
  p.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  ck('the landing page loads no demo bundle', scripts.length === 0, scripts.join(' '));
  ck(
    'both service cards offer their own demo',
    (await p.locator('[data-demo-cta]').count()) === 2,
    `${await p.locator('[data-demo-cta]').count()}`,
  );
  const targets = await p.$$eval('[data-demo-cta]', (nodes) => nodes.map((n) => n.getAttribute('href')));
  ck('and they point at different ones', new Set(targets).size === 2, targets.join(' '));
  await p.close();
}

// --- The online-store page sends people to the store demo ------------------------
for (const [label, service, demo] of [
  ['RO', '/servicii/magazin-online/', '/demo/magazin/'],
  ['EN', '/en/services/online-store/', '/en/demo/store/'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${service}`, { waitUntil: 'domcontentloaded' });
  ck(`${label}: the store page offers a demo`, (await p.locator('[data-demo-cta]').count()) === 1);
  await p.locator('[data-demo-cta]').click();
  await p.waitForURL(`**${demo}`, { timeout: 5000 }).catch(() => {});
  ck(`${label}: it reaches the store demo`, new URL(p.url()).pathname === demo, p.url());
  await p.close();
}

// --- Without JavaScript ----------------------------------------------------------
{
  const p = await b.newPage({ ...VIEWPORT, javaScriptEnabled: false });
  await p.goto(`${BASE}/demo/magazin/`, { waitUntil: 'domcontentloaded' });
  ck('the app is hidden without JS', !(await p.locator('[data-store-demo]').isVisible()));
  ck('the fallback note is shown', await p.locator('.no-js-only').isVisible());
  ck('the page still has its heading', (await p.locator('h1').count()) === 1);
  await p.close();
}

// --- Accessibility ----------------------------------------------------------------
for (const [label, path] of [
  ['RO', '/demo/magazin/'],
  ['EN', '/en/demo/store/'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.addInitScript({ path: axePath });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await p.waitForFunction(() => document.querySelectorAll('[data-store-catalogue] li').length > 0);
  await settleAnimations(p);

  const catalogue = await runAxe(p, '[data-store-demo]');
  ck(`${label}: the catalogue is axe-clean`, catalogue.violations.length === 0,
    catalogue.violations.map((v) => v.id).join(', '));

  await p.locator('[data-add="0"]').click();
  await p.locator('[data-store-checkout-btn]').click();
  const form = await runAxe(p, '[data-store-demo]');
  ck(`${label}: the checkout is axe-clean`, form.violations.length === 0,
    form.violations.map((v) => v.id).join(', '));

  const unnamed = await p.$$eval('[data-store-demo] button', (buttons) =>
    buttons.filter((el) => !el.textContent.trim() && !el.getAttribute('aria-label')).length,
  );
  ck(`${label}: every button has an accessible name`, unnamed === 0, `${unnamed} without`);

  const page = await runAxe(p);
  ck(`${label}: the whole page is axe-clean`, page.violations.length === 0,
    page.violations.map((v) => v.id).join(', '));
  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
