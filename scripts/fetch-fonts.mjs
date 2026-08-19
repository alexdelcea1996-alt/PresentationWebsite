/**
 * Downloads the brand fonts, subsets them to the characters this site actually
 * uses, and writes `src/assets/fonts/` plus a `fonts.json` manifest.
 *
 *   npm run fonts
 *
 * Requires `pyftsubset` (pip install fonttools brotli).
 *
 * The font files are committed to the repository on purpose: the build then
 * needs no network access and produces byte-identical output everywhere.
 * Re-run this after adding content in a language whose letters are not in the
 * baseline below — otherwise those few glyphs fall back to a system font.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/assets/fonts');
/** Build-only copies for the share images. Never served to a browser. */
const ogFontDir = join(root, 'scripts/og-fonts');

// A modern UA makes Google Fonts serve woff2 (and the variable font file).
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// An ancient UA makes the same endpoint serve plain TTF. Satori, which lays out
// the Open Graph images, reads ttf/otf/woff but not woff2 — so the browser fonts
// above cannot be reused for it.
const LEGACY_UA = 'Mozilla/4.0';

/**
 * Static instances the share images need, at the weights they actually use.
 *
 * Fraunces is requested at a pinned optical size as well as a weight
 * (`opsz,wght@144,600`). The browser picks a point on the `opsz` axis by itself
 * from the font size; Satori cannot — it reads a static TTF and would render
 * the axis default, which is the small-text cut. At the 60-70px a share image
 * sets its title, that cut looks thin and mealy next to the same headline on
 * the page. 144 is the display end of the axis, which is what a share image is.
 */
const OG_FONTS = [
  { query: 'Fraunces:opsz,wght@144,600', file: 'fraunces-600.ttf' },
  { query: 'Inter:wght@400', file: 'inter-400.ttf' },
  { query: 'Inter:wght@600', file: 'inter-600.ttf' },
];

// `latin` covers English; `latin-ext` carries the Romanian ș/ț/ă/â/î.
const WANTED_SUBSETS = ['latin', 'latin-ext'];

/**
 * Fraunces carries two axes, `opsz` and `wght`, and both are kept.
 *
 * `opsz` is the reason it is here rather than another serif. Browsers set
 * `font-optical-sizing: auto` by default, so the same file draws a high-contrast
 * display cut in an 84px headline and a sturdier text cut at 18px — one
 * download, two designs, no second file and no manual switching. Subsetting
 * keeps both axes: `pyftsubset` drops glyphs, not axes.
 */
const families = [
  {
    name: 'Fraunces',
    query: 'Fraunces:opsz,wght@9..144,300..700',
    slug: 'fraunces',
    /*
      Ship one axis, not two.

      Every one of the 87 places this site sets the display face asks for the
      same weight — 600 — and the headings in `global.css` do too. A weight axis
      nobody moves is pure payload: variable deltas for a range of weights that
      will never be rendered. Pinning `wght` at 600 and keeping `opsz` free cuts
      Fraunces from 71 kB to 38 kB across the two subsets, and loses nothing
      visible, because the thing being kept is the axis that actually does work
      here.

      If a second display weight is ever wanted, remove this pin and re-run —
      the cost is the 33 kB back, not a redesign. The suite's font budget is
      what will notice.
    */
    pin: { wght: 600 },
  },
  { name: 'Inter', query: 'Inter:wght@400..600', slug: 'inter' },
];

/**
 * Always kept, whatever the current copy happens to contain: printable ASCII,
 * the Latin-1 letters, the full Romanian set (both the correct comma-below
 * forms and the cedilla forms that older systems substitute), and the
 * typographic marks the design uses.
 */
const BASELINE = [
  // Printable ASCII
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)),
  // Latin-1 letters
  ...Array.from({ length: 96 }, (_, i) => String.fromCharCode(0xc0 + i)),
  // Romanian, comma-below and cedilla variants
  ...'ĂăÂâÎîȘșȚțŞşŢţ',
  // Punctuation and symbols used in the design. Arrows, check marks and maths
  // signs are deliberately absent: Google's latin subsets do not carry them, so
  // requesting them changes nothing. The design draws those as SVG icons.
  ...'–—…„“”‘’«»†•·×÷°±€£¥©®™§',
].join('');

/** Every character that appears in the site's copy, so nothing renders in a fallback face. */
async function collectContentCharacters() {
  const roots = [join(root, 'src/i18n'), join(root, 'src/content'), join(root, 'src/data')];
  const chars = new Set();

  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return; // Directory may not exist yet.
    }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (/\.(ts|md)$/.test(entry.name)) {
        for (const char of await readFile(path, 'utf8')) chars.add(char);
      }
    }
  }

  for (const dir of roots) await walk(dir);
  return chars;
}

/** Split Google's CSS into `{ subset, weight, unicodeRange, url }` records. */
function parseFontFaces(css) {
  const faces = [];
  const blockPattern = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;

  for (const [, subset, body] of css.matchAll(blockPattern)) {
    const url = body.match(/src:\s*url\(([^)]+)\)/)?.[1];
    const unicodeRange = body.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
    const weight = body.match(/font-weight:\s*([^;]+);/)?.[1]?.trim();
    if (url && unicodeRange && weight) faces.push({ subset, url, unicodeRange, weight });
  }

  return faces;
}

await mkdir(outDir, { recursive: true });

