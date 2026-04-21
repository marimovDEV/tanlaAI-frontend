import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Bot,
  Crosshair,
  Users,
  Terminal,
  Save,
  RefreshCcw,
  Check,
  AlertCircle,
  Activity,
  ChevronRight,
} from "lucide-react";
import apiClient from "../api/client";
import { cn } from "../utils/cn";

type SettingsState = {
  platform_name: string;
  default_language: string;
  timezone: string;
  currency: string;
  ai_provider: string;
  max_results_per_user: number;
  image_quality: string;
  enable_bg_removal: boolean;
  bg_removal_mode: string;
  max_image_size: number;
  auto_resize: boolean;
  keep_aspect_ratio: boolean;
  default_door_height_ratio: number;
  placement_mode: string;
  allow_window_placement: boolean;
  snap_to_wall: boolean;
  auto_create_lead: boolean;
  notify_admin: boolean;
  default_lead_status: string;
  items_per_page: number;
  enable_infinite_scroll: boolean;
  show_debug_logs: boolean;
  enable_deploy_actions: boolean;
  deploy_enabled: boolean;
  // Billing fields
  server_due_date: string | null;
  server_cost: number;
  server_note: string;
  ai_due_date: string | null;
  ai_cost_per_request: number;
  usd_to_uzs_rate: number;
  ai_monthly_budget_uzs: number;
  ai_storage_channel_id: string;
};

