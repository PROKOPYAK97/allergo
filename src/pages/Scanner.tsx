import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Camera, ChevronDown, ScanLine } from 'lucide-react';
import { parseCode } from '@/lib/codes';
import { ALLERGENS } from '@/lib/data';
import { TestBadge } from '@/components/Badges';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Food = { product_name?: string; brands?: string; ingredients_text?: string; allergens_tags?: string[]; traces_tags?: string[]; image_front_url?: string };

const demoStatuses = ['Производитель не подключён к АллерГо', 'Партия проверена на все аллергены', 'Партия проверена частично', 'В образце обнаружен аллерген'];

const allergenAliases: Record<string, string> = {
  peanuts: 'peanut',
  eggs: 'egg',
  soya: 'soy',
  soybeans: 'soy',
  'soy-beans': 'soy',
  'tree-nuts': 'nuts',
  'sulphur-dioxide-and-sulphites': 'sulphites',
  'sulfur-dioxide-and-sulfites': 'sulphites',
  sulfites: 'sulphites',
};

function normalizeAllergen(tag: string) {
  const name = tag.trim().toLowerCase().replace(/^[a-z]{2}:/, '');
  return allergenAliases[name] ?? name;
}

function DemoReport({ gtin, food }: { gtin: string; food: Food }) {
  const pinnedDemo = gtin === '07622210721976';
  const hash = Array.from(gtin).reduce((sum, digit) => (Math.imul(sum, 31) + Number(digit)) >>> 0, 0);
  const scenario = (hash ^ (hash >>> 16)) & 3;
  const detectedIndex = (hash >>> 8) % ALLERGENS.length;
  const declared = new Set(food.allergens_tags?.map(normalizeAllergen));
  const traces = new Set(food.traces_tags?.map(normalizeAllergen));
  const incomplete = !Array.isArray(food.allergens_tags) ||
    [...declared, ...traces].some(id => !ALLERGENS.some(allergen => allergen.id === id));
  const title = pinnedDemo ? 'Партия проверена на 4 аллергена' : incomplete && scenario !== 0 ? 'Сведения об аллергенах неполные' : demoStatuses[scenario];

  return <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby="demo-report-title">
    <p className="text-xs font-semibold uppercase tracking-wide text-primary">АллерГо · Демонстрационный отчёт</p>
    {pinnedDemo && <span className="inline-flex rounded-full border border-lime-300 bg-lime-100 px-3 py-1 text-sm font-semibold text-primary">Проверено АллерГо · демо</span>}
    <h2 id="demo-report-title" className="text-xl font-bold">{title}</h2>
    <p className="text-sm text-zinc-600">Вымышленный сценарий для презентации. Для решения о покупке сверяйтесь с маркировкой на упаковке.</p>
    {!pinnedDemo && scenario === 0 ? <p className="text-sm">В этом сценарии отчёты производителя недоступны.</p> : (
      <details open={pinnedDemo || undefined}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
          Результаты по {ALLERGENS.length} аллергенам <ChevronDown className="size-4" aria-hidden="true" />
        </summary>
        <ul className="mt-3 divide-y">
          {ALLERGENS.map((allergen, index) => (
            <li key={allergen.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span>{allergen.name}</span>
              {pinnedDemo ? (
                ['gluten', 'soy'].includes(allergen.id) ? (
                  <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Присутствует в составе</span>
                ) : (
                  <TestBadge result={['milk', 'peanut', 'nuts', 'egg'].includes(allergen.id) ? 'negative' : 'not_tested'} />
                )
              ) : declared.has(allergen.id) ? (
                <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Заявлен в составе</span>
              ) : traces.has(allergen.id) ? (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-950">Возможны следы</span>
              ) : (
                <TestBadge result={incomplete || (scenario === 2 && index >= 4) ? 'not_tested' : scenario === 3 && index === detectedIndex ? 'positive' : 'negative'} />
              )}
            </li>
          ))}
        </ul>
      </details>
    )}
  </section>;
}

export default function Scanner({ initialCode }: { initialCode?: string }) {
  const store = useStore(), nav = useNavigate();
  const [code, setCode] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [camera, setCamera] = useState(false);
  const [food, setFood] = useState<Food | null>(null), [notice, setNotice] = useState('');
  const [demoGtin, setDemoGtin] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null), stop = useRef<() => void>(() => {}), request = useRef<AbortController | null>(null);
  useEffect(() => () => { stop.current(); request.current?.abort(); }, []);
  async function lookup(raw: string) {
    stop.current(); setCamera(false); request.current?.abort();
    setError(''); setFood(null); setNotice(''); setDemoGtin(null);
    try {
      let url: URL | undefined;
      try { url = new URL(raw); } catch { /* raw barcode */ }
      if (url?.origin === location.origin && /^\/batch\/[^/]+$/.test(url.pathname)) { nav(url.pathname); return; }
      const parsed = parseCode(raw);
      const matches = parsed.identity ? store.batches.filter(b => b.markingCodes?.some(c => { try { return parseCode(c).identity === parsed.identity; } catch { return false; } })) : [];
      if (matches.length === 1) { nav(`/batch/${matches[0].id}`); return; }
      if (matches.length === 0) setDemoGtin(parsed.gtin);
      setNotice(matches.length > 1 ? 'Код связан с несколькими партиями: требуется исправление производителем.' : 'Отчёт для этой упаковки не найден. GTIN определяет товар, но не подтверждает партию.');
      setBusy(true);
      const controller = new AbortController(); request.current = controller;
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const barcode = parsed.gtin.startsWith('0') ? parsed.gtin.slice(1) : parsed.gtin;
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,ingredients_text,allergens_tags,traces_tags,image_front_url`, { signal: controller.signal });
        if (res.status === 404) { setNotice(n => n + ' Товар также отсутствует в Open Food Facts.'); return; }
        if (!res.ok) throw new Error('Open Food Facts временно недоступен. Повторите поиск.');
        const data = await res.json();
        if (data.status !== 1) setNotice(n => n + ' Товар отсутствует в Open Food Facts.');
        else setFood(data.product);
      } finally { clearTimeout(timer); }
    } catch (e) { setError(e instanceof Error && e.name === 'AbortError' ? 'Запрос прерван или истекло время ожидания. Повторите поиск.' : (e as Error).message); }
    finally { setBusy(false); }
  }
  async function start() {
    setError(''); setCamera(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Камера доступна через HTTPS или localhost. Используйте ручной ввод.');
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromConstraints({ video: { facingMode: { ideal: 'environment' } } }, video.current!, (result, _, controls) => {
        if (result) { controls.stop(); setCode(result.getText()); void lookup(result.getText()); }
      });
      stop.current = () => controls.stop();
    } catch { setCamera(false); setError('Не удалось открыть камеру. Разрешите доступ или введите код вручную.'); }
  }
  useEffect(() => {
    if (!initialCode) return;
    const timer = setTimeout(() => {
      setCode(initialCode);
      void lookup(initialCode);
    }, 0);
    return () => clearTimeout(timer);
    // Initial demo navigation performs the same lookup as the scan form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">АллерГо / Сканер</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Проверка продукта</h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">Отсканируйте код с упаковки, чтобы увидеть состав продукта, сведения об аллергенах и отчёт АллерГо.</p>
      </header>

      <div className="grid items-start gap-5 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby="scan-title">
          <div className="space-y-1.5">
            <h2 id="scan-title" className="text-xl font-bold">Код с упаковки</h2>
            <p className="text-sm text-muted-foreground">Подойдут штрихкод, Data Matrix «Честного знака» или QR АллерГо.</p>
          </div>
          <video ref={video} hidden={!camera} className="w-full rounded-xl bg-black" muted playsInline />
          <Button className="w-full" disabled={busy} onClick={() => camera ? (stop.current(), setCamera(false)) : void start()}>
            <Camera aria-hidden="true" /> {camera ? 'Остановить камеру' : 'Сканировать камерой'}
          </Button>
          <form className="space-y-2 border-t border-border pt-4" onSubmit={e => { e.preventDefault(); void lookup(code); }}>
            <label htmlFor="code" className="text-sm font-medium">Или введите код вручную</label>
            <Input id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="Например, 7622210721976" />
            <Button variant="outline" className="w-full" disabled={busy || !code.trim()}>{busy ? 'Ищем продукт…' : 'Проверить код'}</Button>
          </form>
          <Button variant="link" className="h-auto px-0 py-0 text-sm" disabled={busy} onClick={() => {
            const demoBarcode = '7622210721976';
            setCode(demoBarcode);
            void lookup(demoBarcode);
          }}>Открыть демо-отчёт belVita</Button>
        </section>

        <div className="min-w-0 space-y-4" aria-busy={busy}>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">{notice}</p>}
          {!food && !demoGtin && !error && !notice && (
            <section className="space-y-3 rounded-2xl border border-dashed border-border p-6 sm:p-8">
              <ScanLine className="size-6 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-bold">Результат проверки</h2>
              <p className="text-sm text-muted-foreground">Здесь появятся карточка товара и сведения о проверке партии.</p>
            </section>
          )}
          {food && (
            <article className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center gap-4">
                {food.image_front_url && <img src={food.image_front_url} alt="Упаковка товара" className="size-20 shrink-0 rounded-lg bg-background object-contain" />}
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Карточка товара</p>
                  <h2 className="break-words text-xl font-bold">{food.product_name || 'Название не указано'}</h2>
                  {food.brands && <p className="text-sm text-muted-foreground">{food.brands}</p>}
                  {demoGtin === '07622210721976' && <span className="inline-flex rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-primary">Проверено АллерГо · демо</span>}
                </div>
              </div>
              <dl className="divide-y divide-border border-y border-border text-sm">
                <div className="grid gap-1 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
                  <dt className="font-medium">Состав</dt>
                  <dd className="break-words text-muted-foreground">{food.ingredients_text || 'Нет данных'}</dd>
                </div>
              </dl>
              <p className="text-sm text-muted-foreground">Сверяйте состав и сведения об аллергенах с упаковкой.</p>
              <a className="text-sm font-medium text-primary underline" href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">Данные Open Food Facts · ODbL</a>
            </article>
          )}
          {demoGtin && food && <DemoReport gtin={demoGtin} food={food} />}
          {demoGtin === '07622210721976' && food && (
            <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-xl font-bold">Производитель</h2>
              <p className="font-medium">ООО «Мон’дэлис Русь»</p>
              <p className="text-sm text-muted-foreground">Входит в группу Mondelēz International. Печенье belVita в России выпускает фабрика «Большевик» в Собинке.</p>
              <p className="text-sm text-muted-foreground">Адрес фабрики — 601203, Владимирская область, г. Собинка, ул. Мира, д. 12.</p>
              <div className="flex flex-wrap gap-3 text-sm text-primary underline">
                <a href="https://www.mondelezinternational.com/russia/index.html" target="_blank" rel="noreferrer">Официальный сайт производителя</a>
                <a href="https://vodovoz.ru/catalog/pechene/3900/" target="_blank" rel="noreferrer">Карточка товара по штрихкоду</a>
              </div>
            </section>
          )}
          {demoGtin && (
            <a
              className="inline-flex text-sm font-medium text-primary underline"
              href={`https://национальный-каталог.рф/search/?type=goods&q=${demoGtin.replace(/^0+(?=\d{8})/, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              Найти товар в Национальном каталоге
            </a>
          )}
        </div>
      </div>

      <aside className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <p>Презентационный режим с демо-кабинетом производителя.</p>
        <Link className="font-medium text-primary underline" to="/cabinet/batches">Кабинет производителя</Link>
      </aside>
    </div>
  );
}

