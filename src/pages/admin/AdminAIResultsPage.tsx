import { useEffect, useState, useCallback } from 'react';
import { Eye, Clock, User, Package, ExternalLink } from 'lucide-react';
import apiClient from '../../api/client';

type AIResult = {
  id: number;
  user_name: string;
  product_name: string;
  input_image: string | null;
  image: string;
  status: string;
  created_at: string;
};

const MEDIA_BASE = import.meta.env.VITE_BACKEND_ORIGIN || '';

export default function AdminAIResultsPage() {
  const [results, setResults] = useState<AIResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('admin/ai-results/');
      setResults(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Visualization Logs</h1>
          <p className="text-sm text-slate-500">History of all AI transformations across the platform</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold">
          <Eye size={18} /> {results.length} Generations
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <Eye size={48} className="mx-auto text-slate-100 mb-3" />
          <p className="text-slate-500">Hali AI generatsiyalari yo{"'"}q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all"
            >
              {/* Image Comparison / Main Result */}
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={r.image.startsWith('http') ? r.image : `${MEDIA_BASE}${r.image}`}
                  alt={r.product_name}
                  className="w-full h-full object-contain"
                />
                
                {/* User/Product Float Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                   <div className="flex items-center gap-2 text-white">
                      <Package size={14} className="text-sky-400" />
                      <span className="text-xs font-bold truncate">{r.product_name}</span>
                   </div>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={14} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{r.user_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Clock size={12} />
                    {new Date(r.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <a
                    href={r.image.startsWith('http') ? r.image : `${MEDIA_BASE}${r.image}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink size={14} /> View Full Image
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
