import React, { useEffect, useState, useRef } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Save, 
  X, 
  Trash2, 
  ChevronDown, 
} from 'lucide-react';
import apiClient from '../api/client';
import type { Product, Category } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import { cn } from '../utils/cn';

interface ProductFormData {
  name: string;
  description: string;
  pricing_type: 'total' | 'per_m2';
  image_file?: File;
  category: number | '';
  price: string;
  price_per_m2: string;
  height: string;
  width: string;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_price: string;
  sale_end_date: string;
}

const emptyFormData: ProductFormData = {
  name: '',
  description: '',
  category: '',
  pricing_type: 'total',
  price: '',
  price_per_m2: '',
  height: '',
  width: '',
  is_featured: false,
  is_on_sale: false,
  discount_price: '',
  sale_end_date: '',
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part: number) => part.toString().padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeProduct = (product: Product): ProductFormData => ({
  ...emptyFormData,
  name: product.name ?? '',
  description: product.description ?? '',
  category: product.category ?? '',
  pricing_type: product.price_per_m2 && !product.price ? 'per_m2' : 'total',
  price: product.price ?? '',
  price_per_m2: product.price_per_m2 ?? '',
  height: product.height ?? '',
  width: product.width ?? '',
  is_featured: Boolean(product.is_featured),
  is_on_sale: Boolean(product.is_on_sale),
  discount_price: product.discount_price ?? '',
  sale_end_date: toDateTimeLocal(product.sale_end_date),
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<Record<string, unknown>>(error)) {
    return fallback;
  }

  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }

  const firstFieldError = Object.values(error.response?.data ?? {}).find((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return typeof value === 'string';
  });

  if (Array.isArray(firstFieldError)) {
    return String(firstFieldError[0]);
  }

  if (typeof firstFieldError === 'string') {
    return firstFieldError;
  }

  return fallback;
};

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { haptic } = useTelegram();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catsRes, prodRes] = await Promise.all([
          apiClient.get('categories/'),
          isEdit ? apiClient.get(`/products/${id}/`) : Promise.resolve(null)
        ]);
        
        setCategories(catsRes.data.results || catsRes.data);
        
        if (prodRes) {
          setFormData(normalizeProduct(prodRes.data));
          setPreview(prodRes.data.image ?? null);
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        setErrorMessage('Mahsulot formasini yuklashda xatolik yuz berdi.');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image_file: file }));
      setPreview(URL.createObjectURL(file));
      haptic('light');
    }
  };

  const handlePricingTypeChange = (pricing_type: 'total' | 'per_m2') => {
    setFormData((prev) => {
      if (pricing_type === 'total') {
        return {
          ...prev,
          pricing_type,
          price_per_m2: '',
        };
      }

      return {
        ...prev,
        pricing_type,
        price: '',
        height: '',
        width: '',
      };
    });
    haptic('light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    haptic('medium');

    const data = new FormData();
    data.append('name', formData.name?.toString() ?? '');
    data.append('description', formData.description?.toString() ?? '');
    data.append('category', formData.category?.toString() ?? '');
    data.append('is_featured', String(Boolean(formData.is_featured)));
    data.append('is_on_sale', String(Boolean(formData.is_on_sale)));

    if (formData.pricing_type === 'total') {
      data.append('price', formData.price?.toString() ?? '');
      data.append('price_per_m2', '');
      data.append('height', formData.height?.toString() ?? '');
      data.append('width', formData.width?.toString() ?? '');
    } else {
      data.append('price', '');
      data.append('price_per_m2', formData.price_per_m2?.toString() ?? '');
      data.append('height', '');
      data.append('width', '');
    }

    if (formData.is_on_sale) {
      data.append('discount_price', formData.discount_price?.toString() ?? '');
      data.append('sale_end_date', formData.sale_end_date ?? '');
    } else {
      data.append('discount_price', '');
      data.append('sale_end_date', '');
    }

    if (formData.image_file) {
      data.append('image', formData.image_file);
    }

    try {
      if (isEdit) {
        await apiClient.patch(`/products/${id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post('products/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      haptic('heavy');
      navigate('/creator');
    } catch (err) {
      console.error('Error saving product:', err);
      setErrorMessage(getErrorMessage(err, 'Mahsulotni saqlashning imkoni bo‘lmadi.'));
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Shakl yuklanmoqda...</div>;

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-on-surface">{isEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h2>
        <button onClick={() => navigate(-1)} className="text-outline"><X size={24} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="rounded-2xl border border-error/20 bg-error/10 px-5 py-4 text-sm font-bold text-error">
            {errorMessage}
          </div>
        )}

        <div onClick={() => fileInputRef.current?.click()} className="relative aspect-[4/5] bg-surface-variant rounded-[40px] border-2 border-dashed border-outline/10 overflow-hidden flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all">
          {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-primary"><Camera size={28} /></div><p className="text-sm font-bold text-on-surface">Mahsulot rasmini yuklash</p><p className="text-[10px] text-outline mt-1 uppercase tracking-widest font-black">PNG, JPG 10MB gacha</p></>}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Mahsulot nomi</label>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Masalan: Viktoriya uslubidagi eman eshik" required className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Kategoriya</label>
            <div className="relative">
              <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-bold outline-none appearance-none focus:ring-2 focus:ring-primary/10 transition-all">
                <option value="">Kategoriyani tanlang</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Tavsif / Hikoya</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Ishlab chiqarish jarayonini tasvirlang..." className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
        </div>

        <div className="bg-surface-variant/30 p-6 rounded-[32px] space-y-6">
          <div className="flex p-1 bg-white rounded-2xl border border-outline/5">
            <button type="button" onClick={() => handlePricingTypeChange('total')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.pricing_type === 'total' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-outline")}>Qat'iy narx</button>
            <button type="button" onClick={() => handlePricingTypeChange('per_m2')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.pricing_type === 'per_m2' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-outline")}>Kvadrat metr uchun (m²)</button>
          </div>
          {formData.pricing_type === 'total' ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Umumiy narx (UZS)</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-black text-lg outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-outline uppercase ml-1 mb-1 block">Balandligi (sm)</label>
                  <input name="height" value={formData.height} onChange={handleInputChange} type="number" className="w-full bg-white border border-outline/5 rounded-xl py-3 px-4 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-outline uppercase ml-1 mb-1 block">Kengligi (sm)</label>
                  <input name="width" value={formData.width} onChange={handleInputChange} type="number" className="w-full bg-white border border-outline/5 rounded-xl py-3 px-4 text-sm font-bold" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">1 m² uchun narx (UZS)</label>
              <input name="price_per_m2" type="number" value={formData.price_per_m2} onChange={handleInputChange} placeholder="0.00" className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-black text-lg outline-none" />
            </div>
          )}
        </div>

        <div className="bg-error/5 border border-error/10 p-6 rounded-[32px] space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-error">Chegirma</p>
              <p className="text-xs text-outline mt-1">Mahsulotga aksiyaviy narx berish</p>
            </div>
            <input
              type="checkbox"
              name="is_on_sale"
              checked={Boolean(formData.is_on_sale)}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-outline/20 text-error focus:ring-error/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Chegirma narxi (UZS)</label>
              <input
                name="discount_price"
                type="number"
                value={formData.discount_price}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={!formData.is_on_sale}
                className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-bold outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Aksiya tugash sanasi</label>
              <input
                name="sale_end_date"
                type="datetime-local"
                value={formData.sale_end_date ?? ''}
                onChange={handleInputChange}
                disabled={!formData.is_on_sale}
                className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-bold outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-outline/5 rounded-[32px] p-6">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-outline">Asosiy vitrina</p>
              <p className="text-xs text-outline mt-1">Mahsulotni bosh sahifada ko'rsatish</p>
            </div>
            <input
              type="checkbox"
              name="is_featured"
              checked={Boolean(formData.is_featured)}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-outline/20 text-primary focus:ring-primary/20"
            />
          </label>
        </div>

        <button type="submit" disabled={submitting} className="w-full main-button-gradient text-white font-black py-5 rounded-[28px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /><span className="text-lg uppercase tracking-widest">{isEdit ? "O'zgarishlarni saqlash" : "Mahsulotni e'lon qilish"}</span></>}
        </button>

        {isEdit && <button type="button" onClick={async () => {
          if (!window.confirm("Bu mahsulotni o'chirasizmi?")) {
            return;
          }

          try {
            await apiClient.delete(`/products/${id}/`);
            navigate('/creator');
          } catch (error) {
            console.error('Error deleting product:', error);
            setErrorMessage(getErrorMessage(error, "Mahsulotni o'chirishning imkoni bo‘lmadi."));
          }
        }} className="w-full flex items-center justify-center gap-2 text-error text-xs font-black uppercase tracking-widest pt-4"><Trash2 size={16} />Mahsulotni o'chirish</button>}
      </form>
    </div>
  );
};

export default ProductFormPage;