const contentChars = await collectContentCharacters();
const charset = [...new Set([...BASELINE, ...contentChars])]
  .filter((char) => char.codePointAt(0) > 31 || char === ' ')
  .sort()
  .join('');
const charsetFile = join(outDir, '.charset.txt');
await writeFile(charsetFile, charset);
console.log(`Character set: ${charset.length} characters (${contentChars.size} seen in content)`);

const manifest = [];
let before = 0;
let after = 0;

for (const family of families) {
  const response = await fetch(`https://fonts.googleapis.com/css2?family=${family.query}&display=swap`, {
    headers: { 'User-Agent': UA },
  });
  if (!response.ok) throw new Error(`Google Fonts returned ${response.status} for ${family.name}`);

  const faces = parseFontFaces(await response.text()).filter((face) =>
    WANTED_SUBSETS.includes(face.subset),
  );

  if (faces.length !== WANTED_SUBSETS.length) {
    throw new Error(
      `Expected ${WANTED_SUBSETS.join(' + ')} for ${family.name}, got ${faces.map((f) => f.subset).join(', ') || 'nothing'}`,
    );
  }

  const variants = [];

  for (const face of faces) {
    const fileName = `${family.slug}-${face.subset}.woff2`;
    const target = join(outDir, fileName);

    const fontResponse = await fetch(face.url, { headers: { 'User-Agent': UA } });
    if (!fontResponse.ok) throw new Error(`Failed to download ${face.url}`);

    const original = Buffer.from(await fontResponse.arrayBuffer());
    const rawFile = join(outDir, `.raw-${fileName}`);
    await writeFile(rawFile, original);

    // Keeps the variable weight axis; drops every glyph the site never shows.
    execFileSync('pyftsubset', [
      rawFile,
      `--output-file=${target}`,
      '--flavor=woff2',
      `--text-file=${charsetFile}`,
      '--layout-features=kern,liga,calt,ccmp,locl,mark,mkmk,rlig',
      '--no-hinting',
      '--desubroutinize',
    ]);

    // Drop the axes this site never moves. `pyftsubset` removes glyphs but
    // keeps every axis, so the pinning is a second pass — see the note on the
    // family above for why it is worth a step of its own.
    if (family.pin) {
      const pins = Object.entries(family.pin).map(([axis, value]) => `${axis}=${value}`);
      execFileSync('fonttools', ['varLib.instancer', '-o', target, target, ...pins], {
        stdio: 'pipe',
      });
    }

    const subsetted = await readFile(target);
    await writeFile(rawFile, ''); // keep the tree clean; the file is gitignored
    before += original.length;
    after += subsetted.length;

    variants.push({
      file: fileName,
      // A pinned axis has to be declared as the single value it now is. Leaving
      // the range Google advertised would let the browser ask for a weight the
      // file can no longer draw, and it would synthesise one instead.
      weight: family.pin?.wght ? String(family.pin.wght) : face.weight,
      style: 'normal',
      unicodeRange: face.unicodeRange,
    });

    const saved = Math.round((1 - subsetted.length / original.length) * 100);
    console.log(
      `✓ ${fileName}: ${(original.length / 1024).toFixed(1)} kB → ${(subsetted.length / 1024).toFixed(1)} kB (−${saved}%)`,
    );
  }

  manifest.push({ name: family.name, slug: family.slug, variants });
}

await writeFile(join(outDir, 'fonts.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `\nTotal: ${(before / 1024).toFixed(0)} kB → ${(after / 1024).toFixed(0)} kB ` +
    `(saved ${((before - after) / 1024).toFixed(0)} kB)`,
);

// --- TTFs for the share images ---------------------------------------------
// Subsetted to the same character set, so these are tens of kilobytes rather
// than the ~800 kB Google ships. They are committed because the build renders
// the share images and must not depend on the network.
await mkdir(ogFontDir, { recursive: true });
console.log('\nBuild-only TTFs for the share images:');

for (const font of OG_FONTS) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${font.query}`, {
    headers: { 'User-Agent': LEGACY_UA },
  });
  if (!css.ok) throw new Error(`Google Fonts returned ${css.status} for ${font.query}`);

  const url = (await css.text()).match(/https:\/\/[^)]*\.ttf/)?.[0];
  if (!url) throw new Error(`No TTF offered for ${font.query} — did the legacy UA stop working?`);

  const download = await fetch(url, { headers: { 'User-Agent': LEGACY_UA } });
  if (!download.ok) throw new Error(`Failed to download ${url}`);

  const original = Buffer.from(await download.arrayBuffer());
  const rawFile = join(ogFontDir, `.raw-${font.file}`);
  const target = join(ogFontDir, font.file);
  await writeFile(rawFile, original);

  // No --flavor here: that flag only accepts woff/woff2, and omitting it keeps
  // the input's plain TTF, which is what satori needs.
  execFileSync('pyftsubset', [
    rawFile,
    `--output-file=${target}`,
    `--text-file=${charsetFile}`,
    '--layout-features=kern,liga,calt,ccmp,locl',
    '--no-hinting',
  ]);

  const subsetted = await readFile(target);
  await writeFile(rawFile, '');
  console.log(
    `✓ ${font.file}: ${(original.length / 1024).toFixed(0)} kB → ${(subsetted.length / 1024).toFixed(1)} kB`,
  );
}
