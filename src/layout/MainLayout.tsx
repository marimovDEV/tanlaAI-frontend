import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Store, Search, Percent, User, Building2, Heart,
  LayoutDashboard, Inbox, PlusCircle, Building,
} from 'lucide-react';
import { useTelegram } from '../contexts/useTelegram';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Root paths per role ──────────────────────────────────────── */
const USER_ROOT_PATHS   = new Set(['/', '/search', '/discounts', '/companies', '/profile']);
const SELLER_ROOT_PATHS = new Set(['/creator', '/creator/leads', '/profile']);

/* ── Nav items ────────────────────────────────────────────────── */
const userNavItems = [
  { to: '/',          icon: Store,     label: "Do'kon"  },
  { to: '/search',    icon: Search,    label: 'Qidiruv' },
  { to: '/discounts', icon: Percent,   label: 'Aksiya'  },
  { to: '/companies', icon: Building,  label: 'Kampaniyalar' },
  { to: '/profile',   icon: User,      label: 'Profil'  },
];

/* Seller nav — 5 items with ➕ center */
const sellerNavLeft  = [
  { to: '/creator',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/creator/leads', icon: Inbox,           label: 'Leadlar'   },
];
const sellerNavRight = [
  { to: '/profile',        icon: User,      label: 'Profil' },
];

/* ── Nav Item Component ───────────────────────────────────────── */
const NavItem: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  haptic: (t: 'light' | 'medium' | 'soft') => void;
  end?: boolean;
}> = ({ to, icon: Icon, label, haptic, end }) => (
  <NavLink
    to={to}
    end={end}
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
          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 1.8}
            className={isActive ? 'text-white' : 'text-[#B8B8C8]'}
          />
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: isActive ? '#FF6B35' : '#C0C0CE' }}
        >
          {label}
        </span>
      </div>
    )}
  </NavLink>
);

/* ── Main Layout ──────────────────────────────────────────────── */
const MainLayout: React.FC = () => {
  const { haptic, profile, webApp } = useTelegram();
  const location = useLocation();
  const navigate  = useNavigate();

  const isSeller  = profile?.role === 'COMPANY' && Boolean(profile?.has_company);
  const rootPaths = isSeller ? SELLER_ROOT_PATHS : USER_ROOT_PATHS;

  /* ── Telegram native Back Button ── */
  useEffect(() => {
    if (!webApp?.isVersionAtLeast?.('6.1')) return;

    const isRoot = rootPaths.has(location.pathname);

    if (isRoot) {
      webApp.BackButton.hide();
    } else {
      webApp.BackButton.show();
      const handler = () => { haptic('light'); navigate(-1); };
      webApp.BackButton.onClick(handler);
      return () => webApp.BackButton.offClick(handler);
    }
  }, [location.pathname, webApp, navigate, haptic, rootPaths]);

  return (
    <div className="min-h-screen bg-[#FFFBF6] text-[#1A1A2E] flex overflow-x-hidden" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Desktop Sidebar (lg+) ──────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[260px] bg-[#1A1A2E] flex-col z-[70] shadow-2xl">

        {/* Logo */}
        <div className="px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF2D55)', boxShadow: '0 8px 24px rgba(255,107,53,0.35)' }}>
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Tanla</h1>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">
                {isSeller ? 'Seller Panel' : 'Home Boutique'}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-white/5" />

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {(isSeller
            ? [...sellerNavLeft, ...sellerNavRight]
            : userNavItems
          ).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/creator'}
              onClick={() => haptic('light')}
              className={({ isActive }) => cn(
                'flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-200',
                isActive ? 'text-white' : 'text-white/45 hover:bg-white/5 hover:text-white/80'
              )}
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

          {/* Seller: Add product button */}
          {isSeller && (
            <button
              onClick={() => { haptic('medium'); navigate('/creator/product/add'); }}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold text-white mt-2 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF2D55)', boxShadow: '0 6px 20px rgba(255,107,53,0.28)' }}
            >
              <PlusCircle size={18} />
              <span>Mahsulot qo'shish</span>
            </button>
          )}
        </nav>



        {/* Bottom link */}
        <div className="p-4 border-t border-white/5">
          {isSeller && (
            <NavLink
              to="/creator/studio/edit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[12px] font-black transition-all hover:bg-white/15 bg-white/8 text-white/70 hover:text-white"
            >
              <Building2 size={16} />
              Kompaniyani tahrirlash
            </NavLink>
          )}
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">

        {/* Mobile/Tablet Top Header */}
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
              <div>
                <span className="text-[20px] font-black text-[#1A1A2E] tracking-tighter">Tanla</span>
                {isSeller && (
                  <span
                    className="ml-2 text-[9px] font-black text-white px-2 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg,#FF6B35,#FF2D55)' }}
                  >
                    SELLER
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">

              {isSeller && (
                <button
                  onClick={() => { haptic('medium'); navigate('/creator/product/add'); }}
                  className="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#FF6B35,#FF2D55)' }}
                >
                  <PlusCircle size={13} /> Qo'shish
                </button>
              )}
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

        {/* ── Mobile Bottom Nav ─────────────────────────── */}
        <footer
          className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden"
          style={{
            background: 'rgba(255,251,246,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.06)',
            height: 'calc(68px + var(--sab))',
            paddingBottom: 'var(--sab)',
          }}
        >
          {isSeller ? (
            /* ── SELLER NAV ─────────────────────────────── */
            <div className="flex justify-around items-center h-[68px] px-2">

              {/* Left items */}
              {sellerNavLeft.map(item => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} haptic={haptic} end={item.to === '/creator'} />
              ))}

              {/* Center ➕ button */}
              <button
                onClick={() => { haptic('medium'); navigate('/creator/product/add'); }}
                className="flex flex-col items-center justify-center active:scale-90 transition-transform -mt-5"
                style={{ minWidth: '64px' }}
              >
                <div
                  className="w-14 h-14 rounded-[20px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #FF2D55)',
                    boxShadow: '0 8px 24px rgba(255,107,53,0.45)',
                  }}
                >
                  <PlusCircle size={26} className="text-white" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#FF6B35] mt-1">Qo'shish</span>
              </button>

              {/* Right items */}
              {sellerNavRight.map(item => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} haptic={haptic} end={false} />
              ))}
            </div>
          ) : (
            /* ── USER NAV ───────────────────────────────── */
            <div className="flex justify-around items-center h-[68px]">
              {userNavItems.map(item => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} haptic={haptic} end={item.to === '/'} />
              ))}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
