import Evidence from '@/components/Evidence';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck, CheckCircle2, XCircle, MinusCircle, AlertTriangle,
  ScanLine, Info, ChevronDown, ChevronUp,
} from 'lucide-react';
import { ALLERGENS, allergenName, type BatchTest } from '@/lib/data';
import { useMyAllergens, useStore } from '@/lib/store';
import { TestBadge } from '@/components/Badges';

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

function ResultIcon({ result }: { result: BatchTest['result'] }) {
  if (result === 'negative') return <CheckCircle2 className="w-7 h-7 text-[#3d8a1f] shrink-0" />;
  if (result === 'positive') return <XCircle className="w-7 h-7 text-red-600 shrink-0" />;
  return <MinusCircle className="w-7 h-7 text-zinc-600 shrink-0" />;
}

type Verdict = { kind: 'safe' | 'danger' | 'warning' | 'none'; text: string; detail?: string };

function buildVerdict(my: string[], tests: BatchTest[]): Verdict {
  if (my.length === 0) {
    const tested = tests.filter((t) => t.result !== 'not_tested');
    const positives = tested.filter((t) => t.result === 'positive');
    if (positives.length > 0) {
      return {
        kind: 'danger',
        text: `В партии обнаружено: ${positives.map((t) => allergenName(t.allergenId).toLowerCase()).join(', ')}`,
        detail: 'Данные производителя. Если вы на это аллергичны — продукт вам не подходит.',
      };
    }
    return {
      kind: 'warning',
      text: `Производитель проверил партию: ${tested.length} из ${ALLERGENS.length} аллергенов, показаны результаты образца`,
      detail: 'Выберите свои аллергены выше — и мы скажем, есть ли для вас риск.',
    };
  }
  const mine = my.map(id => tests.find(t => t.allergenId === id) ?? { allergenId: id, result: 'not_tested' as const, method: '', testedAt: '' });
  const pos = mine.filter((t) => t.result === 'positive');
  if (pos.length > 0) {
    return {
      kind: 'danger',
      text: `⚠️ Осторожно: в партии обнаружен ваш аллерген — ${pos.map((t) => allergenName(t.allergenId).toLowerCase()).join(', ')}`,
      detail: 'Этот продукт вам не подходит, даже если на упаковке написано «может содержать следы».',
    };
  }
  const untested = mine.filter((t) => t.result === 'not_tested');
  const ok = mine.filter((t) => t.result === 'negative');
  if (untested.length > 0) {
    return {
      kind: 'warning',
      text: `По вашим аллергенам есть непроверенные позиции: ${untested.map((t) => allergenName(t.allergenId).toLowerCase()).join(', ')}`,
      detail:
        ok.length > 0
          ? `А эти ваши аллергены не обнаружены: ${ok.map((t) => allergenName(t.allergenId).toLowerCase()).join(', ')}. Непроверенные позиции — решать вам: производитель не делал на них тест.`
          : 'Производитель тест на эти аллергены не проводил — реальный риск неизвестен.',
    };
  }
  return {
    kind: 'safe',
    text: 'Выбранные аллергены не обнаружены в исследованном образце',
    detail: `Проверено по вашему списку (${ok.map((t) => allergenName(t.allergenId).toLowerCase()).join(', ')}) — не обнаружено.`,
  };
}

const verdictStyles: Record<Verdict['kind'], string> = {
  safe: 'bg-[#004e35] text-white',
  danger: 'bg-red-600 text-white',
  warning: 'bg-amber-300 text-amber-950',
  none: 'bg-[#004e35]/5 text-zinc-700',
};

