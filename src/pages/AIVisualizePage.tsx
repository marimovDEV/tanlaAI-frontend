import React, { useState, useEffect, useRef } from 'react';
import { isAxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle2, AlertCircle, RefreshCcw, Download, Share2, Ruler } from 'lucide-react';
import apiClient from '../api/client';
import type { Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';

interface AIUploadResponse {
  status: 'ok' | 'error' | 'processing';
  message?: string;
  code?: string;
  limit?: number;
}

interface AIPollResponse {
  status: 'done' | 'error' | 'processing' | 'pending';
  image_url?: string;
  message?: string;
}

const AIVisualizePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [inputHeight, setInputHeight] = useState('');
  const [inputWidth, setInputWidth] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<number | null>(null);
  const { haptic } = useTelegram();

  const startPolling = React.useCallback((productId: number) => {
    const poll = async () => {
      try {
        const response = await apiClient.get<AIPollResponse>(`/products/${productId}/ai-generate/result/`);
        if (response.data.status === 'done') {
          setResultImage(response.data.image_url ?? null);
          setStatus('done');
          haptic('heavy');
        } else if (response.data.status === 'error') {
          setStatus('error');
          setError(response.data.message || 'AI processing failed');
        } else {
          pollTimeoutRef.current = window.setTimeout(poll, 3000);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setStatus('error');
        setError('Connection lost while processing');
      }
    };

    void poll();
  }, [haptic]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get<Product>(`/products/${id}/`);
        setProduct(response.data);
        setInputHeight(response.data.height ?? '');
        setInputWidth(response.data.width ?? '');

        if (response.data.ai_status === 'processing' || response.data.ai_status === 'completed') {
          setStatus('processing');
          startPolling(response.data.id);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };

    void fetchProduct();

    return () => {
      if (pollTimeoutRef.current) {
        window.clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [id, startPolling]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStatus('idle');
      setError(null);
      haptic('light');
    }
  };

  const handleUpload = async () => {
    if (!image || !product) return;

    setStatus('uploading');
    haptic('medium');

    const formData = new FormData();
    formData.append('room_photo', image);
    if (inputHeight.trim()) {
      formData.append('height', inputHeight.trim());
    }
    if (inputWidth.trim()) {
      formData.append('width', inputWidth.trim());
    }

    try {
      const response = await apiClient.post<AIUploadResponse>(`/products/${product.id}/ai-generate/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'ok' || response.data.status === 'processing') {
        setStatus('processing');
        setError(null);
        startPolling(product.id);
      } else {
        setStatus('error');
        setError(response.data.message || 'Server error');
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      setStatus('error');
      setError(isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || 'Failed to upload image' : 'Failed to upload image');
    }
  };

  return (
    <div className="p-6 pb-24 space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-on-surface">Sun'iy intellekt vizualizatsiyasi</h2>
        <p className="text-xs text-outline font-medium px-10">
          Bo'sh xonangiz rasmini yuklang va SI uni ushbu mahsulot bilan to'ldiradi.
        </p>
      </div>

      {product && (
        <div className="flex items-center gap-4 bg-white rounded-[28px] border border-outline/10 p-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-variant flex-shrink-0">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline/30">
                <Sparkles size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-on-surface truncate">{product.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-outline mt-1">{product.category_name}</p>
            {(product.height || product.width) && (
              <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-primary">
                {product.height && <span>H: {product.height} sm</span>}
                {product.width && <span>W: {product.width} sm</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-[40px] aspect-[4/5] flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 text-primary">
                  <Camera size={28} />
                </div>
                <p className="text-sm font-bold text-primary">Rasmga oling yoki yuklang</p>
                <p className="text-[10px] text-outline mt-1 uppercase tracking-widest font-black">Bo'sh xona rasmi yaxshiroq natija beradi</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="bg-white rounded-[28px] border border-outline/10 p-5 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Ruler size={16} />
              <p className="text-[10px] font-black uppercase tracking-widest">Teshik o'lchamlari</p>
            </div>
            <p className="text-xs text-outline">Mahsulot o'lchamiga yaqin qiymat kiriting. Ruxsat etilgan farq: ±5 sm.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold text-outline uppercase tracking-wider mb-2 block ml-1">Balandlik (sm)</label>
                <input
                  type="number"
                  step="any"
                  value={inputHeight}
                  onChange={(event) => setInputHeight(event.target.value)}
                  placeholder={product?.height ?? '200'}
                  className="w-full bg-surface-variant border border-outline/10 rounded-xl py-3 px-4 text-sm font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-outline uppercase tracking-wider mb-2 block ml-1">Kenglik (sm)</label>
                <input
                  type="number"
                  step="any"
                  value={inputWidth}
                  onChange={(event) => setInputWidth(event.target.value)}
                  placeholder={product?.width ?? '80'}
                  className="w-full bg-surface-variant border border-outline/10 rounded-xl py-3 px-4 text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="bg-white rounded-[40px] aspect-[4/5] flex flex-col items-center justify-center p-10 text-center shadow-sm relative overflow-hidden">
          <div className="relative mb-10">
            <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-primary">
              <Sparkles size={32} className="animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-on-surface mb-2">
            {status === 'uploading' ? 'Bulutli serverga yuklanmoqda...' : 'SI natijani tayyorlamoqda...'}
          </h3>
          <p className="text-xs text-outline leading-relaxed">
            Iltimos, ushbu oynani yopmang. Sun'iy intellekt mahsulotni aniq o'lchab, xonangizga joylashtirmoqda.
          </p>
          
          <div className="absolute bottom-10 left-10 right-10 flex gap-1">
            <div className="h-1 bg-primary/10 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-full" />
            </div>
          </div>
        </div>
      )}

      {status === 'done' && resultImage && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[40px] aspect-[4/5] shadow-2xl relative overflow-hidden border-4 border-white">
            <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
              <CheckCircle2 size={24} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setStatus('idle');
                setPreview(null);
                setImage(null);
                setResultImage(null);
                setError(null);
              }}
              className="flex items-center justify-center gap-2 py-4 bg-white rounded-2xl border border-outline/10 text-sm font-bold active:scale-95 transition-all"
            >
              <RefreshCcw size={18} />
              Yana urinib ko'rish
            </button>
            <button
              type="button"
              onClick={() => resultImage && window.open(resultImage, '_blank', 'noopener,noreferrer')}
              className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-sm font-bold active:scale-95 transition-all"
            >
              <Download size={18} />
              Rasmni saqlash
            </button>
          </div>
          
          <button
            type="button"
            onClick={async () => {
              if (!resultImage) {
                return;
              }

              if (navigator.share) {
                await navigator.share({
                  title: product?.name ?? 'TanlaAI vizualizatsiyasi',
                  url: resultImage,
                });
                return;
              }

              window.open(`https://t.me/share/url?url=${encodeURIComponent(resultImage)}`, '_blank', 'noopener,noreferrer');
            }}
            className="w-full flex items-center justify-center gap-3 py-5 bg-secondary text-white rounded-[24px] font-bold active:scale-95 transition-all shadow-lg"
          >
            <Share2 size={20} />
            Do'stlar bilan ulashish
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white rounded-[40px] aspect-[4/5] flex flex-col items-center justify-center p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-extrabold text-on-surface mb-2">Xatolik yuz berdi</h3>
          <p className="text-xs text-outline leading-relaxed mb-8">{error || "Noma'lum xatolik yuz berdi"}</p>
          <button 
            onClick={() => setStatus('idle')}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all"
          >
            Boshqa rasmni sinab ko'rish
          </button>
        </div>
      )}

      {status === 'idle' && preview && (
        <button 
          onClick={handleUpload}
          className="w-full main-button-gradient text-white font-bold py-5 rounded-[24px] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <Sparkles size={20} fill="white" />
          <span className="text-lg">Natijani tayyorlash</span>
        </button>
      )}
    </div>
  );
};

export default AIVisualizePage;