const tabs = [
  { id: "general", label: "Umumiy", icon: Settings },
  { id: "billing", label: "Hisob-kitob", icon: Activity },
  { id: "ai", label: "AI & Tasvirlar", icon: Bot },
  { id: "viz", label: "Vizualizatsiya", icon: Crosshair },
  { id: "crm", label: "CRM & Leads", icon: Users },
  { id: "devops", label: "DevOps", icon: Terminal },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [output, setOutput] = useState("Tizim loglari tayyor...");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, billingRes] = await Promise.all([
        apiClient.get("/admin/system-settings/"),
        apiClient.get("/admin/billing/")
      ]);
      setSettings({ ...settingsRes.data, ...billingRes.data });
    } catch (e) {
      console.error("Settings load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setStatus("idle");
    try {
      await Promise.all([
        apiClient.post("/admin/system-settings/", settings),
        apiClient.post("/admin/billing/", settings)
      ]);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (
    key: keyof SettingsState,
    value: SettingsState[keyof SettingsState],
  ) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const runAction = async (action: string) => {
    setLoading(true);
    setOutput(`Running: ${action}...`);
    try {
      const { data } = await apiClient.post("admin/run-action/", { action });
      setOutput(
        [
          `>>> ${action.toUpperCase()} EXECUTION`,
          `Status: ${data.status}`,
          `Exit Code: ${data.exit_code ?? "-"}`,
          `Command: ${data.command ?? "-"}`,
          "---------------------------------------",
          data.output || "No output generated.",
        ].join("\n"),
      );
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setOutput(`Error: ${msg || "Command failed"}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Sozlamalar yuklanmoqda...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-end justify-between border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Tizim Sozlamalari
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Platforma boshqaruvi va SaaS nazorati
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl",
            status === "success"
              ? "bg-emerald-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200",
          )}
        >
          {saving ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : status === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {status === "success" ? "Saqlandi!" : "Saqlash"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
        <aside className="lg:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group",
                  activeTab === tab.id
                    ? "bg-white text-indigo-600 shadow-md border border-slate-100 ring-1 ring-slate-100"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      activeTab === tab.id
                        ? "bg-indigo-50"
                        : "bg-slate-50 group-hover:bg-white",
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-black tracking-tight">
                    {tab.label}
                  </span>
                </div>
                {activeTab === tab.id && <ChevronRight size={16} />}
              </button>
            );
          })}
        </aside>

        {/* Tab Content */}
        <main className="flex-1 bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-10"
            >
              {activeTab === "billing" && settings && (
                <div className="space-y-8">
                  <header className="flex items-center gap-4 text-rose-500">
                    <Activity className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      SaaS Hisob-kitoblari
                    </h2>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-slate-50 rounded-3xl space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">💻 Server</h3>
                      <Field
                        label="Oylik narxi (UZS)"
                        type="number"
                        value={settings.server_cost}
                        onChange={(v) => updateSetting("server_cost", Number(v))}
                      />
                      <Field
                        label="Keyingi to'lov sanasi"
                        type="date"
                        value={settings.server_due_date || ""}
                        onChange={(v) => updateSetting("server_due_date", v)}
                      />
                      <Field
                        label="Eslatma"
                        value={settings.server_note}
                        onChange={(v) => updateSetting("server_note", v)}
                      />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">🤖 AI Xizmati</h3>
                      <Field
                        label="Bitta so'rov narxi (USD)"
                        type="number"
                        step="0.0001"
                        value={settings.ai_cost_per_request}
                        onChange={(v) => updateSetting("ai_cost_per_request", Number(v))}
                      />
                      <Field
                        label="USD kursi (1$ = X UZS)"
                        type="number"
                        value={settings.usd_to_uzs_rate}
                        onChange={(v) => updateSetting("usd_to_uzs_rate", Number(v))}
                      />
                      <Field
                        label="Oylik AI Budjeti (UZS)"
                        type="number"
                        value={settings.ai_monthly_budget_uzs}
                        onChange={(v) => updateSetting("ai_monthly_budget_uzs", Number(v))}
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "general" && settings && (
                <div className="space-y-8">
                  <header className="flex items-center gap-4 text-indigo-600">
                    <Settings className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      Platforma Ma&apos;lumotlari
                    </h2>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field
                      label="Platforma Nomi"
                      value={settings.platform_name}
                      onChange={(v) => updateSetting("platform_name", v)}
                    />
                    <Field
                      label="Asosiy Til"
                      value={settings.default_language}
                      onChange={(v) => updateSetting("default_language", v)}
                    />
                    <Field
                      label="Vaqt Zonasi"
                      value={settings.timezone}
                      onChange={(v) => updateSetting("timezone", v)}
                    />
                    <Field
                      label="Valyuta"
                      value={settings.currency}
                      onChange={(v) => updateSetting("currency", v)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "ai" && settings && (
                <div className="space-y-8">
                  <header className="flex items-center gap-4 text-emerald-600">
                    <Bot className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      AI & Tasvirni Qayta Ishlash
                    </h2>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SelectField
                      label="AI Modeli"
                      value={settings.ai_provider}
                      onChange={(v) => updateSetting("ai_provider", v)}
                      options={[
                        { v: "gemini", l: "Google Gemini (Imagen 3)" },
                        { v: "openai", l: "OpenAI (DALL-E 3)" },
                      ]}
                    />
                    <SelectField
                      label="Tasvir Sifati"
                      value={settings.image_quality}
                      onChange={(v) => updateSetting("image_quality", v)}
                      options={[
                        { v: "low", l: "Tezkor" },
                        { v: "medium", l: "Optimal" },
                        { v: "high", l: "HD Sifat" },
                      ]}
                    />
                    <SelectField
                      label="Fonni O'chirish Rejimi"
                      value={settings.bg_removal_mode}
                      onChange={(v) => updateSetting("bg_removal_mode", v)}
                      options={[
                        { v: "ai", l: "To&apos;liq AI" },
                        { v: "color", l: "Rang asosida" },
                        { v: "hybrid", l: "Gibrid (Tavsiya)" },
                      ]}
                    />
                    <Field
                      label="Maksimal Tasvir Hajmi (px)"
                      type="number"
                      value={settings.max_image_size}
                      onChange={(v) =>
                        updateSetting("max_image_size", Number(v))
                      }
                    />
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800 text-sm">
                        Fonni avtomatik o&apos;chirish
                      </p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                        Har bir mahsulot uchun majburiy
                      </p>
                    </div>
                    <Toggle
                      value={settings.enable_bg_removal}
                      onChange={(v) => updateSetting("enable_bg_removal", v)}
                    />
                  </div>

                  <div className="pt-4">
                    <Field
                      label="Telegram Storage ID (Channel/Group)"
                      value={settings.ai_storage_channel_id || ""}
                      onChange={(v) => updateSetting("ai_storage_channel_id", v)}
                    />
                    <p className="text-[10px] text-slate-400 mt-2 px-1 leading-relaxed">
                      AI rasmlarni "Unlimited Cloud" sifatida saqlash uchun kanal yoki guruh ID sini kiriting (Masalan: -100123456789). Bo'sh qolsa default admin botga yuboradi.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "viz" && settings && (
                <div className="space-y-8">
                  <header className="flex items-center gap-4 text-rose-500">
                    <Crosshair className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      Vizualizatsiya Normalari
                    </h2>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field
                      label="Eshikning balandlik nisbati (0.0 - 1.0)"
                      type="number"
                      step="0.01"
                      value={settings.default_door_height_ratio}
                      onChange={(v) =>
                        updateSetting(
                          "default_door_height_ratio",
                          parseFloat(v),
                        )
                      }
                    />
                    <SelectField
                      label="Joylashtirish Rejimi"
                      value={settings.placement_mode}
                      onChange={(v) => updateSetting("placement_mode", v)}
                      options={[
                        { v: "auto", l: "Avtomat (AI)" },
                        { v: "center", l: "Markaz bo&apos;yicha" },
                        { v: "manual", l: "Qo&apos;lda" },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ToggleField
                      label="Devorga yopishish (Snap-to-wall)"
                      value={settings.snap_to_wall}
                      onChange={(v) => updateSetting("snap_to_wall", v)}
                    />
                    <ToggleField
                      label="Oynaga ham joylashtirish"
                      value={settings.allow_window_placement}
                      onChange={(v) =>
                        updateSetting("allow_window_placement", v)
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "crm" && settings && (
                <div className="space-y-8">
                  <header className="flex items-center gap-4 text-amber-500">
                    <Users className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      Sotuv & CRM Pipeline
                    </h2>
                  </header>
                  <div className="space-y-4">
                    <ToggleField
                      label="Avtomatik Lead yaratish"
                      sub="Foydalanuvchi vizualizatsiya qilganda"
                      value={settings.auto_create_lead}
                      onChange={(v) => updateSetting("auto_create_lead", v)}
                    />
                    <ToggleField
                      label="Adminni ogohlantirish"
                      sub="Yangi so'rov tushganda bot orqali"
                      value={settings.notify_admin}
                      onChange={(v) => updateSetting("notify_admin", v)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "devops" && (
                <div className="space-y-8">
                  <header className="flex items-center gap-4 text-slate-800">
                    <Terminal className="w-6 h-6" />
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      DevOps & Terminal
                    </h2>
                  </header>

                  {settings?.deploy_enabled ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <ActionButton
                        label="Git Pull"
                        onClick={() => runAction("git_pull")}
                        color="bg-indigo-50 text-indigo-600"
                      />
                      <ActionButton
                        label="Migrate"
                        onClick={() => runAction("migrate")}
                        color="bg-emerald-50 text-emerald-600"
                      />
                      <ActionButton
                        label="Static"
                        onClick={() => runAction("collectstatic")}
                        color="bg-amber-50 text-amber-600"
                      />
                      <ActionButton
                        label="Restart"
                        onClick={() => runAction("restart_service")}
                        color="bg-rose-50 text-rose-600"
                      />
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-600 p-6 rounded-[32px] border border-red-100 flex items-center gap-4">
                      <AlertCircle className="shrink-0" />
                      <p className="text-sm font-bold leading-relaxed">
                        Deploy amallari faol emas. [.env] dagi
                        [ALLOW_ADMIN_DEPLOY_ACTIONS] ni [True] qiling.
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Live Terminal Output
                      </span>
                    </div>
                    <pre className="bg-slate-900 text-slate-200 p-8 rounded-[40px] shadow-2xl font-mono text-xs min-h-[300px] overflow-auto border-4 border-slate-800 whitespace-pre-wrap">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { v: string | number; l: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.v} value={opt.v}>
            {opt.l}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "w-12 h-6 rounded-full relative transition-all duration-300",
        value ? "bg-indigo-600" : "bg-slate-200",
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
          value ? "left-7" : "left-1",
        )}
      />
    </button>
  );
}

function ToggleField({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all group">
      <div>
        <h4 className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
          {label}
        </h4>
        {sub && (
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
            {sub}
          </p>
        )}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm",
        color,
      )}
    >
      {label}
    </button>
  );
}
