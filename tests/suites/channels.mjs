import { launch, BASE, axePath } from '../harness.mjs';
const NUMBER = '+40 767 079 882';
const DIGITS = '40767079882';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);

const b = await launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) =>
    window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
});
// wa.me is unreachable from here; stub it so the click can be followed. The
// route goes on the context, not the page — target=_blank opens a new page,
// which would not inherit a page-level route.
await p.context().route('https://wa.me/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>stub whatsapp</h1>' }));

await p.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });

const wa = p.locator('#contact a[href*="wa.me"]');
ck('WhatsApp row renders in the contact card', (await wa.count()) === 1 && (await wa.isVisible()));

const href = (await wa.getAttribute('href')) ?? '';
const url = new URL(href);
ck('link points at wa.me over https', url.protocol === 'https:' && url.host === 'wa.me', url.origin);
ck('path is digits only — no + and no spaces', url.pathname === `/${DIGITS}`, url.pathname);
ck('digits match the configured number', DIGITS === NUMBER.replace(/\D/g, ''));

ck('opens in a new tab', (await wa.getAttribute('target')) === '_blank');
ck(
  'external link is protected with rel=noopener',
  ((await wa.getAttribute('rel')) ?? '').includes('noopener'),
  await wa.getAttribute('rel'),
);

ck(
  'WhatsApp row shows the action, not the number again',
  (await wa.innerText()).includes('Scrie-mi pe WhatsApp') && !(await wa.innerText()).includes(NUMBER),
  (await wa.innerText()).replace(/\n/g, ' | '),
);
ck('row is labelled WhatsApp', (await wa.innerText()).includes('WhatsApp'));
// The whole point of the change: the number is stated once in the card.
ck(
  'the number appears exactly once in the contact card',
  (await p.locator('#contact aside.card').innerText()).split(NUMBER).length - 1 === 1,
);

// The icon must not be announced; the visible text carries the meaning.
ck(
  'icon is hidden from screen readers',
  (await wa.locator('svg').getAttribute('aria-hidden')) === 'true',
);

const roText = url.searchParams.get('text') ?? '';
ck('RO opens with a Romanian first message', /Bună.*proiect/s.test(roText), roText);

// --- Phone row, in the same card ---
const tel = p.locator('#contact a[href^="tel:"]');
ck('phone row renders in the contact card', (await tel.count()) === 1 && (await tel.isVisible()));
ck(
  'tel: uses the dialable form with the country code',
  (await tel.getAttribute('href')) === `tel:+${DIGITS}`,
  await tel.getAttribute('href'),
);
ck('phone number is displayed as configured', (await tel.innerText()).includes(NUMBER),
  (await tel.innerText()).replace(/\n/g, ' | '));
ck('phone row is labelled', (await tel.innerText()).includes('Telefon'));
// A tel: link must dial in place, not spawn a blank tab.
ck('phone row does not open a new tab', (await tel.getAttribute('target')) === null);
ck('phone row is above WhatsApp', await tel.evaluate(
  (el, other) => !!(el.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING),
  await wa.elementHandle(),
));

// Keyboard: Tab must actually land on the row, and :focus-visible must paint a
// ring. Tabbing (rather than .focus()) is what makes :focus-visible match, and
// the ring is read off the element's own computed style — getComputedStyle
// takes pseudo-elements, not pseudo-classes, so passing ':focus-visible'
// silently returns empty strings and proves nothing.
await p.locator('#contact a[href^="mailto:"]').focus();
let tabs = 0;
while (tabs < 5 && !(await wa.evaluate((el) => el === document.activeElement))) {
  await p.keyboard.press('Tab');
  tabs += 1;
}
ck('Tab reaches the row from the email row', await wa.evaluate((el) => el === document.activeElement),
  `${tabs} tab(s)`);
// The row has `transition-colors`, which transitions outline-color too — read
// it too early and you get the pre-focus colour and a meaningless pass.
await p.waitForTimeout(400);
const ring = await wa.evaluate((el) => {
  const s = getComputedStyle(el);
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
  return { style: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, accent };
});
// #6366f1 -> rgb(99, 102, 241)
const [r, g, bl] = ring.accent.replace('#', '').match(/../g).map((h) => parseInt(h, 16));
ck(
  'focus paints a 2px ring in the accent colour',
  ring.style === `solid 2px rgb(${r}, ${g}, ${bl})`,
  `${ring.style} (accent ${ring.accent})`,
);

