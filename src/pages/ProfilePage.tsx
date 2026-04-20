import React, { useEffect, useState } from 'react';
import { Heart, User, ChevronRight, Sparkles, Building2, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import type { ApiListResponse, Product, WishlistItem } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import ProductCard from '../components/ProductCard';

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
    <div className="pb-20" style={{ background: '#FFFBF6', minHeight: '100vh' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      {/* Profile Header */}
      <div className="px-4 pt-6 pb-5">
        <div className="flex items-center gap-5">
          <div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center overflow-hidden"
            style={{
              background: tgUser?.photo_url ? undefined : 'linear-gradient(135deg, #FF6B35, #FF2D55)',
              boxShadow: '0 8px 24px rgba(255,107,53,0.25)',
              border: '3px solid white',
            }}
          >
            {tgUser?.photo_url ? (
              <img src={tgUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-[22px] font-black text-[#1A1A2E] leading-none tracking-tight">
              {tgUser?.first_name || 'Foydalanuvchi'}
            </h3>
            <p className="text-[13px] text-[#B0B0BF] font-bold mt-1">@{tgUser?.username || 'user'}</p>
            <div
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
              style={{
                background: profile?.role === 'COMPANY'
                  ? 'linear-gradient(135deg, #00C9B1, #00A896)'
                  : 'linear-gradient(135deg, #FF6B35, #FF2D55)',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {profile?.role === 'COMPANY' ? 'Sotuvchi' : 'Xaridor'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 space-y-2.5 mb-6">
        <button
          onClick={() => { haptic('light'); navigate('/visualizations'); }}
          className="w-full flex items-center justify-between p-4 rounded-[20px] active:scale-[0.97] transition-transform"
          style={{ background: '#fff', boxShadow: '0 4px 16px rgba(26,26,46,0.06)' }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.08)' }}
            >
              <Sparkles size={20} color="#8B5CF6" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#1A1A2E]">Mening vizualizatsiyalarim</p>
              <p className="text-[10px] font-bold text-[#B0B0BF] uppercase tracking-widest">AI natijalarim</p>
            </div>
          </div>
          <ChevronRight size={16} color="#C0C0CE" />
        </button>

        <button
          onClick={() => { haptic('light'); navigate('/wishlist'); }}
          className="w-full flex items-center justify-between p-4 rounded-[20px] active:scale-[0.97] transition-transform"
          style={{ background: '#fff', boxShadow: '0 4px 16px rgba(26,26,46,0.06)' }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center"
              style={{ background: 'rgba(255,45,85,0.08)' }}
            >
              <Heart size={20} color="#FF2D55" />
            </div>
            <div>
              <p className="text-[14px] font-black text-[#1A1A2E]">Sevimli mahsulotlar</p>
              <p className="text-[10px] font-bold text-[#B0B0BF] uppercase tracking-widest">{wishlist.length} ta saqlangan</p>
            </div>
          </div>
          <ChevronRight size={16} color="#C0C0CE" />
        </button>
      </div>

      {/* Company CTA */}
      <div className="px-4 mb-8">
        {!profile?.has_company ? (
          <button
            onClick={() => { haptic('medium'); navigate('/company/create'); }}
            className="w-full relative overflow-hidden p-5 rounded-[22px] flex items-center justify-between active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF2D55 100%)',
              boxShadow: '0 12px 32px rgba(255,107,53,0.35)',
            }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-15"
              style={{ background: 'white', transform: 'translate(30%,-30%)' }} />
            <div className="text-left pr-4 relative">
              <div className="flex items-center gap-2 mb-1.5">
                <Store size={16} className="text-white/80" />
                <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Yangi</span>
              </div>
              <h3 className="font-black text-[17px] text-white leading-tight mb-0.5">Kompaniya ochish</h3>
              <p className="text-[12px] font-medium text-white/75">
                Biznesingizni platformaga qo'shing
              </p>
            </div>
            <div
              className="w-11 h-11 flex-shrink-0 rounded-[14px] flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronRight size={20} className="text-white" />
            </div>
          </button>
        ) : (
          <button
            onClick={() => { haptic('light'); navigate('/creator'); }}
            className="w-full p-5 rounded-[22px] flex items-center justify-between active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1A1A2E, #2D2D4E)',
              boxShadow: '0 12px 32px rgba(26,26,46,0.30)',
            }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <Building2 size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-[17px] text-white leading-tight">Mening kompaniyam</h3>
                <p className="text-[12px] font-medium text-white/60">Dashboard va boshqaruv</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/50" />
          </button>
        )}
      </div>

      {/* Wishlist Section */}
      {wishlist.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,45,85,0.08)' }}>
                <Heart size={16} color="#FF2D55" />
              </div>
              <h2 className="text-[18px] font-black text-[#1A1A2E] tracking-tight">Sevimlilar</h2>
            </div>
            <button
              onClick={() => navigate('/wishlist')}
              className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
              style={{ color: '#FF2D55', background: 'rgba(255,45,85,0.06)' }}
            >
              Barchasi <ChevronRight size={12} className="inline" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-[22px]" style={{
                  height: '240px',
                  background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s infinite',
                }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {wishlist.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={true}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty state if no wishlist */}
      {!loading && wishlist.length === 0 && (
        <div className="px-4">
          <div
            className="rounded-[22px] p-10 text-center"
            style={{ background: '#fff', boxShadow: '0 4px 16px rgba(26,26,46,0.06)', border: '2px dashed rgba(26,26,46,0.06)' }}
          >
            <Heart size={40} color="#E0E0E8" className="mx-auto mb-3" />
            <p className="text-[14px] font-bold text-[#B0B0BF] mb-3">Sizning sevimlilar ro'yxatingiz bo'sh</p>
            <button
              onClick={() => { haptic('light'); navigate('/search'); }}
              className="text-[13px] font-black text-white px-6 py-2.5 rounded-[14px] active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF2D55)', boxShadow: '0 6px 18px rgba(255,107,53,0.28)' }}
            >
              Qidirishni boshlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
