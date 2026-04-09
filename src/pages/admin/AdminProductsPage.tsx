import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, AlertCircle, Package } from 'lucide-react';
import apiClient from '../../api/client';

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | null;
  image: string | null;
  category: number | null;
  category_name: string;
  ai_status: string;
  owner_details: { first_name: string; last_name: string } | null;
  company_details: { name: string } | null;
};

const MEDIA_BASE = import.meta.env.VITE_BACKEND_ORIGIN || '';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProducts = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/products/', { params: q ? { search: q } : {} });
      setProducts(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bu mahsulotni o'chirmoqchimisiz?")) return;
    setDeleting(id);
    try {
      await apiClient.delete(`/admin/products/${id}/`);
      setProducts((p) => p.filter((x) => x.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'AI Ready' },
      processing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Processing' },
      error: { bg: 'bg-red-100', text: 'text-red-700', label: 'AI Failed' },
      none: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'No AI' },
    };
    const c = map[s] || map.none;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {s === 'error' && <AlertCircle size={12} />}
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500">Manage your digital boutique catalog</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Image</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Product Details</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Price</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Category</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Status</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Creator</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Package size={40} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm">Mahsulot topilmadi</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {p.image ? (
                        <img
                          src={p.image.startsWith('http') ? p.image : `${MEDIA_BASE}${p.image}`}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package size={20} className="text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{p.description?.slice(0, 60)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {p.price ? `${Number(p.price).toLocaleString()}` : 'None'}
                      </span>
                      <p className="text-[10px] font-bold text-sky-600">CYM</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 uppercase">
                        {p.category_name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.ai_status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-[10px] font-bold">
                          {p.owner_details?.first_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs text-slate-600">
                          {p.owner_details?.first_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
