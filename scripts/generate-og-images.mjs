/**
 * Draws one Open Graph share image per page, after the build.
 *
 * Every page declares its own `og:image` URL in its <head>; this reads that URL
 * back and writes the file exactly where the page says it is. The path is
 * therefore defined in one place only (`Base.astro`) and the two cannot drift
 * apart — a page that changed its slug gets a matching image automatically.
 *
 * Why not the old approach: the previous script drew a single generic card per
 * language, ran only when someone remembered `npm run og`, and rasterised text
 * with librsvg — which meant it silently depended on Space Grotesk and Inter
 * being installed system-wide via fontconfig. On a clean machine it produced
 * blank or fallback-font images. Satori embeds the glyph outlines from font
 * files committed to the repo, so the result is identical everywhere.
 *
 * Failure mode is deliberately loud: if this throws, the build fails and
 * Cloudflare keeps serving the previous deploy rather than publishing pages
 * whose share image 404s.
 */
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const fontDir = join(root, 'scripts/og-fonts');

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Brand and address come from the page's own structured data, which Astro fills
 * from `src/data/site.ts`. Hardcoding them here — as the old script did — meant
 * the share card could go on saying the wrong thing long after site.ts changed.
 */
function identityFrom(html) {
  for (const [, raw] of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    const data = JSON.parse(raw);
    if (data['@type'] === 'ProfessionalService') {
      return { brand: data.name, email: String(data.email).replace(/^mailto:/, '') };
    }
  }
  throw new Error('No ProfessionalService schema found — cannot read the brand name');
}

const fonts = [
  { name: 'Space Grotesk', weight: 600, style: 'normal', data: await readFile(join(fontDir, 'space-grotesk-600.ttf')) },
  { name: 'Inter', weight: 400, style: 'normal', data: await readFile(join(fontDir, 'inter-400.ttf')) },
  { name: 'Inter', weight: 600, style: 'normal', data: await readFile(join(fontDir, 'inter-600.ttf')) },
];

const mark = `data:image/svg+xml;base64,${(await readFile(join(root, 'public/favicon.svg'))).toString('base64')}`;

/** What kind of page this is, for the eyebrow. Keyed on the URL, not the title. */
function eyebrowFor(pathname) {
  const en = pathname.startsWith('/en/');
  const segments = pathname.split('/').filter(Boolean);
  const kind = en ? segments[1] : segments[0];
  const deep = segments.length > (en ? 2 : 1);

  const labels = {
    blog: deep ? ['ARTICOL', 'ARTICLE'] : ['BLOG', 'BLOG'],
    servicii: ['SERVICIU', 'SERVICE'],
    services: ['SERVICIU', 'SERVICE'],
    'studii-de-caz': ['STUDIU DE CAZ', 'CASE STUDY'],
    'case-studies': ['STUDIU DE CAZ', 'CASE STUDY'],
  };

  return (labels[kind] ?? ['DEZVOLTARE WEB', 'WEB DEVELOPMENT'])[en ? 1 : 0];
}

/**
 * The card already shows the brand in the corner, so drop it from the title.
 * It appears in three shapes across the site — leading on the landing pages
 * ("Alex Delcea — …") and trailing elsewhere, after either an em dash or a pipe.
 */
function stripBrand(title, brand) {
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return title
    .replace(new RegExp(`^${escaped}\\s*[—|·]\\s*`), '')
    .replace(new RegExp(`\\s*[—|·]\\s*${escaped}$`), '')
    .trim();
}

function card({ eyebrow, title, brand, email }) {
  const text = (content, style) => ({ type: 'div', props: { style, children: content } });

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#0b0f1a',
        // The same two glows the site uses, so a shared link looks like the page.
        backgroundImage:
          'radial-gradient(1040px 760px at 17% 10%, rgba(99,102,241,0.55), rgba(99,102,241,0) 70%),' +
          'radial-gradient(920px 680px at 90% 95%, rgba(34,211,238,0.35), rgba(34,211,238,0) 70%)',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 16 },
            children: [
              { type: 'img', props: { src: mark, width: 56, height: 56 } },
              text(brand, {
                fontFamily: 'Space Grotesk',
                fontWeight: 600,
                fontSize: 26,
                color: '#f1f5f9',
              }),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              text(eyebrow, {
                fontSize: 19,
                letterSpacing: 3.4,
                color: '#22d3ee',
                marginBottom: 26,
              }),
              text(title, {
                fontFamily: 'Space Grotesk',
                fontWeight: 600,
                fontSize: title.length > 68 ? 52 : 64,
                lineHeight: 1.16,
                letterSpacing: -1.6,
                color: '#f1f5f9',
                // Satori has no ellipsis; the size step above keeps long titles in.
                maxHeight: 240,
                overflow: 'hidden',
              }),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #1c2436',
              paddingTop: 26,
            },
            // Just the address. A domain used to sit on the right here, but it
            // was one nobody owns yet — an invented claim on every shared link.
            children: [text(email, { fontSize: 21, color: '#6b7a92' })],
          },
        },
      ],
    },
  };
}

/** Every built HTML file, recursively. */
async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

const pages = await htmlFiles(dist);
let written = 0;
let bytes = 0;

for (const file of pages) {
  const html = await readFile(file, 'utf8');
  const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];

  if (!imageUrl || !title) {
    throw new Error(`${relative(dist, file)} declares no og:image/og:title — cannot draw its card`);
  }

  // The page states where its image lives; write it exactly there.
  const target = join(dist, new URL(imageUrl).pathname);
  const pathname = `/${relative(dist, dirname(file))}/`.replace(/\/+/g, '/').replace('/./', '/');
  const { brand, email } = identityFrom(html);

  const decoded = title
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  const svg = await satori(
    card({ eyebrow: eyebrowFor(pathname), title: stripBrand(decoded, brand), brand, email }),
    { width: WIDTH, height: HEIGHT, fonts },
  );

  const raw = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();

  // resvg writes full-depth RGBA. These cards are flat colour over a smooth
  // gradient, so a palette costs nothing visible and saves about two thirds.
  const png = await sharp(raw).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, png);
  bytes += png.length;
  written += 1;
}

console.log(
  `og: ${written} share image(s) drawn, ${(bytes / 1024 / written).toFixed(0)} kB average`,
);
