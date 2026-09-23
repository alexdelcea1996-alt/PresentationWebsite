import { launch, BASE } from '../harness.mjs';
const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

// Pin the OS scheme so the theme assertion below is deterministic.
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) =>
    window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
});
// cal.com is unreachable from here, so stub the frame with a local page.
await p.route('https://cal.com/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>stub calendar</h1>' }));

await p.goto(BASE + '/#contact', { waitUntil: 'networkidle' });

const trigger = p.locator('[data-booking-open]');
ck('booking card renders when a link is configured', await trigger.isVisible());

// Without JS, or with JS failing, this must still be a usable link.
ck(
  'trigger is a real link to the booking page',
  (await trigger.getAttribute('href')) === 'https://cal.com/delcea-alexandru-arqdvl/30min' &&
    (await trigger.getAttribute('target')) === '_blank',
  await trigger.getAttribute('href'),
);
ck(
  'external link is protected with rel=noopener',
  ((await trigger.getAttribute('rel')) ?? '').includes('noopener'),
);

const dialog = p.locator('[data-booking-dialog]');
const frame = p.locator('[data-booking-frame]');
// Not even built: an empty iframe still costs a browsing context, and with a
// booking link in every closing band that cost was on every page.
ck('no calendar frame exists before opening', (await frame.count()) === 0);
ck('dialog starts closed', !(await dialog.evaluate((d) => d.open)));

await trigger.click();
await p.waitForTimeout(500);
ck('click opens the modal instead of navigating', await dialog.evaluate((d) => d.open));
ck('we stayed on the page', new URL(p.url()).host === 'localhost:4331', p.url());

const src = await frame.getAttribute('src');
ck('iframe loads the booking page on demand', (src ?? '').startsWith('https://cal.com/delcea-alexandru-arqdvl/30min'), src);
ck('theme is passed to the calendar', (src ?? '').includes('theme=dark'), src);
ck('locale is passed to the calendar', (src ?? '').includes('embed-locale=ro'), src);

// Escape closes it: that comes free from <dialog>.showModal, but verify.
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
ck('Escape closes the modal', !(await dialog.evaluate((d) => d.open)));

// Reopening must not refetch.
await trigger.click();
await p.waitForTimeout(300);
ck('reopening reuses the loaded calendar',
  (await frame.count()) === 1 && (await frame.getAttribute('src')) === src);

// The escape hatch inside the modal, for the case where framing is refused.
const escapeLink = p.locator('[data-booking-dialog] a[target="_blank"]');
ck('modal offers an open-in-new-tab link', await escapeLink.isVisible());

await p.locator('[data-booking-close]').click();
await p.waitForTimeout(300);
ck('close button works', !(await dialog.evaluate((d) => d.open)));

// Modified clicks must keep the browser's own behaviour.
await p.keyboard.down('Control');
await trigger.click();
await p.keyboard.up('Control');
await p.waitForTimeout(300);
ck('ctrl-click is left to the browser', !(await dialog.evaluate((d) => d.open)));

ck('no CSP violations', (await p.evaluate(() => window.__csp)).length === 0,
  (await p.evaluate(() => window.__csp)).join(' | '));
ck('no page errors', errs.length === 0, errs.join(' | '));

// Switching theme while the calendar is already loaded must re-theme it,
// not leave it on the old palette.
await p.locator('[data-theme-toggle]').first().click();
await p.waitForTimeout(200);
await p.locator('[data-booking-open]').click();
await p.waitForTimeout(400);
const lightSrc = await p.locator('[data-booking-frame]').getAttribute('src');
const themeNow = await p.evaluate(() => document.documentElement.dataset.theme);
ck('light theme is passed through', (lightSrc ?? '').includes('theme=light'),
  `theme=${themeNow} src=${lightSrc}`);

// --- The closing bands offer the call too ---------------------------------------
/*
  The calendar used to exist in one place: at the bottom of the contact page,
  under the form. Somebody who would rather talk than type had to reach the
  last page of the site to find out that they could. Every closing band now
  carries it next to "ask for a quote" — and it has to be the same well-behaved
  thing it is on the contact page: a real link first, nothing fetched from the
  calendar until the click, the modal in the page's own language, one dialog
  per page however many links point at it.
*/
const BOOKING = 'https://cal.com/delcea-alexandru-arqdvl/30min';
for (const [label, path, where, lang] of [
  ['landing page', '/', 'next-step', 'ro'],
  ['pricing page', '/preturi/', 'next-step', 'ro'],
  ['English pricing page', '/en/pricing/', 'next-step', 'en'],
  ['service page', '/servicii/magazin-online/', 'service', 'ro'],
  ['article', '/blog/cat-costa-un-site-de-prezentare/', 'blog', 'ro'],
  ['English article', '/en/blog/how-much-does-a-business-website-cost/', 'blog', 'en'],
]) {
  const page = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let fetched = 0;
  await page.route('https://cal.com/**', (route) => {
    fetched += 1;
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>stub calendar</h1>' });
  });
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

  const link = page.locator(`[data-booking-open][data-booking-where="${where}"]`);
  const frameEl = page.locator('[data-booking-frame]');
  // Read without waiting: an attribute read on a missing element blocks for
  // thirty seconds and then throws, which would end the suite instead of
  // failing the check.
  const found = await link.evaluateAll((nodes) =>
    nodes.map((n) => ({ href: n.getAttribute('href'), target: n.getAttribute('target'), rel: n.getAttribute('rel') ?? '' })));
  ck(`${label}: the closing band offers a call`,
    found.length === 1 && found[0].href === BOOKING, `${found.length} link(s)`);
  ck(`${label}: as a real link, so it works without JavaScript`,
    found.length === 1 && found[0].target === '_blank' && found[0].rel.includes('noopener'));
  ck(`${label}: one calendar dialog on the page`, (await page.locator('[data-booking-dialog]').count()) === 1);
  ck(`${label}: nothing is fetched from the calendar before the click, or even built`,
    fetched === 0 && (await frameEl.count()) === 0, `${fetched} request(s), ${await frameEl.count()} frame(s)`);

  // Clicked only when there is exactly one to click: a missing link has
  // already failed above, and must not turn into a timeout that takes the
  // rest of the suite down with it.
  if ((await link.count()) === 1 && (await page.locator('[data-booking-dialog]').count()) === 1) {
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForTimeout(400);
    const opened = await page.locator('[data-booking-dialog]').evaluate((d) => d.open);
    const frameSrc = (await frameEl.getAttribute('src')) ?? '';
    ck(`${label}: the click opens the calendar in place`,
      opened && frameSrc.startsWith(BOOKING) && new URL(page.url()).pathname === path,
      `${opened ? 'open' : 'closed'} ${frameSrc.slice(0, 50)}`);
    ck(`${label}: in the page's language`, frameSrc.includes(`embed-locale=${lang}`), frameSrc);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    ck(`${label}: and Escape closes it`, !(await page.locator('[data-booking-dialog]').evaluate((d) => d.open)));
  } else {
    // Same three lines either way, so the tally does not depend on the outcome.
    for (const what of ['the click opens the calendar in place', "in the page's language", 'and Escape closes it']) {
      ck(`${label}: ${what}`, false, 'nothing to click');
    }
  }
  ck(`${label}: no page errors`, errors.length === 0, errors.join(' | '));
  await page.close();
}

console.log(R.join('\n'));
await b.close();

if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
