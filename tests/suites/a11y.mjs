import { launch, BASE, PAGE, axePath, checks, settleAnimations } from '../harness.mjs';

const check = checks();
const browser = await launch();

for (const [label, path] of [
  ['RO', '/'],
  ['EN', '/en/'],
  // The five pages the landing page used to be, in both languages.
  ['RO services', '/servicii/'],
  ['EN services', '/en/services/'],
  ['RO projects', '/proiecte/'],
  ['EN projects', '/en/projects/'],
  ['RO pricing', '/preturi/'],
  ['EN pricing', '/en/pricing/'],
  ['RO estimate', '/estimare/'],
  ['EN estimate', '/en/estimate/'],
  ['RO contact', '/contact/'],
  ['EN contact', '/en/contact/'],
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
  ['RO colophon', '/colofon/'],
  ['EN colophon', '/en/colophon/'],
  ['RO checklist', '/ghid/lista-de-lansare/'],
  ['EN checklist', '/en/guide/launch-checklist/'],
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

/**
 * --- WCAG 2.4.7: the configurator's option cards must show their focus ---
 *
 * axe cannot see this one, and that is the whole reason it is here. The cards
 * wrap an `sr-only` radio or checkbox — the standard way to get a large styled
 * target with real form semantics. But `sr-only` clips its element with
 * `clip: rect(0,0,0,0)`, and a clipped element's focus ring is clipped with it,
 * so the global `:focus-visible` outline fires, paints, and is thrown away. To
 * axe everything looks perfect: the input is focusable, labelled and reachable.
 * To a keyboard user, tabbing through the price configurator showed nothing at
 * all — not which option they were on, not that they had entered the group.
 *
 * Three things are asserted, because the first two alone can each be satisfied
 * by a bug:
 *   - a ring is drawn on the CARD (not on the clipped input, whose own outline
 *     is exactly the thing nobody can see);
 *   - it is the accent colour, not the inherited `currentColor` — a card that
 *     lost only the colour utility still draws a ring and would pass a
 *     width-only check;
 *   - it clears 3:1 against the surface behind it (1.4.11).
 *
 * Focus is moved with real Tab presses: `:focus-visible` is allowed not to
 * match a programmatic `.focus()`, and for checkboxes in Chrome it does not —
 * which made an earlier version of this check report a working ring as broken.
 *
 * The settle before reading is not padding either. The card carries
 * `transition-colors`, and Tailwind's colour transition list includes
 * `outline-color`, so an immediate read catches the ring mid-fade and reports
 * the colour it is coming FROM.
 */
{
  const contrast = (a, b) => {
    const lum = (rgb) => {
      const [r, g, bl] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const parse = (css) => (css.match(/\d+/g) ?? []).slice(0, 3).map(Number);

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    // The wizard has a page of its own now; tabbing to it from the landing page
    // would be tabbing through a page that no longer contains it.
    await page.goto(`${BASE}${PAGE.estimate.ro}`, { waitUntil: 'networkidle' });

    const tabTo = async (kind) => {
      for (let i = 0; i < 320; i += 1) {
        await page.keyboard.press('Tab');
        const on = await page.evaluate((k) => {
          const el = document.activeElement;
          return k === 'radio'
            ? el?.getAttribute?.('name') === 'project-type'
            : (el?.hasAttribute?.('data-feature-input') ?? false);
        }, kind);
        if (on) return true;
      }
      return false;
    };

    const ring = async () => {
      await page.waitForTimeout(700);
      return page.evaluate(() => {
        const card = document.activeElement?.closest('label');
        if (!card) return null;
        const s = getComputedStyle(card);
        // What the ring is drawn against: the section behind the card.
        const behind = getComputedStyle(card.closest('section') ?? document.body).backgroundColor;
        return {
          width: parseFloat(s.outlineWidth),
          style: s.outlineStyle,
          colour: s.outlineColor,
          text: s.color,
          accent: s.getPropertyValue('--color-accent').trim(),
          behind,
          pageBg: getComputedStyle(document.body).backgroundColor,
        };
      });
    };

    for (const kind of ['radio', 'checkbox']) {
      if (kind === 'checkbox') {
        // Step two is hidden until a project type is chosen and the wizard advances.
        await page.locator('label:has(input[name="project-type"])').first().click();
        await page.locator('#estimate [data-action="next"]').click();
        await page.waitForTimeout(400);
        await page.evaluate(() => document.activeElement.blur());
      }

      const reached = await tabTo(kind);
      check(`${theme}: the configurator ${kind} is reachable by keyboard`, reached);
      if (!reached) continue;

      const r = await ring();
      check(`${theme}: focusing the ${kind} draws a ring on the card`,
        r !== null && r.width >= 2 && r.style !== 'none',
        `${r?.width}px ${r?.style}`);
      // Not currentColor: a card that kept the width utility and lost the colour
      // one still draws a ring, and a width-only check would call that fine.
      check(`${theme}: the ring is the accent colour, not inherited text colour`,
        r !== null && r.colour !== r.text,
        `ring ${r?.colour} vs text ${r?.text} (accent ${r?.accent})`);
      const behind = parse(r.behind).length === 3 && !/rgba\(0, 0, 0, 0\)/.test(r.behind)
        ? parse(r.behind)
        : parse(r.pageBg);
      const ratio = contrast(parse(r.colour), behind);
      check(`${theme}: the ring clears 3:1 against what is behind it`,
        ratio >= 3, `${ratio.toFixed(2)}:1`);
    }

    await page.close();
  }
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
