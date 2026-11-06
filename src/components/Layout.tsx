import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react';
import { useRole, type Role } from '@/lib/store';

export default function Layout() {
  const [role, setRole] = useRole();
  const nav = useNavigate();
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-xs font-semibold uppercase tracking-widest transition-colors ${
      isActive ? 'text-[#004e35]' : 'text-[#004e35]/60 hover:text-[#004e35]'
    }`;

  const onLanding = typeof window !== 'undefined' && window.location.pathname === '/';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Шапка в стиле Enko: лого слева, апперкейс-навигация, контакт справа */}
      <header className={`sticky top-0 bg-background/90 backdrop-blur z-10 ${onLanding ? '' : 'border-b border-[#004e35]/10'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 font-display font-extrabold text-xl uppercase tracking-tight text-[#004e35]">
            <span className="w-9 h-9 rounded-lg bg-[#004e35] text-white flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </span>
            АллерГо
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {onLanding ? (
              <>
                <a href="#platform" className="text-xs font-semibold uppercase tracking-widest text-[#004e35]/60 hover:text-[#004e35] transition-colors">Платформа</a>
                <a href="#mission" className="text-xs font-semibold uppercase tracking-widest text-[#004e35]/60 hover:text-[#004e35] transition-colors">Миссия</a>
                <a href="#demo" className="text-xs font-semibold uppercase tracking-widest text-[#004e35]/60 hover:text-[#004e35] transition-colors">Демо</a>
                <a href="#pricing" className="text-xs font-semibold uppercase tracking-widest text-[#004e35]/60 hover:text-[#004e35] transition-colors">Тарифы</a>
              </>
            ) : (
              <NavLink to="/" end className={linkCls}>Главная</NavLink>
            )}
            {(role === 'none' || role === 'buyer') && (
              <NavLink to="/profile" className={linkCls}>Мои аллергены</NavLink>
            )}
            <NavLink to="/demo" className={linkCls}>Демо-партия</NavLink>
            {role === 'manufacturer' && <NavLink to="/cabinet" className={linkCls}>Кабинет</NavLink>}
            {role === 'admin' && <NavLink to="/admin" className={linkCls}>Администрирование</NavLink>}
          </nav>
          <Link to="/scan" className="text-sm font-bold text-[#004e35]">Сканировать</Link><div className="ml-auto">
            {role === 'none' ? (
              <Button size="sm" className="rounded-full px-5" onClick={() => nav('/login')}>Войти</Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full px-5"
                onClick={() => {
                  setRole('none' as Role);
                  nav('/');
                }}
              >
                Выйти
              </Button>
            )}
          </div>
        </div>
      </header>

      <p className="bg-amber-50 text-amber-950 text-center text-xs p-2">Презентационный MVP · Демо-роли без авторизации · Пример партии не является реальным протоколом испытаний</p><main className="flex-1">
        <Outlet />
      </main>

      {/* Футер в стиле Enko: тёмно-зелёный, крупные ссылки */}
      <footer className="bg-[#004e35] text-white">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-[1fr_auto] gap-10 pb-14 border-b border-white/15">
            <div>
              <p className="font-display font-extrabold uppercase text-2xl leading-tight mb-3">
                Партия проверена<span className="text-[#88e53e]">.</span><br />
                <span className="text-white/60 text-lg">Результаты тестов — по партиям.</span>
              </p>
              <p className="text-sm text-white/60 max-w-sm">
                Платформа верификации аллергенов: производитель тестирует партию,
                покупатель сканирует QR и видит реальный риск.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-x-12 gap-y-4 content-start">
              {[
                ['Платформа', '/#platform'],
                ['Демо-партия', '/demo'],
                ['Мои аллергены', '/profile'],
                ['Тарифы', '/#pricing'],
                ['Вход', '/login'],
              ].map(([label, to]) => (
                <Link
                  key={label}
                  to={to}
                  className="font-display font-bold uppercase text-lg text-white/80 hover:text-[#88e53e] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="pt-6 flex flex-wrap gap-3 items-center justify-between text-xs text-white/50">
            <p>© 2026 АллерГо · прототип платформы</p>
            <p>Демо-данные · результаты тестов иллюстративны и не заменяют консультацию врача</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
