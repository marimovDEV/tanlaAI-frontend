import React, { useEffect, useState } from 'react';
import {
  Inbox, Phone, MessageCircle, Ruler, CheckCircle2,
  Calendar, User as UserIcon, Clock, Package,
} from 'lucide-react';
import apiClient from '../api/client';
import { useTelegram } from '../contexts/useTelegram';
import type { ApiListResponse, LeadRequest, LeadType } from '../types';

/* ── helpers ─────────────────────────────────────────────────── */
const LEAD_META: Record<LeadType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  call:        { label: "Qo'ng'iroq",    color: '#34C759', bg: 'rgba(52,199,89,0.1)',   icon: <Phone size={16} />       },
  telegram:    { label: 'Telegram',      color: '#0088cc', bg: 'rgba(0,136,204,0.1)',  icon: <MessageCircle size={16} /> },
  measurement: { label: "O'lchash",      color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', icon: <Ruler size={16} />        },
  visualize:   { label: 'AI Vizual',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: <MessageCircle size={16} /> },
};

const fmtDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const fmtTime = (s: string) => {
  const d = new Date(s);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ── Skeleton ────────────────────────────────────────────────── */
const LeadSkeleton = () => (
  <div
    className="rounded-[20px] overflow-hidden"
    style={{
      height: 130,
      background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4de 50%,#f0ede8 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }}
  />
);

/* ── Lead Card ───────────────────────────────────────────────── */
const LeadCard: React.FC<{
  lead: LeadRequest;
  onUpdate: (id: number, data: Partial<LeadRequest>) => void;
}> = ({ lead, onUpdate }) => {
  const meta  = LEAD_META[lead.lead_type] ?? LEAD_META.call;
  const phone = lead.phone;
  const username = lead.user_details?.username;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return '#34C759';
      case 'rejected': return '#FF3B30';
      case 'active': return '#007AFF';
      default: return '#8A8A99';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'converted': return 'Sotildi';
      case 'rejected': return 'Rad etildi';
      case 'active': return 'Jarayonda';
      case 'contacted': return 'Bog\'lanildi';
      default: return 'Yangi';
    }
  };

  return (
    <div
      className="bg-white rounded-[24px] p-5 transition-all duration-300"
      style={{
        boxShadow: lead.is_processed
          ? '0 2px 8px rgba(26,26,46,0.04)'
          : '0 8px 32px rgba(26,26,46,0.08)',
        opacity: lead.status === 'rejected' ? 0.7 : 1,
        border: lead.status === 'converted' ? '2px solid #34C75922' : '1px solid rgba(26,26,46,0.06)',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <span 
                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter"
                style={{ background: `${getStatusColor(lead.status)}15`, color: getStatusColor(lead.status) }}
              >
                {getStatusLabel(lead.status)}
              </span>
            </div>
            {lead.product_name && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Package size={11} color="#C0C0CE" />
                <p className="text-[12px] text-[#5A5A6E] font-bold">{lead.product_name}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onUpdate(lead.id, { is_processed: !lead.is_processed })}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={lead.is_processed
            ? { background: 'rgba(52,199,89,0.1)', color: '#34C759' }
            : { background: 'rgba(26,26,46,0.05)', color: '#C0C0CE' }
          }
        >
          <CheckCircle2 size={18} strokeWidth={lead.is_processed ? 3 : 2} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Customer Info Card */}
        <div className="bg-[#fcfaf7] rounded-[18px] p-4 border border-[#f0ede8] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center text-[#B0B0BF]">
                <UserIcon size={14} />
              </div>
              <div>
                <p className="text-[13px] font-black text-[#1A1A2E]">
                  {lead.user_details?.first_name || "Noma'lum mijoz"}
                </p>
                {username && <p className="text-[11px] font-bold text-[#8B5CF6]">@{username}</p>}
              </div>
            </div>
            
            <div className="flex gap-2">
              {username && (
                <a 
                  href={`https://t.me/${username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg shadow-[#0088cc]/20 active:scale-90 transition-all"
                >
                  <MessageCircle size={16} color="white" />
                </a>
              )}
              {phone && (
                <a 
                  href={`tel:${phone}`}
                  className="w-9 h-9 rounded-full bg-[#34C759] flex items-center justify-center shadow-lg shadow-[#34C759]/20 active:scale-90 transition-all"
                >
                  <Phone size={16} color="white" />
                </a>
              )}
            </div>
          </div>

          {phone && (
            <p className="text-[14px] font-black text-[#34C759] pl-1">{phone}</p>
          )}
        </div>

        {/* Message / Details */}
        {(lead.message || lead.price_info || lead.calculated_price) && (
          <div className="px-1 space-y-2.5">
            {lead.message && (
              <div className="bg-white/50 rounded-xl p-3 border border-dashed border-[#f0ede8]">
                <p className="text-[13px] text-[#5A5A6E] leading-relaxed italic">
                  "{lead.message}"
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {lead.price_info && (
                <div className="px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100 flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-[#FF6B35]">💰 {lead.price_info}</span>
                </div>
              )}
              {lead.calculated_price && (
                <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-100 flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-[#34C759]">💵 {Number(lead.calculated_price).toLocaleString()} so'm</span>
                </div>
              )}
              {lead.width_cm && lead.height_cm && (
                <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-[#007AFF]">📐 {lead.width_cm}x{lead.height_cm} sm</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={() => onUpdate(lead.id, { status: 'converted', is_processed: true })}
          className={`py-3 rounded-xl text-[12px] font-black transition-all active:scale-95 flex items-center justify-center gap-2 ${
            lead.status === 'converted' 
            ? 'bg-[#34C759] text-white' 
            : 'bg-white border-2 border-[#34C759] text-[#34C759]'
          }`}
        >
          <CheckCircle2 size={14} />
          Sotildi
        </button>
        <button
          onClick={() => onUpdate(lead.id, { status: 'rejected', is_processed: true })}
          className={`py-3 rounded-xl text-[12px] font-black transition-all active:scale-95 ${
            lead.status === 'rejected' 
            ? 'bg-[#FF3B30] text-white' 
            : 'bg-white border-2 border-[#FF3B30] text-[#FF3B30]'
          }`}
        >
          Rad etildi
        </button>
      </div>

      {/* Footer / Date */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(26,26,46,0.04)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar size={11} color="#C0C0CE" />
            <span className="text-[10px] text-[#C0C0CE] font-bold">{fmtDate(lead.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} color="#C0C0CE" />
            <span className="text-[10px] text-[#C0C0CE] font-bold">{fmtTime(lead.created_at)}</span>
          </div>
        </div>
        <p className="text-[10px] font-black text-[#B0B0BF] uppercase tracking-tighter">ID: #{lead.id}</p>
      </div>
    </div>
  );
};

/* ── Filters ─────────────────────────────────────────────────── */
type Filter = 'all' | 'new' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',  label: 'Barchasi'  },
  { key: 'new',  label: 'Yangi'     },
  { key: 'done', label: "Ko'rilgan" },
];

/* ── Page ────────────────────────────────────────────────────── */
const LeadListView: React.FC = () => {
  const [leads,   setLeads]   = useState<LeadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<Filter>('all');
  const { haptic } = useTelegram();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await apiClient.get<ApiListResponse<LeadRequest> | LeadRequest[]>('/leads/');
        setLeads(Array.isArray(res.data) ? res.data : res.data.results ?? []);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const updateLead = async (leadId: number, data: Partial<LeadRequest>) => {
    haptic('light');
    try {
      await apiClient.patch(`/leads/${leadId}/`, data);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...data } : l));
      if (data.status === 'converted') haptic('heavy');
      else if (data.status === 'rejected') haptic('medium');
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = leads.filter(l => {
    if (filter === 'new')  return !l.is_processed && l.status !== 'rejected';
    if (filter === 'done') return  l.is_processed || l.status === 'converted' || l.status === 'rejected';
    return true;
  });

  const newCount  = leads.filter(l => !l.is_processed).length;
  const doneCount = leads.filter(l =>  l.is_processed).length;

  return (
    <div style={{ background: '#FFFBF6' }} className="min-h-screen pb-28">
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[22px] font-black text-[#1A1A2E]">Mijoz so'rovlari</h1>
          {newCount > 0 && (
            <span
              className="text-[13px] font-black text-white px-3 py-1 rounded-full"
              style={{ background: 'linear-gradient(135deg,#FF2D55,#FF6B35)' }}
            >
              {newCount} yangi
            </span>
          )}
        </div>
        <p className="text-[12px] font-bold text-[#B0B0BF] uppercase tracking-widest">
          Jami: {leads.length} ta • Ko'rilgan: {doneCount} ta
        </p>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => { haptic('light'); setFilter(f.key); }}
              className="flex-1 py-2.5 rounded-[14px] text-[12px] font-black transition-all active:scale-95"
              style={filter === f.key
                ? { background: 'linear-gradient(135deg,#FF6B35,#FF2D55)', color: '#fff', boxShadow: '0 4px 14px rgba(255,107,53,0.28)' }
                : { background: '#fff', color: '#8A8A99', border: '1.5px solid rgba(26,26,46,0.08)' }
              }
            >
              {f.label}
              {f.key === 'new' && newCount > 0 && (
                <span className="ml-1 text-[10px]">({newCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-3">
        {loading ? (
          [1,2,3,4].map(i => <LeadSkeleton key={i} />)
        ) : filtered.length > 0 ? (
          filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdate={updateLead}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div
              className="w-20 h-20 rounded-[24px] flex items-center justify-center"
              style={{ background: 'rgba(255,107,53,0.08)' }}
            >
              <Inbox size={32} color="#FF6B35" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[18px] font-black text-[#1A1A2E] mb-1">
                {filter === 'new' ? 'Yangi so\'rov yo\'q' :
                 filter === 'done' ? "Ko'rilgan so'rov yo'q" :
                 'Hali so\'rov yo\'q'}
              </h3>
              <p className="text-[13px] text-[#B0B0BF] font-medium">
                {filter === 'all' ? 'Mahsulotlaringiz bosilganda bu yerda ko\'rinadi' : 'Boshqa filtr tanlang'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListView;
