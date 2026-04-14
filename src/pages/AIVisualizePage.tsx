import React, { useState, useEffect, useRef } from 'react';
import { isAxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle2, AlertCircle, RefreshCcw, Download, Share2, Ruler, Phone } from 'lucide-react';
import apiClient from '../api/client';
import type { Product } from '../types';
import { useTelegram } from '../contexts/useTelegram';
import LeadForm from '../components/LeadForm';

interface AIUploadResponse {
  status: 'ok' | 'error' | 'processing' | 'preparing';
  message?: string;
  code?: string;
  limit?: number;
}

interface RoomAnalysisSummary {
  door_found: boolean;
  geometry_source: string;
  detection_method: string;
  wall_angle: number;
  design_dna: string;
  preserve_elements: string[];
  lighting: {
    direction: string;
    warmth: string;
    intensity: number;
  };
}

interface GenerationMeta {
  engine?: string;
  model?: string;
  mode?: string;
  product_description?: string;
  response_text?: string;
}

interface PipelineMeta {
  version?: string;
  room_analysis_engine?: string;
  image_edit_engine?: string;
}

interface AIPollResponse {
  status: 'done' | 'error' | 'processing' | 'pending';
  image_url?: string;
  message?: string;
  analysis?: RoomAnalysisSummary;
  generation_prompt?: string;
  generation_meta?: GenerationMeta;
  pipeline?: PipelineMeta;
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
  const [analysis, setAnalysis] = useState<RoomAnalysisSummary | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<GenerationMeta | null>(null);
  const [pipelineMeta, setPipelineMeta] = useState<PipelineMeta | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadType, setLeadType] = useState<'call' | 'measurement'>('call');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimeoutRef = useRef<number | null>(null);
  const { haptic } = useTelegram();

  const startPolling = React.useCallback((productId: number) => {
    const poll = async () => {
      try {
        const response = await apiClient.get<AIPollResponse>(`/products/${productId}/ai-generate/result/`);
        if (response.data.status === 'done') {
          setResultImage(response.data.image_url ?? null);
          setAnalysis(response.data.analysis ?? null);
          setGenerationPrompt(response.data.generation_prompt ?? null);
          setGenerationMeta(response.data.generation_meta ?? null);
          setPipelineMeta(response.data.pipeline ?? null);
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

        // Don't auto-trigger processing state here. 
        // Let the user upload their room photo first.
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
      setAnalysis(null);
      setGenerationPrompt(null);
      setGenerationMeta(null);
      setPipelineMeta(null);
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
      const response = await apiClient.post<AIUploadResponse>(`/products/${product.id}/ai-generate/`, formData);

      if (response.data.status === 'ok' || response.data.status === 'processing') {
        setStatus('processing');
        setError(null);
        startPolling(product.id);
      } else if (response.data.status === 'preparing') {
        setStatus('processing');
        setError('Mahsulot tayyorlanmoqda (SI fonni o\'chirmoqda)...');
        // Retry after 5 seconds
        setTimeout(() => handleUpload(), 5000);
      } else {
        setStatus('error');
        setError(response.data.message || 'Server error');
      }
    } catch (error: unknown) {
      console.error('Upload error details:', error);
      setStatus('error');
      
      let msg = 'Failed to upload image';
      if (isAxiosError<{ message?: string, error?: string }>(error)) {
        msg = error.response?.data?.message || error.response?.data?.error || `Server error (${error.response?.status})`;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      setError(msg);
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
        <div className="flex items-center gap-3 bg-white rounded-[28px] border border-outline/10 p-4 shadow-sm">
          {/* Door image - left */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-variant flex-shrink-0 shadow-sm border border-outline/5">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline/30">
                <Sparkles size={18} />
              </div>
            )}
          </div>
          {/* Product info - middle */}
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-on-surface truncate text-sm">{product.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-outline mt-0.5">{product.category_name}</p>
            {(product.height || product.width) && (
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-primary">
                {product.height && <span>H: {product.height} sm</span>}
                {product.width && <span>W: {product.width} sm</span>}
              </div>
            )}
          </div>
          {/* Room image - right */}
          {preview && (
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-variant flex-shrink-0 shadow-sm border-2 border-primary/20">
              <img src={preview} alt="Xona rasmi" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <div className="space-y-6">
          {product?.ai_status === 'processing' && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3 text-primary animate-pulse">
              <RefreshCcw size={20} className="shrink-0 mt-0.5 animate-spin" />
              <div className="text-sm">
                <b>Mahsulot tayyorlanmoqda:</b> AI fonni o‘chirmoqda. Siz o‘z rasmingizni yuklab turishingiz mumkin.
              </div>
            </div>
          )}

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-[40px] aspect-[4/5] flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
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
          <div className="bg-white rounded-[40px] aspect-[4/5] shadow-2xl relative overflow-hidden border-4 border-white ring-1 ring-slate-100">
            <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
            <div className="absolute top-6 right-6 bg-green-500 text-white p-2.5 rounded-full shadow-lg animate-bounce">
              <CheckCircle2 size={24} />
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => {
                setLeadType('call');
                setShowLeadForm(true);
                haptic('medium');
              }}
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-[24px] font-black shadow-lg shadow-primary/25 active:scale-95 transition-all text-lg"
            >
              <Phone size={22} fill="white" />
              Sotib olish / Bog'lanish
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  setLeadType('measurement');
                  setShowLeadForm(true);
                  haptic('medium');
                }}
                className="flex items-center justify-center gap-2 py-4 bg-white text-primary border-2 border-primary rounded-2xl text-sm font-black active:scale-95 transition-all"
              >
                <Ruler size={18} />
                O'lchashni buyurtma
              </button>
              <button
                type="button"
                onClick={() => resultImage && window.open(resultImage, '_blank', 'noopener,noreferrer')}
                className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-800 rounded-2xl text-sm font-black active:scale-95 transition-all"
              >
                <Download size={18} />
                Saqlash
              </button>
            </div>
          </div>

          {(analysis || generationPrompt) && (
            <div className="space-y-4">
              {analysis && (
                <div className="bg-white rounded-[28px] border border-outline/10 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">AI tahlili</p>
                      <h3 className="text-lg font-extrabold text-on-surface mt-1">Xona konteksti chiqarildi</h3>
                    </div>
                    {pipelineMeta?.image_edit_engine && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                        {pipelineMeta.image_edit_engine}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface/80">{analysis.design_dna}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl bg-surface-variant px-4 py-3">
                      <p className="text-outline font-black uppercase tracking-wider">Rakurs</p>
                      <p className="mt-1 font-bold text-on-surface">{analysis.wall_angle}°</p>
                    </div>
                    <div className="rounded-2xl bg-surface-variant px-4 py-3">
                      <p className="text-outline font-black uppercase tracking-wider">Aniqlash</p>
                      <p className="mt-1 font-bold text-on-surface">{analysis.detection_method}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-variant px-4 py-3">
                      <p className="text-outline font-black uppercase tracking-wider">Yorug'lik</p>
                      <p className="mt-1 font-bold text-on-surface">{analysis.lighting.direction}, {analysis.lighting.warmth}</p>
                    </div>
                    <div className="rounded-2xl bg-surface-variant px-4 py-3">
                      <p className="text-outline font-black uppercase tracking-wider">Intensivlik</p>
                      <p className="mt-1 font-bold text-on-surface">{analysis.lighting.intensity}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-outline">Saqlangan elementlar</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysis.preserve_elements.map((item) => (
                        <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-primary">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {generationPrompt && (
                <div className="bg-slate-950 text-white rounded-[28px] p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Nano Banana prompt</p>
                      <h3 className="text-lg font-extrabold mt-1">Yuborilgan instruction</h3>
                    </div>
                    {generationMeta?.model && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                        {generationMeta.model}
                      </span>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-200 font-mono max-h-72 overflow-auto">
                    {generationPrompt}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={() => {
                setStatus('idle');
                setPreview(null);
                setImage(null);
                setResultImage(null);
                setError(null);
                setAnalysis(null);
                setGenerationPrompt(null);
                setGenerationMeta(null);
                setPipelineMeta(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 text-sm font-black active:scale-95 transition-all hover:bg-slate-100"
            >
              <RefreshCcw size={14} />
              Boshidan
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!resultImage) return;
                if (navigator.share) {
                  await navigator.share({
                    title: product?.name ?? 'TanlaAI vizualizatsiyasi',
                    url: resultImage,
                  });
                  return;
                }
                window.open(`https://t.me/share/url?url=${encodeURIComponent(resultImage)}`, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-primary rounded-2xl border border-primary/20 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              <Share2 size={14} />
              Ulashish
            </button>
          </div>
        </div>
      )}

      {showLeadForm && product && (
        <LeadForm 
          productId={product.id} 
          leadType={leadType} 
          initialPriceInfo={inputHeight && inputWidth ? `${inputHeight}x${inputWidth} sm o'lchamda SI vizualizatsiya` : "SI vizualizatsiyasi"}
          onClose={() => setShowLeadForm(false)} 
        />
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
