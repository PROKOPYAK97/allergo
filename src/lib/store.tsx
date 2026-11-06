import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { parseCode } from './codes';
import { ALLERGENS } from './data';
import type { Batch, BatchTest, Complaint, DB, Product } from './data';

const STORAGE_KEY = 'ffv-db-v1';
export const DEMO_COMPANY_ID = 'c1';
const BATCH_LOCK_HOURS = 24;

// ---------- Seed ----------
function seed(): DB {
  const base = new Date('2026-10-15T09:00:00');
  const iso = (d: Date) => d.toISOString();
  const day = 24 * 3600 * 1000;
  const tests: BatchTest[] = [
    { allergenId: 'gluten', result: 'negative', method: 'Экспресс-тест иммунохроматографический, ХЕМАТест Глютен Профи', testedAt: iso(base) },
    { allergenId: 'peanut', result: 'negative', method: 'Экспресс-тест иммунохроматографический, ХЕМАТест Арахис Профи', testedAt: iso(base) },
    { allergenId: 'nuts', result: 'negative', method: 'Экспресс-тест иммунохроматографический, ХЕМАТест Орехи Профи', testedAt: iso(base) },
    { allergenId: 'milk', result: 'not_tested', method: '', testedAt: iso(base) },
    { allergenId: 'egg', result: 'not_tested', method: '', testedAt: iso(base) },
    { allergenId: 'soy', result: 'not_tested', method: '', testedAt: iso(base) },
  ];
  return {
    companies: [
      {
        id: DEMO_COMPANY_ID,
        name: 'ООО «Кондитерская фабрика „Медовик"»',
        inn: '7707000010',
        status: 'active',
        plan: 'standard',
        contactEmail: 'quality@medovik.example',
      },
      {
        id: 'c2',
        name: 'ООО «Здоровая сладость»',
        inn: '7802000020',
        status: 'moderation',
        plan: 'standard',
        contactEmail: 'info@zdorovo.example',
      },
    ],
    products: [
      {
        id: 'p1',
        companyId: DEMO_COMPANY_ID,
        name: 'belVita Утреннее мультизлаковое, 225 г',
        category: 'Печенье',
        photo: '🍪',
      },
      {
        id: 'p2',
        companyId: DEMO_COMPANY_ID,
        name: 'Пряник ржаной на фруктозе',
        category: 'Пряники',
        photo: '🥨',
      },
    ],
    batches: [
      {
        id: 'b1042',
        markingCodes: ['010460000000001121DEMO1042'],
        productId: 'p1',
        companyId: DEMO_COMPANY_ID,
        batchNumber: '1042',
        productionDate: '2026-10-15',
        status: 'active',
        createdAt: iso(base),
        tests,
      },
      {
        id: 'b1039',
        productId: 'p1',
        companyId: DEMO_COMPANY_ID,
        batchNumber: '1039',
        productionDate: '2026-09-28',
        status: 'archived',
        createdAt: iso(new Date(base.getTime() - 17 * day)),
        tests: [
          { allergenId: 'gluten', result: 'negative', method: 'Экспресс-тест ХЕМАТест Глютен Профи', testedAt: iso(new Date(base.getTime() - 17 * day)) },
          { allergenId: 'peanut', result: 'not_tested', method: '', testedAt: iso(new Date(base.getTime() - 17 * day)) },
        ],
      },
    ],
    scans: [
      { id: 's1', batchId: 'b1042', scannedAt: iso(new Date(base.getTime() + 2 * day)), region: 'Москва' },
      { id: 's2', batchId: 'b1042', scannedAt: iso(new Date(base.getTime() + 2 * day + 3600e3)), region: 'Санкт-Петербург' },
      { id: 's3', batchId: 'b1042', scannedAt: iso(new Date(base.getTime() + 3 * day)), region: 'Казань' },
      { id: 's4', batchId: 'b1042', scannedAt: iso(new Date(base.getTime() + 4 * day)), region: 'Краснодар' },
      { id: 's5', batchId: 'b1042', scannedAt: iso(new Date(base.getTime() + 5 * day)), region: 'Новосибирск' },
      { id: 's6', batchId: 'b1039', scannedAt: iso(new Date(base.getTime() - 15 * day)), region: 'Москва' },
    ],
    complaints: [
      {
        id: 'k1',
        batchId: 'b1042',
        text: 'После употребления появилась лёгкая сыпь. Ребёнку 4 года, аллергик на молоко.',
        createdAt: iso(new Date(base.getTime() + 4 * day)),
        status: 'open',
      },
    ],
  };
}

// Update only the original sample records, preserving user-created products and batches.
function currentDemo(db: DB): DB {
  return {
    ...db,
    products: db.products.map(product => product.id === 'p1' ? { ...product, name: 'belVita Утреннее мультизлаковое, 225 г' } : product),
    companies: db.companies.map(company => company.id === DEMO_COMPANY_ID ? { ...company, name: 'Демо-кабинет belVita', inn: 'Демо', contactEmail: 'demo@allergo.example' } : company),
    batches: db.batches.map(batch => ['b1042', 'b1039'].includes(batch.id) ? {
      ...batch,
      tests: ALLERGENS.map(allergen => ({
        allergenId: allergen.id,
        result: ['milk', 'peanut', 'nuts', 'egg'].includes(allergen.id) ? 'negative' as const : 'not_tested' as const,
        method: ['gluten', 'soy'].includes(allergen.id) ? 'Присутствует в составе' : 'Демонстрационный отчёт',
        testedAt: batch.createdAt,
      })),
    } : batch),
  };
}

