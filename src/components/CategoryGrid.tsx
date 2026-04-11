import React from 'react';
import { NavLink } from 'react-router-dom';
import type { Category } from '../types';

interface Props {
  categories: Category[];
}

const CategoryGrid: React.FC<Props> = ({ categories }) => {
  return (
    <div className="flex overflow-x-auto gap-3.5 py-2 no-scrollbar mb-6 px-1">
      {categories.map((category) => (
        <NavLink
          key={category.id}
          to={`/search?category=${category.id}`}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 group active:scale-95 transition-all w-[76px]"
        >
          <div className="w-full aspect-square rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-3.5 group-hover:shadow-md transition-all">
            {category.icon ? (
              <img src={category.icon} alt={category.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-200 rounded-full" />
              </div>
            )}
          </div>
          <span className="text-[11px] font-bold text-slate-500 truncate w-full text-center group-hover:text-primary transition-colors">
            {category.name}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default CategoryGrid;
