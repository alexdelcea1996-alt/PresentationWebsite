/**
 * The two demos that frame a complete example site.
 *
 * These are the easiest demos to fake and the hardest to notice faking: a
 * screenshot in a rounded rectangle looks identical to a real page until you
 * try to click something. So the suite clicks. It walks the menu inside the
 * frame, submits both forms, and switches the frame to phone width to prove the
 * example's own breakpoints are the ones doing the work.
 *
 * It also guards the two things that had to change to allow framing at all —
 * `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN` — because those
 * are a deliberate, narrow relaxation and must not quietly widen further.
 */
import { launch, BASE } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const VIEWPORT = { viewport: { width: 1440, height: 1000 } };

const CASES = [
  {
    label: 'RO landing',
    host: '/demo/landing-page/',
    example: '/demo/exemplu/atelier/',
    tab: 'landing',
    kind: 'landing',
    brand: 'Rindea',
  },
  {
    label: 'EN landing',
    host: '/en/demo/landing-page/',
    example: '/en/demo/example/workshop/',
    tab: 'landing',
    kind: 'landing',
    brand: 'Rindea',
  },
  {
    label: 'RO site',
    host: '/demo/site-de-prezentare/',
    example: '/demo/exemplu/instalatii/',
    tab: 'site',
    kind: 'site',
    brand: 'Termoflux',
  },
  {
    label: 'EN site',
    host: '/en/demo/business-website/',
    example: '/en/demo/example/plumber/',
    tab: 'site',
    kind: 'site',
    brand: 'Termoflux',
  },
];

// --- The host pages -------------------------------------------------------------
for (const c of CASES) {
  const p = await b.newPage(VIEWPORT);
  const violations = [];
  await p.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`),
    );
  });
  const res = await p.goto(`${BASE}${c.host}`, { waitUntil: 'load' });
  ck(`${c.label}: the demo page is served`, res?.status() === 200, `${res?.status()}`);

  // All four demos reachable, this one marked as where you are.
  ck(`${c.label}: the switcher offers all four demos`,
    (await p.locator('[data-demo-tab]').count()) === 4);
  ck(`${c.label}: this demo is marked as current`,
    (await p.locator(`[data-demo-tab="${c.tab}"]`).getAttribute('aria-current')) === 'page');

  const frame = p.locator('[data-demo-frame] iframe');
  ck(`${c.label}: there is exactly one frame`, (await frame.count()) === 1);
  ck(`${c.label}: it points at the example`,
    (await frame.getAttribute('src')) === c.example, await frame.getAttribute('src'));
  // A frame with no accessible name is a dead end for a screen reader.
  ck(`${c.label}: the frame is named`, ((await frame.getAttribute('title')) ?? '').length > 5);

  ck(`${c.label}: the example can be opened on its own`,
    (await p.locator(`[data-frame-open][href="${c.example}"]`).count()) === 1);

  // The disclaimer is not decoration: the business in the frame is invented and
  // the page has to say so before anyone reads it as a portfolio entry.
  const disclaimer = (await p.locator('[data-demo-disclaimer]').innerText()).toLowerCase();
  ck(`${c.label}: it says the business is invented`,
    /invent/.test(disclaimer), disclaimer.slice(0, 60));

  // Five things to look at, so the visitor knows what they are looking at.
  ck(`${c.label}: the reading guide is there`,
    (await p.locator('[data-demo-lookfor]').count()) === 5,
    `${await p.locator('[data-demo-lookfor]').count()}`);

  // --- The width switch -----------------------------------------------------
  const shell = p.locator('[data-frame-shell]');
  const wide = (await shell.boundingBox())?.width ?? 0;
  await p.locator('[data-frame-width="mobile"]').click();
  await p.waitForTimeout(600);
  const narrow = (await shell.boundingBox())?.width ?? 0;
  ck(`${c.label}: the phone view really is narrower`, narrow > 0 && narrow < wide - 200,
    `${Math.round(wide)} → ${Math.round(narrow)}`);
  ck(`${c.label}: the pressed state follows`,
    (await p.locator('[data-frame-width="mobile"]').getAttribute('aria-pressed')) === 'true' &&
      (await p.locator('[data-frame-width="desktop"]').getAttribute('aria-pressed')) === 'false');

  violations.push(...(await p.evaluate(() => window.__csp)));
  ck(`${c.label}: framing our own page violates no policy`, violations.length === 0,
    violations.join(' | '));
  await p.close();
}

// --- Inside the frame -----------------------------------------------------------
// Reached through the host page, not opened directly: if the iframe were ever
// blocked by a header, everything below would fail rather than quietly pass.
for (const c of CASES) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${c.host}`, { waitUntil: 'load' });
  const inside = p.frameLocator('[data-demo-frame] iframe');

  // A refused frame renders Chromium's own error page, which has a heading and
  // a body like any document — so "there is an h1" is not proof of anything.
  // The brand is: it only appears if our page really loaded. Checked first, and
  // the rest of this block is skipped when it fails, because every assertion
  // after it would otherwise time out one by one and take the suite down with
  // a stack trace instead of a readable result.
  const body = await inside.locator('body').innerText();
  const loaded = body.includes(c.brand);
  ck(`${c.label}: the example really loaded inside the frame`, loaded, body.trim().slice(0, 60));

  if (!loaded) {
    await p.close();
    continue;
  }

  ck(`${c.label}: with a heading of its own`,
    (await inside.locator('h1').innerText()).length > 10);

  if (c.kind === 'landing') {
    // The argument the service page makes: a landing page has no menu.
    ck(`${c.label}: it has no navigation menu`, (await inside.locator('nav').count()) === 0);
    ck(`${c.label}: one action, repeated`,
      (await inside.locator('a[href="#rezerva"]').count()) === 2,
      `${await inside.locator('a[href="#rezerva"]').count()}`);

    // The form works far enough to be worth trying, and admits it sends nothing.
    await inside.locator('#lp-name').fill('Test');
    await inside.locator('#lp-phone').fill('0700000000');
    await inside.locator('[data-lp-form] button[type="submit"]').click();
    await p.waitForTimeout(300);
    const done = await inside.locator('[data-lp-done]').innerText();
    ck(`${c.label}: submitting shows a confirmation`, done.length > 20);
    ck(`${c.label}: which admits nothing was sent`,
      /nu s-a trimis|nothing was sent/i.test(done), done.slice(0, 80));
  } else {
    // And a business website does have one, working.
    const nav = inside.locator('nav a');
    ck(`${c.label}: the menu has three entries`, (await nav.count()) === 3,
      `${await nav.count()}`);

    // Walk it. A menu that does not navigate is a picture of a menu.
    await nav.nth(1).click();
    await p.waitForTimeout(500);
    const services = inside.locator('h1');
    ck(`${c.label}: the menu navigates inside the frame`,
      (await services.innerText()).length > 3, await services.innerText());
    ck(`${c.label}: and marks where you are`,
      (await inside.locator('nav a[aria-current="page"]').count()) === 1);

    await inside.locator('nav a').nth(2).click();
    await p.waitForTimeout(500);
    await inside.locator('#bw-name').fill('Test');
    await inside.locator('#bw-phone').fill('0700000000');
    await inside.locator('[data-bw-form] button[type="submit"]').click();
    await p.waitForTimeout(300);
    const done = await inside.locator('[data-bw-done]').innerText();
    ck(`${c.label}: the contact form confirms`, done.length > 20);
    ck(`${c.label}: and admits nothing was sent`,
      /nu s-a trimis|nothing was sent/i.test(done), done.slice(0, 80));
  }

  await p.close();
}

