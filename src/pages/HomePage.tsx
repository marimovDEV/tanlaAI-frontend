import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import apiClient from '../api/client';
import type { Banner, Category, Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import { Search, Menu, Bell } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [onSaleProducts, setOnSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { haptic } = useTelegram();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, categoriesRes, productsRes, onSaleRes] = await Promise.all([
          apiClient.get('banners/'),
          apiClient.get('categories/'),
          apiClient.get('products/'),
          apiClient.get('products/?is_on_sale=true'),
        ]);

        setBanners(bannersRes.data.results || bannersRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
        setProducts(productsRes.data.results || productsRes.data);
        setOnSaleProducts(onSaleRes.data.results || onSaleRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="w-full h-48 bg-surface-variant animate-pulse rounded-2xl" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-16 bg-surface-variant animate-pulse rounded-2xl flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-surface-variant animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const topProducts = products.slice(0, 4);
  const recentProducts = products.slice(4);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto bg-[#f8fafc] min-h-screen pb-24">
      {/* 1. Header (Premium Style) */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button 
          onClick={() => haptic('light')}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-transform"
        >
          <Menu size={22} className="text-slate-800" />
        </button>
        <h1 className="text-2xl font-black tracking-tighter text-[#2563eb]">Tanla</h1>
        <button 
          onClick={() => haptic('light')}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-transform relative"
        >
          <div className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          <Bell size={22} className="text-slate-800" />
        </button>
      </div>

      {/* 2. Hero Block */}
      <div className="px-1 mb-6">
        <div 
          onClick={() => navigate('/visualize/new')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-[20px] shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform cursor-pointer"
        >
          <h2 className="text-lg font-black leading-tight">
            Uyingiz uchun ideal eshikni toping
          </h2>
          <p className="text-sm opacity-90 mt-1 font-medium">
            AI orqali sinab ko'ring 🚪✨
          </p>
        </div>
      </div>

      {/* 3. Premium Search Bar */}
      <div className="mb-8 px-1">
        <div 
          className="relative group transition-all"
          onClick={() => {
            haptic('light');
            navigate('/search');
          }}
        >
          <input 
            type="text" 
            placeholder="Eshik nomi, model..." 
            className="w-full h-14 bg-white rounded-[20px] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] pl-14 pr-6 text-[15px] font-medium transition-all cursor-pointer"
            readOnly
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600">
            <Search size={22} />
          </div>
        </div>
      </div>

      {/* 3. Main Banners Carousel */}
      {banners.length > 0 && (
        <div className="mb-10 px-1">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* 4. Categories (Horizontal scroll assumed in CategoryGrid) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5 px-2">
          <h2 className="font-black text-[19px] text-slate-900 tracking-tight">Kategoriyalar</h2>
        </div>
        <div className="px-1">
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* 🔥 Chegirmalar (Horizontal Scroll) */}
      {onSaleProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-black text-[19px] text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-xl">🔥</span> Chegirmalar
            </h2>
            <button
              className="text-[11px] font-black text-red-600 uppercase tracking-widest px-3 py-1.5 bg-red-50 rounded-lg active:scale-95 transition-all"
              onClick={() => {
                haptic('light');
                navigate('/discounts');
              }}
            >
              Barchasi
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 -mx-4 px-5 snap-x">
            {onSaleProducts.map((product) => (
              <div key={product.id} className="w-[170px] flex-shrink-0 snap-start">
                <ProductCard 
                  product={product} 
                  onToggleWishlist={async (id) => {
                    try {
                      await apiClient.post(`products/${id}/toggle_wishlist/`);
                      setOnSaleProducts(prev => prev.map(p => p.id === id ? { ...p, is_wishlisted: !p.is_wishlisted } : p));
                    } catch (e) {
                      console.error(e);
                    }
                  }} 
                  isWishlisted={product.is_wishlisted}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. 🔥 Eng ko'p sotilayotganlar (2-col grid) */}
      {topProducts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-black text-[19px] text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-xl">🔥</span> Eng ko'p sotilayotganlar
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 px-1">
            {topProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onToggleWishlist={async (id) => {
                  try {
                    await apiClient.post(`products/${id}/toggle_wishlist/`);
                    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_wishlisted: !p.is_wishlisted } : p));
                  } catch (e) {
                    console.error(e);
                  }
                }} 
                isWishlisted={product.is_wishlisted}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. So'nggi mahsulotlar (2-col grid) */}
      {recentProducts.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5 px-2">
            <h2 className="font-black text-[19px] text-slate-900 tracking-tight">So'nggi mahsulotlar</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 px-1">
            {recentProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onToggleWishlist={async (id) => {
                  try {
                    await apiClient.post(`products/${id}/toggle_wishlist/`);
                    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_wishlisted: !p.is_wishlisted } : p));
                  } catch (e) {
                    console.error(e);
                  }
                }} 
                isWishlisted={product.is_wishlisted}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 mb-8 text-center opacity-50">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Tanla Raqamli Butigi</p>
      </div>
    </div>
  );
};

export default HomePage;
