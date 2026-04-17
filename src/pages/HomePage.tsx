import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import apiClient from '../api/client';
import type { Banner, Category, Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import { Search } from 'lucide-react';

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

  return (
    <div className="p-5 sm:p-8 max-w-screen-xl mx-auto">
      {/* Search Bar - Premium Style */}
      <div className="mb-8">
        <div 
          className="relative group transition-all"
          onClick={() => {
            haptic('light');
            navigate('/search');
          }}
        >
          <input 
            type="text" 
            placeholder="Mahsulotlarni qidiring..." 
            className="w-full h-14 bg-white rounded-2xl border border-slate-100 shadow-sm pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer group-hover:border-slate-200 group-hover:shadow-md"
            readOnly
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors">
            <Search size={20} />
          </div>
        </div>
      </div>

      {banners.length > 0 && (
        <div className="mb-10">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* Aksiyalar Section - New */}
      {onSaleProducts.length > 0 && (
        <section className="mb-10 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-error rounded-full" />
              <h2 className="font-black text-xl text-slate-900 tracking-tight">Hafta aksiyalari</h2>
            </div>
            <button
              className="text-xs font-black text-error uppercase tracking-widest px-3 py-1 bg-red-50 rounded-lg active:scale-95 transition-all"
              onClick={() => {
                haptic('light');
                navigate('/discounts');
              }}
            >
              Barchasi
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
            {onSaleProducts.map((product) => (
              <div key={product.id} className="w-[180px] flex-shrink-0">
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

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="font-black text-xl text-slate-900 tracking-tight">Kategoriyalar</h2>
          <button
            className="text-xs font-black text-primary uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-lg active:scale-95 transition-all"
            onClick={() => {
              haptic('light');
              navigate('/search');
            }}
          >
            Barchasi
          </button>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="font-black text-xl text-slate-900 tracking-tight">So'nggi mahsulotlar</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
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

      <div className="mt-12 mb-6 text-center">
        <p className="text-[10px] uppercase tracking-widest font-bold text-outline">Tanla Raqamli Butigi</p>
      </div>
    </div>
  );
};

export default HomePage;
