import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, RefreshCcw, Star, Phone } from 'lucide-react';
import type { Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import { getMediaUrl } from '../utils/media';

interface Props {
  product: Product;
  onToggleWishlist?: (id: number) => void;
  isWishlisted?: boolean;
}

const ProductCard: React.FC<Props> = ({ product, onToggleWishlist, isWishlisted }) => {
  const { haptic, webApp } = useTelegram();
  const hasSale = product.is_on_sale && Boolean(product.discount_price);
  const company = product.company_details;

  const formatPrice = (value?: string, suffix = '') => {
    if (!value) {
      return null;
    }
    return `${Number(value).toLocaleString()} so'm${suffix}`;
  };

  const basePrice = product.price
    ? formatPrice(product.price)
    : formatPrice(product.price_per_m2, ' / m²');

  const salePrice = product.price
    ? formatPrice(product.discount_price)
    : formatPrice(product.discount_price, ' / m²');

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!company?.phone) return;
    haptic('light');
    const uri = `tel:${company.phone}`;
    if (webApp && webApp.openLink) {
      webApp.openLink(uri);
    } else {
      window.location.href = uri;
    }
  };

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group active:scale-[0.98] flex flex-col h-full border border-slate-100">
      <div className="relative aspect-[4/5] bg-[#f8fafc] overflow-hidden p-2">
        <NavLink to={`/product/${product.id}`} className="block w-full h-full bg-white rounded-[20px] shadow-sm">
          <img 
            src={getMediaUrl(product.image) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EProduct%3C/text%3E%3C/svg%3E"} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </NavLink>
        
        {/* Micro UX Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          {hasSale && (
            <div className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              🔥 Chegirma
            </div>
          )}
          {product.is_featured && (
            <div className="bg-amber-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              ⚡ Tez sotiladi
            </div>
          )}
          <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
             Mavjud
          </div>
        </div>

        {product.ai_status === 'processing' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md z-10 animate-pulse">
            <RefreshCcw size={10} className="animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-widest">AI Processing</span>
          </div>
        )}

        {onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
              haptic('soft');
            }}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all border border-slate-100"
          >
            <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <NavLink to={`/product/${product.id}`} className="block mb-2">
          <h4 className="text-[15px] font-bold text-slate-800 leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center gap-1 mb-2">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-600">4.8</span>
            <span className="text-[11px] text-slate-400 ml-1">({Math.floor(Math.random() * 50) + 10})</span>
          </div>
        </NavLink>

        <div className="mt-auto pt-1 mb-3">
          {hasSale && basePrice && salePrice ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 line-through leading-none mb-1">{basePrice}</span>
              <span className="text-[17px] font-black text-red-600 leading-none">{salePrice}</span>
            </div>
          ) : basePrice ? (
            <span className="text-[17px] font-black text-slate-900 leading-none">{basePrice}</span>
          ) : (
            <span className="text-[17px] font-black text-slate-300 leading-none">Kelishilgan</span>
          )}
        </div>

        {/* Quick Action CTA inside card */}
        <button 
          onClick={handleCall}
          disabled={!company?.phone}
          className="w-full bg-[#16a34a] hover:bg-green-700 active:bg-green-800 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          <Phone size={16} fill="currentColor" className="text-white" />
          <span className="text-[13px] font-black uppercase tracking-wider">Qo'ng'iroq</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
