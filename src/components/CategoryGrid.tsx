import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { Category } from '../types';

interface Props {
  categories: Category[];
}

const CategoryGrid: React.FC<Props> = ({ categories }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');

  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 snap-x">
      <NavLink
        to={`/search`}
        end
        className={`flex-shrink-0 snap-start px-5 py-2 rounded-full text-[13px] font-semibold transition-all border ${!currentCategory && location.pathname === '/' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
      >
        Barchasi
      </NavLink>
      {categories.map((cat) => {
        const isActive = currentCategory === String(cat.id);
        return (
          <NavLink
            key={cat.id}
            to={`/search?category=${cat.id}`}
            className={`flex-shrink-0 snap-start px-5 py-2 rounded-full text-[13px] font-semibold transition-all border flex items-center gap-1.5 ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {cat.name}
          </NavLink>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
