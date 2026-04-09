import { useEffect, useState, useCallback } from 'react';
import { Search, Users, Shield } from 'lucide-react';
import apiClient from '../../api/client';

type TgUser = {
  id: number;
  telegram_id: number;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  photo_url: string | null;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<TgUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchUsers = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/users/', { params: q ? { search: q } : {} });
      setUsers(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const toggleRole = async (id: number) => {
    setToggling(id);
    try {
      const { data } = await apiClient.post(`/admin/users/${id}/toggle-role/`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: data.role } : u)));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500">Manage company status and platform permissions</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
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
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">User</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Telegram ID</th>
                <th className="text-center text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Current Role</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Joined</th>
                <th className="text-right text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Users size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 text-sm">Foydalanuvchi topilmadi</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.photo_url ? (
                          <img src={u.photo_url} alt="" className="w-9 h-9 rounded-full object-cover bg-slate-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-bold">
                            {u.first_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {[u.first_name, u.last_name].filter(Boolean).join(' ')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {u.username ? `@${u.username}` : '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{u.telegram_id}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'COMPANY'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.role === 'COMPANY' && <Shield size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(u.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleRole(u.id)}
                        disabled={toggling === u.id}
                        className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                          u.role === 'COMPANY'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.role === 'COMPANY' ? 'REVOKE' : 'PROMOTE'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white flex-shrink-0">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Company Strategy</h3>
          <p className="text-sm text-slate-600 mt-1">
            Users with the <strong className="text-sky-700">Company</strong> role gain access to advanced
            collection management tools within the WebApp. Promote users who offer exceptional
            craftsmanship to expand the boutique's catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
