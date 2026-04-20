import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Star, Phone } from 'lucide-react';
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
    if (!value) { return null; }
    return `${Number(value).toLocaleString()} so'm${suffix}`;
  };

  const basePrice = product.price ? formatPrice(product.price) : formatPrice(product.price_per_m2, ' / m²');
  const salePrice = product.price ? formatPrice(product.discount_price) : formatPrice(product.discount_price, ' / m²');

  let discountPct = 0;
  if (hasSale && product.price && product.discount_price) {
     discountPct = Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100);
  }

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
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-2.5 flex flex-col h-full border border-slate-50 group">
      
      {/* Image container */}
      <div className="relative h-[140px] bg-slate-50 rounded-xl overflow-hidden mb-3.5 border border-slate-100">
        <NavLink to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={getMediaUrl(product.image) || "https://via.placeholder.com/300"} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </NavLink>
        
        {/* Micro Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
          {hasSale && discountPct > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              -{discountPct}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              🔥 TOP
            </span>
          )}
        </div>
        
        <div className="absolute bottom-2 left-2">
          <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            🟢 Mavjud
          </span>
        </div>

        {onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
              haptic('soft');
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm active:scale-90 transition border border-white"
          >
            <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <NavLink to={`/product/${product.id}`} className="block mb-2">
          <h3 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <Star size={10} className="fill-amber-400 text-amber-400" /> 
            4.8 ({(product.id * 7 % 40) + 10})
          </p>
        </NavLink>
        
        <div className="mt-auto mb-3">
          <p className="text-[14px] font-black text-slate-900 leading-none">
            {salePrice || basePrice || "Kelishilgan"}
          </p>
          {hasSale && basePrice && salePrice && (
            <p className="text-[10px] text-slate-400 line-through mt-1">
              {basePrice}
            </p>
          )}
        </div>

        <button 
          onClick={handleCall}
          disabled={!company?.phone}
          className="mt-auto w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition active:scale-95"
        >
          <Phone size={14} className="fill-current" /> Qo'ng'iroq
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
