import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, MessageCircle, Share2 as Instagram } from 'lucide-react';
import apiClient from '../api/client';
import type { ApiListResponse, Company, Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import ProductCard from '../components/ProductCard';

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { haptic } = useTelegram();
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const [companyRes, productsRes] = await Promise.all([
          apiClient.get<Company>(`/companies/${id}/`),
          apiClient.get<ApiListResponse<Product> | Product[]>(`/products/?company=${id}`),
        ]);

        setCompany(companyRes.data);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.results);
      } catch (error) {
        console.error('Error fetching company detail:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCompany();
  }, [id]);

  if (loading) {
    return <div className="p-6">Studiya sahifasi yuklanmoqda...</div>;
  }

  if (!company) {
    return <div className="p-6">Studiya topilmadi.</div>;
  }

  if (!company.is_currently_active) {
    return (
      <div className="p-6 pb-24 space-y-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div className="bg-white rounded-[32px] p-8 text-center border border-outline/10">
          <div className="w-20 h-20 rounded-[28px] bg-surface-variant flex items-center justify-center mx-auto mb-5">
            <Building2 size={32} className="text-outline/40" />
          </div>
          <h2 className="text-2xl font-black text-on-surface mb-2">{company.name}</h2>
          <p className="text-sm text-outline">Bu studiya hozircha faol emas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-8">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        <ArrowLeft size={18} />
      </button>

      <section className="text-center space-y-4">
        <div className="w-32 h-32 rounded-[36px] overflow-hidden mx-auto bg-white shadow-xl border border-outline/10">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-outline/30">
              <Building2 size={36} />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-black text-on-surface">{company.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-outline text-xs font-bold uppercase tracking-widest">
            <MapPin size={14} className="text-primary" />
            <span>{company.location}</span>
          </div>
        </div>

        <p className="text-sm text-outline leading-relaxed max-w-md mx-auto">{company.description}</p>

        <div className="flex justify-center gap-4">
          {company.telegram_link && (
            <a
              href={`https://t.me/${company.telegram_link.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptic('light')}
              className="w-12 h-12 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center"
            >
              <MessageCircle size={20} />
            </a>
          )}
          {company.instagram_link && (
            <a
              href={company.instagram_link.startsWith('http') ? company.instagram_link : `https://instagram.com/${company.instagram_link.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptic('light')}
              className="w-12 h-12 rounded-2xl bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center"
            >
              <Instagram size={20} />
            </a>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-on-surface">Mahsulotlar</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-outline bg-white px-3 py-1 rounded-full border border-outline/10">
            {products.length} ta
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isWishlisted={product.is_wishlisted} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[28px] p-10 text-center border border-dashed border-outline/10 text-outline">
            Bu studiyada hali mahsulot yo'q.
          </div>
        )}
      </section>
    </div>
  );
};

export default CompanyDetailPage;
