/**
 * Serves `dist/` the way Cloudflare will: every header in `dist/_headers` is
 * applied to the matching path.
 *
 * This matters more than it looks. The site's CSP lists a SHA-256 hash for each
 * inline script, regenerated on every build. Testing against a plain static
 * server would happily run scripts that production refuses, and the first sign
 * of trouble would be a blank section on the live site.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.TEST_PORT ?? 4331);

// Re-read per request rather than caching: a rebuild mid-session regenerates the
// hashes, and a stale copy would block the very scripts under test.
async function loadRules() {
  const raw = await readFile(join(DIST, '_headers'), 'utf8');
  const rules = [];
  let current = null;

  for (const line of raw.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: [] };
      rules.push(current);
    } else if (current) {
      const idx = line.indexOf(':');
      current.headers.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()]);
    }
  }

  return rules;
}

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.xml': 'application/xml',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path.endsWith('/')) path += 'index.html';

  let body;
  try {
    body = await readFile(join(DIST, path));
  } catch {
    try {
      body = await readFile(join(DIST, path, 'index.html'));
      path += '/index.html';
    } catch {
      res.writeHead(404);
      return res.end('not found');
    }
  }

  for (const rule of await loadRules()) {
    const pattern = new RegExp(`^${rule.pattern.replace(/\*/g, '.*')}$`);
    if (pattern.test(path) || pattern.test(path.replace(/index\.html$/, ''))) {
      for (const [key, value] of rule.headers) res.setHeader(key, value);
    }
  }

  res.setHeader('Content-Type', types[extname(path)] ?? 'application/octet-stream');
  res.writeHead(200);
  res.end(body);
});

// Refuse to carry on if the port is taken. Something else on 4331 would serve a
// different — possibly stale — build, and the suites would pass against it while
// telling you nothing about the code you just changed.
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop whatever is listening there, or set ` +
        'TEST_PORT to a free port.',
    );
  } else {
    console.error(error.message);
  }
  process.exit(1);
});

server.listen(PORT, () => console.log(`test server on ${PORT}`));
