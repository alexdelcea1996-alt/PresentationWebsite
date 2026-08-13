/**
 * The visual signature: palette, mark, beam, spine.
 *
 * Everything here is decoration, which is exactly why it needs a suite. A
 * broken guarantee shouts — a paragraph goes missing, a form stops submitting.
 * A broken flourish is silent: the ring stops turning, the mask fails to load,
 * the minifier eats a declaration, and the page still looks *fine*. It just
 * quietly stops being the thing that was built.
 *
 * Two failure modes get most of the attention below, because both have already
 * happened once:
 *
 *   1. The minifier rewriting a declaration into something the browser refuses.
 *      Lightning CSS folded `animation-timeline: view()` into the `animation`
 *      shorthand, which Chrome rejects wholesale, so the spine silently stopped
 *      animating while the source still read perfectly. Every check here reads
 *      COMPUTED style in a real browser against the built stylesheet — never
 *      the source — because that is the only place the difference shows.
 *
 *   2. An ancestor quietly becoming a scroll container. `overflow: hidden`
 *      makes one; `animation-timeline: view()` resolves against the nearest
 *      scrollport, so the spine measured its progress through a box that never
 *      scrolls and froze. Nothing about that looks wrong in the CSS.
 */
import { launch, BASE, AXE_RULES, axePath, settleAnimations } from '../harness.mjs';

