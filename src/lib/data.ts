// Модель данных платформы верификации аллергенов

export type TestResult = 'negative' | 'positive' | 'not_tested';

export interface Allergen {
  id: string;
  name: string;
  icon: string;
}

// Перечень по п. 14 ст. 4.4 ТР ТС 022/2011
export const ALLERGENS: Allergen[] = [
  { id: 'gluten', name: 'Злаки с глютеном', icon: '🌾' },
  { id: 'peanut', name: 'Арахис', icon: '🥜' },
  { id: 'nuts', name: 'Орехи (древесные)', icon: '🌰' },
  { id: 'milk', name: 'Молоко', icon: '🥛' },
  { id: 'egg', name: 'Яйцо', icon: '🥚' },
  { id: 'soy', name: 'Соя', icon: '🫘' },
  { id: 'fish', name: 'Рыба', icon: '🐟' },
  { id: 'crustaceans', name: 'Ракообразные', icon: '🦐' },
  { id: 'molluscs', name: 'Моллюски', icon: '🦪' },
  { id: 'celery', name: 'Сельдерей', icon: '🌿' },
  { id: 'mustard', name: 'Горчица', icon: '🟡' },
  { id: 'sesame', name: 'Кунжут', icon: '⚪' },
  { id: 'sulphites', name: 'Диоксид серы и сульфиты', icon: '🧪' },
  { id: 'lupin', name: 'Люпин', icon: '🌱' },
];

export const allergenName = (id: string) =>
  ALLERGENS.find((a) => a.id === id)?.name ?? id;

export interface Company {
  id: string;
  name: string;
  inn: string;
  logo?: string;
  status: 'active' | 'moderation' | 'blocked';
  plan: 'standard';
  contactEmail: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  photo?: string;
  category: string;
}

export interface BatchTest {
  allergenId: string;
  result: TestResult;
  method: string;
  photoUrl?: string;
  testedAt: string;
}

export interface Batch {
  markingCodes?: string[];
  id: string;
  productId: string;
  companyId: string;
  batchNumber: string;
  productionDate: string;
  status: 'active' | 'archived';
  createdAt: string; // ISO — результаты нельзя менять спустя 24ч
  tests: BatchTest[];
}

export interface ScanEvent {
  id: string;
  batchId: string;
  scannedAt: string;
  region: string;
}

export interface Complaint {
  id: string;
  batchId: string;
  text: string;
  photoUrl?: string;
  createdAt: string;
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
}

export interface DB {
  companies: Company[];
  products: Product[];
  batches: Batch[];
  scans: ScanEvent[];
  complaints: Complaint[];
}
