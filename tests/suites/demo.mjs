/**
 * The playable bookings demo.
 *
 * This one is exercised rather than inspected: the point of the page is that it
 * *works*, so the suite plays it — adds a booking, marks someone as arrived,
 * cancels, reinstates, deletes — and checks the numbers after each move. It also
 * covers the two things that only break for a returning visitor: state that
 * survives a reload, and a saved board that was anchored to an older day.
 */
import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const STORE = 'demo-bookings-v1';
const VIEWPORT = { viewport: { width: 1440, height: 1000 } };

/** Seed day 0: Maria (arrived, 220), Andrei (80), Elena (150), Cristina (cancelled, 90). */
const TODAY_LIVE = 3;
const TODAY_TAKINGS = 450;

const digits = (text) => Number(text.replace(/[^\d]/g, ''));

async function open(path, options = {}) {
  const p = await b.newPage({ ...VIEWPORT, ...options });
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`),
    );
  });
  await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-demo-list] li').length > 0, null, {
    timeout: 5000,
  });
  return p;
}

const stats = async (p) => ({
  rows: await p.locator('[data-demo-list] li').count(),
  count: digits(await p.locator('[data-demo-count]').innerText()),
  revenue: digits(await p.locator('[data-demo-revenue]').innerText()),
});

// --- Both locales: it renders, it counts, it filters, it navigates -----------
for (const [label, path, currency, addLabel] of [
  ['RO', '/demo/', 'lei', 'Adaugă programare'],
  ['EN', '/en/demo/', 'RON', 'Add a booking'],
]) {
  const p = await open(path);

  const first = await stats(p);
  ck(`${label}: the seeded day renders`, first.rows === 4, `${first.rows} rows`);
  ck(`${label}: cancelled bookings are not counted`, first.count === TODAY_LIVE, `${first.count}`);
  ck(
    `${label}: cancelled bookings are not takings`,
    first.revenue === TODAY_TAKINGS,
    `${first.revenue} (cancelled 90 must be excluded)`,
  );
  ck(
    `${label}: money carries the currency`,
    (await p.locator('[data-demo-revenue]').innerText()).includes(currency),
  );
  ck(`${label}: the add button is labelled`, (await p.locator('[data-demo-add]').innerText()).trim() === addLabel);

  // The stats read as a description list, so the term has to precede the value
  // even though the value is painted above it.
  const dlOrder = await p.$$eval('[data-booking-demo] dl > div', (groups) =>
    groups.map((g) => [...g.children].map((c) => c.tagName.toLowerCase()).join('-')),
  );
  ck(`${label}: the stats are a well-formed list`, dlOrder.join() === 'dt-dd,dt-dd', dlOrder.join(' '));

  const times = await p.locator('[data-demo-list] > li > p:first-child').allInnerTexts();
  ck(
    `${label}: rows are in time order`,
    times.join() === [...times].sort().join(),
    times.join(' '),
  );

  // Filters
  for (const [key, expected] of [
    ['confirmed', 2],
    ['arrived', 1],
    ['cancelled', 1],
    ['all', 4],
  ]) {
    await p.click(`[data-demo-filter="${key}"]`);
    const rows = await p.locator('[data-demo-list] li').count();
    const pressed = await p.getAttribute(`[data-demo-filter="${key}"]`, 'aria-pressed');
    ck(`${label}: filter "${key}" shows ${expected}`, rows === expected && pressed === 'true', `${rows} rows`);
  }
  const pressedCount = await p.locator('[data-demo-filter][aria-pressed="true"]').count();
  ck(`${label}: exactly one filter is pressed`, pressedCount === 1, `${pressedCount}`);

  // Day navigation — tomorrow holds two bookings worth 300.
  await p.click('[data-demo-next]');
  const tomorrow = await stats(p);
  ck(
    `${label}: tomorrow has its own bookings`,
    tomorrow.rows === 2 && tomorrow.count === 2 && tomorrow.revenue === 300,
    `${tomorrow.rows} rows / ${tomorrow.count} / ${tomorrow.revenue}`,
  );
  ck(`${label}: the day offset is shown`, (await p.locator('[data-demo-relative]').innerText()).trim() === '+1');

  // Two days out is empty, and says so instead of showing a blank panel.
  await p.click('[data-demo-next]');
  await p.click('[data-demo-next]');
  ck(
    `${label}: an empty day explains itself`,
    (await p.locator('[data-demo-list] li').count()) === 0 &&
      (await p.locator('[data-demo-empty]').isVisible()),
  );

  const cspHere = await p.evaluate(() => window.__csp ?? []);
  ck(`${label}: no CSP violation while playing`, cspHere.length === 0, cspHere.slice(0, 2).join(' | '));

  await p.close();
}

// --- Adding, and what happens to focus ---------------------------------------
{
  const p = await open('/demo/');
  const before = await stats(p);

  ck('the form starts closed', !(await p.locator('[data-demo-form]').isVisible()));
  await p.click('[data-demo-add]');
  ck(
    'opening the form is announced',
    (await p.getAttribute('[data-demo-add]', 'aria-expanded')) === 'true',
  );
  ck('the form is open', await p.locator('[data-demo-form]').isVisible());
  ck(
    'focus lands in the first field',
    await p.evaluate(() => document.activeElement?.getAttribute('name') === 'name'),
  );

  await p.fill('[data-demo-form] [name="name"]', 'Test Testescu');
  await p.fill('[data-demo-form] [name="time"]', '08:00');
  await p.fill('[data-demo-form] [name="price"]', '130');
  await p.click('[data-demo-form] button[type="submit"]');

  const after = await stats(p);
  ck('the booking is added', after.rows === before.rows + 1, `${after.rows}`);
  ck('the stats follow', after.count === before.count + 1 && after.revenue === before.revenue + 130,
    `${after.count} / ${after.revenue}`);
  ck('the form closes again', !(await p.locator('[data-demo-form]').isVisible()));
  ck(
    'focus returns to the button that opened it',
    await p.evaluate(() => document.activeElement?.hasAttribute('data-demo-add')),
  );
  ck(
    'it sorts into place by time',
    (await p.locator('[data-demo-list] li').first().innerText()).includes('Test Testescu'),
  );

  // Escape closes without saving.
  await p.click('[data-demo-add]');
  await p.fill('[data-demo-form] [name="name"]', 'Never Saved');
  await p.press('[data-demo-form] [name="name"]', 'Escape');
  ck('Escape discards the form', !(await p.locator('[data-demo-form]').isVisible()));
  ck('nothing was added by Escape', (await p.locator('[data-demo-list] li').count()) === after.rows);

  // A required field cannot be skipped.
  await p.click('[data-demo-add]');
  await p.fill('[data-demo-form] [name="name"]', '');
  await p.click('[data-demo-form] button[type="submit"]');
  ck('an empty name is refused', await p.locator('[data-demo-form]').isVisible());
  await p.press('[data-demo-form] [name="name"]', 'Escape');

  await p.close();
}

// --- Statuses: arrive, cancel, reinstate, delete ------------------------------
{
  const p = await open('/demo/');
  const row = (n) => p.locator('[data-demo-list] li').nth(n);

  // Andrei, 11:00, confirmed, 80 — the second row of the seeded day.
  const andrei = row(1);
  ck('a confirmed booking offers arrive/cancel/delete', (await andrei.locator('button').count()) === 3);

  await andrei.locator('button').first().click();
  ck('marking arrived changes the badge', (await row(1).getAttribute('data-status')) === 'arrived');
  const afterArrive = await stats(p);
  ck('arriving does not change the takings', afterArrive.revenue === TODAY_TAKINGS, `${afterArrive.revenue}`);
  ck('an arrived booking drops the arrive action', (await row(1).locator('button').count()) === 2);

  // Cancel it: out of the count and out of the takings, still on the list.
  await row(1).locator('button').first().click();
  const afterCancel = await stats(p);
  ck(
    'cancelling removes it from the count and the takings',
    afterCancel.rows === 4 && afterCancel.count === TODAY_LIVE - 1 && afterCancel.revenue === TODAY_TAKINGS - 80,
    `${afterCancel.count} / ${afterCancel.revenue}`,
  );
  ck('a cancelled booking offers reinstate/delete', (await row(1).locator('button').count()) === 2);

  await row(1).locator('button').first().click();
  const afterRestore = await stats(p);
  ck(
    'reinstating puts it back',
    (await row(1).getAttribute('data-status')) === 'confirmed' &&
      afterRestore.count === TODAY_LIVE &&
      afterRestore.revenue === TODAY_TAKINGS,
    `${afterRestore.count} / ${afterRestore.revenue}`,
  );

  await row(1).locator('button').last().click();
  const afterDelete = await stats(p);
  ck(
    'deleting removes the row',
    afterDelete.rows === 3 && afterDelete.count === TODAY_LIVE - 1,
    `${afterDelete.rows} rows`,
  );

  // --- It survives a reload ---------------------------------------------------
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-demo-list] li').length > 0);
  const reloaded = await stats(p);
  ck(
    'the change survives a reload',
    reloaded.rows === 3 && reloaded.count === TODAY_LIVE - 1,
    `${reloaded.rows} rows`,
  );

  // --- Reset puts the seed back -----------------------------------------------
  await p.click('[data-demo-filter="arrived"]');
  await p.click('[data-demo-reset]');
  const reset = await stats(p);
  ck('reset restores the seeded day', reset.rows === 4 && reset.revenue === TODAY_TAKINGS, `${reset.rows} rows`);
  ck(
    'reset clears the filter too',
    (await p.getAttribute('[data-demo-filter="all"]', 'aria-pressed')) === 'true',
  );

  await p.close();
}

// --- A board saved days ago still lands on a populated today ------------------
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/demo/`, { waitUntil: 'domcontentloaded' });
  await p.evaluate(
    ([store, anchor]) =>
      localStorage.setItem(
        store,
        JSON.stringify({
          anchor,
          bookings: [
            { id: 'old-1', name: 'Veche Rezervare', phone: '', service: 0, time: '10:00',
              duration: 30, price: 111, status: 'confirmed', date: anchor },
          ],
        }),
      ),
    [
      STORE,
      // Nine days ago, local time.
      (() => {
        const d = new Date();
        d.setDate(d.getDate() - 9);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })(),
    ],
  );
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-demo-list] li').length > 0);
  const rolled = await stats(p);
  ck(
    'a board saved nine days ago rolls forward to today',
    rolled.rows === 1 && rolled.revenue === 111,
    `${rolled.rows} rows / ${rolled.revenue}`,
  );

  // --- Corrupt storage falls back to the seed rather than breaking -------------
  await p.evaluate((store) => localStorage.setItem(store, '{ not json'), STORE);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-demo-list] li').length > 0);
  ck('corrupt storage falls back to the seed', (await stats(p)).rows === 4);

  await p.evaluate((store) => localStorage.setItem(store, '{"anchor":5,"bookings":"nope"}'), STORE);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('[data-demo-list] li').length > 0);
  ck('storage of the wrong shape falls back to the seed', (await stats(p)).rows === 4);

  await p.evaluate((store) => localStorage.removeItem(store), STORE);
  await p.close();
}