const R = [];
const ck = (n, ok, d = '') => R.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`);
const b = await launch();

/** WCAG contrast, so the palette is checked as arithmetic and not just by axe. */
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const parse = (value) => {
  const hex = value.trim();
  if (hex.startsWith('#')) return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return hex.match(/\d+/g).slice(0, 3).map(Number);
};
const luminance = (rgb) => {
  const [r, g, bl] = rgb.map((v) => lin(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
};
const contrast = (a, c) => {
  const [x, y] = [luminance(parse(a)), luminance(parse(c))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const tokensFor = async (theme) => {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  const read = await p.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const g = (name) => s.getPropertyValue(name).trim();
    return {
      accent: g('--color-accent'),
      bright: g('--color-accent-bright'),
      alt: g('--color-accent-alt'),
      spark: g('--spark'),
      surface: getComputedStyle(document.body).backgroundColor,
    };
  });
  await p.close();
  return read;
};

// --- The palette is its own -----------------------------------------------------
const dark = await tokensFor('dark');
const light = await tokensFor('light');

// Tailwind's indigo-500 and cyan-400. Not a style opinion in a test — the point
// of the exercise was to stop opening with the default gradient of every
// generated portfolio, and that is a claim a check can hold.
const STOCK = ['#6366f1', '#22d3ee', '#818cf8', '#4f46e5', '#0e7490'];
ck(
  'the accent pair is not the stock indigo/cyan',
  ![dark.accent, dark.alt, dark.bright, light.accent, light.alt].some((c) =>
    STOCK.includes(c.toLowerCase())),
  `${dark.accent} / ${dark.alt}`,
);

ck(
  'the light theme derives its own values rather than reusing the dark ones',
  light.accent !== dark.accent && light.alt !== dark.alt,
  `${light.accent} vs ${dark.accent}`,
);

// A dark theme whose accents are darker than its background, or a light theme
// whose accents are lighter, is the classic result of copying one into the other.
ck(
  'dark-theme accents are lighter than the page, light-theme accents darker',
  luminance(parse(dark.alt)) > luminance(parse(dark.surface)) &&
    luminance(parse(light.alt)) < luminance(parse(light.surface)),
);

for (const [name, tokens] of [['dark', dark], ['light', light]]) {
  const ratio = contrast(tokens.alt, tokens.surface);
  ck(`${name}: the second accent clears AA as body text`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
  const ring = contrast(tokens.accent, tokens.surface);
  ck(`${name}: the accent clears 3:1 as a focus ring`, ring >= 3, `${ring.toFixed(2)}:1`);
}

// --- The mark --------------------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });

  ck('the mark is defined as a mask, inline', dark.spark.startsWith('url("data:image/svg+xml'),
    dark.spark.slice(0, 34));

  const stamp = await p.locator('.eyebrow').first().evaluate((el) => {
    const s = getComputedStyle(el, '::before');
    return {
      content: s.content,
      width: parseFloat(s.width),
      mask: s.maskImage,
      colour: s.backgroundColor,
      text: getComputedStyle(el).color,
    };
  });
  ck('every section label is stamped with it', stamp.content === '""' && stamp.width > 6,
    `${stamp.width}px`);
  ck('and it is painted through a mask, not shipped as an image',
    stamp.mask.includes('data:image/svg+xml'));
  // The whole reason for a mask: one asset, coloured by whatever it lands in.
  ck('it takes the colour of the label it sits beside', stamp.colour === stamp.text,
    `${stamp.colour} vs ${stamp.text}`);

  // Decorative: the words already say what the section is.
  const named = await p.locator('.eyebrow').first().evaluate((el) => el.innerText.trim());
  ck('the label still reads as its words alone', named.length > 2 && !named.includes('undefined'),
    named);

  await p.close();
}

// --- One mark, in three places ---------------------------------------------------
/**
 * The spark is drawn three times over: in `public/favicon.svg` on a 32 grid,
 * in `src/data/icons.ts` for the header and footer logo on a 24 grid, and in
 * the `--spark` mask for the section labels, also on 24. Three copies of one
 * drawing is three chances for them to stop being the same drawing — and the
 * failure is quiet, because each of them looks fine on its own. You only see it
 * by opening two tabs side by side.
 *
 * So the geometry is compared as arithmetic: the two 24-grid copies must be
 * identical, and the favicon must be exactly those coordinates scaled by 32/24.
 */
{
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');

  /** Every number in the path data, in order. */
  const coords = (source) => {
    const paths = [...source.matchAll(/\sd=["']([^"']+)["']/g)].map((m) => m[1]).join(' ');
    return (paths.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  };

  const favicon = coords(read('public', 'favicon.svg'));
  const iconsFile = read('src', 'data', 'icons.ts');
  const sparkEntry = iconsFile.slice(iconsFile.indexOf('spark:'), iconsFile.indexOf("',", iconsFile.indexOf('spark:')));
  const logo = coords(sparkEntry);
  const cssFile = read('src', 'styles', 'global.css');
  const maskEntry = cssFile.slice(cssFile.indexOf('--spark:'), cssFile.indexOf('\n', cssFile.indexOf('--spark:')));
  // The mask is URL-encoded, so the quotes around `d` arrive as %27-free plain
  // quotes but the angle brackets do not. Decoding first keeps `coords` simple.
  const mask = coords(decodeURIComponent(maskEntry));

  ck('the mark is drawn in all three places', favicon.length > 0 && logo.length > 0 && mask.length > 0,
    `favicon ${favicon.length}, logo ${logo.length}, mask ${mask.length} numbers`);
  ck('the logo and the label mask are the same drawing',
    logo.length === mask.length && logo.every((v, i) => v === mask[i]),
    `${logo.join(',')} vs ${mask.join(',')}`);

  const SCALE = 32 / 24;
  const scaled = logo.every((v, i) => Math.abs(v * SCALE - favicon[i]) < 0.005);
  ck('and the favicon is the same drawing at the larger grid',
    favicon.length === logo.length && scaled,
    favicon.length === logo.length
      ? logo.map((v, i) => `${(v * SCALE).toFixed(2)}~${favicon[i]}`).slice(0, 4).join(' ')
      : `${favicon.length} vs ${logo.length} numbers`);

  // Weight scales with the grid like everything else.
  const weight = (source) => Number(source.match(/stroke-width=["']?([\d.]+)/)?.[1]);
  const wFav = weight(read('public', 'favicon.svg'));
  const wLogo = weight(sparkEntry);
  const wMask = weight(decodeURIComponent(maskEntry));
  ck('and the stroke weight scales with it',
    wLogo === wMask && Math.abs(wLogo * SCALE - wFav) < 0.005,
    `favicon ${wFav}, logo ${wLogo}, mask ${wMask}`);
}

// --- The rule that ends an article ------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/blog/landing-page-sau-site-de-prezentare/`, { waitUntil: 'load' });
  const rule = p.locator('.rule-mark');
  ck('a blog post ends with the mark before the pitch', (await rule.count()) === 1);
  ck('the rule is hidden from assistive technology',
    (await rule.getAttribute('aria-hidden')) === 'true');

  const geometry = await rule.evaluate((el) => {
    const glyph = el.querySelector('span');
    return {
      glyph: parseFloat(getComputedStyle(glyph).width),
      mask: getComputedStyle(glyph).maskImage.includes('data:image/svg+xml'),
      lines: [
        parseFloat(getComputedStyle(el, '::before').width),
        parseFloat(getComputedStyle(el, '::after').width),
      ],
    };
  });
  ck('it is a mark set into a rule, both halves drawn',
    geometry.glyph > 6 && geometry.mask && geometry.lines.every((w) => w > 40),
    `glyph ${geometry.glyph}px, lines ${geometry.lines.join('/')}`);

  // It has to sit between the article and the call to action, not after both.
  const order = await p.evaluate(() => {
    const rule = document.querySelector('.rule-mark');
    const aside = document.querySelector('article aside');
    return rule.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING ? 'before' : 'after';
  });
  ck('and it comes before the call to action, not after it', order === 'before', order);
  await p.close();
}

