/**
 * Shared plumbing for the suites.
 *
 * Two things here are load-bearing:
 *
 * 1. `playwright-core`, not `playwright`. The full package downloads ~150 MB of
 *    browsers in a postinstall hook, which would fire on the Cloudflare build too
 *    and has no business running there. `playwright-core` ships no browser and no
 *    install script; we point it at one already on the machine.
 * 2. `axePath` is injected with `page.addInitScript`, never `page.addScriptTag`.
 *    The site serves a CSP without `unsafe-inline`, so a script tag is refused —
 *    and a refused injection looks exactly like a clean accessibility run.
 */
import { chromium } from 'playwright-core';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

/** The built site, served by `tests/server.mjs` with the real `_headers`. */
export const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:4331';

/**
 * The address the built site believes it lives at.
 *
 * Read from the canonical link on the built home page rather than written out,
 * because three suites need to assert "this points at production, not at
 * localhost" and a hostname typed into each of them turns a domain move into a
 * hunt through the test files. `SITE_URL` in the Cloudflare project settings is
 * the single place that decides this; everything downstream, tests included,
 * reads it back out of the artefact.
 */
export const PRODUCTION_URL = (() => {
  const home = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.html');
  if (!existsSync(home)) return null;
  const canonical = readFileSync(home, 'utf8').match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  return canonical ? new URL(canonical).origin : null;
})();

/** Same, as a bare hostname — what a fake address bar would show. */
export const PRODUCTION_HOST = PRODUCTION_URL ? new URL(PRODUCTION_URL).host : null;

export const axePath = require.resolve('axe-core/axe.min.js');

/** Where the WCAG rule sets we care about live, in one place. */
export const AXE_RULES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

  // A Playwright browser pool, if one is configured — version-agnostic, so an
  // upgrade does not silently break the suites.
  const pool = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (pool && existsSync(pool)) {
    for (const entry of readdirSync(pool)) {
      if (!entry.startsWith('chromium')) continue;
      for (const rel of [
        'chrome-linux/chrome',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-win/chrome.exe',
      ]) {
        const candidate = join(pool, entry, rel);
        if (existsSync(candidate)) return candidate;
      }
    }
    if (existsSync(join(pool, 'chromium'))) return join(pool, 'chromium');
  }

  return [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].find((path) => existsSync(path));
}

export async function launch(options = {}) {
  const executablePath = findChromium();
  if (!executablePath) {
    throw new Error(
      'No Chromium found. Install Google Chrome or Chromium, or set CHROMIUM_PATH ' +
        'to a browser binary.',
    );
  }
  return chromium.launch({ executablePath, ...options });
}

/** A page with axe-core already loaded, ready for `runAxe`. */
export async function auditPage(browser, options = {}) {
  const page = await browser.newPage(options);
  await page.addInitScript({ path: axePath });
  return page;
}

/**
 * Finish the scroll-reveal animation before measuring anything.
 *
 * `[data-reveal]` elements fade in over 0.6s. Run axe while one is at, say,
 * opacity 0.6 and it samples a blended colour — cyan #22d3ee reads as #198499 —
 * and reports a contrast failure that does not exist on the finished page.
 * Worse, whether it happens at all depends on load timing, so the suite passes
 * until something unrelated shifts by a few milliseconds.
 */
export async function settleAnimations(page) {
  await page.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')),
  );
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll('[data-reveal]')].every(
          (el) => getComputedStyle(el).opacity === '1',
        ),
      null,
      { timeout: 3000 },
    )
    .catch(() => {});
}

/** Run axe over the whole document, or over one selector. */
export function runAxe(page, selector) {
  return page.evaluate(
    async ([sel, rules]) =>
      // @ts-ignore — injected above
      axe.run(sel ? document.querySelector(sel) : document, { runOnly: rules }),
    [selector ?? null, AXE_RULES],
  );
}

/**
 * Collects results and prints them in the format `run.mjs` counts. Sets a
 * non-zero exit code if anything failed, so a suite cannot fail silently.
 */
export function checks() {
  let failed = 0;

  // Prints as it goes rather than buffering: these suites walk twenty-odd pages,
  // and a run that dies halfway should still show what passed before it did.
  const check = (name, pass, detail = '') => {
    if (!pass) failed += 1;
    const suffix = detail ? ` — ${detail}` : '';
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${suffix}`);
  };

  check.report = () => {
    if (failed) process.exitCode = 1;
    return failed;
  };

  return check;
}
