import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Store, Search, Percent, User, Building2, Sparkles, Heart } from 'lucide-react';
import { useTelegram } from '../contexts/useTelegram';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { to: '/',          icon: Store,   label: "Do'kon"  },
  { to: '/search',    icon: Search,  label: 'Qidiruv' },
  { to: '/discounts', icon: Percent, label: 'Aksiya'  },
  { to: '/wishlist',  icon: Heart,   label: 'Sevimli' },
  { to: '/profile',   icon: User,    label: 'Profil'  },
];

const MainLayout: React.FC = () => {
  const { haptic, profile } = useTelegram();

  return (
    <div className="min-h-screen bg-[#FFFBF6] text-[#1A1A2E] flex overflow-x-hidden" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ────────────────────────────
          SIDEBAR — Desktop (lg+)
      ──────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[260px] bg-[#1A1A2E] flex-col z-[70] shadow-2xl">

        {/* Logo */}
        <div className="px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF2D55)', boxShadow: '0 8px 24px rgba(255,107,53,0.35)' }}>
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Tanla</h1>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">Home Boutique</p>
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/5" />

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => haptic('light')}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                )
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #FF6B35, #FF2D55)',
                boxShadow: '0 6px 20px rgba(255,107,53,0.30)'
              } : {}}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Banner */}
        <div
          className="mx-4 mb-4 p-4 rounded-2xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #00C9B1, #0096FF)' }}
        >
          <div className="absolute right-2 top-2 opacity-10">
            <Sparkles size={44} className="text-white" />
          </div>
          <p className="text-[12px] font-black text-white mb-0.5">AI Visualizer ✨</p>
          <p className="text-[10px] text-white/75 leading-snug">Uyingizni virtual bezang</p>
          <NavLink
            to="/visualize/new"
            className="mt-3 inline-block bg-white text-[#00A896] text-[11px] font-black px-4 py-1.5 rounded-xl hover:scale-105 transition-transform"
          >
            Sinab ko'ring →
          </NavLink>
        </div>

        {/* Studio Link */}
        <div className="p-4 border-t border-white/5">
          <NavLink
            to="/creator"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[12px] font-black transition-all hover:bg-white/15 bg-white/8 text-white/70 hover:text-white"
          >
            <Building2 size={16} />
            {profile?.has_company ? 'Studiyam' : 'Studio oching'}
          </NavLink>
        </div>
      </aside>

      {/* ────────────────────────────
          MAIN AREA
      ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">

        {/* Mobile / Tablet Top Header */}
        <header
          className="fixed top-0 left-0 right-0 lg:hidden z-[60]"
          style={{
            background: 'rgba(255,251,246,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 'var(--sat)',
          }}
        >
          <div className="flex items-center justify-between px-4 h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FF2D55)', boxShadow: '0 4px 16px rgba(255,107,53,0.30)' }}
              >
                <Store size={17} className="text-white" />
              </div>
              <span className="text-[22px] font-black text-[#1A1A2E] tracking-tighter">Tanla</span>
            </div>

            {/* Tablet nav */}
            <nav className="hidden md:flex lg:hidden items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => haptic('light')}
                  className={({ isActive }) =>
                    cn(
                      'px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all',
                      isActive ? 'text-white' : 'text-[#8A8A99] hover:text-[#FF6B35]'
                    )
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(135deg, #FF6B35, #FF2D55)'
                  } : {}}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <NavLink
                to="/visualize/new"
                className="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white"
                style={{ background: 'linear-gradient(135deg, #00C9B1, #0096FF)' }}
              >
                <Sparkles size={13} /> AI
              </NavLink>
              <NavLink
                to="/creator"
                className="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-2 bg-[#1A1A2E] text-white rounded-xl text-[11px] font-black"
              >
                <Building2 size={13} />
                {profile?.has_company ? 'Studiya' : 'Studio'}
              </NavLink>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="pb-32 min-h-screen lg:pb-12"
          style={{ paddingTop: 'calc(4rem + var(--sat))' }}
        >
          <div className="max-w-screen-xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <footer
          className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-around items-center md:hidden"
          style={{
            background: 'rgba(255,251,246,0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.06)',
            height: 'calc(68px + var(--sab))',
            paddingBottom: 'var(--sab)',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => haptic('light')}
              className="flex flex-col items-center justify-center min-w-[52px] py-2 active:scale-90 transition-transform"
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #FF6B35, #FF2D55)',
                      boxShadow: '0 4px 12px rgba(255,107,53,0.35)'
                    } : {}}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? 'text-white' : 'text-[#B8B8C8]'}
                    />
                  </div>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: isActive ? '#FF6B35' : '#C0C0CE' }}
                  >
                    {item.label}
                  </span>
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