// --- The examples are fiction, and are treated as fiction ------------------------
{
  const sitemap = await (await fetch(`${BASE}/sitemap-0.xml`)).text();
  const p = await b.newPage();

  for (const c of CASES) {
    const res = await p.goto(`${BASE}${c.example}`, { waitUntil: 'domcontentloaded' });
    ck(`${c.label}: the example is served on its own too`, res?.status() === 200);

    const robots = await p.locator('meta[name="robots"]').getAttribute('content');
    ck(`${c.label}: the example refuses indexing`, /noindex/.test(robots ?? ''), String(robots));
    ck(`${c.label}: and stays out of the sitemap`, !sitemap.includes(c.example), c.example);

    // The whole point of the examples is that they do not inherit this design.
    const sheets = await p.$$eval('link[rel="stylesheet"]', (nodes) =>
      nodes.map((n) => n.getAttribute('href')),
    );
    ck(`${c.label}: it does not load this site's stylesheet`, sheets.length === 0,
      sheets.join(' '));
  }
  await p.close();
}

// --- The offers that now have a demo point at it ---------------------------------
for (const [label, service, demo] of [
  ['RO landing', '/servicii/landing-page/', '/demo/landing-page/'],
  ['RO presentation', '/servicii/site-de-prezentare/', '/demo/site-de-prezentare/'],
  ['EN landing', '/en/services/landing-page/', '/en/demo/landing-page/'],
  ['EN presentation', '/en/services/business-website/', '/en/demo/business-website/'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}${service}`, { waitUntil: 'domcontentloaded' });
  const cta = p.locator(`[data-demo-cta][href$="${demo}"]`);
  ck(`${label}: the service page offers its demo`, (await cta.count()) === 1);
  await cta.click();
  await p.waitForURL(`**${demo}`, { timeout: 5000 }).catch(() => {});
  ck(`${label}: and the button gets there`, new URL(p.url()).pathname === demo, p.url());
  await p.close();
}

// --- The headers that had to change ----------------------------------------------
{
  const res = await fetch(`${BASE}/`);
  const csp = res.headers.get('content-security-policy') ?? '';
  // Relaxed from 'none' so the demos can frame our own pages. Third-party
  // framing — the actual clickjacking risk — must still be refused.
  ck('the site may frame itself', /frame-src [^;]*'self'/.test(csp), 'frame-src');
  ck('but only this origin may frame it', csp.includes("frame-ancestors 'self'"),
    csp.split(';').find((part) => part.includes('frame-ancestors')));
  ck('no third party may frame it', !/frame-ancestors[^;]*\*/.test(csp));
  ck('the legacy header agrees', res.headers.get('x-frame-options') === 'SAMEORIGIN',
    res.headers.get('x-frame-options'));
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
