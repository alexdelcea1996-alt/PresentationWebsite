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
ck('iframe has no src before opening', !(await frame.getAttribute('src')));
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
ck('reopening reuses the loaded calendar', (await frame.getAttribute('src')) === src);

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

console.log(R.join('\n'));
await b.close();

if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
