// Local dev server that mirrors production: serves /site with directory indexes,
// applies the redirects and security headers from netlify.toml, and routes POST /api/lead
// to the real function (stub mode locally, since no CRM env vars are set).
// Usage: node serve.mjs            (port 3001)
//        $env:PORT=3002; node serve.mjs   (PowerShell)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(root, 'site');
const port = Number(process.env.PORT) || 3001;
const fn = async (f) => (await import(pathToFileURL(path.join(root, 'netlify/functions', f)).href)).default;
const FUNCTIONS = { '/api/lead': await fn('lead.mjs'), '/api/contractor-demo': await fn('contractor-demo.mjs') };

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const toml = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
const securityHeaders = Object.fromEntries(
  [...(toml.split('[[headers]]').find((b) => /for\s*=\s*"\/\*"/.test(b)) || '').matchAll(/^\s*([A-Za-z-]+)\s*=\s*"(.*)"\s*$/gm)]
    .filter(([, k]) => k !== 'for' && k !== 'Strict-Transport-Security').map(([, k, v]) => [k, v]),
);
const redirects = [...toml.matchAll(/\[\[redirects\]\]\s*from\s*=\s*"([^"]+)"\s*to\s*=\s*"([^"]+)"\s*status\s*=\s*(\d+)/g)]
  .map(([, from, to, status]) => ({ from, to, status: Number(status) }));

function matchRedirect(p) {
  for (const r of redirects) {
    if (r.from.endsWith('/*') ? p.startsWith(r.from.slice(0, -1)) : p === r.from || p === `${r.from}/`) return r;
  }
  return null;
}

async function handleFunction(handler, req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: { 'content-type': req.headers['content-type'] || 'application/json' },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
  });
  const response = await handler(request, { ip: '127.0.0.1' });
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  try {
    if (FUNCTIONS[url.pathname]) return await handleFunction(FUNCTIONS[url.pathname], req, res);
    const headers = { ...securityHeaders, 'Cache-Control': 'no-store' };
    const p = decodeURIComponent(url.pathname);
    const r = matchRedirect(p);
    if (r && !fs.existsSync(path.join(siteRoot, p, 'index.html'))) {
      res.writeHead(r.status, { ...headers, Location: r.to });
      return res.end();
    }
    let file = path.normalize(path.join(siteRoot, p));
    if (!file.startsWith(siteRoot)) { res.writeHead(400); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: `${p}/${url.search}` }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { ...headers, 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      return fs.createReadStream(file).pipe(res);
    }
    res.writeHead(404, { ...headers, 'Content-Type': TYPES['.html'] });
    fs.createReadStream(path.join(siteRoot, '404.html')).pipe(res);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') { console.error(`Port ${port} is in use. Try: $env:PORT=3002; node serve.mjs`); process.exit(1); }
  throw err;
});
server.listen(port, () => console.log(`IronWeb Digital running at http://localhost:${port}`));
