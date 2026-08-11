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

// A modern UA makes Google Fonts serve woff2 (and the variable font file).
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// `latin` covers English; `latin-ext` carries the Romanian ș/ț/ă/â/î.
const WANTED_SUBSETS = ['latin', 'latin-ext'];

const families = [
  { name: 'Space Grotesk', query: 'Space+Grotesk:wght@500..700', slug: 'space-grotesk' },
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

    const subsetted = await readFile(target);
    await writeFile(rawFile, ''); // keep the tree clean; the file is gitignored
    before += original.length;
    after += subsetted.length;

    variants.push({
      file: fileName,
      weight: face.weight,
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
