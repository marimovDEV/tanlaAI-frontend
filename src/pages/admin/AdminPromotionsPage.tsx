import { useEffect, useState, useCallback } from 'react';
import { Tag, Package } from 'lucide-react';
import apiClient from '../../api/client';

type Promotion = {
  id: number;
  name: string;
  description: string;
  price: string | null;
  discount_price: string | null;
  image: string | null;
  is_on_sale: boolean;
  sale_end_date: string | null;
  company_details: { name: string } | null;
};

const MEDIA_BASE = import.meta.env.VITE_BACKEND_ORIGIN || '';

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('admin/promotions/');
      setPromos(data.results ?? data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Promotions</h1>
          <p className="text-sm text-slate-500">Manage active discounts and seasonal offers</p>
        </div>
        <span className="flex items-center gap-2 text-sm font-semibold text-sky-700 bg-sky-100 px-4 py-2 rounded-xl">
          <Tag size={16} /> {promos.length} Active Promotions
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Image</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Product</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Pricing</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Expires</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold px-4 py-3">Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Tag size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-500 text-sm">No active promotions at the moment.</p>
                    <p className="text-xs text-sky-600 mt-1 font-semibold uppercase">
                      Manage products to start a sale
                    </p>
                  </td>
                </tr>
              ) : (
                promos.map((p) => (
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
                      <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {p.discount_price ? (
                          <>
                            <span className="line-through text-slate-400 text-xs mr-2">
                              {Number(p.price).toLocaleString()}
                            </span>
                            <span className="font-bold text-red-600">
                              {Number(p.discount_price).toLocaleString()} сум
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-slate-700">
                            {p.price ? `${Number(p.price).toLocaleString()} сум` : '—'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {p.sale_end_date
                        ? new Date(p.sale_end_date).toLocaleDateString()
                        : 'No expiry'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {p.company_details?.name || '—'}
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
