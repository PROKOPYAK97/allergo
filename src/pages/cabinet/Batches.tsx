import Evidence from '@/components/Evidence';
import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Download, Lock, QrCode as QrIcon } from 'lucide-react';
import { ALLERGENS, allergenName, type BatchTest } from '@/lib/data';
import { DEMO_COMPANY_ID, batchLocked, useStore } from '@/lib/store';
import { Qr } from '@/components/Qr';
import { TestBadge } from '@/components/Badges';

type Draft = Record<string, { checked: boolean; result: 'negative' | 'positive' }>;

export default function Batches() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().slice(0, 10));
  const [draft, setDraft] = useState<Draft>({});
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const products = store.products.filter((p) => p.companyId === DEMO_COMPANY_ID);
  const batches = store.batches.filter((b) => b.companyId === DEMO_COMPANY_ID);

  const selected = (a: string) => draft[a]?.checked ?? false;

  const submit = () => {
    const tests: BatchTest[] = ALLERGENS.map((a) => {
      const d = draft[a.id];
      const checked = d?.checked ?? false;
      return {
        allergenId: a.id,
        result: !checked ? ('not_tested' as const) : d!.result,
        method: checked
          ? 'Экспресс-тест иммунохроматографический, ХЕМАТест «Профи»'
          : '',
        testedAt: new Date().toISOString(),
      };
    });
    const id = store.addBatch({ productId, batchNumber: batchNumber.trim(), productionDate, tests });
    const url = `${window.location.origin}/batch/${id}`;
    setCreatedUrl(url);
    setDraft({}); setBatchNumber(''); setProductId('');
  };

  const downloadLabel = (productName: string, batchNumber: string, url: string) => {
    const w = window.open('', '_blank', 'width=420,height=560');
    if (!w) return;
    const canvas = document.createElement('canvas');
    // QR в PNG через временный canvas
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(canvas, url, { width: 300, margin: 1 }, () => {
        w.document.write(`<html><head><title>Этикетка партии №${batchNumber}</title>
          <style>body{font-family:Arial;text-align:center;padding:24px}
          h1{font-size:18px}p{color:#555;font-size:13px}.badge{border:2px solid #2E7D32;border-radius:12px;padding:12px;margin-top:12px;font-weight:bold;color:#2E7D32}</style></head>
          <body><h1>${productName}</h1><p>Партия №${batchNumber} — проверена</p>
          <img src="${canvas.toDataURL()}" width="300" height="300"/>
          <div class="badge">Партия проверена: сканируйте и посмотрите результаты тестов</div>
          <script>window.print()</script></body></html>`);
        w.document.close();
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{batches.length} партий</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Новая партия</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-[#004e35]/15">
            <DialogHeader>
              <DialogTitle>Новая партия и план тестов</DialogTitle>
            </DialogHeader>
            {createdUrl ? (
              <div className="text-center space-y-3 py-4">
                <p className="font-medium text-zinc-800">Партия создана. QR-метка готова:</p>
                <div className="inline-block border border-[#004e35]/15 p-3 rounded-lg bg-white">
                  <Qr value={createdUrl} size={200} />
                </div>
                <p className="text-xs text-zinc-500 break-all">{createdUrl}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setCreatedUrl(null)}>Создать ещё</Button>
                  <Button variant="outline" onClick={() => setOpen(false)}>Готово</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Продукт</Label>
                    <Select value={productId} onValueChange={setProductId}>
                      <SelectTrigger><SelectValue placeholder="Выберите…" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Номер партии</Label>
                    <Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="1043" />
                  </div>
                  <div>
                    <Label>Дата производства</Label>
                    <Input type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>План тестов (аллергены по ТР ТС 022/2011)</Label>
                  <div className="mt-2 grid sm:grid-cols-2 gap-2">
                    {ALLERGENS.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 border border-[#004e35]/15 rounded-md px-3 py-2">
                        <Checkbox
                          checked={selected(a.id)}
                          onCheckedChange={(v) =>
                            setDraft((d) => ({
                              ...d,
                              [a.id]: { checked: !!v, result: d[a.id]?.result ?? 'negative' },
                            }))
                          }
                        />
                        <span className="text-sm flex-1 text-zinc-700">{a.icon} {a.name}</span>
                        {selected(a.id) && (
                          <Select
                            value={draft[a.id].result}
                            onValueChange={(v) =>
                              setDraft((d) => ({ ...d, [a.id]: { checked: true, result: v as 'negative' | 'positive' } }))
                            }
                          >
                            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="negative">Не обнаружен</SelectItem>
                              <SelectItem value="positive">Обнаружен</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={!productId || !batchNumber.trim() || !Object.values(draft).some((d) => d.checked)}
                  onClick={submit}
                >
                  Создать партию и сгенерировать QR
                </Button>
                <p className="text-xs text-zinc-500">
                  Через 24 часа после создания результаты блокируются — платформа фиксирует факт тестирования.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {batches.map((b) => {
          const p = products.find((x) => x.id === b.productId);
          const url = `${window.location.origin}/batch/${b.id}`;
          const locked = batchLocked(b.createdAt);
          const scans = store.scans.filter((s) => s.batchId === b.id).length;
          return (
            <Card key={b.id} className="border-[#004e35]/10 bg-card">
              <CardContent className="pt-5">
                <div className="flex flex-wrap gap-4">
                  <div className="border border-[#004e35]/15 rounded-lg p-2 bg-white h-fit">
                    <Qr value={url} size={96} />
                  </div>
                  <div className="flex-1 min-w-48">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-zinc-800">{p?.name}</p>
                      <Badge variant={b.status === 'active' ? 'default' : 'secondary'}>
                        {b.status === 'active' ? 'Активна' : 'Архив'}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500">
                      Партия №{b.batchNumber} · произведена {b.productionDate} · {scans} сканирований
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {b.tests.filter((t) => t.result !== 'not_tested').map((t) => (
                        <Badge
                          key={t.allergenId}
                          className={
                            t.result === 'negative'
                              ? 'bg-[#88e53e]/25 text-[#004e35] hover:bg-[#88e53e]/25 border-[#88e53e]/70'
                              : 'bg-red-100 text-red-800 hover:bg-red-100 border-red-300'
                          }
                        >
                          {allergenName(t.allergenId)}: {t.result === 'negative' ? 'не обнаружен' : 'обнаружен'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 h-fit">
                    <Link to={`/batch/${b.id}`} target="_blank">
                      <Button size="sm" variant="outline"><QrIcon className="w-4 h-4 mr-1" /> Открыть страницу</Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => downloadLabel(p?.name ?? '', b.batchNumber, url)}>
                      <Download className="w-4 h-4 mr-1" /> Этикетка
                    </Button>
                    {b.status === 'active' && (
                      <Button size="sm" variant="ghost" onClick={() => store.archiveBatch(b.id)}>В архив</Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-3"><Evidence batchId={b.id} editable /><label className="block text-sm">Коды маркировки этой партии (по одному в строке)<textarea className="block w-full border rounded p-2" defaultValue={b.markingCodes?.join('\n') ?? ''} onBlur={e => { try { store.bindCodes(b.id, e.target.value.split('\n').map(c => c.trim()).filter(Boolean)); e.target.setCustomValidity(''); } catch (err) { e.target.setCustomValidity((err as Error).message); e.target.reportValidity(); } }} /></label><p className="text-xs">Сохранение при выходе из поля. Введите полный Data Matrix с серийным номером. Один GTIN не связывает товар с партией.</p></div><Separator className="my-3 bg-[#004e35]/10" />
                <div className="space-y-1">
                  {b.tests.map((t) => (
                    <div key={t.allergenId} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700">{allergenName(t.allergenId)}</span>
                      <span className="flex items-center gap-2">
                        {locked && <Lock className="w-3 h-3 text-zinc-600" />}
                        <TestBadge result={t.result} />
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
                                                                                                                                                                                                                                             