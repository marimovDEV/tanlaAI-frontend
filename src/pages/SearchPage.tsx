import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import apiClient from '../api/client';
import type { ApiListResponse, Product, Category } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import ProductCard from '../components/ProductCard';
import { cn } from '../utils/cn';

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
      const categoryId = searchParams.get('category');
      const search = searchParams.get('search');
      
      let url = '/products/?';
      if (categoryId) url += `category=${categoryId}&`;
      if (search) url += `search=${search}&`;

      const response = await apiClient.get<ApiListResponse<Product> | Product[]>(url);
      setProducts(Array.isArray(response.data) ? response.data : response.data.results);
    } catch (err) {
      console.error('Error fetching searched products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<ApiListResponse<Category> | Category[]>('/categories/');
        setCategories(Array.isArray(response.data) ? response.data : response.data.results);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        const newParams = new URLSearchParams(searchParams);
        if (searchTerm) newParams.set('search', searchTerm);
        else newParams.delete('search');
        setSearchParams(newParams);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleCategory = (id: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (activeCategory === id.toString()) {
      newParams.delete('category');
    } else {
      newParams.set('category', id.toString());
    }
    setSearchParams(newParams);
    haptic('light');
  };

  return (
    <div className="p-4 sm:p-6 pb-20 space-y-6">
      {/* Search Input */}
      <div className="relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Mahsulotlarni qidiring..." 
          className="w-full h-14 bg-white rounded-2xl border-none shadow-sm pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
          <Search size={20} />
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline/40 hover:text-outline"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="flex overflow-x-auto gap-2 no-scrollbar px-1 py-1">
        <button
          onClick={() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('category');
            setSearchParams(newParams);
            haptic('soft');
          }}
          className={cn(
            "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
            !activeCategory 
              ? "bg-primary text-white border-primary shadow-md" 
              : "bg-white text-outline border-outline/10"
          )}
        >
          Barcha mahsulotlar
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
              activeCategory === cat.id.toString()
                ? "bg-primary text-white border-primary shadow-md" 
                : "bg-white text-outline border-outline/10"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort/Filter Bar */}
      <div className="flex items-center justify-between border-b border-outline/5 pb-4 px-1">
        <div className="flex items-center gap-2 text-outline text-[10px] font-black uppercase tracking-widest">
          <SlidersHorizontal size={14} />
          <span>{products.length} ta natija topildi</span>
        </div>
        <button className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest">
          <ArrowUpDown size={14} />
          <span>Mos keluvchi</span>
        </button>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] bg-surface-variant animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
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
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-surface-variant/50 rounded-full flex items-center justify-center mx-auto">
            <Search size={40} className="text-outline/20" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Natija topilmadi</h3>
            <p className="text-sm text-outline">Filtrlarni yoki qidiruv so'zini o'zgartirib ko'ring.</p>
          </div>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSearchParams(new URLSearchParams());
            }}
            className="text-primary font-bold text-sm"
          >
            Barcha filtrlarni tozalash
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