// --- The beam ----------------------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });

  // Without the typed registration the angle is an uninterpolatable string and
  // the gradient simply swaps between two identical frames.
  //
  // `CSS.supports('--beam-angle', ...)` cannot tell us this: for a custom
  // property it answers "does this parse as a token sequence", which is true
  // of anything, registered or not — it returns true for 'not-an-angle' as
  // happily as for '90deg'. The registration itself is readable though: the
  // @property rule is in the stylesheet as a CSSPropertyRule with its syntax
  // on it, which is also the form that has to survive the minifier.
  const registered = await p.evaluate(() => {
    // The registration lives inside `@layer components`, so a flat pass over
    // the top-level rules misses it entirely — layers, media and supports
    // blocks all nest their contents.
    const find = (rules) => {
      for (const rule of rules ?? []) {
        if (rule.constructor.name === 'CSSPropertyRule' && rule.name === '--beam-angle') {
          return { syntax: rule.syntax, initial: rule.initialValue, inherits: rule.inherits };
        }
        const nested = find(rule.cssRules);
        if (nested) return nested;
      }
      return null;
    };
    for (const sheet of document.styleSheets) {
      const hit = find(sheet.cssRules);
      if (hit) return hit;
    }
    return null;
  });
  ck('the beam angle is registered as an angle, so it can be interpolated',
    registered?.syntax === '"<angle>"' || registered?.syntax === '<angle>',
    JSON.stringify(registered));

  const beams = p.locator('.beam');
  ck('exactly one thing on the page wears it', (await beams.count()) === 1,
    `${await beams.count()}`);
  ck('and it is the plan marked as the popular one',
    (await beams.first().innerText()).toLowerCase().includes('cel mai ales'),
    (await beams.first().innerText()).split('\n')[0]);

  const ring = await beams.first().evaluate((el) => {
    const s = getComputedStyle(el, '::before');
    return {
      animation: s.animationName,
      composite: s.maskComposite,
      clip: s.maskClip,
      padding: s.paddingTop,
      display: s.display,
    };
  });
  ck('the ring is running', ring.animation === 'beam-travel' && ring.display !== 'none',
    `${ring.animation} / ${ring.display}`);
  // Two masks excluded from each other is what leaves a frame instead of a slab.
  ck('and it is a frame, not a filled box',
    ring.composite.includes('exclude') && ring.clip.includes('content-box'),
    `${ring.composite} | ${ring.clip}`);
  ck('one pixel of it', ring.padding === '1px', ring.padding);

  // The angle has to actually move; a registered property that never advances
  // looks identical in a screenshot and is the whole failure mode.
  const angleAt = () =>
    beams.first().evaluate((el) => getComputedStyle(el, '::before').getPropertyValue('--beam-angle'));
  const first = await angleAt();
  await p.waitForTimeout(700);
  const second = await angleAt();
  ck('the beam travels rather than sitting still', first !== second, `${first} -> ${second}`);

  await p.close();
}

