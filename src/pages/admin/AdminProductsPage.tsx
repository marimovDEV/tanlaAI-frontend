import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, AlertCircle, Package, Plus, Pencil, X } from 'lucide-react';
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
  company: number | null;
};

type Category = { id: number; name: string };
type Company = { id: number; name: string };

const MEDIA_BASE = import.meta.env.VITE_BACKEND_ORIGIN || '';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCat, setFormCat] = useState('');
  const [formComp, setFormComp] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);

  const fetchProducts = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/products/', { params: q ? { search: q } : {} });
      setProducts(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDependencies = async () => {
    const [catRes, compRes] = await Promise.all([
      apiClient.get('/admin/categories/'),
      apiClient.get('/admin/companies/'),
    ]);
    setCategories(catRes.data.results ?? catRes.data);
    setCompanies(compRes.data.results ?? compRes.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchDependencies();
  }, [fetchProducts]);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCat('');
    setFormComp('');
    setFormImage(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormPrice(p.price || '');
    setFormCat(String(p.category || ''));
    setFormComp(String(p.company || ''));
    setFormImage(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formCat) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formName.trim());
      fd.append('description', formDesc.trim());
      fd.append('price', formPrice);
      fd.append('category', formCat);
      if (formComp) fd.append('company', formComp);
      if (formImage) fd.append('image', formImage);

      if (editing) {
        await apiClient.patch(`/admin/products/${editing.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await apiClient.post('/admin/products/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowForm(false);
      fetchProducts(search);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-sky-600/20 whitespace-nowrap"
          >
            <Plus size={18} /> New Product
          </button>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomi</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Mahsulot nomi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tavsifi</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px]"
                  placeholder="Mahsulot haqida ma'lumot"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Narxi (sum)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Masalan: 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategoriya</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="">Tanlang...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kompaniya (ixtiyoriy)</label>
                <select
                  value={formComp}
                  onChange={(e) => setFormComp(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="">Platform mahsuloti</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormImage(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold file:text-sm hover:file:bg-slate-200"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving || !formName.trim() || !formCat}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : editing ? "O'zgarishlarni saqlash" : 'Yangi mahsulot yaratish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
