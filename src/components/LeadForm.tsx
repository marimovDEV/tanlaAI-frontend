import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import apiClient from '../api/client';
import { useTelegram } from '../contexts/useTelegram';

interface Props {
  productId: number;
  onClose: () => void;
  leadType: 'call' | 'measurement';
  initialPriceInfo?: string;
  source?: string;
  sharedId?: string;
}

const LeadForm: React.FC<Props> = ({ productId, onClose, leadType, initialPriceInfo, source, sharedId }) => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { haptic } = useTelegram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    haptic('medium');

    try {
      await apiClient.post('/leads/', {
        product: productId,
        lead_type: leadType,
        phone,
        message: message || "Siz bilan bog'lanishlarini kutmoqda.",
        price_info: initialPriceInfo || "",
        source: source || "",
        shared_id: sharedId || null,
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending lead request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center px-4" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-lg rounded-t-[32px] p-8 pb-10 animate-in slide-in-from-bottom duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-outline/20 rounded-full mx-auto mb-6" />
        
        {success ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-on-surface mb-2">Muvaffaqiyatli!</h3>
            <p className="text-xs text-outline">Mutaxassislarimiz tez orada siz bilan bog'lanishadi.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface mb-1">
                  {leadType === 'call' ? "Qo'ng'iroq buyurtma qilish" : "O'lchashni buyurtma qilish"}
                </h3>
                <p className="text-xs text-outline">Ma'lumotlaringizni kiriting, biz o'zimiz aloqaga chiqamiz.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-outline"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-1.5 block">
                  Telefon raqam
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67" 
                  required
                  className="w-full bg-white border border-outline/10 rounded-2xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-1.5 block">
                  Izoh (Ixtiyoriy)
                </label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Qulay vaqt yoki o'ziga xos talablaringiz..." 
                  rows={3}
                  className="w-full bg-white border border-outline/10 rounded-2xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-5 rounded-2xl mt-4 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Yuborilmoqda...' : "So'rovni yuborish"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadForm;
