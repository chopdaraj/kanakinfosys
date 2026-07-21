import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Settings, ShieldCheck, Landmark, Percent, Lock } from "lucide-react";

export default function AdminSettings() {
  const [form, setForm] = useState({
    min_deposit: 100000,
    profit_percentage_daily: 0.10,
    referral_percentage_monthly: 1.0,
    lock_period_months: 6,
    company_bank_name: "",
    company_account_number: "",
    company_account_holder: "",
    company_ifsc: "",
    company_branch: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings")
      .then((res) => {
        setForm({
          min_deposit: res.data.min_deposit ?? 100000,
          profit_percentage_daily: res.data.profit_percentage_daily ?? 0.10,
          referral_percentage_monthly: res.data.referral_percentage_monthly ?? 1.0,
          lock_period_months: res.data.lock_period_months ?? 6,
          company_bank_name: res.data.company_bank_name || "",
          company_account_number: res.data.company_account_number || "",
          company_account_holder: res.data.company_account_holder || "",
          company_ifsc: res.data.company_ifsc || "",
          company_branch: res.data.company_branch || ""
        });
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load settings:", e);
        setLoading(false);
      });
  }, []);

  const handleChange = (k) => (e) => {
    const val = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", form);
      toast.success("System configurations updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update configurations");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-slate-400 text-xs">Loading settings room...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-settings-page">
        {/* Header */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">System configuration</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Platform Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure default interest percentages, deposit minimums, and company payout coordinates.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: General Rules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Yield Rules */}
            <div className="kanak-card p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <Percent className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Operational Yield & Commit Limits</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Minimum Deposit Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={form.min_deposit}
                    onChange={handleChange("min_deposit")}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono-num font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Lock-In Period (Months)</label>
                  <input
                    type="number"
                    required
                    value={form.lock_period_months}
                    onChange={handleChange("lock_period_months")}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono-num font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Daily Yield Profit Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.profit_percentage_daily}
                    onChange={handleChange("profit_percentage_daily")}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono-num font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Monthly Referral Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.referral_percentage_monthly}
                    onChange={handleChange("referral_percentage_monthly")}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono-num font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div className="kanak-card p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <Landmark className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Deposit Credentials (Bank Details)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={form.company_bank_name}
                    onChange={handleChange("company_bank_name")}
                    placeholder="e.g. HDFC Bank"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={form.company_account_holder}
                    onChange={handleChange("company_account_holder")}
                    placeholder="e.g. Kanak Infosys Private Limited"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Account Number</label>
                  <input
                    type="text"
                    required
                    value={form.company_account_number}
                    onChange={handleChange("company_account_number")}
                    placeholder="e.g. 501234567890"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={form.company_ifsc}
                    onChange={handleChange("company_ifsc")}
                    placeholder="e.g. HDFC0000123"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={form.company_branch}
                    onChange={handleChange("company_branch")}
                    placeholder="e.g. Connaught Place"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary / Submit */}
          <div className="space-y-6">
            <div className="kanak-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Save Configuration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saving updates will instantly modify the payment deposit coordinates seen by clients, as well as proration daily credit algorithms.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 text-xs font-semibold text-white kanak-gradient-btn"
              >
                {saving ? "Saving Changes..." : "Commit Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
