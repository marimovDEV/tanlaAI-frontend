import React, { useEffect, useState, useRef } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  MessageCircle, 
  Save, 
  X, 
  Camera,
  Share2 as Instagram
} from 'lucide-react';
import apiClient from '../api/client';
import type { Company } from '../types';
import { useTelegram } from '../contexts/useTelegram';

interface CompanyFormData extends Partial<Company> {
  logo_file?: File;
}

const emptyCompanyForm: CompanyFormData = {
  name: '',
  description: '',
  location: '',
  telegram_link: '',
  instagram_link: '',
};

const normalizeCompany = (company: Company): CompanyFormData => ({
  name: company.name ?? '',
  description: company.description ?? '',
  location: company.location ?? '',
  telegram_link: company.telegram_link ?? '',
  instagram_link: company.instagram_link ?? '',
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

const CompanyEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { haptic } = useTelegram();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyExists, setCompanyExists] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(emptyCompanyForm);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await apiClient.get('/companies/my/');
        setFormData(normalizeCompany(response.data));
        setPreview(response.data.logo ?? null);
        setCompanyExists(true);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          setCompanyExists(false);
          setFormData(emptyCompanyForm);
        } else {
          console.error('Error fetching company:', err);
          setErrorMessage(getErrorMessage(err, "Studiya ma'lumotlarini yuklashda xatolik yuz berdi."));
        }
      } finally {
        setLoading(false);
      }
    };
    void fetchCompany();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo_file: file }));
      setPreview(URL.createObjectURL(file));
      haptic('light');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    haptic('medium');

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'logo_file' && value instanceof File) {
        data.append('logo', value);
      } else if (key === 'logo_file' || key === 'logo') {
        // Skip
      } else if (value !== null && value !== undefined) {
        data.append(key, value.toString());
      }
    });

    try {
      const request = companyExists
        ? apiClient.patch('/companies/my/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : apiClient.post('/companies/my/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

      await request;
      setCompanyExists(true);
      haptic('heavy');
      navigate('/creator');
    } catch (err) {
      console.error('Error saving company:', err);
      setErrorMessage(getErrorMessage(err, "Studiya profilini saqlashning imkoni bo‘lmadi."));
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Studiya ma'lumotlari yuklanmoqda...</div>;

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-on-surface">Studiya profili</h2>
        <button onClick={() => navigate(-1)} className="text-outline">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMessage && (
          <div className="rounded-2xl border border-error/20 bg-error/10 px-5 py-4 text-sm font-bold text-error">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col items-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 bg-surface-variant rounded-[40px] border-2 border-dashed border-outline/10 overflow-hidden relative cursor-pointer active:scale-95 transition-all shadow-xl shadow-black/5"
          >
            {preview ? (
              <img src={preview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-outline/30">
                <Building2 size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-outline mt-4">Studiya identifikatsiyasi</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        <div className="space-y-5">
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Brend nomi</label>
            <div className="relative">
              <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Artisan Studio" required className="w-full bg-white border border-outline/5 rounded-2xl py-4 pl-14 pr-5 text-on-surface font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
          </div>
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Manzil</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Shahar, Tuman" required className="w-full bg-white border border-outline/5 rounded-2xl py-4 pl-14 pr-5 text-on-surface font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-2 block">Faoliyatimiz haqida</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Mijozlarga sizning noyob yondashuvingiz haqida aytib bering..." className="w-full bg-white border border-outline/5 rounded-2xl py-4 px-5 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-outline ml-1">Ijtimoiy tarmoqlar</h4>
          <div className="relative">
            <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-[#229ED9]" size={20} />
            <input name="telegram_link" value={formData.telegram_link} onChange={handleInputChange} placeholder="@username" className="w-full bg-white border border-outline/5 rounded-2xl py-4 pl-14 pr-5 text-on-surface font-bold outline-none" />
          </div>
          <div className="relative">
            <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-[#E4405F]" size={20} />
            <input name="instagram_link" value={formData.instagram_link} onChange={handleInputChange} placeholder="@username yoki link" className="w-full bg-white border border-outline/5 rounded-2xl py-4 pl-14 pr-5 text-on-surface font-bold outline-none" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full main-button-gradient text-white font-black py-5 rounded-[28px] shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /><span className="text-lg uppercase tracking-widest">{companyExists ? 'Profilni yangilash' : 'Profilni yaratish'}</span></>}
        </button>
      </form>
    </div>
  );
};

export default CompanyEditPage;
