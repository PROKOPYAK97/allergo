import { Navigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRole, useStore } from '@/lib/store';
import { CompanyStatusBadge, ComplaintBadge } from '@/components/Badges';

export default function Admin() {
  const [role] = useRole();
  const store = useStore();

  if (role !== 'admin') return <Navigate to="/login" replace />;

  const totalScans = store.scans.length;
  const testedBatches = store.batches.filter((b) => b.tests.some((t) => t.result !== 'not_tested')).length;
  const openComplaints = store.complaints.filter((c) => c.status === 'open').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4 text-zinc-900">Администрирование платформы</h1>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          ['Производители', store.companies.length],
          ['Партии с тестами', testedBatches],
          ['Сканирований QR', totalScans],
        ].map(([label, v]) => (
          <Card key={label as string} className="border-[#004e35]/10 bg-card">
            <CardHeader className="pb-1"><CardTitle className="text-xs font-medium text-zinc-500">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-extrabold text-zinc-900">{v}</p></CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="companies">
        <TabsList className="bg-card border-[#004e35]/10">
          <TabsTrigger value="companies">Производители</TabsTrigger>
          <TabsTrigger value="complaints">
            Жалобы {openComplaints > 0 && <Badge className="ml-1 bg-[#c0392b] hover:bg-[#c0392b]">{openComplaints}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card className="border-[#004e35]/10 bg-card">
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#004e35]/10 hover:bg-transparent">
                    <TableHead className="text-zinc-500">Компания</TableHead>
                    <TableHead className="text-zinc-500">ИНН</TableHead>
                    <TableHead className="text-zinc-500">Тариф</TableHead>
                    <TableHead className="text-zinc-500">Статус</TableHead>
                    <TableHead className="text-zinc-500 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.companies.map((c) => (
                    <TableRow key={c.id} className="border-[#004e35]/10 hover:bg-[#004e35]/[0.04]">
                      <TableCell className="font-medium text-zinc-800">{c.name}</TableCell>
                      <TableCell className="text-zinc-600">{c.inn}</TableCell>
                      <TableCell className="text-zinc-600">Стандарт</TableCell>
                      <TableCell><CompanyStatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-right space-x-1">
                        {c.status !== 'active' && (
                          <Button size="sm" variant="outline" onClick={() => store.setCompanyStatus(c.id, 'active')}>Активировать</Button>
                        )}
                        {c.status !== 'blocked' && (
                          <Button size="sm" variant="ghost" onClick={() => store.setCompanyStatus(c.id, 'blocked')}>Блок</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card className="border-[#004e35]/10 bg-card">
            <CardContent className="pt-4 space-y-4">
              {store.complaints.length === 0 && <p className="text-sm text-zinc-500">Жалоб нет.</p>}
              {store.complaints.map((c) => {
                const b = store.batches.find((x) => x.id === c.batchId);
                const p = b && store.products.find((x) => x.id === b.productId);
                return (
                  <div key={c.id} className="border border-[#004e35]/15 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium text-sm text-zinc-800">
                          {p?.name} · партия №{b?.batchNumber}
                        </p>
                        <p className="text-sm text-zinc-600 mt-1">{c.text}</p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {new Date(c.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ComplaintBadge status={c.status} />
                        <Select
                          value={c.status}
                          onValueChange={(v) => store.setComplaintStatus(c.id, v as typeof c.status)}
                        >
                          <SelectTrigger className="w-44 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Открыта</SelectItem>
                            <SelectItem value="in_review">На рассмотрении</SelectItem>
                            <SelectItem value="resolved">Решена</SelectItem>
                            <SelectItem value="rejected">Отклонена</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-right">
        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Сбросить все демо-данные?')) store.resetDemo(); }}>
          Сбросить демо-данные
        </Button>
      </div>
    </div>
  );
}
                                                                                                                                      