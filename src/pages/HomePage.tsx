import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import apiClient from '../api/client';
import type { Banner, Category, Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { haptic } = useTelegram();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, categoriesRes, productsRes] = await Promise.all([
          apiClient.get('/banners/'),
          apiClient.get('/categories/'),
          apiClient.get('/products/'),
        ]);

        setBanners(bannersRes.data.results || bannersRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
        setProducts(productsRes.data.results || productsRes.data);
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
    <div className="p-4 sm:p-6">
      {/* Search Bar (Static for now) */}
      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Mahsulotlarni qidiring..." 
            className="w-full h-14 bg-white rounded-2xl border-none shadow-sm pl-12 pr-6 text-sm focus:ring-2 focus:ring-primary/20"
            readOnly
            onClick={() => {
              haptic('light');
              navigate('/search');
            }}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {banners.length > 0 && <BannerCarousel banners={banners} />}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-extrabold text-lg text-on-surface">Kategoriyalar</h2>
          <button
            className="text-xs font-bold text-primary translate-y-0.5"
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
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-extrabold text-lg text-on-surface">So'nggi mahsulotlar</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onToggleWishlist={async (id) => {
                try {
                  await apiClient.post(`/products/${id}/toggle_wishlist/`);
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
        <p className="text-[10px] uppercase tracking-widest font-bold text-outline">TanlaAI Raqamli Butigi</p>
      </div>
    </div>
  );
};

export default HomePage;
