import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Phone, 
  MessageCircle, 
  Ruler, 
  CheckCircle2, 
  X,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import apiClient from '../api/client';
import { useTelegram } from '../contexts/useTelegram';
import { cn } from '../utils/cn';
import type { ApiListResponse, LeadRequest, LeadType } from '../types';

const LeadListView: React.FC = () => {
  const [leads, setLeads] = useState<LeadRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { haptic } = useTelegram();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await apiClient.get<ApiListResponse<LeadRequest> | LeadRequest[]>('/leads/');
        setLeads(Array.isArray(response.data) ? response.data : response.data.results);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const toggleProcessed = async (leadId: number, currentStatus: boolean) => {
    haptic('light');
    try {
      await apiClient.patch(`/leads/${leadId}/`, { is_processed: !currentStatus });
      setLeads((prev) => prev.map((lead) => lead.id === leadId ? { ...lead, is_processed: !currentStatus } : lead));
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const getLeadIcon = (type: LeadType) => {
    switch (type) {
      case 'call': return <Phone size={18} className="text-primary" />;
      case 'measurement': return <Ruler size={18} className="text-secondary" />;
      default: return <MessageCircle size={18} className="text-blue-500" />;
    }
  };

  if (loading) return <div className="p-6">So'rovlar yuklanmoqda...</div>;

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Mijoz so'rovlari</h2>
          <p className="text-[10px] text-outline font-black uppercase tracking-widest mt-1">So'rovlar ro'yxati</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-outline">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <div 
              key={lead.id} 
              className={cn(
                "bg-white p-6 rounded-[32px] border transition-all duration-300",
                lead.is_processed ? "border-outline/5 opacity-60" : "border-primary/10 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    lead.is_processed ? "bg-outline/10 text-outline" : "bg-primary/5"
                  )}>
                    {getLeadIcon(lead.lead_type)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-on-surface capitalize">
                      {lead.lead_type === 'call' ? "Qo'ng'iroq" : lead.lead_type === 'measurement' ? "O'lchash" : lead.lead_type}
                    </h4>
                    <p className="text-[10px] font-bold text-outline uppercase">{lead.product_name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleProcessed(lead.id, lead.is_processed)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    lead.is_processed ? "bg-green-500 text-white" : "bg-white border border-outline/10 text-outline/30"
                  )}
                >
                  <CheckCircle2 size={20} />
                </button>
              </div>

              <div className="space-y-3 bg-surface-variant/30 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <UserIcon size={14} className="text-outline" />
                  <p className="text-xs font-bold text-on-surface">
                    {lead.user_details?.first_name || "Noma'lum mijoz"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-outline" />
                  <a href={`tel:${lead.phone}`} className="text-xs font-black text-primary underline">
                    {lead.phone || 'Telefon raqam berilmagan'}
                  </a>
                </div>
                {lead.message && (
                  <div className="pt-2 border-t border-outline/5">
                    <p className="text-[11px] text-on-surface leading-normal italic">"{lead.message}"</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-outline uppercase tracking-wider">
                <Calendar size={12} />
                {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-30">
            <Inbox size={64} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">Faol so'rovlar yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadListView;
