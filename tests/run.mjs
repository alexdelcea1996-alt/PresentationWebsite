/**
 * Runs every suite against the built site.
 *
 *   npm run build && npm test
 *
 * Boots `server.mjs` (which applies the real `_headers`), runs each suite in its
 * own process so one crash cannot take the rest down, and reports a tally.
 * Exits non-zero if anything failed — including a suite that died before it
 * managed to print a single result, which is the failure mode that matters most:
 * a silently broken harness reads exactly like a clean run.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const PORT = Number(process.env.TEST_PORT ?? 4331);
const BASE = process.env.TEST_BASE_URL ?? `http://localhost:${PORT}`;

const SUITES = [
  'a11y',
  'a11y-light',
  'csp',
  'transitions',
  'completeness',
  'guarantees',
  'legal',
  'demo',
  'store',
  'offers',
  'share-images',
  'case-study',
  'audit',
  'interact',
  'channels',
  'metrics',
  'configurator',
  'theme',
  'hero',
  'booking',
];

const only = process.argv.slice(2);
const selected = only.length ? SUITES.filter((s) => only.includes(s)) : SUITES;

if (only.length && selected.length !== only.length) {
  const unknown = only.filter((s) => !SUITES.includes(s));
  console.error(`Unknown suite(s): ${unknown.join(', ')}\nAvailable: ${SUITES.join(', ')}`);
  process.exit(2);
}

if (!existsSync(join(root, 'dist', '_headers'))) {
  console.error('No dist/_headers found. Run `npm run build` first — the suites test\nthe built site, headers included.');
  process.exit(2);
}

const server = spawn(process.execPath, [join(here, 'server.mjs')], {
  stdio: ['ignore', 'pipe', 'inherit'],
  env: { ...process.env, TEST_PORT: String(PORT) },
});

const stopServer = () => server.kill();
process.on('exit', stopServer);
process.on('SIGINT', () => { stopServer(); process.exit(130); });

/**
 * Wait for *our* server to announce itself, rather than for the port to answer.
 * Polling with fetch cannot tell our server from someone else's: if the port is
 * already taken, the squatter replies, the poll succeeds, and the whole suite
 * runs against a build we did not make — passing, and proving nothing.
 */
function waitForServer() {
  return new Promise((resolve) => {
    const done = (ok) => { clearTimeout(timer); resolve(ok); };
    const timer = setTimeout(() => done(false), 10_000);

    server.stdout.on('data', (chunk) => {
      if (String(chunk).includes('test server on')) done(true);
    });
    server.on('exit', () => done(false));
  });
}

if (!(await waitForServer())) {
  console.error(
    '\nThe test server did not start (see the message above). Aborting rather than\n' +
      'running against whatever else may be on the port.',
  );
  stopServer();
  process.exit(2);
}

function runSuite(name) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(here, 'suites', `${name}.mjs`)], {
      env: { ...process.env, TEST_BASE_URL: BASE },
    });

    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });

    child.on('close', (code) => {
      const pass = (output.match(/^PASS\b/gm) ?? []).length;
      const fail = (output.match(/^FAIL\b/gm) ?? []).length;
      resolve({ name, pass, fail, code, output });
    });
  });
}

const started = Date.now();
const results = [];

for (const name of selected) {
  process.stdout.write(`  ${name}…`);
  const result = await runSuite(name);
  results.push(result);

  // A suite that exits non-zero with nothing to show did not pass — it broke.
  const crashed = result.code !== 0 && result.fail === 0;
  const status = crashed ? 'CRASHED' : result.fail ? `${result.fail} FAILED` : 'ok';
  process.stdout.write(`\r  ${result.name.padEnd(12)} ${String(result.pass).padStart(3)} passed  ${status}\n`);

  if (result.fail || crashed) {
    for (const line of result.output.split('\n')) {
      if (line.startsWith('FAIL') || crashed) console.log(`      ${line}`);
    }
  }
}

stopServer();

const pass = results.reduce((sum, r) => sum + r.pass, 0);
const fail = results.reduce((sum, r) => sum + r.fail, 0);
const crashed = results.filter((r) => r.code !== 0 && r.fail === 0);
const seconds = ((Date.now() - started) / 1000).toFixed(1);

console.log(`\n${pass} passed, ${fail} failed${crashed.length ? `, ${crashed.length} crashed` : ''} in ${seconds}s`);

process.exit(fail || crashed.length ? 1 : 0);
