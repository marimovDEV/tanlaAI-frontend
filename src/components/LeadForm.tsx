import React, { useState } from 'react';
import { X, Send, MapPin, Pencil, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react';
import apiClient from '../api/client';
import { useTelegram } from '../contexts/useTelegram';

export type LeadFormType = 'call' | 'measurement' | 'direct';

interface Props {
  productId: number;
  onClose: () => void;
  leadType: LeadFormType;
  initialPriceInfo?: string;
  widthCm?: number;
  heightCm?: number;
  source?: string;
  sharedId?: string;
}

// Per-type copy so we don't branch inside JSX.
// `direct` = AI-free checkout: customer just wants to buy, so we foreground
// that intent with a shopping icon and an order-focused title.
const LEAD_COPY: Record<LeadFormType, { title: string; subtitle: string; cta: string }> = {
  call: {
    title: "Qo'ng'iroq buyurtma qilish",
    subtitle: "Ma'lumotlaringizni kiriting, biz o'zimiz aloqaga chiqamiz.",
    cta: "So'rovni yuborish",
  },
  measurement: {
    title: "O'lchashni buyurtma qilish",
    subtitle: "Ma'lumotlaringizni kiriting, biz o'zimiz aloqaga chiqamiz.",
    cta: "So'rovni yuborish",
  },
  direct: {
    title: "Buyurtma berish",
    subtitle: "Mahsulotni buyurtma qilish uchun ma'lumotlaringizni kiriting.",
    cta: "Buyurtmani tasdiqlash",
  },
};

type AddressMode = 'location' | 'manual';

interface AxiosLikeErr {
  response?: { data?: { address?: string[] | string; detail?: string } };
}

const LeadForm: React.FC<Props> = ({
  productId, onClose, leadType, initialPriceInfo,
  widthCm, heightCm, source, sharedId,
}) => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { haptic } = useTelegram();

  // Address state — user picks exactly one mode, but we only send whichever is filled.
  const [addressMode, setAddressMode] = useState<AddressMode>('location');
  const [addressText, setAddressText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestLocation = () => {
    setGeoError(null);
    if (!('geolocation' in navigator)) {
      setGeoError("Brauzer geolokatsiyani qo'llamayapti. Manzilni qo'lda yozing.");
      return;
    }
    setGeoBusy(true);
    haptic('light');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoBusy(false);
        haptic('medium');
      },
      (err) => {
        setGeoBusy(false);
        let msg = "Lokatsiyani olishning imkoni bo'lmadi.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Ruxsat berilmadi. Manzilni qo'lda yozing.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Joylashuv aniqlanmadi. Manzilni qo'lda yozing.";
        }
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    setLat(null);
    setLng(null);
  };

  const hasCoords = lat !== null && lng !== null;
  const hasManual = addressText.trim().length > 0;
  const canSubmit = !loading && (
    (addressMode === 'location' && hasCoords) ||
    (addressMode === 'manual' && hasManual)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErrorMsg(null);
    haptic('medium');

    try {
      // NOTE: `calculated_price` intentionally NOT sent — server always
      // recomputes it from product.price_per_m2 × (width*height/10000)
      // so clients can't quote themselves a discount.
      const payload: Record<string, unknown> = {
        product: productId,
        lead_type: leadType,
        phone,
        message: message || "Siz bilan bog'lanishlarini kutmoqda.",
        price_info: initialPriceInfo || "",
        width_cm: widthCm ?? null,
        height_cm: heightCm ?? null,
        source: source || "",
        shared_id: sharedId || null,
      };
      if (addressMode === 'location' && hasCoords) {
        payload.latitude = lat;
        payload.longitude = lng;
      } else if (addressMode === 'manual' && hasManual) {
        payload.address_text = addressText.trim();
      }

      await apiClient.post('/leads/', payload);
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error sending lead request:', error);
      const err = error as AxiosLikeErr;
      const data = err?.response?.data;
      let msg = "So'rovni yuborib bo'lmadi. Iltimos, qayta urinib ko'ring.";
      if (data?.address) {
        msg = Array.isArray(data.address) ? data.address[0] : data.address;
      } else if (data?.detail) {
        msg = data.detail;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-outline'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center px-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-lg rounded-t-[32px] p-8 pb-10 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-outline/20 rounded-full mx-auto mb-6" />

        {success ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {leadType === 'direct' ? (
                <ShoppingBag className="text-primary" size={32} />
              ) : (
                <Send className="text-primary" size={32} />
              )}
            </div>
            <h3 className="text-xl font-extrabold text-on-surface mb-2">
              {leadType === 'direct' ? "Buyurtma qabul qilindi!" : "Muvaffaqiyatli!"}
            </h3>
            <p className="text-xs text-outline">
              {leadType === 'direct'
                ? "Kompaniya tez orada siz bilan bog'lanadi."
                : "Mutaxassislarimiz tez orada siz bilan bog'lanishadi."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-start gap-3">
                {leadType === 'direct' && (
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShoppingBag size={20} className="text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-on-surface mb-1">
                    {LEAD_COPY[leadType].title}
                  </h3>
                  <p className="text-xs text-outline">{LEAD_COPY[leadType].subtitle}</p>
                </div>
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

              {/* Address picker — 2 modes: location OR manual */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-1.5 block">
                  Manzil
                </label>
                <div className="flex p-1 bg-white rounded-2xl border border-outline/10 mb-3">
                  <button
                    type="button"
                    onClick={() => setAddressMode('location')}
                    className={tabClass(addressMode === 'location')}
                  >
                    <MapPin size={14} />
                    Lokatsiya
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode('manual')}
                    className={tabClass(addressMode === 'manual')}
                  >
                    <Pencil size={14} />
                    Qo'lda yozish
                  </button>
                </div>

                {addressMode === 'location' ? (
                  <div className="space-y-2">
                    {hasCoords ? (
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-primary" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Lokatsiya tayyor</p>
                            <p className="text-xs text-outline mt-0.5">
                              {lat!.toFixed(5)}, {lng!.toFixed(5)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearLocation}
                          className="text-[10px] font-black uppercase tracking-widest text-error"
                        >
                          O'zgartirish
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={requestLocation}
                        disabled={geoBusy}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-primary/30 text-primary font-bold py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {geoBusy ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Aniqlanmoqda...
                          </>
                        ) : (
                          <>
                            <MapPin size={18} />
                            Lokatsiyamni yuborish
                          </>
                        )}
                      </button>
                    )}
                    {geoError && (
                      <p className="text-[11px] text-error ml-1">{geoError}</p>
                    )}
                    <p className="text-[10px] text-outline ml-1">
                      Aniq joylashuv — usta manzilingizga tez yetib keladi.
                    </p>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value)}
                      placeholder="Masalan: Toshkent, Chilonzor, 5-kvartal, 12-uy"
                      rows={3}
                      className="w-full bg-white border border-outline/10 rounded-2xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-outline ml-1 mb-1.5 block">
                  Izoh (Ixtiyoriy)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Qulay vaqt yoki o'ziga xos talablaringiz..."
                  rows={2}
                  className="w-full bg-white border border-outline/10 rounded-2xl py-4 px-5 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>

              {errorMsg && (
                <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-xs font-bold text-error">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-primary text-white font-bold py-5 rounded-2xl mt-2 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Yuborilmoqda...' : LEAD_COPY[leadType].cta}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadForm;
