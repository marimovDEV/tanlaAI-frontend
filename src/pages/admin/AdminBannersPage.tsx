import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../api/client';

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
};

const MEDIA_BASE = import.meta.env.VITE_BACKEND_ORIGIN || '';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('admin/banners/');
      setBanners(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreate = () => {
    setEditing(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormOrder(0);
    setFormActive(true);
    setFormImage(null);
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setFormTitle(b.title);
    setFormSubtitle(b.subtitle);
    setFormOrder(b.order);
    setFormActive(b.is_active);
    setFormImage(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', formTitle);
      fd.append('subtitle', formSubtitle);
      fd.append('order', String(formOrder));
      fd.append('is_active', String(formActive));
      if (formImage) fd.append('image', formImage);

      if (editing) {
        await apiClient.patch(`/admin/banners/${editing.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await apiClient.post('admin/banners/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowForm(false);
      fetchBanners();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu bannerni o'chirmoqchimisiz?")) return;
    await apiClient.delete(`/admin/banners/${id}/`);
    setBanners((b) => b.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Banners</h1>
          <p className="text-sm text-slate-500">Manage homepage carousel banners</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-pink-600/20"
        >
          <Plus size={18} /> New Banner
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <ImageIcon size={48} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500">Hali banner yo{"'"}q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all"
            >
              {b.image ? (
                <img
                  src={b.image.startsWith('http') ? b.image : `${MEDIA_BASE}${b.image}`}
                  alt={b.title}
                  className="w-full h-40 object-cover bg-slate-100"
                />
              ) : (
                <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
                  <ImageIcon size={40} className="text-slate-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{b.title || `Banner #${b.id}`}</h3>
                    {b.subtitle && (
                      <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Order: {b.order}</p>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(b)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <Pencil size={14} /> Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editing ? 'Bannerni tahrirlash' : 'Yangi banner'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Banner sarlavhasi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
              <input
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Banner tavsifi"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 accent-sky-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormImage(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold file:text-sm hover:file:bg-slate-200"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : 'Yaratish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
