import { Badge } from '@/components/ui/badge';
import type { TestResult } from '@/lib/data';
import type { Complaint } from '@/lib/data';

export function TestBadge({ result }: { result: TestResult }) {
  if (result === 'negative')
    return <Badge className="bg-lime-100 text-lime-900 hover:bg-lime-100 border-lime-300">Не обнаружен</Badge>;
  if (result === 'positive')
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Обнаружен</Badge>;
  return <Badge variant="secondary">Не тестировался</Badge>;
}

export function ComplaintBadge({ status }: { status: Complaint['status'] }) {
  const map: Record<Complaint['status'], [string, string]> = {
    open: ['Открыта', 'bg-amber-100 text-amber-900 hover:bg-amber-100 border-amber-300'],
    in_review: ['На рассмотрении', 'bg-sky-100 text-sky-900 hover:bg-sky-100 border-sky-300'],
    resolved: ['Решена', 'bg-lime-100 text-lime-900 hover:bg-lime-100 border-lime-300'],
    rejected: ['Отклонена', 'bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-zinc-300'],
  };
  const [label, cls] = map[status];
  return <Badge className={cls}>{label}</Badge>;
}

export function CompanyStatusBadge({ status }: { status: 'active' | 'moderation' | 'blocked' }) {
  const map = {
    active: ['Активен', 'bg-lime-100 text-lime-900 hover:bg-lime-100 border-lime-300'],
    moderation: ['На модерации', 'bg-amber-100 text-amber-900 hover:bg-amber-100 border-amber-300'],
    blocked: ['Заблокирован', 'bg-red-100 text-red-800 hover:bg-red-100 border-red-300'],
  } as const;
  const [label, cls] = map[status];
  return <Badge className={cls}>{label}</Badge>;
}
