import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A sample of the names of checks that actually exist in the suite.
 *
 * Read out of `tests/suites/*.mjs` at build time, never written by hand. The
 * constellation in the hero and on the colophon draws one dot per check and
 * names them on hover; names invented for that would make an ornament about
 * honesty into a lie, which is worse than having no ornament.
 *
 * `node:fs` above is the same deliberate tripwire as in `build.ts`: this module
 * may only ever be imported from component frontmatter, which runs in Node. If
 * it is ever pulled into a client bundle the build fails loudly instead of
 * shipping a broken page.
 *
 * A SAMPLE, and the copy says so. All 1,152 names would be some 50 kB of text
 * on the landing page to support a hover — the count is the claim being made,
 * and that one is exact and asserted; the names are there to show what a check
 * in this suite actually looks like.
 */
/*
  Anchored to the working directory, not to `import.meta.url`.

  Astro bundles this module into `dist/.prerender/` before running it, so
  `import.meta.url` points inside the output folder and walking up from there
  lands on `dist/tests/suites`, which does not exist. The build ran from the
  project root, and that is the only stable anchor here. If it ever does not,
  the read throws and the build stops — which is the right failure for a page
  that would otherwise quietly render with no names at all.
*/
const suiteDir = join(process.cwd(), 'tests', 'suites');

/** `ck('…')` and `check('…')`, which is how every suite declares an assertion. */
const CALL = /\b(?:ck|check)\(\s*(['"`])([^'"`\n]{12,64})\1/g;

function collect(): string[] {
  const names = new Set<string>();

  for (const file of readdirSync(suiteDir).sort()) {
    if (!file.endsWith('.mjs')) continue;
    const source = readFileSync(join(suiteDir, file), 'utf8');
    for (const [, , name] of source.matchAll(CALL)) {
      // Template names are built per iteration and read as fragments out of
      // context ("dark: ${label}"), so only the fully literal ones are shown.
      if (name.includes('${') || name.includes('|')) continue;
      // A selector is a name to a machine, not to a reader.
      if (/^[[.#]|=>|\)$/.test(name)) continue;
      names.add(name.trim());
    }
  }

  return [...names].sort();
}

/**
 * Evenly spaced through the sorted set rather than the first N, so the sample
 * spans the whole suite — the first N alphabetically would be a wall of checks
 * that happen to start with "and".
 */
function sample(all: string[], count: number): string[] {
  if (all.length <= count) return all;
  const step = all.length / count;
  return Array.from({ length: count }, (_, i) => all[Math.floor(i * step)]!);
}

/**
 * How many assertions each suite file declares, in the order they run.
 *
 * The constellation uses this to give every dot a depth: a dot belongs to the
 * suite it came from, and the suites are stacked back to front, so the cloud
 * turned side-on is the shape of the test suite rather than a slab of noise.
 * Twenty-eight sheets, each as dense as that suite is large.
 *
 * These are `ck(` call sites, the same lower bound `SUITE_CHECKS` is guarded
 * against — a suite that asserts inside a loop really runs more than it
 * declares. Proportions are what the picture needs, and the proportions of the
 * declarations are close enough to the proportions of the runs to be honest
 * about it in the copy: this is the shape of the suite as written.
 */
function shape(): number[] {
  const sizes: number[] = [];

  for (const file of readdirSync(suiteDir).sort()) {
    if (!file.endsWith('.mjs')) continue;
    const source = readFileSync(join(suiteDir, file), 'utf8');
    sizes.push([...source.matchAll(CALL)].length);
  }

  return sizes;
}

const all = collect();

/** How many distinct literal names the suite declares — for the copy to cite. */
export const CHECK_NAMES_FOUND = all.length;

/** One number per suite file, in run order. Sums to the declared call sites. */
export const SUITE_SHAPE: readonly number[] = shape();

export const CHECK_SAMPLE: readonly string[] = sample(all, 40);
