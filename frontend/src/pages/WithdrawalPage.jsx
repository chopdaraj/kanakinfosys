import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, formatINR, formatDate } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ClientLayout from "@/components/ClientLayout";

export default function WithdrawalPage() {
  const { user, refreshUser } = useAuth();
  const [balances, setBalances] = useState(null);
  const [settings, setSettings] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, setRes, wdrRes] = await Promise.all([
        api.get("/earnings/summary"),
        api.get("/settings"),
        api.get("/withdrawals/my"),
      ]);
      setBalances(balRes.data);
      setSettings(setRes.data);
      setWithdrawals(wdrRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load withdrawal data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.kyc_status !== "verified") {
      toast.error("You must complete KYC verification before requesting withdrawals.");
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const minWdr = 1000; // Default min withdrawal
    if (val < minWdr) {
      toast.error(`Minimum withdrawal amount is ${formatINR(minWdr)}`);
      return;
    }

    if (val > (balances?.withdrawable_amount || 0)) {
      toast.error("Insufficient withdrawable balance");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/withdrawals", { amount: val });
      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      fetchData();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "under_review": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "approved": return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "paid": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "rejected": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "under_review": return "Under Review";
      case "approved": return "Approved";
      case "paid": return "Paid";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  // Timeline visualizer for single withdrawal
  const renderTimeline = (wdr) => {
    const states = [
      { key: "pending", label: "Requested" },
      { key: "under_review", label: "Reviewing" },
      { key: "approved", label: "Approved" },
      { key: "paid", label: "Paid" }
    ];

    const currentStatus = wdr.status.toLowerCase();
    
    // Find active step index
    let activeIndex = 0;
    if (currentStatus === "under_review") activeIndex = 1;
    else if (currentStatus === "approved") activeIndex = 2;
    else if (currentStatus === "paid") activeIndex = 3;
    else if (currentStatus === "rejected") activeIndex = 2; // Ends at index 2 (Rejected)

    return (
      <div className="flex items-center justify-between w-full max-w-md mx-auto my-4 text-xs font-semibold px-2">
        {states.map((s, idx) => {
          const isDone = currentStatus === "rejected" 
            ? idx < 2 
            : idx <= activeIndex;
          const isActive = idx === activeIndex && currentStatus !== "rejected";
          const isRejected = currentStatus === "rejected" && idx === 2;

          return (
            <div key={s.key} className="flex-1 flex flex-col items-center relative">
              {/* Connection Line */}
              {idx < states.length - 1 && (
                <div 
                  className={`absolute top-3 left-[50%] right-[-50%] h-[2px] transition-all duration-300 ${
                    idx < activeIndex ? "bg-emerald-500" : "bg-slate-800"
                  }`} 
                />
              )}
              {/* Step Circle */}
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold z-10 transition-all ${
                  isRejected
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : isDone
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20 animate-pulse"
                        : "bg-slate-800 text-slate-500"
                }`}
              >
                {isRejected ? "✕" : isDone ? "✓" : idx + 1}
              </div>
              <span className={`mt-2 text-[10px] uppercase tracking-wider font-semibold ${
                isRejected 
                  ? "text-red-400" 
                  : isDone 
                    ? "text-emerald-400" 
                    : isActive 
                      ? "text-blue-400" 
                      : "text-slate-500"
              }`}>
                {isRejected ? "Rejected" : s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ClientLayout>
      <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Withdrawal Hub</h1>
          <p className="text-slate-400 mt-2 text-sm">Manage capital pay-outs, check withdrawable limits, and trace disbursements.</p>
        </div>

        {/* Dashboard Balance stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Balance</h4>
            <h2 className="text-3xl font-bold text-white mt-3">
              {balances ? formatINR(balances.total_earned + balances.unlocked_amount) : "₹0.00"}
            </h2>
            <p className="text-[10px] text-slate-500 mt-2">Includes yields, referrals, and unlocked capital</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Withdrawable Balance</h4>
            <h2 className="text-3xl font-bold text-emerald-400 mt-3">
              {balances ? formatINR(balances.withdrawable_amount) : "₹0.00"}
            </h2>
            <p className="text-[10px] text-slate-500 mt-2">Net of active payouts and pending withdrawals</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/5 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Withdrawal Info</h4>
            <div className="mt-3 space-y-1 text-sm text-white">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Min Withdrawal:</span>
                <span className="font-semibold text-xs">{formatINR(1000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Charges:</span>
                <span className="text-emerald-400 font-semibold text-xs">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Process Time:</span>
                <span className="text-blue-400 font-semibold text-xs">24-48 Business Hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form and Bank Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Request Form */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 border border-white/5 bg-slate-900/40 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6">Request Payout</h3>
            
            {user?.kyc_status !== "verified" ? (
              <div className="text-center p-6 border border-yellow-500/20 bg-yellow-500/5 rounded-2xl space-y-3">
                <span className="text-3xl">🔒</span>
                <h4 className="text-yellow-400 font-bold">KYC Verification Required</h4>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  KYC reviews must be approved before withdrawals can be initiated. Please complete KYC under your Profile tab first.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Withdrawal Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-[50%] translate-y-[-50%] text-slate-500 text-lg font-bold">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="1000"
                      step="any"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-500 font-bold focus:outline-none focus:border-blue-500 transition-all text-base"
                    />
                  </div>
                </div>

                {/* Bank account confirmation */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">🏦</span>
                    <h5 className="text-white text-xs font-bold uppercase tracking-wider">Destination Bank Details</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Account Holder:</span>
                      <p className="text-white font-semibold mt-0.5 truncate">{user?.account_holder || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Bank Name:</span>
                      <p className="text-white font-semibold mt-0.5 truncate">{user?.bank_name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Account Number:</span>
                      <p className="text-white font-semibold mt-0.5 truncate">{user?.account_number || "—"}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">IFSC Code:</span>
                      <p className="text-white font-semibold mt-0.5 uppercase">{user?.ifsc || "—"}</p>
                    </div>
                  </div>
                  {(!user?.account_number || !user?.ifsc) && (
                    <p className="text-[10px] text-red-400 mt-1">⚠️ Missing bank coordinates. Please fill your bank details in Profile settings.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !user?.account_number || !user?.ifsc}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Request...
                    </>
                  ) : (
                    "Submit Withdrawal Request"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Notes / Policy Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/5 bg-slate-900/40 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>⚠️</span> Withdrawal Rules & Terms
              </h3>
              <ul className="space-y-3 text-xs text-slate-400 list-disc list-inside">
                <li>Withdrawal requests are processed during standard working days.</li>
                <li>Payouts are disbursed via secure direct Bank Transfer (IMPS/NEFT) only.</li>
                <li>Capital principal deposits remain locked for **6 Months** from their approved date before being eligible for unlocking.</li>
                <li>Earned monthly profits and referral commissions are always unlocked and available.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Withdrawal Ledger / Status Timelines */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 bg-slate-900/40 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-6">Recent Withdrawal Requests</h3>
          {withdrawals.length === 0 ? (
            <div className="text-center p-8 border border-white/5 bg-slate-950/20 rounded-xl">
              <p className="text-slate-500 text-sm">No withdrawals requested yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mobile layout (list of status timelines) */}
              <div className="space-y-4">
                {withdrawals.map((w) => (
                  <div key={w.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold">Date:</span>
                        <p className="text-white mt-0.5">{formatDate(w.requested_at)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Amount:</span>
                        <p className="text-white mt-0.5 font-bold text-sm text-emerald-400">{formatINR(w.amount)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-right">Status:</span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] mt-0.5 font-semibold ${getStatusClass(w.status)}`}>
                          {getStatusLabel(w.status)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline stepper */}
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3 text-center">Processing Timeline</p>
                      {renderTimeline(w)}
                    </div>

                    {/* Transaction ID if available */}
                    {w.transaction_id && (
                      <div className="bg-slate-900/50 rounded-lg p-2.5 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 uppercase font-bold">Transaction ID:</span>
                        <span className="text-white font-mono">{w.transaction_id}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
