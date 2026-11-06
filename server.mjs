import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist'), dataDir = path.resolve(process.env.DATA_DIR || 'runtime-data');
await fs.mkdir(dataDir, { recursive: true });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const media = url.pathname.match(/^\/api\/media\/(b[a-zA-Z0-9-]+)\/(photo|video)$/);
    if (url.pathname === '/api/db' || media) {
      const file = path.join(dataDir, media ? `${media[1]}-${media[2]}` : 'db.json');
      if (req.method === 'GET') {
        try { const b = await fs.readFile(file); res.setHeader('Content-Type', media ? await fs.readFile(file + '.type', 'utf8') : 'application/json'); res.end(b); }
        catch { res.writeHead(404); res.end(); } return;
      }
      if (req.method !== 'PUT') { res.writeHead(405); res.end(); return; }
      // Demo server: same-origin writes only. Roles are presentation roles, not authentication.
      if (req.headers.origin && req.headers.origin !== 'http://localhost:5173' && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) { res.writeHead(403); res.end(); return; }
      let size = 0; const chunks = [];
      for await (const chunk of req) { size += chunk.length; if (size > (media ? 40 * 1024 * 1024 : 2 * 1024 * 1024)) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
      const body = Buffer.concat(chunks);
      if (media) {
        const type = req.headers['content-type'] || '';
        if (!(media[2] === 'photo' ? /^image\/(jpeg|png|webp|gif)$/ : /^video\/(mp4|webm|ogg)$/).test(type)) { res.writeHead(415); res.end(); return; }
        await fs.writeFile(file + '.type', type);
      } else {
        const db = JSON.parse(body.toString());
        if (!['products', 'batches', 'companies', 'scans', 'complaints'].every(k => Array.isArray(db[k]))) { res.writeHead(400); res.end(); return; }
      }
      await fs.writeFile(file + '.tmp', body); await fs.rename(file + '.tmp', file); res.writeHead(204); res.end(); return;
    }
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    const target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!target.startsWith(root + path.sep) && target !== root) { res.writeHead(403); res.end(); return; }
    let file = target;
    try { if (!(await fs.stat(file)).isFile()) file = path.join(root, 'index.html'); } catch { file = path.join(root, 'index.html'); }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(500); res.end('Server error'); }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Allergo demo: http://localhost:3000'));
