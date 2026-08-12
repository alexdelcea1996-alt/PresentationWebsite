/**
 * Cloudflare Web Analytics — asserted in whichever state the build is in.
 *
 * Same shape as `audit.mjs`: the feature is dormant until PUBLIC_CF_BEACON_TOKEN
 * is set, so the suite first asks the built HTML what state it is in and then
 * holds that state to its own rules. Nothing here needs editing when the token
 * is finally configured; the other branch simply starts running.
 *
 * The point of the pairing is that the CSP and the page can never disagree. A
 * beacon with no allowance is a script that silently never runs; an allowance
 * with no beacon is an origin the site advertises for no reason.
 */
import { launch, BASE } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const REPORT_ORIGIN = 'https://cloudflareinsights.com';

const probe = await b.newPage();
await probe.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const live = (await probe.locator(`script[src="${BEACON_SRC}"]`).count()) > 0;
const csp = await probe.evaluate(
  async (base) => (await fetch(base + '/')).headers.get('content-security-policy'),
  BASE,
);
await probe.close();

console.log(`# analytics are ${live ? 'ON (token configured)' : 'OFF (no token)'}`);

// Read the directives as lists rather than searching the whole policy string:
// the report origin is a substring of nothing else here today, but a check that
// only holds by accident is a check that breaks on the next origin added.
const sources = (name) =>
  (csp.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name} `)) ?? '')
    .split(/\s+/)
    .slice(1);

// The two allowances the beacon needs, each tied to the beacon being there.
ck('script-src matches whether the beacon is in the page',
  sources('script-src').includes('https://static.cloudflareinsights.com') === live,
  live ? 'expected the beacon host allowed' : 'expected the beacon host absent');
ck('connect-src matches whether the beacon is in the page',
  sources('connect-src').includes(REPORT_ORIGIN) === live,
  live ? 'expected the report origin allowed' : 'expected the report origin absent');

// Whatever the state, no consent banner is warranted and none is claimed: the
// policy has to describe the measuring, and it has to describe it in both
// languages. This is the half that was missing when the form claimed the data
// went nowhere.
for (const [label, path] of [['RO', '/confidentialitate/'], ['EN', '/en/privacy/']]) {
  const p = await b.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  const text = await p.locator('main').innerText();
  ck(`${label} privacy names the analytics service`, text.includes('Cloudflare Web Analytics'));
  ck(`${label} privacy says how to check for yourself`,
    text.includes('static.cloudflareinsights.com'));
  ck(`${label} privacy states there are no cookies behind it`,
    /cookie/i.test(text) && /(fără identificator persistent|no persistent\s+identifier)/i.test(text));
  await p.close();
}

if (!live) {
  // Absence has to be real absence, not a disabled script tag sitting in the
  // markup, and it has to hold on more than the page that was probed.
  for (const path of ['/', '/en/', '/servicii/magazin-online/', '/demo/']) {
    const p = await b.newPage();
    const asked = [];
    p.on('request', (req) => {
      if (req.url().includes('cloudflareinsights.com')) asked.push(req.url());
    });
    await p.goto(`${BASE}${path}`, { waitUntil: 'load' });
    await p.waitForTimeout(400);

    const mentions = await p.evaluate(() => document.documentElement.outerHTML)
      .then((html) => html.includes('cloudflareinsights.com'));
    ck(`${path} carries no analytics script`, !mentions);
    ck(`${path} makes no analytics request`, asked.length === 0, asked.join(' '));
    await p.close();
  }
} else {
  // The beacon is a third-party script on every page of the site, so the bar is
  // higher than "it is present": it must not block, must not error, and must
  // not be the thing that finally trips the policy it was given.
  for (const path of ['/', '/en/', '/servicii/magazin-online/']) {
    const p = await b.newPage();
    const violations = [];
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) =>
        window.__csp.push(`${e.violatedDirective} <- ${e.blockedURI}`));
    });

    // Cloudflare is not reachable from a test run, and loading a real tracker
    // from the suite would be rude anyway. Serve something inert of the right
    // shape so the browser applies the CSP to a genuine cross-origin script.
    let fetched = false;
    await p.context().route('https://static.cloudflareinsights.com/**', (route) => {
      fetched = true;
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '/* stub */' });
    });

    await p.goto(`${BASE}${path}`, { waitUntil: 'load' });
    await p.waitForTimeout(400);
    violations.push(...(await p.evaluate(() => window.__csp)));

    const beacon = p.locator(`script[src="${BEACON_SRC}"]`);
    ck(`${path} carries exactly one beacon`, (await beacon.count()) === 1);
    ck(`${path} defers it`, (await beacon.getAttribute('defer')) !== null);

    const token = JSON.parse((await beacon.getAttribute('data-cf-beacon')) ?? '{}').token;
    ck(`${path} passes a token`, typeof token === 'string' && token.length > 0);

    ck(`${path} actually loads the beacon`, fetched);
    ck(`${path} does so without a policy violation`, violations.length === 0,
      violations.join(' | '));
    ck(`${path} raises no page error`, errs.length === 0, errs.join(' | '));

    // Last thing in the body: nothing the visitor is waiting for queues behind it.
    const isLast = await p.evaluate(
      (src) => document.body.lastElementChild?.getAttribute?.('src') === src,
      BEACON_SRC,
    );
    ck(`${path} keeps it last in the body`, isLast);
    await p.close();
  }
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
