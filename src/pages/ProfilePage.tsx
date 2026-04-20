import React, { useEffect, useState } from 'react';
import { Heart, User, Settings, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import type { ApiListResponse, Product, WishlistItem } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import ProductCard from '../components/ProductCard';
import { cn } from '../utils/cn';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: tgUser, haptic, profile } = useTelegram();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await apiClient.get<ApiListResponse<WishlistItem> | WishlistItem[]>('/wishlist/');
        const items = Array.isArray(response.data) ? response.data : response.data.results;
        const products = items.map((item) => item.product_details);
        setWishlist(products);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (productId: number) => {
    try {
      await apiClient.post(`/products/${productId}/toggle_wishlist/`);
      setWishlist(prev => prev.filter(p => p.id !== productId));
      haptic('soft');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-20 space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-surface-variant flex items-center justify-center">
          {tgUser?.photo_url ? (
            <img src={tgUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-outline/40" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-extrabold text-on-surface">
            {tgUser?.first_name || 'Foydalanuvchi'}
          </h3>
          <p className="text-outline text-sm">@{tgUser?.username || 'user'}</p>
        </div>
      </div>

      {/* Stats/Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-outline/5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Saqlanganlar</p>
          <p className="text-xl font-black text-primary">{wishlist.length}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-outline/5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Holat</p>
          <p className="text-sm font-black text-primary uppercase line-clamp-1">
            {profile?.role === 'COMPANY' ? 'Ishlab chiqaruvchi' : 'Xaridor'}
          </p>
        </div>
      </div>

      {/* Company Strategy Block */}
      {!profile?.has_company ? (
        <div className="mb-8">
          <button 
            onClick={() => { haptic('light'); navigate('/company/create'); }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] p-5 flex items-center justify-between shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-transform"
          >
            <div className="text-left pr-4">
              <h3 className="font-black text-lg mb-1 leading-tight">🚀 Biznesingizni boshlang</h3>
              <p className="text-xs font-medium opacity-90">
                Kompaniyangizni qo'shing va sotuvlarni oshiring!
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 flex-shrink-0 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-inner">
              <ChevronRight size={24} className="text-white" />
            </div>
          </button>
        </div>
      ) : (
        <div className="mb-8 flex gap-2">
          <button 
            onClick={() => { haptic('light'); navigate('/creator'); }}
            className="flex-1 bg-slate-900 text-white rounded-[24px] p-5 flex items-center justify-between shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-transform"
          >
            <div className="text-left pr-4">
              <h3 className="font-black text-lg mb-1 leading-tight">🏢 Mening kompaniyam</h3>
              <p className="text-xs font-medium opacity-90">
                Dashboard va boshqaruv
              </p>
            </div>
            <div className="w-10 h-10 bg-white/10 flex-shrink-0 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
              <ChevronRight size={24} className="text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Wishlist Section */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="font-extrabold text-xl text-on-surface flex items-center gap-2">
            <Heart size={20} className="fill-error text-error" />
            Mening tanlovlarim
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-surface-variant animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {wishlist.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={true}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-10 text-center border-2 border-dashed border-outline/10">
            <Heart size={48} className="text-outline/20 mx-auto mb-4" />
            <p className="text-outline text-sm font-medium">Sizning saqlanganlar ro'yxatingiz bo'sh.</p>
            <button 
              onClick={() => haptic('light')}
              className="mt-4 text-primary font-bold text-sm"
            >
              Qidirishni boshlash
            </button>
          </div>
        )}
      </section>

      {/* Menu Options */}
      <div className="space-y-3">
        {[
          { icon: Sparkles, label: 'Mening vizualizatsiyalarim', path: '/visualizations', iconColor: 'bg-indigo-50 text-indigo-600' },
          { icon: Settings, label: 'Sozlamalar' },
          { icon: LogOut, label: 'Dasturdan chiqish', className: 'text-error' }
        ].map((item, idx) => (
          <button 
            key={idx}
            className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-outline/5 active:scale-[0.98] transition-all"
            onClick={() => {
              if (item.path) navigate(item.path);
              haptic('light');
            }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                item.iconColor || (item.className ? "bg-error/10 text-error" : "bg-primary/5 text-primary")
              )}>
                <item.icon size={20} />
              </div>
              <span className={cn("font-bold text-sm", item.className && item.className)}>
                {item.label}
              </span>
            </div>
            <ChevronRight size={16} className="text-outline/30" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
