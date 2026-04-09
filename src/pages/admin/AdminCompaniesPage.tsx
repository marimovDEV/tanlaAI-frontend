import { useEffect, useState, useCallback } from 'react';
import { Search, Pencil, Trash2, Building2, X } from 'lucide-react';
import apiClient from '../../api/client';

type Company = {
  id: number;
  name: string;
  description: string;
  location: string;
  logo: string | null;
  is_active: boolean;
  subscription_deadline: string | null;
  owner_name: string;
  owner_username: string;
  product_count: number;
  created_at: string;
  telegram_link?: string;
  instagram_link?: string;
};

const MEDIA_BASE = import.meta.env.VITE_BACKEND_ORIGIN || '';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLoc, setFormLoc] = useState('');
  const [formTg, setFormTg] = useState('');
  const [formIg, setFormIg] = useState('');
  const [formLogo, setFormLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCompanies = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/companies/', { params: q ? { search: q } : {} });
      setCompanies(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    const t = setTimeout(() => fetchCompanies(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchCompanies]);

  const openEdit = (c: Company) => {
    setEditing(c);
    setFormName(c.name);
    setFormDesc(c.description || '');
    setFormLoc(c.location || '');
    setFormTg(c.telegram_link || '');
    setFormIg(c.instagram_link || '');
    setFormLogo(null);
    setShowForm(true);
  };

  const handleEditSubmit = async () => {
    if (!editing || !formName.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formName.trim());
      fd.append('description', formDesc.trim());
      fd.append('location', formLoc.trim());
      fd.append('telegram_link', formTg.trim());
      fd.append('instagram_link', formIg.trim());
      if (formLogo) fd.append('logo', formLogo);

      const { data } = await apiClient.patch(`/admin/companies/${editing.id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setCompanies((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const { data } = await apiClient.post(`/admin/companies/${id}/toggle-active/`);
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: data.is_active } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const updateDeadline = async (id: number, date: string) => {
    try {
      const { data } = await apiClient.post(`/admin/companies/${id}/update-deadline/`, {
        subscription_deadline: date || null,
      });
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, subscription_deadline: data.subscription_deadline } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kompaniyani o'chirmoqchimisiz?")) return;
    await apiClient.delete(`/admin/companies/${id}/`);
    setCompanies((c) => c.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Companies</h1>
          <p className="text-sm text-slate-500">Manage registered studios and brands</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
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
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Logo</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Company Name</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Owner</th>
                <th className="text-center text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Status</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Deadline</th>
                <th className="text-center text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Products</th>
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
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Building2 size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 text-sm">Kompaniya topilmadi</p>
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {c.logo ? (
                        <img
                          src={c.logo.startsWith('http') ? c.logo : `${MEDIA_BASE}${c.logo}`}
                          alt={c.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                          <Building2 size={18} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400">
                        ID: {c.id} | {c.location}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{c.owner_name}</p>
                      <p className="text-xs text-slate-400">{c.owner_username}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(c.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          c.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {c.is_active ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={c.subscription_deadline?.slice(0, 10) || ''}
                        onChange={(e) => updateDeadline(c.id, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        c.product_count > 0 ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {c.product_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Kompaniyani tahrirlash</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kompaniya nomi</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tavsifi</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manzili</label>
                <input
                  value={formLoc}
                  onChange={(e) => setFormLoc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Link</label>
                  <input
                    value={formTg}
                    onChange={(e) => setFormTg(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="https://t.me/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instagram Link</label>
                  <input
                    value={formIg}
                    onChange={(e) => setFormIg(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormLogo(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold file:text-sm hover:file:bg-slate-200"
                />
              </div>
              <button
                onClick={handleEditSubmit}
                disabled={saving || !formName.trim()}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-lg shadow-sky-600/20 disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
