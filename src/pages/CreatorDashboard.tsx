import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Package, 
  Inbox, 
  Settings, 
  PlusCircle, 
  ArrowRight, 
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import apiClient from '../api/client';
import { getMediaUrl } from '../utils/media';
import type { ApiListResponse, Company, LeadRequest, Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import { cn } from '../utils/cn';

const CreatorDashboard: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { haptic } = useTelegram();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companyRes, productsRes, leadsRes] = await Promise.all([
          apiClient.get<Company>('/companies/my/'),
          apiClient.get<Product[]>('/products/my/'),
          apiClient.get<ApiListResponse<LeadRequest> | LeadRequest[]>('/leads/')
        ]);
        
        setCompany(companyRes.data);
        setProducts(productsRes.data);
        setLeadsCount(Array.isArray(leadsRes.data) ? leadsRes.data.length : leadsRes.data.count || leadsRes.data.results.length);
      } catch (error: unknown) {
        console.error('Error fetching dashboard data:', error);
        if (isAxiosError(error) && error.response?.status === 404) {
          navigate('/company/create');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return <div className="p-6">Boshqaruv paneli yuklanmoqda...</div>;
  }

  return (
    <div className="p-6 pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Studiya markazi</h2>
          <p className="text-xs text-outline font-bold uppercase tracking-widest mt-1">Boshqaruv markazi</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <LayoutDashboard size={24} />
        </div>
      </div>

      {/* Company Card */}
      {company && (
        <div className="bg-white p-6 rounded-[32px] border border-outline/5 shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-surface-variant overflow-hidden border border-outline/10">
            {company.logo ? (
              <img src={getMediaUrl(company.logo)} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline/30">
                <Building2 size={24} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-on-surface">{company.name}</h3>
            <p className="text-xs text-outline line-clamp-1">{company.location}</p>
          </div>
          <button 
            onClick={() => navigate('/creator/studio/edit')}
            className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-outline active:scale-90 transition-transform"
          >
            <Settings size={20} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Mahsulotlar', value: products.length, icon: Package, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Buyurtmalar', value: leadsCount, icon: Inbox, color: 'text-secondary', bg: 'bg-secondary/5' }
        ].map((stat, idx) => (
          <div key={idx} className={cn("p-5 rounded-[28px] border border-outline/5", stat.bg)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Tezkor amallar</h4>
        
        <button 
          onClick={() => {
            haptic('medium');
            navigate('/creator/product/add');
          }}
          className="w-full flex items-center justify-between p-6 bg-primary text-white rounded-[28px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <PlusCircle size={24} />
            </div>
            <div className="text-left">
              <p className="font-black">Yangi mahsulot qo'shish</p>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">Ommaviy katalogga chiqarish</p>
            </div>
          </div>
          <ArrowRight size={20} />
        </button>

        <button 
          onClick={() => navigate('/creator/leads')}
          className="w-full flex items-center justify-between p-6 bg-white rounded-[28px] border border-outline/10 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-on-surface">Ko'rsatkichlarni tahlil qilish</p>
              <p className="text-[10px] font-bold text-outline uppercase tracking-tighter">Buyurtmalar va statistikani ko'rish</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-outline/30" />
        </button>
      </div>

      {/* Latest Products Snippet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-outline">Sizning to'plamingiz</h4>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest">Barchasi</button>
        </div>
        
        <div className="space-y-3">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-2xl border border-outline/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden">
                <img src={getMediaUrl(product.image)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface text-sm">{product.name}</p>
                <p className="text-[10px] text-outline uppercase font-black">{product.price ? `${Number(product.price).toLocaleString()} UZS` : 'Maxsus narx'}</p>
              </div>
              <button 
                onClick={() => navigate(`/creator/product/edit/${product.id}`)}
                className="text-[10px] font-black text-primary uppercase tracking-widest"
              >
                Tahrirlash
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <Package size={48} className="mx-auto mb-2 text-outline/30" />
              <p className="text-xs font-bold text-outline">Hali mahsulotlar yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
