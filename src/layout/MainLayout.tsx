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
    <div className="min-h-screen bg-background text-on-background font-manrope">
      {/* Header */}
      <nav className="fixed top-0 w-full z-[60] bg-background/80 backdrop-blur-md flex items-center justify-between px-6 h-16 border-b border-outline/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              haptic('light');
            }}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div className="font-bold tracking-tight text-xl absolute left-1/2 transform -translate-x-1/2">
          TanlaAI
        </div>
        
        <div className="w-10"></div>
      </nav>

      {/* Sliding Menu (Simplification for now) */}
      <div className={cn(
        "fixed top-16 left-0 w-full z-[55] bg-surface border-b border-outline/10 shadow-xl transform transition-all duration-300 ease-out",
        isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <div className="p-6 flex flex-col gap-4">
          <NavLink 
            to="/company/create" 
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-outline/5 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Kompaniya yaratish</h4>
              <p className="text-[10px] text-outline font-medium">Studiyangizni ro'yxatdan o'tkazing yoki tahrirlang</p>
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
              <h4 className="text-sm font-bold">Mahsulot qo'shish</h4>
              <p className="text-[10px] text-outline font-medium">Yangi mahsulot yoki xizmatni qo'shish</p>
            </div>
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 pb-24 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 w-full z-50 rounded-t-2xl bg-background/80 backdrop-blur-md shadow-[0_-12px_40px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 pb-[env(safe-area-inset-bottom,0)] px-4">
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
  );
};

export default MainLayout;