// Following the link must not be refused by the page's own CSP.
const [popup] = await Promise.all([p.waitForEvent('popup'), wa.click()]);
await popup.waitForLoadState('domcontentloaded');
ck('click reaches wa.me', new URL(popup.url()).host === 'wa.me', popup.url());
ck('we stayed on the site in the original tab', new URL(p.url()).host === 'localhost:4331');
await popup.close();

// --- EN ---
const en = await b.newPage({ viewport: { width: 1280, height: 900 } });
await en.goto(`${BASE}/en/#contact`, { waitUntil: 'networkidle' });
const enWa = en.locator('#contact a[href*="wa.me"]');
const enText = new URL(await enWa.getAttribute('href')).searchParams.get('text') ?? '';
ck('EN opens with an English first message', /^Hi!.*project\.$/s.test(enText), enText);
ck('EN points at the same number', new URL(await enWa.getAttribute('href')).pathname === `/${DIGITS}`);
ck('EN call to action is translated', (await enWa.innerText()).includes('Message me on WhatsApp'),
  (await enWa.innerText()).replace(/\n/g, ' | '));
ck(
  'EN footer carries the translated action',
  (await en.locator('footer a[href*="wa.me"]').innerText()).trim() === 'Message me on WhatsApp',
);

// --- The footer carries all three on every page, including ones with no
//     contact section of their own ---
const blog = await b.newPage();
await blog.goto(`${BASE}/blog/`, { waitUntil: 'networkidle' });
ck('blog page has no contact section', (await blog.locator('#contact').count()) === 0);

const foot = blog.locator('footer');
ck('footer offers email', (await foot.locator('a[href^="mailto:"]').count()) === 1);
ck(
  'footer offers the phone as a tel: link',
  (await foot.locator('a[href^="tel:"]').getAttribute('href')) === `tel:+${DIGITS}`,
);
const footWa = foot.locator('a[href*="wa.me"]');
ck('footer offers WhatsApp', (await footWa.count()) === 1);
// The same call to action as the card, not the number — that is already on
// the line above it.
ck('footer WhatsApp carries the call to action', (await footWa.innerText()).trim() === 'Scrie-mi pe WhatsApp',
  await footWa.innerText());
ck(
  'the number appears exactly once in the footer',
  (await foot.innerText()).split(NUMBER).length - 1 === 1,
);
ck(
  'footer WhatsApp opens safely in a new tab',
  (await footWa.getAttribute('target')) === '_blank' &&
    ((await footWa.getAttribute('rel')) ?? '').includes('noopener'),
);
ck('footer phone dials in place', (await foot.locator('a[href^="tel:"]').getAttribute('target')) === null);

// Structured data must publish the dialable number, not the display form.
// Pages can carry several JSON-LD blocks, so pick the business one by type.
const ld = (await blog.locator('script[type="application/ld+json"]').allInnerTexts())
  .map((raw) => JSON.parse(raw))
  .find((entry) => entry['@type'] === 'ProfessionalService');
ck('business structured data is present', !!ld);
ck('structured data publishes the dialable number', ld?.telephone === `+${DIGITS}`, String(ld?.telephone));

// --- a11y of the contact card, both themes ---
for (const scheme of ['dark', 'light']) {
  const a = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  await a.addInitScript({ path: axePath });
  await a.goto(`${BASE}/#contact`, { waitUntil: 'networkidle' });
  const res = await a.evaluate(async () =>
    // @ts-ignore
    axe.run('#contact', { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
  ck(`contact section is clean in ${scheme} theme`, res.violations.length === 0,
    res.violations.map((v) => v.id).join(', '));
  await a.close();
}

ck('no CSP violations', (await p.evaluate(() => window.__csp)).length === 0,
  (await p.evaluate(() => window.__csp)).join(' | '));
ck('no page errors', errs.length === 0, errs.join(' | '));

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
