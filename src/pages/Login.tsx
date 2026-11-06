import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, ShieldCheck, HeartPulse } from 'lucide-react';
import { useRole, DEMO_COMPANY_ID, useStore } from '@/lib/store';

export default function Login() {
  const [, setRole] = useRole();
  const store = useStore();
  const nav = useNavigate();
  const company = store.companies.find((c) => c.id === DEMO_COMPANY_ID);

  const cards = [
    {
      icon: HeartPulse,
      iconCls: 'text-[#004e35]',
      title: 'Я покупатель',
      text: 'Личный кабинет: укажите свои аллергены один раз — и проверка любого продукта займёт секунды.',
      button: 'Войти как покупатель',
      variant: 'outline' as const,
      action: () => { setRole('buyer'); nav('/profile'); },
    },
    {
      icon: Factory,
      iconCls: 'text-[#004e35]',
      title: 'Я производитель',
      text: `Кабинет компании «${company?.name}» — продукты, партии, результаты тестов и QR-метки.`,
      button: 'Войти как производитель',
      variant: 'default' as const,
      action: () => { setRole('manufacturer'); nav('/cabinet'); },
    },
    {
      icon: ShieldCheck,
      iconCls: 'text-zinc-700',
      title: 'Я администратор',
      text: 'Модерация производителей, жалобы покупателей, глобальная статистика платформы.',
      button: 'Войти как администратор',
      variant: 'secondary' as const,
      action: () => { setRole('admin'); nav('/admin'); },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-2 text-zinc-900">Вход в платформу</h1>
      <p className="text-center text-zinc-500 text-sm mb-10">
        Прототип: вход без пароля, роль выбирается вручную
      </p>
      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        {cards.map((c) => {
          const CardIcon = c.icon;
          return (
            <Card key={c.title} className="border-[#004e35]/10 bg-card flex flex-col">
              <CardHeader>
                <span className="w-12 h-12 rounded-xl bg-[#88e53e]/25 border border-[#88e53e]/70 flex items-center justify-center mb-3">
                  <CardIcon className={`w-6 h-6 ${c.iconCls}`} />
                </span>
                <CardTitle className="text-lg">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-zinc-600 flex-1">{c.text}</p>
                <Button className="w-full mt-6 rounded-full" variant={c.variant} onClick={c.action}>
                  {c.button}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
                                                                        