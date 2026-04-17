import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, MessageCircle, Share2 as Instagram, Phone, Play, Zap } from 'lucide-react';
import apiClient from '../api/client';
import type { ApiListResponse, Company, Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import ProductCard from '../components/ProductCard';
import { getMediaUrl } from '../utils/media';

// Telegram WebApp safe link opener
const openLink = (url: string) => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openLink) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  } catch {
    window.open(url, '_blank');
  }
};

const formatTelegramUrl = (link: string) => {
  if (link.startsWith('http')) return link;
  return `https://t.me/${link.replace('@', '')}`;
};

const formatInstagramUrl = (link: string) => {
  if (link.startsWith('http')) return link;
  return `https://instagram.com/${link.replace('@', '')}`;
};

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
            <img src={getMediaUrl(company.logo)} alt={company.name} className="w-full h-full object-cover" />
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

        {/* 📱 Telefon — Call tugmasi */}
        {company.phone && (
          <button
            onClick={() => { haptic('medium'); openLink(`tel:${company.phone}`); }}
            className="mx-auto flex items-center gap-3 bg-green-500 text-white px-6 py-3.5 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-green-500/20"
          >
            <Phone size={18} />
            <span>{company.phone}</span>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-80 border-l border-white/20 pl-3">
              <Zap size={10} /> Qo'ng'iroq
            </span>
          </button>
        )}

        {/* Ijtimoiy tarmoq tugmalari */}
        <div className="flex justify-center gap-3 flex-wrap">
          {company.telegram_link && (
            <button
              onClick={() => { haptic('light'); openLink(formatTelegramUrl(company.telegram_link!)); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] font-bold text-sm active:scale-95 transition-all"
            >
              <MessageCircle size={18} />
              Telegram
            </button>
          )}
          {company.instagram_link && (
            <button
              onClick={() => { haptic('light'); openLink(formatInstagramUrl(company.instagram_link!)); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E4405F]/10 text-[#E4405F] font-bold text-sm active:scale-95 transition-all"
            >
              <Instagram size={18} />
              Instagram
            </button>
          )}
          {company.youtube_link && (
            <button
              onClick={() => { haptic('light'); openLink(company.youtube_link!); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF0000]/10 text-[#FF0000] font-bold text-sm active:scale-95 transition-all"
            >
              <Play size={18} />
              YouTube
            </button>
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
