/**
 * Downloads the brand fonts (variable woff2, latin + latin-ext) into
 * `src/assets/fonts/` and writes `fonts.json` describing them.
 *
 *   npm run fonts
 *
 * The font files are committed to the repository on purpose: the build then
 * needs no network access and produces byte-identical output everywhere.
 * Re-run this only when changing typeface or weight range.
 */
import { mkdir, writeFile } from 'node:fs/promises';
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
const manifest = [];

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
    const fontResponse = await fetch(face.url, { headers: { 'User-Agent': UA } });
    if (!fontResponse.ok) throw new Error(`Failed to download ${face.url}`);

    const bytes = Buffer.from(await fontResponse.arrayBuffer());
    await writeFile(join(outDir, fileName), bytes);

    variants.push({
      file: fileName,
      weight: face.weight,
      style: 'normal',
      unicodeRange: face.unicodeRange,
    });

    console.log(`✓ ${fileName} (${(bytes.length / 1024).toFixed(1)} kB, weight ${face.weight})`);
  }

  manifest.push({ name: family.name, slug: family.slug, variants });
}

await writeFile(join(outDir, 'fonts.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`✓ fonts.json (${manifest.length} families)`);
