import { launch, BASE, axePath, checks, settleAnimations } from '../harness.mjs';

const check = checks();
const browser = await launch();

for (const [label, path] of [
  ['RO', '/'],
  ['EN', '/en/'],
  ['RO case study', '/studii-de-caz/acest-site/'],
  ['EN case study', '/en/case-studies/this-site/'],
  ['RO svc landing', '/servicii/landing-page/'],
  ['EN svc landing', '/en/services/landing-page/'],
  ['RO svc business', '/servicii/site-de-prezentare/'],
  ['RO svc shop', '/servicii/magazin-online/'],
  ['RO svc webapp', '/servicii/aplicatie-web/'],
  ['RO svc optim', '/servicii/optimizare-site/'],
  ['EN svc business', '/en/services/business-website/'],
  ['EN svc shop', '/en/services/online-store/'],
  ['EN svc webapp', '/en/services/web-application/'],
  ['EN svc optim', '/en/services/site-optimisation/'],
  ['RO blog index', '/blog/'],
  ['EN blog index', '/en/blog/'],
  ['RO post', '/blog/de-ce-se-incarca-greu-site-ul-tau/'],
  ['EN post', '/en/blog/why-your-site-is-slow/'],
  ['RO post with a table', '/blog/landing-page-sau-site-de-prezentare/'],
  ['EN post with a table', '/en/blog/landing-page-or-business-website/'],
  ['RO thanks', '/multumesc/'],
  ['EN thanks', '/en/thank-you/'],
  ['RO privacy', '/confidentialitate/'],
  ['EN privacy', '/en/privacy/'],
  ['RO demo', '/demo/'],
  ['EN demo', '/en/demo/'],
  ['RO store demo', '/demo/magazin/'],
  ['EN store demo', '/en/demo/store/'],
  ['RO landing demo', '/demo/landing-page/'],
  ['RO site demo', '/demo/site-de-prezentare/'],
  ['EN landing demo', '/en/demo/landing-page/'],
  ['EN site demo', '/en/demo/business-website/'],
  // The examples are separate documents: axe on the host page cannot see inside
  // the frame, so each one is checked in its own right. They have their own
  // palette and their own markup, which is exactly why they need their own runs.
  ['RO example landing', '/demo/exemplu/atelier/'],
  ['RO example site', '/demo/exemplu/instalatii/'],
  ['RO example services', '/demo/exemplu/instalatii/servicii/'],
  ['RO example contact', '/demo/exemplu/instalatii/contact/'],
  ['EN example landing', '/en/demo/example/workshop/'],
  ['EN example site', '/en/demo/example/plumber/'],
]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // Injected via addInitScript: the site's CSP blocks inline <script> tags, so
  // addScriptTag would fail and — worse — could pass silently in a shell pipe.
  await page.addInitScript({ path: axePath });
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await settleAnimations(page);
  const result = await page.evaluate(async () =>
    // @ts-ignore
    axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }),
  );

  const summary = result.violations.map((v) => `${v.id} (${v.impact})`).join(', ');
  check(`dark: ${label}`, result.violations.length === 0, summary);
  for (const violation of result.violations) {
    for (const node of violation.nodes.slice(0, 3)) {
      console.log(`      ${node.html.slice(0, 120)}`);
    }
  }
  await page.close();
}

// --- Transferred bytes for a cold visit ---
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const bytes = {};
page.on('response', async (response) => {
  try {
    const buf = await response.body();
    const type = (response.headers()['content-type'] ?? 'other').split(';')[0];
    bytes[type] = (bytes[type] ?? 0) + buf.length;
  } catch {}
});
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
console.log('\n=== Uncompressed payload (RO, cold) ===');
let total = 0;
for (const [type, size] of Object.entries(bytes).sort((a, b) => b[1] - a[1])) {
  total += size;
  console.log(`  ${String(Math.round(size / 1024)).padStart(5)} kB  ${type}`);
}
console.log(`  ${String(Math.round(total / 1024)).padStart(5)} kB  TOTAL`);

await browser.close();
check.report();
