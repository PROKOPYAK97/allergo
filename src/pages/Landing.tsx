import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUpRight, FlaskConical, QrCode, Users } from 'lucide-react';
import { TestBadge } from '@/components/Badges';

const PLATFORM = [
  {
    icon: FlaskConical,
    title: 'Тест на производстве',
    text: 'Экспресс-тесты на глютен, арахис, молоко и другие аллергены прямо на линии — результат за ~10 минут, от 316 ₽ за тест (закупка у производителя).',
  },
  {
    icon: QrCode,
    title: 'QR-метка на упаковке',
    text: 'Платформа генерирует QR-код, ведущий на страницу партии с результатами тестов. Наклейка на упаковку — и точка.',
  },
  {
    icon: Users,
    title: 'Проверка для покупателя',
    text: 'Покупатель сканирует код, отмечает свои аллергены — и видит персональный вердикт по этой партии, а не «может содержать следы».',
  },
];

const MISSION_ROWS = [
  ['Новый стандарт для аллергиков', 'Честный статус по каждой партии вместо расплывчатых предупреждений'],
  ['Новое доверие к маркировке', 'Результаты тестов фиксируются и неизменны после публикации'],
  ['Новый аргумент для сетей', 'Готовый пакет доказательств аллергенного блока ХАССП для аудитов'],
];

