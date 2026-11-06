import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DEMO_COMPANY_ID, useStore } from '@/lib/store';
import { QrCode, Package, FlaskConical, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const store = useStore();
  const batches = store.batches.filter((b) => b.companyId === DEMO_COMPANY_ID);
  const scans = useMemo(
    () => store.scans.filter((s) => batches.some((b) => b.id === s.batchId)),
    [store.scans, batches],
  );
  const last7 = scans.filter(
    (s) => Date.now() - new Date(s.scannedAt).getTime() < 7 * 24 * 3600e3,
  );

  const kpis = [
    { icon: QrCode, label: 'Сканирований QR всего', value: scans.length },
    { icon: Users, label: 'Сканирований за 7 дней', value: last7.length },
    { icon: Package, label: 'Активных партий', value: batches.filter((b) => b.status === 'active').length },
    { icon: FlaskConical, label: 'Проведено тестов', value: batches.reduce((n, b) => n + b.tests.filter((t) => t.result !== 'not_tested').length, 0) },
  ];

  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of scans) {
      const d = s.scannedAt.slice(0, 10);
      m.set(d, (m.get(d) ?? 0) + 1);
    }
    return [...m.entries()].sort();
  }, [scans]);

  const max = Math.max(1, ...byDay.map(([, v]) => v));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const KpiIcon = k.icon;
          return (
          <Card key={k.label} className="border-[#004e35]/10 bg-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-zinc-500">{k.label}</CardTitle>
              <KpiIcon className="w-4 h-4 text-[#004e35]" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-zinc-900">{k.value}</p>
            </CardContent>
          </Card>
          );
        })}
      </div>

      <Card className="border-[#004e35]/10 bg-card">
        <CardHeader>
          <CardTitle className="text-base text-zinc-900">Сканирования по дням</CardTitle>
        </CardHeader>
        <CardContent>
          {byDay.length === 0 ? (
            <p className="text-sm text-zinc-500">Данных пока нет.</p>
          ) : (
            <div className="flex items-end gap-2 h-36">
              {byDay.map(([d, v]) => (
                <div key={d} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div
                    className="w-full bg-volt rounded-t"
                    style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
                    title={`${v} сканирований`}
                  />
                  <span className="text-[10px] text-zinc-500 truncate w-full text-center">
                    {new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#004e35]/10 bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-zinc-900">Последние партии</CardTitle>
          <Link to="/cabinet/batches"><Button size="sm" variant="outline">Все партии</Button></Link>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {batches.slice(0, 3).map((b) => {
            const p = store.products.find((x) => x.id === b.productId);
            return (
              <div key={b.id} className="flex items-center justify-between gap-3 border-b border-[#004e35]/10 last:border-0 pb-2">
                <div className="min-w-0">
                  <p className="font-medium truncate text-zinc-800">{p?.name} · партия №{b.batchNumber}</p>
                  <p className="text-xs text-zinc-500">
                    {store.scans.filter((s) => s.batchId === b.id).length} сканирований
                  </p>
                </div>
                <Badge variant={b.status === 'active' ? 'default' : 'secondary'}>
                  {b.status === 'active' ? 'Активна' : 'Архив'}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
                                                                                                             