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
    <div className="bg-white rounded-3xl overflow-hidden border border-outline/5 shadow-sm group active:scale-[0.98] transition-all flex flex-col h-full">
      <div className="relative aspect-[3/4] bg-surface-variant">
        <NavLink to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center">
          <img 
            src={product.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='24' font-weight='bold' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3EProduct%3C/text%3E%3C/svg%3E"} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </NavLink>
        {product.ai_status === 'processing' && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/20 z-10 animate-pulse">
            <RefreshCcw size={12} className="text-white animate-spin" />
            <span className="text-[10px] text-white font-bold tracking-wider uppercase">SI...</span>
          </div>
        )}
        {onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
              haptic('soft');
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
          >
            <Heart size={20} className={isWishlisted ? 'fill-error text-error' : 'text-outline'} />
          </button>
        )}
        {product.is_on_sale && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-error rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
            Sale
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <NavLink to={`/product/${product.id}`}>
          <h4 className="text-sm font-bold text-on-surface truncate">{product.name}</h4>
          <p className="text-[10px] text-outline font-medium mb-2">{product.category_name}</p>
        </NavLink>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {hasSale && basePrice && salePrice ? (
              <>
                <span className="text-xs text-outline line-through">{basePrice}</span>
                <span className="text-sm font-extrabold text-error">{salePrice}</span>
              </>
            ) : basePrice ? (
              <span className="text-sm font-extrabold text-primary">{basePrice}</span>
            ) : (
              <span className="text-sm font-extrabold text-outline">So'rov bo'yicha</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