const PLANS = [
  {
    name: 'Производителям',
    tag: 'Тариф «Стандарт»',
    price: '15 000 ₽/мес',
    features: [
      'До 20 партий в месяц — экспресс-тесты включены',
      'Все 14 аллергенов по ТР ТС 022/2011',
      'QR-метки, страницы партий, печать этикеток',
      'Сопровождение и обучение персонала',
      'Статистика сканирований покупателями',
      'Бесплатный пилот на вашем производстве',
    ],
    highlight: true,
  },
  {
    name: 'Кондитерским на заказ',
    tag: 'Оплата за результат',
    price: '2 250 ₽/заказ',
    features: [
      'Проверка заказа «без опасных аллергенов»',
      'Тесты сырья и готового изделия',
      'Метка и страница проверки для клиента',
      'Окупается с 2–3 дополнительных заказов в месяц',
    ],
  },
  {
    name: 'Покупателям',
    tag: 'Всегда бесплатно',
    price: '0 ₽',
    features: [
      'Сканирование QR-кода на упаковке',
      'Персональная проверка по вашим аллергенам',
      'Честный статус: проверено / не тестировалось',
      'Жалоба производителю при реакции',
    ],
  },
];

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Landing() {
  const nav = useNavigate();
  return (
    <div>
      {/* ===== HERO: как у Enko — лид слева, гигантский заголовок справа ===== */}
      <section className="relative overflow-hidden">
        {/* лёгкий лаймовый ореол за заголовком */}
        <div className="pointer-events-none absolute -right-40 top-10 w-[34rem] h-[34rem] rounded-full bg-[#88e53e]/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 min-h-[calc(100vh-7rem)] grid md:grid-cols-2 gap-10 items-end pb-14 pt-16">
          {/* Левая колонка: лид */}
          <div className="max-w-md pb-2">
            <p className="text-lg font-medium leading-relaxed text-[#004e35]">
              Мы меняем смысл надписи «может содержать следы»: производитель тестирует
              каждую партию, а люди с аллергией видят реальный риск.
            </p>
            <button
              type="button"
              onClick={() => scrollTo('mission')}
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#004e35]/70 hover:text-[#004e35] transition-colors"
            >
              Листайте вниз <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Правая колонка: гигантский заголовок */}
          <h1 className="font-display font-extrabold uppercase text-right leading-[0.88] tracking-tight text-[#004e35] text-[clamp(3rem,9.5vw,8.5rem)]">
            Партия
            <br />
            проверена<span className="text-[#88e53e]">.</span>
            <br />
            <span className="text-[clamp(1.6rem,4.5vw,4rem)] block mt-3 text-[#004e35]/70 font-bold">
              Без аллергенов
            </span>
          </h1>
        </div>
      </section>

      {/* ===== Полоса-разделитель: зелёный фон, суть в одну строку ===== */}
      <section className="bg-[#004e35] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-display font-bold uppercase tracking-wide text-lg md:text-2xl">
            «Может содержать следы» <span className="text-[#88e53e]">→</span> «Проверено: не обнаружено»
          </p>
          <Link to="/demo">
            <Button variant="secondary" className="rounded-full px-6">Смотреть демо</Button>
          </Link>
        </div>
      </section>

      {/* ===== НАША МИССИЯ: крупные строки-строки ===== */}
      <section id="mission" className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#004e35]/60 mb-10">Наша миссия</p>
        <div className="border-t border-[#004e35]/15">
          {MISSION_ROWS.map(([title, sub]) => (
            <div
              key={title}
              className="grid md:grid-cols-[1fr_auto] gap-2 md:gap-8 items-center border-b border-[#004e35]/15 py-8 group cursor-default"
            >
              <h2 className="font-display font-extrabold uppercase leading-none text-[#004e35] text-[clamp(1.6rem,4.5vw,3.5rem)] group-hover:translate-x-2 transition-transform duration-300">
                {title}
              </h2>
              <p className="text-zinc-600 md:text-right max-w-sm md:justify-self-end">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ПЛАТФОРМА: три карточки ===== */}
      <section id="platform" className="bg-white border-y border-[#004e35]/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <h2 className="font-display font-extrabold uppercase leading-none text-[#004e35] text-[clamp(2rem,5vw,4rem)]">
              Платформа
            </h2>
            <p className="text-zinc-600 max-w-md">
              Один цикл: тест на линии → метка на упаковке → проверка покупателем. Данные партии фиксируются за 24 часа до блокировки.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PLATFORM.map((p, i) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="border-[#004e35]/10 bg-background rounded-2xl">
                  <CardHeader>
                    <span className="flex items-center gap-3 mb-2">
                      <span className="w-12 h-12 rounded-xl bg-[#88e53e]/25 border border-[#88e53e] flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-[#004e35]" />
                      </span>
                      <span className="font-display font-extrabold text-3xl text-[#004e35]/20">0{i + 1}</span>
                    </span>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-zinc-600">{p.text}</CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ДЕМО: телефон с карточкой партии ===== */}
      <section id="demo" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#004e35]/60 mb-4">Попробуйте сами</p>
            <h2 className="font-display font-extrabold uppercase leading-[0.95] text-[#004e35] text-[clamp(2rem,5vw,3.5rem)] mb-6">
              То, что видит покупатель после сканирования
            </h2>
            <p className="text-zinc-600 mb-8 max-w-md">
              Откройте страницу демо-партии, отметьте свои аллергены — и платформа покажет персональный вердикт.
              Так выглядит замена «может содержать следы».
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/demo">
                <Button size="lg" className="rounded-full px-7">Открыть демо-партию</Button>
              </Link>
              <Link to="/profile">
                <Button size="lg" variant="outline" className="rounded-full px-7">Мои аллергены</Button>
              </Link>
            </div>
          </div>

          {/* Карточка-превью */}
          <div className="max-w-sm mx-auto w-full">
            <Card className="border-[#004e35]/15 rounded-3xl shadow-[0_24px_60px_-24px_rgba(0,78,53,0.35)]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">belVita Утреннее мультизлаковое, 225 г</CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">Штрихкод 7622210721976 · демонстрационный отчёт</p>
                  </div>
                  <span className="text-3xl">🍪</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="bg-[#004e35] text-white rounded-xl p-3 text-xs font-semibold mb-3">
                  Демо · молоко, арахис, орехи и яйцо не обнаружены
                </div>
                {[
                  ['egg', 'Яйцо', 'negative'],
                  ['peanut', 'Арахис', 'negative'],
                  ['nuts', 'Орехи (древесные)', 'negative'],
                  ['milk', 'Молоко', 'negative'],
                ].map(([id, name, res]) => (
                  <div key={id} className="flex items-center justify-between border-b border-[#004e35]/10 last:border-0 pb-2">
                    <span className="text-zinc-700">{name}</span>
                    <TestBadge result={res as 'negative' | 'not_tested'} />
                  </div>
                ))}
                <p className="text-xs text-zinc-500 pt-1">Глютен и соя присутствуют в составе. Остальные аллергены не тестировались.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== ЭКОНОМИКА ДЛЯ ПРОИЗВОДИТЕЛЯ (из финмодели) ===== */}
      <section className="bg-white border-t border-[#004e35]/10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ['975 ₽', 'стоимость проверки одной партии — против 4 500 ₽ за анализ в лаборатории'],
              ['в 4,6 раза', 'дешевле лаборатории: результат за ~10 минут вместо 3–10 дней'],
              ['70 500 ₽/мес', 'экономия при контроле каждой из 20 партий вместо лабораторных анализов'],
            ].map(([big, small]) => (
              <div key={big} className="border border-[#004e35]/10 rounded-2xl p-6 bg-background">
                <p className="font-display font-extrabold text-3xl md:text-4xl text-[#004e35] mb-2">{big}</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{small}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            Один отзыв партии с полки ≈ 380 000 ₽ потерь — это 25 месяцев подписки. Подписка окупается, если предотвратила хотя бы один отзыв.
          </p>
        </div>
      </section>

      {/* ===== ТАРИФЫ ===== */}
      <section id="pricing" className="border-t border-[#004e35]/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="font-display font-extrabold uppercase leading-none text-[#004e35] text-[clamp(2rem,5vw,4rem)] mb-12">
            Сколько стоит
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`border-[#004e35]/10 rounded-2xl ${plan.highlight ? 'border-[#88e53e] border-2' : ''}`}>
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">{plan.tag}</p>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-2xl font-extrabold text-[#004e35]">{plan.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-[#3d8a1f] font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6 rounded-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => nav('/login')}
                  >
                    Оставить заявку <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
