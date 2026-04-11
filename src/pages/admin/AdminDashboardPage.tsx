import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Users, Image,
  TrendingUp, Eye, Plus, RefreshCw, 
  CheckCircle2, Clock, MousePointer2, ChevronRight,
  ShieldAlert, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import apiClient from '../../api/client';
import { cn } from '../../utils/cn';

type RecentItem = {
  id: number;
  name?: string;
  product_name?: string;
  user_name?: string;
  created_at?: string;
  status?: string;
  ai_status?: string;
  image?: string;
};

type DashboardData = {
  counts: {
    product_count: number;
    category_count: number;
    company_count: number;
    user_count: number;
    banner_count: number;
    lead_count: number;
    ai_result_count: number;
    ai_error_count: number;
    active_promotions: number;
  };
  ai_status: Record<string, number>;
  ai_performance: {
    success_rate: number;
    avg_time: number;
  };
  recent_activity: {
    products: RecentItem[];
    ai_results: RecentItem[];
    leads: RecentItem[];
  };
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#cbd5e1'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/dashboard/')
      .then(({ data }) => setData(data))
      .catch(err => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#0067a5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = [
    { name: 'Tayyor', value: data.ai_status.completed || 0 },
    { name: 'Jarayonda', value: data.ai_status.processing || 0 },
    { name: 'Xato', value: data.ai_status.error || 0 },
    { name: 'Kutilmoqda', value: data.ai_status.none || 0 },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Mahsulotlar', value: data.counts.product_count, icon: Package, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Foydalanuvchilar', value: data.counts.user_count, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'AI Natijalar', value: data.counts.ai_result_count, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'AI Xatoliklar', value: data.counts.ai_error_count, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Umumiy holat</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Platformangiz statistikasi va real vaqt tahlili</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tizim Onlayn</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#0067a5] transition-colors shadow-sm">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="relative bg-white p-7 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative flex items-center justify-between mb-8">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", s.bg)}>
                <s.icon size={28} className={s.color} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <TrendingUp size={12} /> +12%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                {s.value !== undefined ? s.value.toLocaleString() : '0'}
              </p>
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Health Widget */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">AI Status Health</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sifat darajasi</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
          
          {/* Fixed Chart Container */}
          <div className="h-[280px] w-full flex items-center justify-center relative bg-slate-50/30 rounded-[32px] overflow-hidden">
            <PieChart width={320} height={280}>
              <Pie
                data={chartData}
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
                cx="50%"
                cy="50%"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                  padding: '12px 16px'
                }}
              />
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-5px]">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{data.ai_performance.success_rate || 100}%</span>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">Success</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="p-5 bg-slate-50/80 rounded-[24px] border border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">O'rtacha vaqt</p>
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <span className="text-xl font-black">{data.ai_performance.avg_time}s</span>
              </div>
            </div>
            <div className="p-5 bg-slate-50/80 rounded-[24px] border border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Jami Renderlar</p>
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-xl font-black">{data.counts.ai_result_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content & Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Products */}
          <div className="bg-white p-8 rounded-[40px] shadow-[0_8_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                  <Package size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">So'nggi mahsulotlar</h3>
              </div>
              <Link to="/adminka/products" className="text-xs font-black text-[#0067a5] hover:underline flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-full">
                Barchasi <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recent_activity.products.length > 0 ? (
                data.recent_activity.products.map((p) => {
                  // Robust URL generation with hardcoded fallback for production
                  const origin = import.meta.env.VITE_BACKEND_ORIGIN || 'https://tanla-ai-backend.onrender.com';
                  const imageUrl = p.image ? (p.image.startsWith('http') ? p.image : `${origin}${p.image}`) : null;

                  return (
                    <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                      <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-slate-100 p-1 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            className="w-full h-full object-contain"
                            alt={p.name}
                            onError={(e) => {
                              // Use a generic SVG placeholder if all else fails
                              (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2JkNWUxIiBmb250LXNpemU9IjEwIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=`;
                            }}
                          />
                        ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><Image size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                          p.ai_status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        )}>
                          {p.ai_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-slate-400 font-medium">Ma'lumot topilmadi</div>
              )}
            </div>
          </div>

          {/* AI Activity & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3 bg-white p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Real-vaqt faollik</h3>
              <div className="space-y-6">
                {data.recent_activity.ai_results.map((ai) => (
                  <div key={ai.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 text-slate-500 font-black text-xs">
                      {ai.user_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-800">
                        <span className="font-black">{ai.user_name}</span> mahsulotni vizualizatsiya qildi: <span className="text-[#0067a5] font-black">{ai.product_name}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                        <Clock size={10} /> {new Date(ai.created_at || '').toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">
              <Link to="/adminka/products?action=add" className="flex-1 p-6 bg-[#0067a5] text-white rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-[#005a91] transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                <Plus size={32} />
                <span className="text-xs font-black uppercase tracking-widest">Qo'shish</span>
              </Link>
              <Link to="/adminka/leads" className="flex-1 p-6 bg-white border border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                <MousePointer2 size={32} className="text-emerald-500" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Lidlar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


