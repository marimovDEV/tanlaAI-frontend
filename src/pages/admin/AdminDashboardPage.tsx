import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, FolderTree, Building2, Users, Image, Tag,
  TrendingUp, Eye, ArrowUpRight, Plus, RefreshCw, AlertCircle, 
  CheckCircle2, Clock, MousePointer2, ChevronRight, BarChart3
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
    { name: 'Ready', value: data.ai_status.completed || 0 },
    { name: 'Processing', value: data.ai_status.processing || 0 },
    { name: 'Failed', value: data.ai_status.error || 0 },
    { name: 'Pending', value: data.ai_status.none || 0 },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Products', value: data.counts.product_count, icon: Package, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Total Users', value: data.counts.user_count, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'AI Results', value: data.counts.ai_result_count, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Leads', value: data.counts.lead_count, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">TanlaAI Real-time Analytics</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Cloud Data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", s.bg)}>
                <s.icon size={28} className={s.color} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <ArrowUpRight size={14} /> 12%
                </span>
                <span className="text-[10px] text-slate-300 font-bold uppercase">vs last month</span>
              </div>
            </div>
            <p className="text-4xl font-black text-slate-900 mb-1">{s.value.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Health Chart */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">AI Status Health</h2>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <BarChart3 size={20} />
            </div>
          </div>
          
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900">{data.ai_performance.success_rate}%</span>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Success Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Avg Time</p>
              <div className="flex items-center gap-2 text-slate-900">
                <Clock size={16} className="text-sky-500" />
                <span className="text-lg font-black">{data.ai_performance.avg_time}s</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Processed</p>
              <div className="flex items-center gap-2 text-slate-900">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-lg font-black">{data.counts.ai_result_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/adminka/products?action=add" className="p-6 bg-[#0067a5] text-white rounded-[32px] flex flex-col items-center gap-3 hover:bg-[#005a91] transition-all shadow-xl shadow-blue-900/10 group">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12">
                <Plus size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Add Product</span>
            </Link>
            <Link to="/adminka/products?status=error" className="p-6 bg-white border border-slate-100 rounded-[32px] flex flex-col items-center gap-3 hover:bg-slate-50 transition-all shadow-sm group">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <AlertCircle size={24} />
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Fix Errors</span>
            </Link>
            <Link to="/adminka/leads" className="p-6 bg-white border border-slate-100 rounded-[32px] flex flex-col items-center gap-3 hover:bg-slate-50 transition-all shadow-sm group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <TrendingUp size={24} />
               </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Leads</span>
            </Link>
            <Link to="/adminka/banners" className="p-6 bg-white border border-slate-100 rounded-[32px] flex flex-col items-center gap-3 hover:bg-slate-50 transition-all shadow-sm group">
              <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Image size={24} />
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Banners</span>
            </Link>
          </div>

          {/* Recent Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Products */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">Recent Products</h3>
                <Link to="/adminka/products" className="text-[10px] font-black text-[#0067a5] uppercase hover:underline flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-4">
                {data.recent_activity.products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-50">
                        {p.image && <img src={p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_BACKEND_ORIGIN || ''}${p.image}`} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 line-clamp-1">{p.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">ID: #{p.id}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                      p.ai_status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                    )}>
                      {p.ai_status || 'NONE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent AI Visuals */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.1em]">AI Actions</h3>
                <Link to="/adminka/ai-results" className="text-[10px] font-black text-[#0067a5] uppercase hover:underline flex items-center gap-1">
                  History <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-4">
                {data.recent_activity.ai_results.map((ai) => (
                  <div key={ai.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-sky-100">
                      {ai.user_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 line-clamp-1">
                         Visualized <span className="text-sky-600">"{ai.product_name}"</span>
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                        <Clock size={10} /> {new Date(ai.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {ai.user_name}
                      </p>
                    </div>
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