// --- The spine ------------------------------------------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });

  const links = p.locator('.spine-link');
  const steps = await p.locator('#process ol > li').count();
  ck('there is a segment between each pair of steps', (await links.count()) === steps - 1,
    `${await links.count()} for ${steps} steps`);

  // THE minification check. The source can be perfect and this still fails.
  const wiring = await links.first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { name: s.animationName, timeline: s.animationTimeline, range: `${s.animationRangeStart} ${s.animationRangeEnd}` };
  });
  ck('the scroll timeline survived minification',
    wiring.name === 'spine-draw' && wiring.timeline === 'view()',
    `${wiring.name} on ${wiring.timeline}`);
  ck('and it is ranged to the reading, not the whole scroll',
    /cover/.test(wiring.range) && wiring.range !== 'normal normal', wiring.range);

  // The ancestor must not be a scroll container, or `view()` resolves to a box
  // that never scrolls and the whole thing freezes while looking correct.
  const overflow = await p.locator('#process').evaluate((el) => getComputedStyle(el).overflow);
  ck('the section clips without becoming a scroll container',
    overflow.includes('clip') && !overflow.includes('hidden'), overflow);

  // And the behaviour itself: the line is unfinished above the fold and complete
  // once the reader is through the list.
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const top = await p.evaluate(() =>
    document.querySelector('#process').getBoundingClientRect().top + window.scrollY);
  const scalesAt = async (offset) => {
    await p.evaluate((y) => window.scrollTo(0, y), top + offset);
    await p.waitForTimeout(450);
    return p.$$eval('.spine-link', (els) =>
      els.map((el) => {
        const s = getComputedStyle(el).scale;
        return s === 'none' ? 1 : Number(s.split(' ')[1] ?? s);
      }));
  };
  const before = await scalesAt(-600);
  const after = await scalesAt(700);
  ck('the spine is unfinished before the section is read',
    before.some((v) => v < 0.5), before.map((v) => v.toFixed(2)).join(' '));
  ck('and complete once it has been', after.every((v) => v > 0.99),
    after.map((v) => v.toFixed(2)).join(' '));
  ck('it draws downwards, each step no further along than the one above',
    before.every((v, i) => i === 0 || v <= before[i - 1] + 0.001),
    before.map((v) => v.toFixed(2)).join(' '));

  await p.close();
}

// --- Somebody who asked for less motion gets less --------------------------------------
{
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, reducedMotion: 'reduce' });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });

  const beam = await p.locator('.beam').first().evaluate((el) =>
    getComputedStyle(el, '::before').display);
  ck('the beam is gone under reduced motion', beam === 'none', beam);

  const glint = await p.locator('.btn-primary').first().evaluate((el) =>
    getComputedStyle(el, '::after').display);
  ck('so is the glint', glint === 'none', glint);

  // The spine must not be left half-drawn — the enhancement starts it at zero,
  // so switching the enhancement off has to give the finished line back.
  const scales = await p.$$eval('.spine-link', (els) =>
    els.map((el) => {
      const s = getComputedStyle(el).scale;
      return s === 'none' ? 1 : Number(s.split(' ')[1] ?? s);
    }));
  ck('and the spine is shown whole rather than half-drawn',
    scales.every((v) => v > 0.99), scales.map((v) => v.toFixed(2)).join(' '));

  await p.close();
}

// --- None of it costs accessibility -----------------------------------------------------
for (const [name, theme] of [['dark', 'dark'], ['light', 'light']]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.addInitScript((t) => localStorage.setItem('theme', t), theme);
  await p.addInitScript({ path: axePath });
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  await settleAnimations(p);
  const res = await p.evaluate(async (rules) =>
    // @ts-ignore
    axe.run('#process, #pricing', { runOnly: rules }), AXE_RULES);
  ck(`${name}: the beam and the spine leave the page axe-clean`, res.violations.length === 0,
    res.violations.map((v) => `${v.id} x${v.nodes.length}`).join(', '));
  await p.close();
}

console.log(R.join('\n'));
await b.close();
if (R.some((line) => line.startsWith('FAIL'))) process.exitCode = 1;