// --- Without JavaScript it says so, instead of showing a dead panel -----------
{
  const p = await b.newPage({ ...VIEWPORT, javaScriptEnabled: false });
  await p.goto(`${BASE}/demo/`, { waitUntil: 'domcontentloaded' });
  ck('the app is hidden without JS', !(await p.locator('[data-booking-demo]').isVisible()));
  const note = p.locator('.no-js-only');
  ck('the fallback note is shown', await note.isVisible());
  ck('the fallback says the rest of the site works', (await note.innerText()).includes('JavaScript'));
  ck('the page still has its heading', (await p.locator('h1').count()) === 1);
  await p.close();
}

// --- It costs the landing page nothing ----------------------------------------
{
  const p = await b.newPage(VIEWPORT);
  const scripts = [];
  p.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  ck(
    'the demo bundle stays off the landing page',
    !scripts.some((url) => url.includes('BookingDemo')),
    scripts.join(' '),
  );
  ck('the landing page still loads no external script', scripts.length === 0, `${scripts.length}`);

  // The nav link is what carries people there.
  const link = p.locator(`a[href$="/demo/"]`);
  ck('the landing page links to the demo', (await link.count()) > 0, `${await link.count()} links`);
  await p.close();
}

// --- Accessibility ------------------------------------------------------------
for (const [label, path] of [
  ['RO', '/demo/'],
  ['EN', '/en/demo/'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.addInitScript({ path: axePath });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await p.waitForFunction(() => document.querySelectorAll('[data-demo-list] li').length > 0);
  await settleAnimations(p);

  const closed = await runAxe(p, '[data-booking-demo]');
  ck(`${label}: the app is axe-clean`, closed.violations.length === 0,
    closed.violations.map((v) => v.id).join(', '));

  // Again with the form open — a whole set of fields axe never saw above.
  await p.click('[data-demo-add]');
  const open = await runAxe(p, '[data-booking-demo]');
  ck(`${label}: the form is axe-clean`, open.violations.length === 0,
    open.violations.map((v) => v.id).join(', '));

  // Every icon-only button must carry a name; a title attribute alone is not one.
  const unnamed = await p.$$eval('[data-booking-demo] button', (buttons) =>
    buttons.filter((el) => !el.textContent.trim() && !el.getAttribute('aria-label')).length,
  );
  ck(`${label}: every icon button has an accessible name`, unnamed === 0, `${unnamed} without`);

  const page = await runAxe(p);
  ck(`${label}: the whole page is axe-clean`, page.violations.length === 0,
    page.violations.map((v) => v.id).join(', '));

  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
