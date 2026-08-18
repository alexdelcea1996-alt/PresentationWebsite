import { execFileSync } from 'node:child_process';

/**
 * What this build knows about itself.
 *
 * Imported only from component frontmatter, which runs in Node at build time —
 * nothing here may ever reach the browser bundle, and `node:child_process`
 * above is the tripwire that makes a mistake loud rather than silent.
 *
 * The commit is resolved exactly the way `scripts/build-version.mjs` resolves
 * it, so the footer, the colophon and `/version.txt` cannot disagree about
 * which commit is live. That file is written after the Astro build; this runs
 * during it. Same inputs, same answer.
 */
function resolveCommit(): string {
  const fromPlatform =
    process.env.WORKERS_CI_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (fromPlatform) return fromPlatform;

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    // Built from a tarball rather than a checkout.
    return '';
  }
}

const commit = resolveCommit();

export const build = {
  commit,
  shortCommit: commit ? commit.slice(0, 7) : '',
  /** github.com/…/commit/<sha> — empty when the sha is unknown. */
  commitUrl: commit ? `https://github.com/alexdelcea1996-alt/PresentationWebsite/commit/${commit}` : '',
  repoUrl: 'https://github.com/alexdelcea1996-alt/PresentationWebsite',
} as const;

/**
 * How many checks are IN the suite.
 *
 * Not "how many passed". The build that produces this page runs before the
 * tests do, so a page claiming its own tests are green would be claiming
 * something it cannot possibly know — which is precisely the kind of statement
 * the rest of the site exists to argue against. The colophon says what the
 * number is and says why it is not a pass rate.
 *
 * Kept by hand, and guarded two ways rather than trusted: `colophon.mjs`
 * asserts it is at least the number of `ck(` call sites across the suite files
 * (loops can only push the real figure higher, never lower), and that the same
 * number appears in `tests/README.md` and the top-level `README.md`. A stale
 * figure fails the build's own test run.
 */
export const SUITE_CHECKS = 1151;

/**
 * The budgets `tests/suites/weight.mjs` actually asserts, restated for the
 * colophon. Numbers duplicated from a test are numbers that drift, so
 * `colophon.mjs` reads the thresholds out of that suite and compares.
 */
export const BUDGETS = {
  homeInlineJs: 15,
  css: 10.5,
  fonts: 64,
  homeBrotli: 25,
} as const;
