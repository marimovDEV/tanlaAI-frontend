import React from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, RefreshCcw } from 'lucide-react';
import type { Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';

interface Props {
  product: Product;
  onToggleWishlist?: (id: number) => void;
  isWishlisted?: boolean;
}

const ProductCard: React.FC<Props> = ({ product, onToggleWishlist, isWishlisted }) => {
  const { haptic } = useTelegram();
  const hasSale = product.is_on_sale && Boolean(product.discount_price);

  const formatPrice = (value?: string, suffix = '') => {
    if (!value) {
      return null;
    }
    return `${Number(value).toLocaleString()} сум${suffix}`;
  };

  const basePrice = product.price
    ? formatPrice(product.price)
    : formatPrice(product.price_per_m2, ' / м²');

  const salePrice = product.price
    ? formatPrice(product.discount_price)
    : formatPrice(product.discount_price, ' / м²');

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 group active:scale-[0.98] flex flex-col h-full border border-slate-100">
      <div className="relative aspect-[3/4] bg-[#f5f5f7] overflow-hidden">
        <NavLink to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EProduct%3C/text%3E%3C/svg%3E"} 
            alt={product.name} 
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        </NavLink>
        
        {product.ai_status === 'processing' && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-blue-100 z-10 shadow-sm">
            <RefreshCcw size={10} className="text-primary animate-spin" />
            <span className="text-[9px] text-primary font-black uppercase tracking-tighter">AI Processing</span>
          </div>
        )}

        {onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
              haptic('soft');
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all border border-slate-100"
          >
            <Heart size={16} className={isWishlisted ? 'fill-error text-error' : 'text-slate-300'} />
          </button>
        )}

        {hasSale && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-error rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20 flex items-center gap-1.5 animate-in zoom-in-50 duration-500">
            {product.price && product.discount_price ? (
              <span>-{Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)}%</span>
            ) : (
              <span>Sale</span>
            )}
          </div>
        )}
      </div>

      <div className="p-3.5 flex flex-col flex-grow">
        <NavLink to={`/product/${product.id}`} className="block mb-1">
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
          <p className="text-[11px] text-slate-400 font-medium">{product.category_name || "Eshik"}</p>
        </NavLink>

        <div className="mt-auto pt-2">
          {hasSale && basePrice && salePrice ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">{basePrice}</span>
              <span className="text-sm font-black text-error leading-none">{salePrice}</span>
            </div>
          ) : basePrice ? (
            <span className="text-sm font-black text-primary leading-none">{basePrice}</span>
          ) : (
            <span className="text-sm font-black text-slate-300 leading-none">Kelishilgan</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