export default function BatchPage() {
  const { batchId } = useParams();
  const store = useStore();
  const [complaint, setComplaint] = useState('');
  const [sent, setSent] = useState(false);
  const [my, toggleAllergen] = useMyAllergens();
  const [pickerOpen, setPickerOpen] = useState(false);

  const batch = store.batches.find((b) => b.id === batchId);
  const product = batch && store.products.find((p) => p.id === batch.productId);
  const company = batch && store.companies.find((c) => c.id === batch.companyId);

  useEffect(() => {
    if (batchId) store.addScan(batchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  if (!batch || !product || !company) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-zinc-500">
        <p className="text-lg font-medium">Партия не найдена</p>
        <Link to="/" className="text-[#004e35] underline text-sm">На главную</Link>
      </div>
    );
  }

  const verdict = buildVerdict(my, batch.tests);
  const scans = store.scans.filter((s) => s.batchId === batch.id);

  return (
    <div className="min-h-full">
      {/* Мобильная колонка: удобно с телефона после сканирования */}
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* Контекст сканирования */}
        <p className="flex items-center gap-2 text-xs text-zinc-500">
          <ScanLine className="w-4 h-4 text-[#004e35]" />
          Вы отсканировали QR-код на упаковке — это страница проверки партии на АллерГо
        </p>

        {/* Карточка продукта */}
        <Card className="border-[#004e35]/10 bg-card">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-xl bg-[#004e35]/5 border border-[#004e35]/10 flex items-center justify-center text-4xl shrink-0">
                {product.photo ?? '📦'}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold leading-tight text-zinc-900">{product.name}</h1>
                  {batch.status === 'archived' && <Badge variant="secondary">Архивная партия</Badge>}
                </div>
                <p className="text-sm text-zinc-600 mt-1">{company.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Партия №{batch.batchNumber} · произведена {fmt(batch.productionDate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="p-3 bg-amber-50 rounded-lg text-sm">Презентационный MVP. Результаты заявлены производителем; отрицательный тест не гарантирует отсутствие аллергена во всей партии.</p><Evidence batchId={batch.id} />
        {/* Персональная проверка */}
        <Card className="border-[#88e53e]/70 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-zinc-900">
              <ShieldCheck className="w-5 h-5 text-[#004e35]" />
              Безопасен ли продукт для вас?
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Отметьте аллергены, на которые у вас реакция — проверим по результатам этой партии
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 rounded-lg border border-[#004e35]/15 bg-[#004e35]/[0.04] px-3 py-2.5 text-sm hover:bg-[#004e35]/[0.05] transition-colors"
            >
              <span className={`text-left ${my.length ? 'text-zinc-800' : 'text-zinc-500'}`}>
                {my.length ? `Ваши аллергены: ${my.map(allergenName).join(', ')}` : 'Выбрать мои аллергены'}
              </span>
              {pickerOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-zinc-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-zinc-500" />}
            </button>
            {pickerOpen && (
              <div className="flex flex-wrap gap-1.5">
                {ALLERGENS.map((a) => {
                  const active = my.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAllergen(a.id)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        active
                          ? 'bg-volt text-black border-volt font-medium'
                          : 'bg-[#004e35]/[0.04] text-zinc-600 border-[#004e35]/15 hover:border-[#88e53e]'
                      }`}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-zinc-500">
              Выбрано {my.length} из {ALLERGENS.length} ·{' '}
              <Link to="/profile" className="underline text-[#004e35]">настроить список в кабинете</Link>
            </p>
          </CardContent>
        </Card>

        {/* Вердикт */}
        <div className={`rounded-xl p-4 ${verdictStyles[verdict.kind]}`}>
          <p className="font-semibold leading-snug">{verdict.text}</p>
          {verdict.detail && <p className="text-xs mt-1.5 opacity-80 leading-relaxed">{verdict.detail}</p>}
        </div>

        {/* Полные результаты */}
        <Card className="border-[#004e35]/10 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-900">Что проверил производитель</CardTitle>
            <p className="text-xs text-zinc-500">
              Экспресс-тесты на производстве · {fmt(batch.tests.find((t) => t.result !== 'not_tested')?.testedAt ?? batch.createdAt)}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {batch.tests.map((t) => {
              const isMine = my.includes(t.allergenId);
              return (
                <div
                  key={t.allergenId}
                  className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 ${
                    isMine ? 'bg-[#88e53e]/20 border border-[#88e53e] -mx-0.5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ResultIcon result={t.result} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate text-zinc-800">
                        {allergenName(t.allergenId)}
                        {isMine && <span className="text-[#004e35] font-normal"> · ваш аллерген</span>}
                      </p>
                      {t.method && <p className="text-xs text-zinc-500 truncate">{t.method}</p>}
                    </div>
                  </div>
                  <TestBadge result={t.result} />
                </div>
              );
            })}
            <Separator className="bg-[#004e35]/10" />
            <p className="text-xs text-zinc-500 leading-relaxed flex gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
              Тесты проведены производителем именно для этой партии (№{batch.batchNumber}). Платформа публикует
              их результаты вместо расплывчатой фразы «может содержать следы». Это не заменяет консультацию
              врача-аллерголога.
            </p>
          </CardContent>
        </Card>

        {/* Как это работает (коротко) */}
        <Card className="border-[#004e35]/10 bg-[#004e35]/[0.04]">
          <CardContent className="py-4 text-xs text-zinc-600 leading-relaxed">
            <p className="font-semibold text-zinc-800 mb-1.5">Почему этой странице можно доверять</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Производитель тестирует партию экспресс-тестами на аллергены.</li>
              <li>Результаты привязываются к номеру партии и публикуются здесь.</li>
              <li>В MVP данные сохраняются на демо-сервере и не имеют независимого заверения.</li>
            </ol>
          </CardContent>
        </Card>

        {/* О производителе */}
        <Card className="border-[#004e35]/10 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-zinc-900">О производителе</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 space-y-1">
            <p className="font-medium text-zinc-800">{company.name}</p>
            <p>ИНН {company.inn} · участник платформы АллерГо с 2026 г.</p>
            <p className="text-xs text-zinc-500">Страницу отсканировали {scans.length} раз(а)</p>
          </CardContent>
        </Card>

        {/* Жалоба */}
        <Card className="border-[#004e35]/10 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <CardTitle className="text-base text-zinc-900">Произошла реакция на продукт?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-sm text-[#004e35]">
                Обращение сохранено на демо-сервере.
              </p>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Расскажите, что случилось: когда купили, какая реакция…"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={!complaint.trim()}
                  onClick={() => {
                    store.addComplaint(batch.id, complaint.trim());
                    setSent(true);
                  }}
                >
                  Отправить жалобу
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
                                                                                                                                                                                                                                                                                                           
