import { NavLink, Navigate, Outlet } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { DEMO_COMPANY_ID, useRole, useStore } from '@/lib/store';

export default function CabinetLayout() {
  const [role] = useRole();
  const store = useStore();
  const company = store.companies.find((c) => c.id === DEMO_COMPANY_ID);

  if (role !== 'manufacturer') return <Navigate to="/login" replace />;

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-[#88e53e]/25 text-[#004e35]' : 'text-zinc-600 hover:bg-[#004e35]/5 hover:text-zinc-800'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Кабинет производителя</h1>
          <p className="text-sm text-zinc-500">{company?.name}</p>
        </div>
        <Badge className="bg-[#88e53e]/25 text-[#004e35] hover:bg-[#88e53e]/25 border-[#88e53e]/70">
          Тариф «Стандарт»
        </Badge>
      </div>
      <nav className="flex gap-1 mb-6 bg-card border border-[#004e35]/10 rounded-lg p-1 w-fit">
        <NavLink to="/cabinet" end className={linkCls}>Дашборд</NavLink>
        <NavLink to="/cabinet/products" className={linkCls}>Продукты</NavLink>
        <NavLink to="/cabinet/batches" className={linkCls}>Партии и тесты</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
                                    