import { launch, BASE } from '../harness.mjs';
import { mkdirSync } from 'node:fs';
// Debug screenshots, handy when a check fails. Gitignored.
const out = new URL('../screenshots/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await launch();
const results = [];
const check = (name, pass, detail = '') =>
  results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);

/**
 * Walk the stepped form the way a visitor does, filling as it goes.
 *
 * The submission tests below are about what happens on submit, not about
 * stepping — but they must still reach the fields the way a real person can,
 * or they would pass on a form nobody can get through.
 */
async function fillContact(page, { name, email, message }) {
  await page.locator('[data-step-next]').click();
  await page.locator('#field-name').fill(name);
  await page.locator('#field-email').fill(email);
  await page.locator('[data-step-next]').click();
  await page.locator('#field-message').fill(message);
}

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

// --- Sticky mobile CTA dock ---
// Below `sm` the header's quote button is hidden, so this dock is the only
// persistent way to act on a phone. It must answer scrolling, not greet, and
// it must step aside wherever a way to act is already on screen.
{
  const dockPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await dockPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const dock = dockPage.locator('[data-sticky-cta]');

  check('dock stays out of the way at the top', !(await dock.isVisible()));

  await dockPage.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await dockPage.waitForTimeout(600);
  check('dock appears once the visitor scrolls', await dock.isVisible());

  const primary = await dock.locator('a').first().boundingBox();
  check('its primary action is thumb-sized', (primary?.height ?? 0) >= 44,
    `${Math.round(primary?.height ?? 0)}px`);
  check('the WhatsApp exit rides along',
    (await dock.locator('a[href*="wa.me"]').count()) === 1);

  // The page scrolls smoothly (scroll-behavior: smooth), so the jump itself
  // takes ~half a second before the observer can even notice the arrival.
  await dockPage.evaluate(() => document.querySelector('#contact')?.scrollIntoView());
  await dockPage.waitForTimeout(1400);
  check('dock steps aside at the form', !(await dock.isVisible()));

  // On a page without a contact section, the footer is the step-aside trigger.
  await dockPage.goto(`${BASE}/blog/`, { waitUntil: 'networkidle' });
  await dockPage.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await dockPage.waitForTimeout(600);
  const midVisible = await dock.isVisible();
  await dockPage.evaluate(() => document.querySelector('footer')?.scrollIntoView());
  await dockPage.waitForTimeout(1400);
  check('on sub-pages it shows mid-scroll and yields to the footer',
    midVisible && !(await dockPage.locator('[data-sticky-cta]').isVisible()));
  await dockPage.close();

  // Desktop never sees it: the header carries the same action there.
  const wide = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await wide.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await wide.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await wide.waitForTimeout(500);
  check('desktop never sees the dock', !(await wide.locator('[data-sticky-cta]').isVisible()));
  await wide.close();
}

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
// This branch opens the visitor's mail client and cannot know whether one
// exists. It used to claim "message received" anyway — a false success that
// silently lost every lead on a machine with no mail client. The honest ending
// is a rescue panel; the false claim must never come back.
await desktop.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
const accessKey = await desktop.locator('[data-contact-form]').getAttribute('data-access-key');
check('no form key configured yet (mailto fallback path)', accessKey === '', `key="${accessKey}"`);

await fillContact(desktop, {
  name: 'Test SRL',
  email: 'test@example.com',
  message: 'Vreau un site de prezentare.',
});

// The promise belongs at the moment of decision, which is the last step —
// the same place the submit button lives, not seven scrolls away in the aside.
check(
  'the reply promise sits at the button, not seven scrolls away',
  (await desktop.locator('[data-submit-note]').isVisible()) &&
    /24/.test(await desktop.locator('[data-submit-note]').innerText()),
);

await desktop.locator('[data-submit]').click();
await desktop.waitForTimeout(500);
check(
  'mailto fallback does NOT claim the message was received',
  await desktop.locator('[data-form-success]').isHidden(),
);
// Checked first, and the interactions below only run when it holds — otherwise
// a regression here would time out clicking a hidden button and crash the
// suite instead of failing it legibly.
const rescueShown = await desktop.locator('[data-form-fallback]').isVisible();
check('it shows the honest rescue panel instead', rescueShown);

if (rescueShown) {
  const waHref = await desktop.locator('[data-fallback-wa]').getAttribute('href');
  check(
    'the WhatsApp exit carries the composed message',
    (waHref ?? '').startsWith('https://wa.me/40767079882?text=') &&
      decodeURIComponent(waHref ?? '').includes('Test SRL') &&
      decodeURIComponent(waHref ?? '').includes('Vreau un site de prezentare.'),
    (waHref ?? '').slice(0, 60),
  );

  // The clipboard exit. Chromium grants clipboard permissions per context.
  await desktop.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await desktop.locator('[data-fallback-copy]').click();
  await desktop.waitForTimeout(200);
  const copied = await desktop.evaluate(() => navigator.clipboard.readText());
  check(
    'copy puts the address and the message on the clipboard',
    copied.includes('@') && copied.includes('Test SRL') && copied.includes('Vreau un site'),
    copied.slice(0, 60).replace(/\n/g, ' '),
  );
  check('and says it did', await desktop.locator('[data-copy-done]').isVisible());
}

