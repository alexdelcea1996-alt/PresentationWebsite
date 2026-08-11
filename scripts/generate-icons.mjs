/**
 * Rasterises `public/favicon.svg` into the icon set browsers and phones expect,
 * and writes the web app manifest alongside it.
 *
 *   npm run icons
 *
 * Run it by hand and commit the output, the same deal as the fonts: the build
 * stays deterministic and needs no image toolchain on the deploy machine.
 *
 * The maskable icon is a separate file on purpose. Android crops icons to
 * whatever shape the launcher uses, and it only promises to keep the middle 80%.
 * Feeding it the plain icon would shave the corners off the rounded square; this
 * one is drawn smaller on a full-bleed background so there is something to crop.
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

/** Matches `--color-surface-deep`, so the icon sits on the site's own background. */
const BRAND_BG = '#0b0f1a';

const source = await readFile(join(publicDir, 'favicon.svg'));

/** Render the SVG at a given size; `padding` is the fraction left empty around it. */
async function render(size, { padding = 0, background } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const glyph = await sharp(source, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  if (!background) return glyph;

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: glyph, gravity: 'centre' }])
    .png()
    .toBuffer();
}

const bg = { r: 0x0b, g: 0x0f, b: 0x1a, alpha: 1 };

const outputs = [
  // iOS ignores transparency and composites onto white, so bake the background in.
  ['apple-touch-icon.png', await render(180, { background: bg })],
  ['icon-192.png', await render(192)],
  ['icon-512.png', await render(512)],
  // 20% padding each side leaves the glyph inside Android's safe zone.
  ['icon-maskable-512.png', await render(512, { padding: 0.2, background: bg })],
  ['favicon-32.png', await render(32)],
];

for (const [name, buffer] of outputs) {
  await writeFile(join(publicDir, name), buffer);
  console.log(`${name.padEnd(24)} ${String(Math.round(buffer.length / 1024)).padStart(4)} kB`);
}

const manifest = {
  name: 'Alex Delcea — Web Developer',
  short_name: 'Alex Delcea',
  description: 'Site-uri și aplicații web pentru afaceri care vor să fie găsite.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: BRAND_BG,
  theme_color: BRAND_BG,
  lang: 'ro',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

await writeFile(join(publicDir, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log('site.webmanifest        written');
