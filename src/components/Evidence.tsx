import { useEffect, useState } from 'react';
export default function Evidence({ batchId, editable = false }: { batchId: string; editable?: boolean }) {
  const [media, setMedia] = useState<{ photo?: string; video?: string }>({}), [error, setError] = useState(''), [revision, setRevision] = useState(0), [uploading, setUploading] = useState(false);
  useEffect(() => {
    let active = true; const urls: string[] = [];
    setMedia({});
    for (const kind of ['photo', 'video'] as const) {
      void fetch(`/api/media/${batchId}/${kind}`).then(async response => {
        if (response.status === 404) return;
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        if (active) { const url = URL.createObjectURL(blob); urls.push(url); setMedia(m => ({ ...m, [kind]: url })); }
      }).catch(() => { if (active) setError('Не удалось загрузить материалы отчёта.'); });
    }
    return () => { active = false; urls.forEach(URL.revokeObjectURL); };
  }, [batchId, revision]);
  async function upload(kind: string, file?: File) {
    if (!file) return;
    const allowed = kind === 'photo' ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] : ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowed.includes(file.type) || file.size > 40 * 1024 * 1024) { setError('Нужны JPG/PNG/WebP/GIF или MP4/WebM/OGG до 40 МБ.'); return; }
    setUploading(true);
    try {
      if (import.meta.env.VITE_STORAGE_MODE === 'blob') {
        const { upload } = await import('@vercel/blob/client');
        await upload(`reports/${batchId}/${kind}`, file, { access: 'private', handleUploadUrl: '/api/upload', contentType: file.type, multipart: file.size > 4 * 1024 * 1024 });
      } else {
        const response = await fetch(`/api/media/${batchId}/${kind}`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!response.ok) throw new Error();
      }
      setError(''); setRevision(n => n + 1);
    } catch { setError('Не удалось сохранить файл на сервере. Повторите загрузку.'); }
    finally { setUploading(false); }
  }
  return <section className="border rounded-xl p-4 space-y-3"><h2 className="font-semibold">Фото и видео LFA-теста</h2>
    <p className="text-xs text-zinc-500">Материалы производителя для этой партии. Платформа не проводит независимую экспертизу.</p>
    {media.photo && <img src={media.photo} alt="Фото LFA-теста партии" className="max-h-80 rounded-lg" />}
    {media.video && <video src={media.video} controls className="w-full max-h-80 rounded-lg" />}
    {!media.photo && !media.video && <p>Материалы не загружены. Фото и видео подтверждения отсутствуют.</p>}
    {editable && <div className="space-y-3"><label className="block">Фото теста<input disabled={uploading} className="block text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => void upload('photo', e.target.files?.[0])} /></label><label className="block">Видео тестирования<input disabled={uploading} className="block text-sm" type="file" accept="video/mp4,video/webm,video/ogg" onChange={e => void upload('video', e.target.files?.[0])} /></label></div>}
    {uploading && <p role="status">Загрузка файла…</p>}{error && <p role="alert">{error}</p>}
  </section>;
}
