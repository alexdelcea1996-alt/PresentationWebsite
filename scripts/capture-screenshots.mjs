/**
 * Photographs the built site for its own case study.
 *
 *   npm run build && npm run shots
 *
 * The case study is about this site, so its screenshots are the one set of
 * project pictures that can be produced honestly without asking a client for
 * anything. Re-run after a visual change; the files are committed.
 *
 * Starts the same server the tests use, so what gets photographed is the real
 * build with the real headers, not a dev server.
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../tests/harness.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/content/case-studies/images');
const PORT = 4399;
const BASE = `http://localhost:${PORT}`;

const shots = [
  {
    file: 'this-site-desktop.png',
    path: '/',
    viewport: { width: 1440, height: 900 },
    scheme: 'dark',
  },
  {
    file: 'this-site-mobile.png',
    path: '/',
    viewport: { width: 390, height: 844 },
    scheme: 'dark',
  },
];

const server = spawn(process.execPath, [join(root, 'tests/server.mjs')], {
  stdio: ['ignore', 'pipe', 'inherit'],
  env: { ...process.env, TEST_PORT: String(PORT) },
});

const ready = await new Promise((resolve) => {
  const timer = setTimeout(() => resolve(false), 10_000);
  server.stdout.on('data', (chunk) => {
    if (String(chunk).includes('test server on')) {
      clearTimeout(timer);
      resolve(true);
    }
  });
  server.on('exit', () => {
    clearTimeout(timer);
    resolve(false);
  });
});

if (!ready) {
  console.error(`Could not start the preview server on ${PORT}. Run \`npm run build\` first.`);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const browser = await launch();

for (const shot of shots) {
  const page = await browser.newPage({
    viewport: shot.viewport,
    colorScheme: shot.scheme,
    deviceScaleFactor: 2,
  });

  await page.goto(BASE + shot.path, { waitUntil: 'load' });

  // Reveal-on-scroll leaves content at opacity 0 until it is scrolled to, and
  // the hero glows drift for a moment. Settle both before the shutter.
  await page.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')),
  );
  await page.waitForFunction(
    () => document.querySelector('[data-live-metrics]')?.dataset.ready === 'true',
    null,
    { timeout: 5000 },
  ).catch(() => {});
  await page.waitForTimeout(1200);

  await page.screenshot({ path: join(outDir, shot.file) });
  console.log(`✓ ${shot.file} (${shot.viewport.width}×${shot.viewport.height} @2x)`);
  await page.close();
}

await browser.close();
server.kill();
