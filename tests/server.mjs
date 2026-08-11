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
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
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
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path.endsWith('/')) path += 'index.html';

  let body;
  let status = 200;
  try {
    body = await readFile(join(DIST, path));
  } catch {
    try {
      body = await readFile(join(DIST, path, 'index.html'));
      path += '/index.html';
    } catch {
      // Same as Cloudflare: unknown paths get 404.html with a 404 status.
      try {
        body = await readFile(join(DIST, '404.html'));
        path = '/404.html';
        status = 404;
      } catch {
        res.writeHead(404);
        return res.end('not found');
      }
    }
  }

  for (const rule of await loadRules()) {
    const pattern = new RegExp(`^${rule.pattern.replace(/\*/g, '.*')}$`);
    if (pattern.test(path) || pattern.test(path.replace(/index\.html$/, ''))) {
      for (const [key, value] of rule.headers) res.setHeader(key, value);
    }
  }

  const type = types[extname(path)] ?? 'application/octet-stream';
  res.setHeader('Content-Type', type);

  // Compress the way Cloudflare does. Without this, a Lighthouse run here
  // measures a site that does not exist: 110 kB of HTML crossing a throttled
  // mobile link uncompressed, when production ships roughly a fifth of that.
  const accepts = req.headers['accept-encoding'] ?? '';
  const compressible = /^(text\/|application\/(json|xml|manifest))/.test(type) || type.endsWith('+json');

  if (compressible && body.length > 1024) {
    if (accepts.includes('br')) {
      body = brotliCompressSync(body, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
      });
      res.setHeader('Content-Encoding', 'br');
    } else if (accepts.includes('gzip')) {
      body = gzipSync(body);
      res.setHeader('Content-Encoding', 'gzip');
    }
    res.setHeader('Vary', 'Accept-Encoding');
  }

  res.writeHead(status);
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
