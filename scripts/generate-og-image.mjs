/**
 * Renders the Open Graph share images into `public/`.
 *
 *   npm run og
 *
 * Requires the brand fonts (Space Grotesk, Inter) to be installed system-wide,
 * since the SVG is rasterised by sharp/librsvg using fontconfig. Re-run this
 * whenever the brand name, tagline or palette changes.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public');

const WIDTH = 1200;
const HEIGHT = 630;

const BRAND = 'Alex Delcea';
const EMAIL = 'alexdelcea1996@gmail.com';

const variants = [
  {
    file: 'og-image.png',
    eyebrow: 'DEZVOLTARE WEB',
    // Pre-wrapped: SVG has no automatic line breaking.
    lines: [
      [{ text: 'Site-uri și aplicații web' }],
      [{ text: 'care ', accent: false }, { text: 'aduc clienți', accent: true }],
    ],
    tagline: 'Site de prezentare · Magazin online · Aplicații web',
  },
  {
    file: 'og-image-en.png',
    eyebrow: 'WEB DEVELOPMENT',
    lines: [
      [{ text: 'Websites and web apps' }],
      [{ text: 'that ', accent: false }, { text: 'win customers', accent: true }],
    ],
    tagline: 'Business websites · Online stores · Web applications',
  },
];

const escapeXml = (value) =>
  value.replace(/[<>&'"]/g, (char) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[char]};`);

/** Lay a line out as a sequence of tspans, so part of it can carry the accent gradient. */
const renderLine = (segments, y) => {
  const spans = segments
    .map(
      (segment) =>
        `<tspan fill="${segment.accent ? 'url(#accent)' : '#f1f5f9'}">${escapeXml(segment.text)}</tspan>`,
    )
    .join('');
  // xml:space="preserve" keeps the space between a plain and an accented segment.
  return `<text x="80" y="${y}" xml:space="preserve" font-family="Space Grotesk" font-weight="600" font-size="68" letter-spacing="-1.6">${spans}</text>`;
};

const buildSvg = ({ eyebrow, lines, tagline }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#818cf8"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0b0f1a"/>
  <ellipse cx="200" cy="60" rx="520" ry="380" fill="url(#glowA)"/>
  <ellipse cx="1080" cy="600" rx="460" ry="340" fill="url(#glowB)"/>

  <!-- Brand mark -->
  <rect x="80" y="72" width="56" height="56" rx="15" fill="url(#mark)"/>
  <!-- 24×24 icon scaled 1.3× and centred inside the 56×56 mark at (108, 100) -->
  <g stroke="#05070d" stroke-width="2" stroke-linecap="round" fill="none"
     transform="translate(92.4 84.4) scale(1.3)">
    <path d="M16 7v3.5M16 21.5V25M7 16h3.5M21.5 16H25"/>
    <path d="m9.6 9.6 2.5 2.5M19.9 19.9l2.5 2.5M22.4 9.6l-2.5 2.5M12.1 19.9l-2.5 2.5"/>
  </g>
  <text x="152" y="110" font-family="Space Grotesk" font-weight="600" font-size="26" fill="#f1f5f9">
    ${escapeXml(BRAND)}
  </text>

  <text x="80" y="238" font-family="Inter" font-size="19" letter-spacing="3.4" fill="#22d3ee">
    ${escapeXml(eyebrow)}
  </text>

  ${renderLine(lines[0], 318)}
  ${renderLine(lines[1], 398)}

  <text x="80" y="470" font-family="Inter" font-size="23" fill="#9aa8be">
    ${escapeXml(tagline)}
  </text>

  <rect x="80" y="524" width="1040" height="1" fill="#1c2436"/>
  <text x="80" y="574" font-family="Inter" font-size="21" fill="#6b7a92">
    ${escapeXml(EMAIL)}
  </text>
</svg>
`;

await mkdir(outDir, { recursive: true });

for (const variant of variants) {
  const png = await sharp(Buffer.from(buildSvg(variant)))
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(outDir, variant.file), png);
  console.log(`✓ ${variant.file} (${(png.length / 1024).toFixed(0)} kB)`);
}
