import React from 'react';
import { NavLink } from 'react-router-dom';
import type { Category } from '../types';

interface Props {
  categories: Category[];
}

const CategoryGrid: React.FC<Props> = ({ categories }) => {
  return (
    <div className="flex overflow-x-auto gap-4 py-2 no-scrollbar mb-8">
      {categories.map((category) => (
        <NavLink
          key={category.id}
          to={`/search?category=${category.id}`}
          className="flex-shrink-0 flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white border border-outline/5 shadow-sm flex items-center justify-center p-3 group-active:scale-95 transition-all">
            {category.icon ? (
              <img src={category.icon} alt={category.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-surface-variant rounded-lg" />
            )}
          </div>
          <span className="text-[10px] font-bold text-on-surface/70 truncate w-16 text-center">
            {category.name}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default CategoryGrid;
