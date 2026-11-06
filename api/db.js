import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const stored = await get('allergo/db.json', { access: 'private', useCache: false });
      if (!stored) return res.status(404).end();
      return res.status(200).json(await new Response(stored.stream).json());
    }
    if (req.method !== 'PUT') return res.status(405).end();
    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return res.status(403).end();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !['companies', 'products', 'batches', 'scans', 'complaints'].every(k => Array.isArray(body[k]))) return res.status(400).end();
    const json = JSON.stringify(body);
    if (Buffer.byteLength(json) > 2 * 1024 * 1024) return res.status(413).end();
    await put('allergo/db.json', json, { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json' });
    return res.status(204).end();
  } catch (error) { console.error('Storage failure', error.message); return res.status(503).json({ error: 'Хранилище временно недоступно' }); }
}
