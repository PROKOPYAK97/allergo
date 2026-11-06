import { handleUpload } from '@vercel/blob/client';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const response = await handleUpload({
      request: req, body: req.body,
      onBeforeGenerateToken: async pathname => {
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) throw new Error('Invalid origin');
        if (!/^reports\/b[a-zA-Z0-9-]+\/(photo|video)$/.test(pathname)) throw new Error('Invalid report path');
        return {
          allowedContentTypes: pathname.endsWith('/photo') ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] : ['video/mp4', 'video/webm', 'video/ogg'],
          maximumSizeInBytes: 40 * 1024 * 1024, addRandomSuffix: false, allowOverwrite: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return res.status(200).json(response);
  } catch { return res.status(400).json({ error: 'Не удалось начать загрузку отчёта' }); }
}
