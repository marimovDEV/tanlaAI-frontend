import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Tag, Building2, Users, Image,
  Settings, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import apiClient from '../api/client';

type AdminUser = { username: string };

const NAV_ITEMS = [
  { to: '/adminka', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/adminka/products', icon: Package, label: 'Products' },
  { to: '/adminka/categories', icon: FolderTree, label: 'Categories' },
  { to: '/adminka/promotions', icon: Tag, label: 'Promotions' },
  { to: '/adminka/companies', icon: Building2, label: 'Companies' },
  { to: '/adminka/users', icon: Users, label: 'Users' },
  { to: '/adminka/banners', icon: Image, label: 'Banners' },
  { to: '/adminka/system', icon: Settings, label: 'System' },
];

export default function AdminLayout() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get('/admin/me/')
      .then(({ data }) => {
        if (data.is_authenticated) {
          setAdmin({ username: data.username });
        } else {
          navigate('/adminka/login');
        }
      })
      .catch(() => navigate('/adminka/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    await apiClient.post('/admin/logout/');
    navigate('/adminka/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] bg-[#1a2332] text-white
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-sky-400">TanlaAI</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              <ChevronRight
                size={14}
                className="ml-auto opacity-40"
              />
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-sky-600/20 flex items-center justify-center text-sky-400 text-sm font-bold">
              {admin?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{admin?.username || 'admin'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 flex items-center px-4 lg:px-8 gap-4 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700">{admin?.username}</p>
                <p className="text-[10px] text-slate-400 uppercase">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
