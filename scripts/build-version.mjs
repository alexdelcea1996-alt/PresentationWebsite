/**
 * Writes `dist/version.txt` — which commit the live site was built from.
 *
 * There is no way to look at a deployed page and tell whether it is current.
 * That gap cost real time: a page was committed twice, both builds went green,
 * and the address kept serving something older, with nothing on the site to say
 * so. Now `/version.txt` answers it in two seconds — open it and compare with
 * `git log -1`.
 *
 * The commit comes from whichever variable the platform sets (Workers Builds
 * and Pages name it differently), and falls back to asking git, so the file is
 * accurate for local builds too.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function commit() {
  const fromPlatform =
    process.env.WORKERS_CI_COMMIT_SHA ??
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.GITHUB_SHA;
  if (fromPlatform) return fromPlatform;

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    // A build from a tarball rather than a checkout. The timestamp still helps.
    return 'unknown';
  }
}

const sha = commit();
const lines = [
  `commit: ${sha}`,
  `short:  ${sha.slice(0, 7)}`,
  `built:  ${new Date().toISOString()}`,
  '',
];

writeFileSync(join(root, 'dist/version.txt'), lines.join('\n'));
console.log(`version: ${sha.slice(0, 7)}`);
