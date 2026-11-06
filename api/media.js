import { get } from '@vercel/blob';
import { Readable } from 'node:stream';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).end();
  const { batchId, kind } = req.query;
  if (!/^b[a-zA-Z0-9-]+$/.test(batchId || '') || !['photo', 'video'].includes(kind)) return res.status(400).end();
  try {
    const file = await get(`reports/${batchId}/${kind}`, { access: 'private', useCache: false });
    if (!file) return res.status(404).end();
    res.setHeader('Content-Type', file.blob.contentType);
    Readable.fromWeb(file.stream).pipe(res);
  } catch { return res.status(503).end(); }
}
