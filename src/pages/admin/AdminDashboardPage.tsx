import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, FolderTree, Building2, Users, Image, Tag,
  TrendingUp, Eye, ArrowUpRight,
} from 'lucide-react';
import apiClient from '../../api/client';

type DashboardStats = {
  product_count: number;
  category_count: number;
  company_count: number;
  user_count: number;
  banner_count: number;
  lead_count: number;
  ai_result_count: number;
  active_promotions: number;
};

const STAT_CARDS = [
  { key: 'product_count', label: 'Products', icon: Package, color: 'bg-sky-500', link: '/adminka/products' },
  { key: 'category_count', label: 'Categories', icon: FolderTree, color: 'bg-emerald-500', link: '/adminka/categories' },
  { key: 'company_count', label: 'Companies', icon: Building2, color: 'bg-violet-500', link: '/adminka/companies' },
  { key: 'user_count', label: 'Users', icon: Users, color: 'bg-amber-500', link: '/adminka/users' },
  { key: 'banner_count', label: 'Banners', icon: Image, color: 'bg-pink-500', link: '/adminka/banners' },
  { key: 'active_promotions', label: 'Promotions', icon: Tag, color: 'bg-red-500', link: '/adminka/promotions' },
  { key: 'lead_count', label: 'Leads', icon: TrendingUp, color: 'bg-teal-500', link: '/adminka/leads' },
  { key: 'ai_result_count', label: 'AI Results', icon: Eye, color: 'bg-indigo-500', link: '/adminka/ai-results' },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiClient.get('/admin/dashboard/').then(({ data }: { data: DashboardStats }) => setStats(data));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platformangiz statistikasi va umumiy ko{"'"}rinishi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const value = stats ? (stats as any)[card.key] ?? 0 : '—';
          return (
            <Link
              key={card.key}
              to={card.link}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-white shadow-lg`}>
                  <card.icon size={20} />
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Tezkor amallar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/adminka/products"
            className="flex items-center gap-3 px-4 py-3 bg-sky-50 text-sky-700 rounded-xl hover:bg-sky-100 transition-colors font-medium text-sm"
          >
            <Package size={18} /> Mahsulotlar
          </Link>
          <Link
            to="/adminka/categories"
            className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium text-sm"
          >
            <FolderTree size={18} /> Kategoriyalar
          </Link>
          <Link
            to="/adminka/companies"
            className="flex items-center gap-3 px-4 py-3 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors font-medium text-sm"
          >
            <Building2 size={18} /> Kompaniyalar
          </Link>
          <Link
            to="/adminka/users"
            className="flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors font-medium text-sm"
          >
            <Users size={18} /> Foydalanuvchilar
          </Link>
        </div>
      </div>
    </div>
  );
}