// --- The form asks one thing at a time ---
// Progressive enhancement over the very same inputs: same ids, same names,
// same submit handler. What follows checks that stepping actually hides the
// other steps (a display collision made it look like it worked while every
// field stayed on screen), that validation blocks forward motion, and that
// none of the machinery leaks into the no-JavaScript page.
{
  const stepped = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  await stepped.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
  await stepped.waitForTimeout(400);

  const shown = (selector) => stepped.locator(selector).isVisible();

  check('the form announces which step it is on', /1/.test(
    (await stepped.locator('[data-step-counter]').innerText())));
  check('step 1 shows the offer questions and nothing else',
    (await shown('#field-type')) && !(await shown('#field-name')) && !(await shown('#field-message')));

  await stepped.locator('[data-step-next]').click();
  await stepped.waitForTimeout(250);
  check('step 2 asks who they are',
    (await shown('#field-name')) && !(await shown('#field-type')) && !(await shown('#field-message')));

  // Required fields gate the step: an empty name must not get past here.
  await stepped.locator('[data-step-next]').click();
  await stepped.waitForTimeout(250);
  check('an empty required field blocks the next step',
    /2/.test(await stepped.locator('[data-step-counter]').innerText()));

  await stepped.locator('#field-name').fill('Ana Pop');
  await stepped.locator('#field-email').fill('ana@example.ro');
  await stepped.locator('[data-step-next]').click();
  await stepped.waitForTimeout(250);
  check('step 3 asks for the message',
    (await shown('#field-message')) && !(await shown('#field-name')));
  check('and the submit button appears only there', await shown('[data-submit]'));

  await stepped.locator('[data-step-back]').click();
  await stepped.waitForTimeout(250);
  check('back returns without losing what was typed',
    (await stepped.locator('#field-name').inputValue()) === 'Ana Pop' && (await shown('#field-name')));
  await stepped.close();

  // Without JavaScript there are no steps to count, so the form must be the
  // plain one — every field at once, no progress line claiming otherwise.
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 900, height: 1000 } });
  const plain = await noJs.newPage();
  await plain.goto(`${BASE}/#contact`, { waitUntil: 'domcontentloaded' });
  check('no JavaScript: every field is on screen at once',
    (await plain.locator('#field-type').isVisible()) &&
      (await plain.locator('#field-name').isVisible()) &&
      (await plain.locator('#field-message').isVisible()));
  check('no JavaScript: nothing claims there are steps',
    !(await plain.locator('[data-step-progress]').isVisible()) &&
      !(await plain.locator('[data-step-nav]').isVisible()));
  await noJs.close();
}

// --- The origin pipeline: sub-pages hand their context to the form ---
// A visitor arriving from a service page or a demo has already said what they
// want; making them restate it at the commitment moment is friction, and the
// lead email saying nothing about where it came from is free analytics thrown
// away. The prefill must be transparent — a visible note, not a silent change.
{
  await desktop.goto(`${BASE}/?from=shop&via=demo-store#contact`, { waitUntil: 'networkidle' });
  const picked = await desktop
    .locator('#field-type')
    .evaluate((el) => el.options[el.selectedIndex].dataset.id);
  check('?from= preselects the project type', picked === 'shop', String(picked));
  check(
    'and says so out loud',
    await desktop.locator('[data-prefill-note]').isVisible(),
  );
  const origin = await desktop
    .locator('[data-contact-form] input[name="origin"]')
    .inputValue()
    .catch(() => null);
  check('the origin rides along as a hidden field', origin === 'demo-store', String(origin));

  // And it reaches the payload on the real path.
  let stampedPost = null;
  await desktop.route('https://api.web3forms.com/submit', async (route) => {
    stampedPost = route.request().postData();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await desktop.evaluate(() => {
    document.querySelector('[data-contact-form]').dataset.accessKey = 'test-key-123';
  });
  await fillContact(desktop, {
    name: 'Test SRL',
    email: 'test@example.com',
    message: 'Vreau un magazin.',
  });
  await desktop.locator('[data-submit]').click();
  await desktop.waitForTimeout(700);
  check('the payload carries the origin stamp', (stampedPost ?? '').includes('demo-store'));
  await desktop.unroute('https://api.web3forms.com/submit');

  // A plain visit stays plain: no note, no phantom origin.
  await desktop.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
  check(
    'no note and no origin without the parameter',
    (await desktop.locator('[data-prefill-note]').isHidden()) &&
      (await desktop.locator('[data-contact-form] input[name="origin"]').count()) === 0,
  );
}

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
await fillContact(desktop, {
  name: 'Test SRL',
  email: 'test@example.com',
  message: 'Vreau un site de prezentare.',
});
await desktop.locator('[data-submit]').click();
await desktop.waitForTimeout(700);

check('form posts to Web3Forms when a key is set', posted !== null);
for (const field of ['test-key-123', 'Test SRL', 'test@example.com', 'Site de prezentare']) {
  check(`  payload carries "${field}"`, (posted ?? '').includes(field));
}
// A confirmed send — and only a confirmed send — lands on the thank-you page,
// where the second conversion waits.
await desktop.waitForURL('**/multumesc/', { timeout: 4000 }).catch(() => {});
check(
  'a confirmed send lands on the thank-you page',
  new URL(desktop.url()).pathname === '/multumesc/',
  desktop.url(),
);
check(
  'which offers the call as the next step',
  (await desktop.locator('[data-thanks-booking]').count()) === 1,
);

// --- An empty form cannot even reach the submit button ---
// Stepping moved this guard earlier: validation now stops the visitor at the
// step that is missing something, so submit is never on screen to be pressed.
await desktop.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(300);
await desktop.locator('[data-step-next]').click();
await desktop.locator('[data-step-next]').click();
await desktop.waitForTimeout(300);
check('an empty form never reaches submit', await desktop.locator('[data-submit]').isHidden());
check('and reports no success', await desktop.locator('[data-form-success]').isHidden());

console.log(results.join('\n'));
await browser.close();

if (results.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