// ---------- Store ----------
interface Store extends DB {
  setCompanyStatus: (id: string, status: DB['companies'][0]['status']) => void;
  addProduct: (p: Omit<Product, 'id' | 'companyId'>) => void;
  deleteProduct: (id: string) => void;
  addBatch: (b: Omit<Batch, 'id' | 'companyId' | 'createdAt' | 'status'>) => string;
  bindCodes: (id: string, codes: string[]) => void;
  archiveBatch: (id: string) => void;
  addScan: (batchId: string) => void;
  addComplaint: (batchId: string, text: string) => void;
  setComplaintStatus: (id: string, status: Complaint['status']) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [db, setDb] = useState<DB>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return currentDemo(JSON.parse(raw) as DB);
    } catch { /* ignore */ }
    return currentDemo(seed());
  });

  useEffect(() => {
    let active = true;
    fetch('/api/db').then(async response => {
      if (response.ok) { const remote = await response.json(); if (active) setDb(currentDemo(remote)); }
      else if (response.status !== 404) throw new Error();
      if (active) setReady(true);
    }).catch(() => { if (active) setSyncError('Сервер недоступен. Изменения не будут опубликованы. Запустите npm start.'); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch { /* server remains source */ }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch('/api/db', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(db), signal: controller.signal })
        .then(r => { if (!r.ok) throw new Error(); setSyncError(''); }).catch(e => { if (e.name !== 'AbortError') setSyncError('Ошибка сохранения на сервере. Повторите действие.'); });
    }, 150);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [db, ready]);

  const store = useMemo<Store>(
    () => ({
      ...db,
      setCompanyStatus: (id, status) =>
        setDb((d) => ({ ...d, companies: d.companies.map((c) => (c.id === id ? { ...c, status } : c)) })),
      addProduct: (p) =>
        setDb((d) => ({
          ...d,
          products: [...d.products, { ...p, id: `p${Date.now()}`, companyId: DEMO_COMPANY_ID }],
        })),
      deleteProduct: (id) =>
        setDb((d) => ({
          ...d,
          products: d.products.filter((p) => p.id !== id),
          batches: d.batches.filter((b) => b.productId !== id),
        })),
      addBatch: (b) => {
        const id = `b${Date.now()}`;
        setDb((d) => ({
          ...d,
          batches: [
            {
              ...b,
              id,
              companyId: DEMO_COMPANY_ID,
              status: 'active',
              createdAt: new Date().toISOString(),
            },
            ...d.batches,
          ],
        }));
        return id;
      },
      bindCodes: (id, codes) => {
        const identities = codes.map(c => parseCode(c).identity);
        if (identities.some(c => !c)) throw new Error('Нужен полный код с серийным номером, а не GTIN.');
        if (db.batches.some(b => b.id !== id && b.markingCodes?.some(c => identities.includes(parseCode(c).identity)))) throw new Error('Код уже привязан к другой партии.');
        setDb(d => ({ ...d, batches: d.batches.map(b => b.id === id ? { ...b, markingCodes: codes } : b) }));
      },
      archiveBatch: (id) =>
        setDb((d) => ({
          ...d,
          batches: d.batches.map((b) => (b.id === id ? { ...b, status: 'archived' } : b)),
        })),
      addScan: (batchId) =>
        setDb((d) => ({
          ...d,
          scans: [
            ...d.scans,
            { id: `s${Date.now()}`, batchId, scannedAt: new Date().toISOString(), region: 'Прямой переход' },
          ],
        })),
      addComplaint: (batchId, text) =>
        setDb((d) => ({
          ...d,
          complaints: [
            { id: `k${Date.now()}`, batchId, text, createdAt: new Date().toISOString(), status: 'open' },
            ...d.complaints,
          ],
        })),
      setComplaintStatus: (id, status) =>
        setDb((d) => ({
          ...d,
          complaints: d.complaints.map((c) => (c.id === id ? { ...c, status } : c)),
        })),
      resetDemo: () => {
        localStorage.removeItem(STORAGE_KEY);
        setDb(currentDemo(seed()));
      },
    }),
    [db],
  );

  return <Ctx.Provider value={store}>{syncError && <p role="alert" className="bg-amber-100 p-3">{syncError}</p>}{ready || syncError ? children : <p className="p-8">Загрузка данных…</p>}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside provider');
  return s;
}

export function batchLocked(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() > BATCH_LOCK_HOURS * 3600e3;
}

export type Role = 'none' | 'buyer' | 'manufacturer' | 'admin';

export function useRole(): [Role, (r: Role) => void] {
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('ffv-role') as Role) || 'none');
  const set = (r: Role) => {
    localStorage.setItem('ffv-role', r);
    setRole(r);
  };
  return [role, set];
}

// ---------- Мои аллергены (покупатель) ----------
export const MY_ALLERGENS_KEY = 'allergo-my-allergens';

export function useMyAllergens(): [string[], (id: string) => void, (ids: string[]) => void] {
  const [my, setMy] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(MY_ALLERGENS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(MY_ALLERGENS_KEY, JSON.stringify(my));
  }, [my]);

  const toggle = (id: string) =>
    setMy((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  return [my, toggle, setMy];
}
