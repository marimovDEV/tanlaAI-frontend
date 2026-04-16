import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import apiClient from '../api/client';
import LeadForm from '../components/LeadForm';
import { useTelegram } from '../contexts/useTelegram';

interface SharedDesign {
  id: string;
  image: string;
  original_image: string | null;
  created_at: string;
  product_details: {
    id: number;
    name: string;
    image: string;
    price: string | null;
  } | null;
}

const ImageSlider: React.FC<{ before: string; after: string }> = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(pos, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[70vh] rounded-3xl overflow-hidden cursor-ew-resize select-none border border-white/10"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: containerRef.current?.offsetWidth }} alt="Before" />
      </div>
      
      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-black/10">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
            <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest z-30">
        Oldin
      </div>
      <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest z-30">
        Keyin
      </div>
    </div>
  );
};

const SharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { haptic } = useTelegram();
  const [design, setDesign] = useState<SharedDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const { data } = await apiClient.get<SharedDesign>(`/shared-designs/${id}/`);
        setDesign(data);
      } catch (err) {
        console.error('Failed to load shared design', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDesign();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Sparkles className="text-white/20 animate-pulse w-10 h-10" />
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <ImageIcon className="text-slate-300 w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Dizayn topilmadi</h2>
        <p className="text-sm text-slate-500 mb-8">Bu havola eskirgan yoki xato bo'lishi mumkin.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold active:scale-95 transition-transform"
        >
          Katalogga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative pb-24 font-['Inter']">
      {/* Action Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <button
          onClick={() => { haptic('light'); navigate('/'); }}
          className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex bg-white/10 backdrop-blur-2xl rounded-2xl px-5 py-2.5 items-center gap-3 border border-white/10">
          <Sparkles size={16} className="text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-black text-white tracking-[0.2em] uppercase">
            TanlaAI Premium
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-5 pt-28 pb-40">
        {design.original_image ? (
          <ImageSlider before={design.original_image} after={design.image} />
        ) : (
          <div className="w-full h-[70vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src={design.image}
              alt="Shared AI Design"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="mt-8 space-y-2 px-2">
          <h2 className="text-2xl font-black text-white">Xonangiz uchun mukammal tanlov!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Bizning AI texnologiyamiz yordamida har bir eshik sizning interyeringizga 100% mos tushishini oldindan ko'ra olasiz.
          </p>
        </div>
      </div>

      {/* Fixed Bottom UI */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-black via-black/90 to-transparent">
        {design.product_details ? (
          <div className="bg-white rounded-[32px] p-5 shadow-2xl flex items-center gap-5 border border-slate-100">
            <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 p-1">
              <img
                src={design.product_details.image}
                alt={design.product_details.name}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-900 text-base mb-1 line-clamp-1">
                {design.product_details.name}
              </h3>
              <div className="flex items-center gap-1.5 mb-4">
                <p className="text-primary font-black text-sm">
                  {design.product_details.price
                    ? new Intl.NumberFormat('ru-RU').format(Number(design.product_details.price)) + " so'm"
                    : "Narxlanmagan"}
                </p>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TanlaAI Narxi</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { haptic('medium'); setShowLeadForm(true); }}
                  className="flex-1 bg-primary text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Sotib olish
                </button>
                <button
                  onClick={() => { haptic('light'); navigate(`/product/${design.product_details?.id}`); }}
                  className="px-5 bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all"
                >
                  O'zim sinash
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="font-extrabold text-slate-800 mb-2">Siz ham o'z xonangizga sinab ko'ring!</h3>
            <button
              onClick={() => { haptic('medium'); navigate('/'); }}
              className="w-full bg-primary text-white py-3 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
            >
              TanlaAI ga o'tish
            </button>
          </div>
        )}
      </div>

      {showLeadForm && design.product_details && (
        <LeadForm
          productId={design.product_details.id}
          onClose={() => setShowLeadForm(false)}
          leadType="call"
          source="share"
          sharedId={design.id}
        />
      )}
    </div>
  );
};

export default SharePage;
