import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartPulse, ScanLine, Trash2, Info } from 'lucide-react';
import { ALLERGENS } from '@/lib/data';
import { useMyAllergens, useRole } from '@/lib/store';

export default function Profile() {
  const [role] = useRole();
  const [my, toggleAllergen, setMy] = useMyAllergens();

  return (
    <div className="min-h-full">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2 text-zinc-900">
            <HeartPulse className="w-6 h-6 text-[#004e35]" />
            Мои аллергены
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {role === 'buyer'
              ? 'Ваш личный кабинет покупателя на АллерГо'
              : 'Отметьте аллергены один раз — и каждый отсканированный продукт будет проверяться автоматически'}
          </p>
        </div>

        <Card className="border-[#88e53e]/70 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-900">На что у вас аллергия?</CardTitle>
            <p className="text-xs text-zinc-500">
              {my.length > 0
                ? `Выбрано: ${my.length}. Этот список подставляется на страницу любой партии.`
                : 'Перечень — по ТР ТС 022/2011 (14 аллергенов, обязательных к маркировке).'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2">
              {ALLERGENS.map((a) => {
                const active = my.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAllergen(a.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? 'bg-volt text-black border-volt'
                        : 'bg-[#004e35]/[0.04] text-zinc-700 border-[#004e35]/15 hover:border-[#88e53e]'
                    }`}
                  >
                    <span className="text-xl leading-none w-6 text-center">{a.icon}</span>
                    <span className="flex-1">{a.name}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                        active ? 'border-black/30 bg-black/10 text-black font-bold' : 'border-[#004e35]/20 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
            {my.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-zinc-500 leading-snug">
                  Ваш список: {my.map((id) => ALLERGENS.find((a) => a.id === id)?.name).join(', ')}
                </p>
                <Button size="sm" variant="ghost" onClick={() => setMy([])}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Очистить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-[#004e35] text-white rounded-xl p-5 text-center space-y-3">
          <p className="font-semibold">Готово! Теперь отсканируйте QR-код на упаковке</p>
          <p className="text-xs text-white/70">
            Страница партии покажет персональный вердикт по вашему списку{my.length ? '' : ' — как только вы его отметите'}.
          </p>
          <Link to="/demo">
            <Button variant="secondary" size="lg" className="rounded-full px-6">
              <ScanLine className="w-4 h-4 mr-1" /> Проверить демо-продукт
            </Button>
          </Link>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed flex gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Список хранится только на вашем устройстве и никуда не отправляется. В прототипе регистрация не требуется.
        </p>
      </div>
    </div>
  );
}
                                                                                                