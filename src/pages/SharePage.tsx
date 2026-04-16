import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import apiClient from '../api/client';
import LeadForm from '../components/LeadForm';
import { useTelegram } from '../contexts/useTelegram';

interface SharedDesign {
  id: string;
  image: string;
  created_at: string;
  product_details: {
    id: number;
    name: string;
    image: string;
    price: string | null;
  } | null;
}

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
    <div className="min-h-screen bg-black/95 relative pb-24">
      {/* Action Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={() => { haptic('light'); navigate('/'); }}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            TanlaAI Dizayn
          </span>
        </div>
      </div>

      {/* Main Image */}
      <div className="w-full h-screen flex items-center justify-center pt-16 pb-32">
        <img
          src={design.image}
          alt="Shared AI Design"
          className="w-full max-h-full object-contain"
        />
      </div>

      {/* Product Card at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-gradient-to-t from-black via-black/80 to-transparent">
        {design.product_details ? (
          <div className="bg-white rounded-3xl p-4 shadow-2xl flex items-center gap-4">
            <div className="w-16 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
              <img
                src={design.product_details.image}
                alt={design.product_details.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-slate-800 text-sm mb-1 line-clamp-1">
                {design.product_details.name}
              </h3>
              <p className="text-primary font-black text-xs mb-3">
                {design.product_details.price
                  ? new Intl.NumberFormat('ru-RU').format(Number(design.product_details.price)) + " so'm"
                  : "Narxlanmagan"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { haptic('medium'); setShowLeadForm(true); }}
                  className="flex-1 bg-primary text-white py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  Sotib olish
                </button>
                <button
                  onClick={() => { haptic('light'); navigate(`/product/${design.product_details?.id}`); }}
                  className="px-4 bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
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
