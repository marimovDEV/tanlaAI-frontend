import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Store, Search, ListOrdered, Percent, User, Building2, PlusCircle, Bell } from 'lucide-react';
import { useTelegram } from '../contexts/useTelegram';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MainLayout: React.FC = () => {
  const { haptic, profile } = useTelegram();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { to: '/', icon: Store, label: "Do'kon" },
    { to: '/search', icon: Search, label: 'Qidiruv' },
    { to: '/leaders', icon: ListOrdered, label: 'Liderlar' },
    { to: '/discounts', icon: Percent, label: 'Aksiyalar', className: 'text-error' },
    { to: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-on-background font-manrope flex overflow-x-hidden">
      {/* Sidebar (Desktop lg+) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[280px] bg-white border-r border-slate-200/60 flex-col z-[70]">
        <div className="px-8 py-8 flex flex-col justify-center border-b border-slate-50">
          <h1 className="text-2xl font-black tracking-tight text-[#0067a5]">Tanla</h1>
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
            <Building2 size={18} /> {profile?.has_company ? "Studiya" : "Studio Dashboard"}
          </NavLink>
        </div>
      </aside>

      {/* Mobile/Tablet View (sm, md) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[280px]">
        {/* Header (Mobile & Tablet only) */}
        <nav className="fixed top-0 w-full lg:hidden z-[60] bg-white/95 backdrop-blur-md border-b border-slate-100 pt-[var(--sat)] h-[calc(4.5rem+var(--sat))]">
          <div className="h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[12px] flex items-center justify-center shadow-md shadow-blue-600/20">
                <Store size={18} className="text-white" />
              </div>
              <div className="font-black tracking-tighter text-2xl text-slate-900">
                Tanla
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
                    isLinkActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <NavLink 
                to="/creator" 
                className="hidden md:flex lg:hidden items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
              >
                <Building2 size={16} /> {profile?.has_company ? "Studiya" : "Studio"}
              </NavLink>

              <button 
                onClick={() => {
                  haptic('light');
                  // navigate('/notifications'); // placeholder
                }}
                className="w-10 h-10 bg-[#f8fafc] flex items-center justify-center rounded-full border border-slate-100 shadow-sm relative active:scale-95 transition-transform"
              >
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]" />
                <Bell size={20} className="text-slate-700" />
              </button>
            </div>
          </div>
        </nav>


        {/* Main Content */}
        <main className="pt-[calc(4rem+var(--sat)+0.5rem)] sm:pt-[calc(4rem+var(--sat)+1rem)] md:pt-16 lg:pt-8 pb-24 min-h-screen px-safe">
          <div className="max-w-screen-2xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Footer Navigation (Mobile Only) */}
        <footer className="fixed bottom-0 left-0 w-full z-[9999] bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] flex justify-around items-center h-[72px] pb-[env(safe-area-inset-bottom,0)] px-6 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => haptic('light')}
              className="flex flex-col items-center justify-center transition-all duration-300 relative"
            >
              {({ isActive: isLinkActive }) => (
                <div className={cn(
                  "flex flex-col items-center justify-center transition-all duration-300",
                  isLinkActive ? cn("text-primary active:scale-90") : "text-slate-300 group-active:scale-95",
                )}>
                  <item.icon size={22} strokeWidth={isLinkActive ? 3 : 2} className="transition-all" />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest mt-1.5 transition-all",
                    isLinkActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  )}>
                    {item.label}
                  </span>
                  {isLinkActive && (
                    <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
