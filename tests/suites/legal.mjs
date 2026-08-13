/**
 * The privacy policy, and the claim it exists to make true.
 *
 * The site used to say, under a form that collects a name and an email, that
 * the data "goes to nobody". That was not true — it lands in an inbox and, when
 * the form service is configured, passes through Web3Forms on the way. A page
 * that sells GDPR-compliant privacy policies as a deliverable had none itself.
 *
 * These checks hold the fix in place: the policy exists in both languages, it
 * names the third parties by name, and it is reachable from the two places
 * where someone would look for it — under the form, and in the footer.
 */
import { launch, BASE, axePath, runAxe, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

const VIEWPORT = { viewport: { width: 1280, height: 1000 } };

for (const [label, home, path, other, heading] of [
  ['RO', '/', '/confidentialitate/', '/en/privacy/', 'confidențialitate'],
  ['EN', '/en/', '/en/privacy/', '/confidentialitate/', 'privacy'],
]) {
  const p = await b.newPage(VIEWPORT);
  const res = await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });

  ck(`${label}: the policy is served`, res?.status() === 200, String(res?.status()));
  ck(
    `${label}: it is titled as a policy`,
    (await p.locator('h1').innerText()).toLocaleLowerCase('ro').includes(heading),
    await p.locator('h1').innerText(),
  );

  // A policy with no date is a policy nobody can date-check.
  const time = p.locator('main time');
  ck(`${label}: it carries a machine-readable date`, (await time.count()) === 1);
  ck(
    `${label}: the date is a real one`,
    !Number.isNaN(Date.parse(await time.getAttribute('datetime'))),
    await time.getAttribute('datetime'),
  );

  // The whole point: the third parties are named, not glossed over.
  const body = await p.locator('main').innerText();
  ck(`${label}: Web3Forms is named`, body.includes('Web3Forms'));
  ck(`${label}: Cal.com is named`, /cal\.com/i.test(body));
  ck(`${label}: Cloudflare is named`, body.includes('Cloudflare'));
  ck(`${label}: localStorage is explained`, body.includes('localStorage'));
  ck(
    `${label}: the supervisory authority is named`,
    body.includes('ANSPDCP') || body.includes('dataprotection.ro'),
  );
  // The policy explains the rights in plain words, which is the right register
  // for a reader — but a policy that never names the regulation it is written
  // under leaves them nothing to look up. One sentence anchors it.
  ck(
    `${label}: the regulation it is written under is named`,
    /2016\/679/.test(body) && /GDPR/i.test(body),
    body.match(/[^.]*2016\/679[^.]*/)?.[0]?.trim().slice(0, 70) ?? 'not cited',
  );
  // All five rights, not a subset — the audit reads the words, not the intent.
  {
    const rights = [
      [/știi ce date|know what data/i, 'access'],
      [/corectezi|correct it/i, 'rectification'],
      [/ștergi|deleted/i, 'erasure'],
      [/te opui|object to/i, 'objection'],
      [/o copie|a copy/i, 'portability'],
    ];
    const missing = rights.filter(([re]) => !re.test(body)).map(([, name]) => name);
    ck(`${label}: every GDPR right is spelled out`, missing.length === 0, missing.join(', '));
  }
  ck(
    `${label}: it gives an address to exercise rights`,
    (await p.locator('main a[href^="mailto:"]').count()) > 0,
  );

  // Links out to the processors, so the reader can check them.
  const external = await p.$$eval('main a[href^="http"]', (as) => as.map((a) => a.href));
  ck(
    `${label}: it links the processors' own policies`,
    external.some((href) => href.includes('web3forms.com')) &&
      external.some((href) => href.includes('cal.com')),
    external.join(' '),
  );

  ck(
    `${label}: it points at the other language`,
    (await p.locator(`link[rel="alternate"][href$="${other}"]`).count()) > 0,
  );

  await p.close();

  // --- Reachable from where it matters -----------------------------------------
  const h = await b.newPage(VIEWPORT);
  await h.goto(`${BASE}${home}`, { waitUntil: 'domcontentloaded' });

  const fromForm = h.locator('[data-privacy-link]');
  ck(`${label}: the form links the policy`, (await fromForm.count()) === 1);
  ck(
    `${label}: and links it in the right language`,
    (await fromForm.getAttribute('href')) === path,
    String(await fromForm.getAttribute('href')),
  );

  ck(
    `${label}: the footer links it too`,
    (await h.locator(`footer a[href="${path}"]`).count()) === 1,
  );

  // The old sentence promised the data went nowhere. It must not come back.
  const formNote = await h.locator('[data-privacy-link]').locator('xpath=..').innerText();
  ck(
    `${label}: the form no longer claims the data goes nowhere`,
    !/nu le trimit nimănui|never shared/i.test(formNote),
    formNote.replace(/\n/g, ' ').slice(0, 90),
  );

  await fromForm.click();
  await h.waitForURL(`**${path}`, { timeout: 5000 }).catch(() => {});
  ck(`${label}: the link actually reaches it`, new URL(h.url()).pathname === path, h.url());
  await h.close();
}

// --- In the sitemap, like every other real page ---------------------------------
{
  const p = await b.newPage(VIEWPORT);
  await p.goto(`${BASE}/sitemap-0.xml`, { waitUntil: 'domcontentloaded' });
  const xml = await p.content();
  ck('the RO policy is in the sitemap', xml.includes('/confidentialitate/'));
  ck('the EN policy is in the sitemap', xml.includes('/en/privacy/'));
  await p.close();
}

// --- Accessibility -----------------------------------------------------------------
for (const [label, path] of [
  ['RO', '/confidentialitate/'],
  ['EN', '/en/privacy/'],
]) {
  const p = await b.newPage(VIEWPORT);
  await p.addInitScript({ path: axePath });
  await p.goto(`${BASE}${path}`, { waitUntil: 'load' });
  await settleAnimations(p);
  const result = await runAxe(p);
  ck(`${label}: the policy is axe-clean`, result.violations.length === 0,
    result.violations.map((v) => v.id).join(', '));
  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
