import { useEffect, useState, useCallback } from 'react';
import { Search, TrendingUp, CheckCircle2, Clock, Trash2, MessageSquare, Phone, Ruler } from 'lucide-react';
import apiClient from '../../api/client';

type Lead = {
  id: number;
  lead_type: 'call' | 'telegram' | 'measurement';
  message: string;
  phone: string;
  is_processed: boolean;
  created_at: string;
  user_name: string;
  product_name: string;
  company_name: string | null;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unprocessed' | 'processed'>('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/leads/', {
        params: filter !== 'all' ? { status: filter } : {},
      });
      setLeads(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const toggleProcessed = async (id: number) => {
    try {
      const { data } = await apiClient.post(`/admin/leads/${id}/toggle-processed/`);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, is_processed: data.is_processed } : l)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu leadni o'chirmoqchimisiz?")) return;
    await apiClient.delete(`/admin/leads/${id}/`);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const getLeadIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={16} className="text-sky-600" />;
      case 'telegram': return <MessageSquare size={16} className="text-sky-500" />;
      case 'measurement': return <Ruler size={16} className="text-emerald-600" />;
      default: return <TrendingUp size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leads Management</h1>
          <p className="text-sm text-slate-500">Track and respond to customer requests</p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          {(['all', 'unprocessed', 'processed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <TrendingUp size={48} className="mx-auto text-slate-100 mb-3" />
          <p className="text-slate-500">Hech qanday lead topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((l) => (
            <div
              key={l.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all p-5 relative overflow-hidden group ${
                l.is_processed ? 'border-emerald-100' : 'border-slate-100 hover:border-sky-200'
              }`}
            >
              {l.is_processed && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-0.5 rounded-bl-xl text-[10px] font-bold">
                  PROCESSED
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  l.lead_type === 'measurement' ? 'bg-emerald-50' : 'bg-sky-50'
                }`}>
                  {getLeadIcon(l.lead_type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{l.user_name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{l.phone}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Product</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{l.product_name}</p>
                </div>
                {l.message && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Message</p>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{l.message}"</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                   <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock size={12} />
                    {new Date(l.created_at).toLocaleDateString()}
                   </div>
                   <div className="text-[10px] font-bold text-sky-600 uppercase">
                    {l.company_name || 'Platform'}
                   </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-2">
                <button
                  onClick={() => toggleProcessed(l.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                    l.is_processed
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {l.is_processed ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                  {l.is_processed ? 'Mark Unprocessed' : 'Mark Processed'}
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
