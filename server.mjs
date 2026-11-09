import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method not allowed.');
  }
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = path.resolve(ROOT, `.${relative}`);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      res.writeHead(403);
      return res.end('Forbidden.');
    }
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) {
      res.writeHead(404);
      return res.end('Not found.');
    }
    const content = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(500);
    res.end('Could not serve this page.');
  }
});

server.listen(PORT, HOST, () => console.log(`CookPath running at http://${HOST}:${PORT}`));
