import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Store, Search, ListOrdered, Percent, User, Menu, X, Building2, PlusCircle } from 'lucide-react';
import { useTelegram } from '../contexts/useTelegram';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MainLayout: React.FC = () => {
  const { haptic } = useTelegram();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { to: '/', icon: Store, label: "Do'kon" },
    { to: '/search', icon: Search, label: 'Qidiruv' },
    { to: '/leaders', icon: ListOrdered, label: 'Liderlar' },
    { to: '/discounts', icon: Percent, label: 'Chegirmalar', className: 'text-error' },
    { to: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-background font-manrope flex overflow-x-hidden">
      {/* Sidebar (Desktop lg+) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[280px] bg-white border-r border-slate-200/60 flex-col z-[70]">
        <div className="px-8 py-8 flex flex-col justify-center border-b border-slate-50">
          <h1 className="text-2xl font-black tracking-tight text-[#0067a5]">TanlaAI</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1">
            Boutique & Design
          </p>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => haptic('light')}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group
                ${
                  isActive
                    ? 'bg-[#0067a5] text-white shadow-xl shadow-blue-900/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#0067a5]'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <NavLink 
            to="/creator" 
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Building2 size={18} /> Studio Dashboard
          </NavLink>
        </div>
      </aside>

      {/* Mobile/Tablet View (sm, md) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[280px]">
        {/* Header (Mobile & Tablet only) */}
        <nav className="fixed top-0 w-full lg:hidden z-[60] bg-background/80 backdrop-blur-md border-b border-outline/5 pt-[var(--sat)] min-h-[calc(4rem+var(--sat))]">
          <div className="h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  haptic('light');
                }}
                className="p-2 hover:bg-surface-variant rounded-full transition-colors md:hidden"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="font-bold tracking-tight text-xl text-primary md:text-2xl">
                TanlaAI
              </div>
            </div>
            
            {/* Desktop-ish nav for medium screens (Tablet) */}
            <div className="hidden md:flex lg:hidden items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => haptic('light')}
                  className={({ isActive: isLinkActive }) => cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    isLinkActive ? "bg-primary/10 text-primary" : "text-outline hover:bg-surface-variant hover:text-on-surface"
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <NavLink 
                to="/creator" 
                className="hidden md:flex lg:hidden items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <Building2 size={16} /> Studio
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Sliding Menu (Mobile only) */}
        <div 
          className={cn(
            "fixed left-0 w-full z-[55] bg-surface border-b border-outline/10 shadow-xl transform transition-all duration-300 ease-out md:hidden",
            isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          )}
          style={{ top: 'calc(4rem + var(--sat))' }}
        >
          <div className="p-6 flex flex-col gap-4 text-left">
            <NavLink 
              to="/company/create" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-outline/5 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-left">Kompaniya yaratish</h4>
                <p className="text-[10px] text-outline font-medium text-left">Studiyangizni ro'yxatdan o'tkazing</p>
              </div>
            </NavLink>

            <NavLink 
              to="/product/create" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-outline/5 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <PlusCircle size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-left">Mahsulot qo'shish</h4>
                <p className="text-[10px] text-outline font-medium text-left">Yangi mahsulot qo'shish</p>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Main Content */}
        <main className="pt-[calc(4rem+var(--sat)+0.5rem)] sm:pt-[calc(4rem+var(--sat)+1rem)] md:pt-16 lg:pt-8 pb-24 min-h-screen px-safe">
          <div className="max-w-screen-2xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Footer Navigation (Mobile Only) */}
        <footer className="fixed bottom-0 w-full z-50 rounded-t-2xl bg-background/80 backdrop-blur-md shadow-[0_-12px_40px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 pb-[env(safe-area-inset-bottom,0)] px-4 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => haptic('light')}
              className="flex flex-col items-center justify-center transition-all duration-200 active:scale-95"
            >
              {({ isActive: isLinkActive }) => (
                <>
                  <div className={cn(
                    "flex flex-col items-center justify-center transition-all duration-200",
                    isLinkActive ? cn("text-primary", item.className && item.className) : "text-outline",
                    isLinkActive && "after:content-[''] after:w-1 after:h-1 after:bg-current after:rounded-full after:mt-1"
                  )}>
                    <item.icon size={24} strokeWidth={isLinkActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
