import { useEffect, useRef, useState } from "react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/Textarea";
import { AlertCircle, CheckCircle, Loader2, Save } from "lucide-react";
import { useAdmin } from "../components/layout/adminProvider";

// ── Settings Panel ────────────────────────────────────────────────────────────
export function AdminSettings() {
  const { settings, saveSettings, error, clearError, loading } = useAdmin();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings(form);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2500);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your business information and site settings.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-green-700 text-sm font-medium">Settings saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide" style={{ fontFamily: "Poppins, sans-serif" }}>Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <Input label="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <Input label="WhatsApp Number" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        <Textarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
        <Input label="Working Hours" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. Mon–Fri: 9AM–7PM" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide" style={{ fontFamily: "Poppins, sans-serif" }}>Social & Map Links</h2>
        <Input label="Facebook Page URL" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." />
        <Input label="Google Maps Link" value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} placeholder="https://maps.google.com/..." />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-amber-700 text-sm">Settings are stored in your MongoDB database via <code className="font-mono text-xs">PUT /admin/settings</code>.</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}