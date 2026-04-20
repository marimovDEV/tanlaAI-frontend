import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import apiClient from '../api/client';
import type { ApiListResponse, Product, Category } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import ProductCard from '../components/ProductCard';

const CardSkeleton = () => (
  <div
    className="rounded-[22px] overflow-hidden"
    style={{
      background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      height: '280px',
    }}
  />
);

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const { haptic } = useTelegram();

  const activeCategory = searchParams.get('category');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/products/?';
      const cat = searchParams.get('category');
      const q   = searchParams.get('search');
      if (cat) url += `category=${cat}&`;
      if (q)   url += `search=${q}&`;
      const res = await apiClient.get<ApiListResponse<Product> | Product[]>(url);
      setProducts(Array.isArray(res.data) ? res.data : res.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    apiClient.get<ApiListResponse<Category> | Category[]>('/categories/')
      .then(res => setCategories(Array.isArray(res.data) ? res.data : res.data.results))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        const p = new URLSearchParams(searchParams);
        searchTerm ? p.set('search', searchTerm) : p.delete('search');
        setSearchParams(p);
      }
    }, 480);
    return () => clearTimeout(t);
  }, [searchTerm, searchParams, setSearchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleCategory = (id: number) => {
    const p = new URLSearchParams(searchParams);
    activeCategory === id.toString() ? p.delete('category') : p.set('category', id.toString());
    setSearchParams(p);
    haptic('light');
  };

  const clearAll = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div style={{ background: '#FFFBF6' }} className="min-h-screen">
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div
        className="sticky z-30 px-4 pt-4 pb-3 space-y-3"
        style={{
          top: 0,
          background: 'rgba(255,251,246,0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(26,26,46,0.05)',
        }}
      >
        <div className="relative">
          <div
            className="w-full h-[52px] flex items-center gap-3 px-5 rounded-[18px]"
            style={{
              background: '#fff',
              boxShadow: '0 4px 20px rgba(26,26,46,0.07)',
              border: '1.5px solid rgba(255,107,53,0.12)',
            }}
          >
            <Search size={20} color="#FF6B35" strokeWidth={2.5} className="flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Mahsulot qidiring..."
              className="flex-1 bg-transparent text-[14px] font-semibold text-[#1A1A2E] placeholder-[#C0C0CE] outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-[#C0C0CE] active:scale-90 transition-transform">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 snap-x">
          <button
            onClick={clearAll}
            className="flex-shrink-0 snap-start px-4 py-2 rounded-full text-[12px] font-black whitespace-nowrap transition-all active:scale-95"
            style={(!activeCategory && !searchTerm)
              ? { background: 'linear-gradient(135deg,#FF6B35,#FF2D55)', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,53,0.28)' }
              : { background: '#fff', color: '#8A8A99', border: '1.5px solid rgba(26,26,46,0.08)' }
            }
          >
            Barchasi
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className="flex-shrink-0 snap-start px-4 py-2 rounded-full text-[12px] font-black whitespace-nowrap transition-all active:scale-95"
              style={activeCategory === cat.id.toString()
                ? { background: 'linear-gradient(135deg,#FF6B35,#FF2D55)', color: '#fff', boxShadow: '0 4px 12px rgba(255,107,53,0.28)' }
                : { background: '#fff', color: '#8A8A99', border: '1.5px solid rgba(26,26,46,0.08)' }
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} color="#FF6B35" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#8A8A99]">
            {loading ? '...' : `${products.length} ta mahsulot`}
          </span>
        </div>
        {(activeCategory || searchTerm) && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[11px] font-black text-[#FF2D55] uppercase tracking-widest active:scale-95 transition-transform"
          >
            <SlidersHorizontal size={12} /> Tozalash
          </button>
        )}
      </div>

      <div className="px-4 pb-10">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onToggleWishlist={async id => {
                  await apiClient.post(`/products/${id}/toggle_wishlist/`);
                  setProducts(prev => prev.map(pr => pr.id === id ? { ...pr, is_wishlisted: !pr.is_wishlisted } : pr));
                }}
                isWishlisted={p.is_wishlisted}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div
              className="w-20 h-20 rounded-[24px] flex items-center justify-center"
              style={{ background: 'rgba(255,107,53,0.08)' }}
            >
              <Search size={32} color="#FF6B35" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[#1A1A2E] mb-1">Natija topilmadi</h3>
              <p className="text-[13px] text-[#B0B0BF] font-medium leading-relaxed">
                Boshqa kategoriya yoki qidiruv so'zi bilan urinib ko'ring
              </p>
            </div>
            <button
              onClick={clearAll}
              className="px-6 py-3 rounded-[16px] text-[13px] font-black text-white active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg,#FF6B35,#FF2D55)', boxShadow: '0 6px 20px rgba(255,107,53,0.28)' }}
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
