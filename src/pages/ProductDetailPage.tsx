import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, User, Calculator, Stars, MessageCircle, Phone, Ruler } from 'lucide-react';
import apiClient from '../api/client';
import type { Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import LeadForm from '../components/LeadForm';

const buildTelegramLink = (value?: string) => {
  if (!value) {
    return null;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://t.me/${value.replace('@', '')}`;
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadType, setLeadType] = useState<'call' | 'measurement'>('call');
  const [calcHeight, setCalcHeight] = useState(200);
  const [calcWidth, setCalcWidth] = useState(80);
  const { haptic, webApp } = useTelegram();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get<Product>(`/products/${id}/`);
        setProduct(response.data);
        if (response.data.height) {
          setCalcHeight(Number(response.data.height));
        }
        if (response.data.width) {
          setCalcWidth(Number(response.data.width));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // BackButton is supported since v6.1+
    if (webApp && webApp.isVersionAtLeast('6.1')) {
      webApp.BackButton.show();
      const handleBack = () => navigate(-1);
      webApp.BackButton.onClick(handleBack);
      return () => {
        webApp.BackButton.hide();
        webApp.BackButton.offClick(handleBack);
      };
    }
  }, [webApp, navigate]);

  const handleToggleWishlist = async () => {
    if (!product || wishlistBusy) {
      return;
    }

    setWishlistBusy(true);
    try {
      const response = await apiClient.post<{ status: 'added' | 'removed' }>(`/products/${product.id}/toggle_wishlist/`);
      setProduct((prev) => (
        prev
          ? { ...prev, is_wishlisted: response.data.status === 'added' }
          : prev
      ));
      haptic(response.data.status === 'added' ? 'medium' : 'soft');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistBusy(false);
    }
  };

  const calculatePrice = () => {
    if (!product?.price_per_m2) return 0;
    const rate = product.is_on_sale && product.discount_price 
      ? Number(product.discount_price) 
      : Number(product.price_per_m2);
    return Math.round((calcHeight * calcWidth / 10000) * rate);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="w-full aspect-[4/5] bg-surface-variant animate-pulse rounded-3xl" />
        <div className="space-y-4">
          <div className="h-8 bg-surface-variant animate-pulse rounded-lg w-2/3" />
          <div className="h-4 bg-surface-variant animate-pulse rounded-lg w-1/3" />
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-6">Product not found.</div>;

  const company = product.company_details;
  const telegramHref = buildTelegramLink(company?.telegram_link);

  return (
    <div className="px-4 sm:px-6 pt-2 pb-10">
      <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-surface-variant mb-6 shadow-sm flex items-center justify-center">
        <img 
          src={product.image || 'https://via.placeholder.com/800'} 
          alt={product.name} 
          className="max-w-full max-h-full object-contain"
        />
        {product.ai_status === 'processing' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-xs font-black text-white uppercase tracking-widest">Sun'iy intellekt ishlamoqda...</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-on-surface">{product.name}</h2>
            <p className="text-outline text-sm mt-1">{product.category_name}</p>
          </div>
          <button 
            type="button"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
            onClick={handleToggleWishlist}
            disabled={wishlistBusy}
          >
            <Heart size={24} className={product.is_wishlisted ? 'fill-error text-error' : 'text-outline'} />
          </button>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-outline/5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-outline">Narx ma'lumoti</p>
            <div className="text-right">
              {product.price ? (
                <>
                  {product.is_on_sale && product.discount_price ? (
                    <>
                      <p className="text-xs text-outline line-through">{Number(product.price).toLocaleString()} сум</p>
                      <p className="text-2xl font-extrabold text-error">{Number(product.discount_price).toLocaleString()} сум</p>
                    </>
                  ) : (
                    <p className="text-2xl font-extrabold text-primary">{Number(product.price).toLocaleString()} сум</p>
                  )}
                </>
              ) : product.price_per_m2 ? (
                <>
                  {product.is_on_sale && product.discount_price ? (
                    <>
                      <p className="text-[10px] text-outline line-through">{Number(product.price_per_m2).toLocaleString()} сум / м²</p>
                      <p className="text-xl font-extrabold text-error">{Number(product.discount_price).toLocaleString()} сум / м²</p>
                    </>
                  ) : (
                    <p className="text-xl font-extrabold text-primary">{Number(product.price_per_m2).toLocaleString()} сум / м²</p>
                  )}
                </>
              ) : (
                <p className="text-lg font-bold text-outline">So'rov bo'yicha narx</p>
              )}
            </div>
          </div>
        </div>

        <p className="text-on-surface text-sm leading-relaxed">
          {product.description}
        </p>

        {/* Live Price Calculator */}
        {product.price_per_m2 && (
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Jonli narx hisoblagichi</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-outline uppercase tracking-wider mb-2 block ml-1">Balandlik (sm)</label>
                <input 
                  type="number" 
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(Number(e.target.value))}
                  className="w-full bg-white border border-outline/10 rounded-xl py-3 px-4 text-sm font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-outline uppercase tracking-wider mb-2 block ml-1">Kenglik (sm)</label>
                <input 
                  type="number" 
                  value={calcWidth}
                  onChange={(e) => setCalcWidth(Number(e.target.value))}
                  className="w-full bg-white border border-outline/10 rounded-xl py-3 px-4 text-sm font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl">
              <div>
                <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Taxminiy umumiy summa</p>
                <p className="text-xl font-black text-primary mt-0.5">{calculatePrice().toLocaleString()} сум</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-bold text-outline uppercase">Narx</p>
                <p className="text-[10px] font-bold text-on-surface">
                  {Number(product.is_on_sale && product.discount_price ? product.discount_price : product.price_per_m2).toLocaleString()} / м²
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Studio Info */}
        {company && (
          <button
            type="button"
            onClick={() => navigate(`/company/${company.id}`)}
            className="w-full bg-white p-5 rounded-2xl border border-outline/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline/10">
                {company.logo ? (
                  <img src={company.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-outline/40" size={24} />
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-outline">Studiya</p>
                <p className="font-bold text-on-surface">{company.name}</p>
              </div>
            </div>
            <div className="bg-primary/10 text-primary text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">Tasdiqlangan</div>
          </button>
        )}

        <button 
          onClick={() => {
            navigate(`/product/${product.id}/visualize`);
            haptic('medium');
          }}
          className="w-full main-button-gradient text-white font-bold py-5 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          < Stars size={20} fill="white" />
          <span className="text-lg">Sun'iy intellekt orqali yaratish</span>
        </button>

        {/* Lead Generation CTAs */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Bog'lanish</p>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => {
                setLeadType('call');
                setShowLeadForm(true);
                haptic('light');
              }}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-outline/5 active:scale-95 transition-all"
            >
              <Phone size={20} className="text-primary" />
              <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Qo'ng'iroq</span>
            </button>
            <button 
              onClick={() => {
                setLeadType('measurement');
                setShowLeadForm(true);
                haptic('light');
              }}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-outline/5 active:scale-95 transition-all"
            >
              <Ruler size={20} className="text-primary" />
              <span className="text-[9px] font-bold text-outline uppercase tracking-wider">O'lchash</span>
            </button>
            {telegramHref ? (
              <a 
                href={telegramHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => haptic('light')}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-outline/5 active:scale-95 transition-all"
              >
                <MessageCircle size={20} className="text-primary" />
                <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Telegram</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-outline/5 opacity-50"
              >
                <MessageCircle size={20} className="text-primary" />
                <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Telegram</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showLeadForm && (
        <LeadForm 
          productId={product.id} 
          leadType={leadType} 
          onClose={() => setShowLeadForm(false)} 
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
