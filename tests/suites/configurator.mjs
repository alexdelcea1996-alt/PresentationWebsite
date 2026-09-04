import { launch, BASE, PAGE } from '../harness.mjs';
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
await page.goto(`${BASE}${PAGE.estimate.ro}`, { waitUntil: 'networkidle' });

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

/*
  Order matters here now.

  Pressing "send" used to fill in a form three sections further down the same
  page; it is a navigation to the contact page today. So everything that reads
  the finished estimate — the WhatsApp text, the shareable link — has to happen
  while the estimate is still on screen, and the hand-over is checked last, on
  the page it lands on.
*/


// --- The estimate can leave the page ---
// An estimate that only exists while the tab is open is one nobody discusses
// with a business partner. Both exits must quote the same numbers the page
// shows — they are built from the same estimate(), and this proves it.
{
  const shownPrice = await page.locator('[data-result-price]').innerText();
  const wa = await cfg.locator('[data-action="whatsapp"]').getAttribute('href');
  const message = decodeURIComponent(wa ?? '');
  check(
    'the WhatsApp exit carries the estimate as text',
    (wa ?? '').startsWith('https://wa.me/40767079882?text=') &&
      message.includes('Site de prezentare') &&
      !message.includes('{details}'),
    (wa ?? '').slice(0, 50),
  );
  // Both figures of the range, exactly as rendered.
  const [low, high] = shownPrice.split('–').map((part) => part.replace(/\D/g, ''));
  check(
    'and quotes the same numbers the page shows',
    message.replace(/\D/g, '').includes(low) && message.replace(/\D/g, '').includes(high),
    `${shownPrice} vs ${message.slice(0, 80).replace(/\n/g, ' ')}`,
  );

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await cfg.locator('[data-action="copy-link"]').click();
  await page.waitForTimeout(200);
  const link = await page.evaluate(() => navigator.clipboard.readText());
  check('copy puts a shareable link on the clipboard', /#estimare=/.test(link), link.slice(-40));
  // Scoped: the contact form's rescue panel carries the same copy hooks.
  check('and says it did', await cfg.locator('[data-copy-done]').isVisible());

  // Opening that link must rebuild the same estimate — and say where it came
  // from, rather than letting somebody think the site guessed their project.
  const shared = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await shared.goto(link, { waitUntil: 'networkidle' });
  await shared.waitForTimeout(500);
  check(
    'a shared link restores the estimate',
    (await shared.locator('[data-result-price]').innerText()) === shownPrice,
    `${await shared.locator('[data-result-price]').innerText()} vs ${shownPrice}`,
  );
  check('and admits it was restored', await shared.locator('[data-restored-note]').isVisible());
  // The hash names no element, so it must not fight the #estimate anchor.
  check('the hash does not collide with a section id',
    (await shared.evaluate(() => document.querySelectorAll('[id="estimare"]').length)) === 0);
  await shared.close();
}

// --- Handed over to the contact form, which is now a page away ---
await cfg.locator('[data-action="send"]').click();
await page.waitForURL((url) => url.pathname === PAGE.contact.ro, { timeout: 8000 });
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

// The form is stepped now, so a prefill that lands on a step the visitor
// cannot see is a prefill they will never find. The handover says which step
// it filled, and the form goes there.
check(
  'the form jumps to the message it was just handed',
  (await page.locator('#field-message').isVisible()) &&
    /3/.test(await page.locator('[data-step-counter]').innerText()),
  await page.locator('[data-step-counter]').innerText(),
);

// --- Changing type clears now-invalid add-ons ---
await page.goto(`${BASE}${PAGE.estimate.ro}`, { waitUntil: 'networkidle' });
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

// The audit band's hand-off to the contact form used to be checked here. It
// moved to the `audit` suite, which knows whether the instant check is switched
// on: with a PageSpeed key configured there is no standing CTA to click, because
// the tool itself is the call to action until it has produced a result.

// --- Comparison section is present in both layouts ---
// It answers "why not a template", so it moved to the services page with the
// rest of the answer to "what do you build and how".
await page.goto(`${BASE}${PAGE.services.ro}`, { waitUntil: 'domcontentloaded' });
const rowsDesktop = await page.locator('#comparison table tbody tr').count();
const cardsMobile = await page.locator('#comparison .md\\:hidden article').count();
check('comparison table has all rows', rowsDesktop === 9, `${rowsDesktop} (8 + spacer)`);
check('comparison has a mobile card per row', cardsMobile === 8, String(cardsMobile));

check('no page errors', consoleErrors.length === 0, consoleErrors.join(' | '));

console.log(results.join('\n'));
await browser.close();

if (results.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
