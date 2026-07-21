import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientLayout from "@/components/ClientLayout";
import { api, formatINR, formatDate } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import AnimatedNumber from "@/components/AnimatedNumber";
import { SkeletonCard, SkeletonChart, SkeletonTable } from "@/components/Skeleton";
import {
  Wallet,
  TrendingUp,
  Coins,
  Lock,
  Users,
  ArrowUpRight,
  Clock,
  HelpCircle,
  ShieldCheck,
  Calendar,
  AlertCircle,
  UploadCloud,
  X,
  Copy,
  Check,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MetricCard = ({ label, value, icon: Icon, sub, colorClass, testId }) => (
  <div className="glass-card kanak-card kanak-card-hover p-6 flex flex-col justify-between h-36" data-testid={testId}>
    <div className="flex items-start justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className={`p-2.5 rounded-xl ${colorClass || "bg-blue-50 text-blue-600"} transition-transform duration-300 hover:scale-110`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-800 mt-2">{value}</div>
      {sub && <div className="text-[10px] font-medium text-slate-400 mt-1">{sub}</div>}
    </div>
  </div>
);

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [lockStatus, setLockStatus] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [loading, setLoading] = useState(true);

  const [depositForm, setDepositForm] = useState({
    amount: "",
    payment_method: "",
    transaction_id: "",
    deposit_date: new Date().toISOString().split("T")[0],
    remarks: ""
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, d, dep, wdr, set, locks] = await Promise.all([
        api.get("/earnings/summary"),
        api.get("/earnings/daily?days=30"),
        api.get("/deposits/my"),
        api.get("/withdrawals/my"),
        api.get("/settings"),
        api.get("/deposits/lock-status"),
      ]);
      setSummary(s.data);
      setDaily(d.data);
      setDeposits(dep.data);
      setWithdrawals(wdr.data);
      setSettings(set.data);
      setLockStatus(locks.data);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (location.search.includes("deposit=true")) {
      setShowDepositModal(true);
    }
  }, [location]);


  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositForm.amount);
    const minDep = settings?.min_deposit || 100000;
    if (isNaN(amt) || amt < minDep) {
      toast.error(`Minimum deposit amount is ${formatINR(minDep)}`);
      return;
    }
    if (!previewImage) {
      toast.error("Please upload payment screenshot proof first");
      return;
    }

    setSubmittingDeposit(true);
    try {
      await api.post("/deposits", {
        amount: amt,
        payment_screenshot: previewImage,
        payment_method: depositForm.payment_method,
        transaction_id: depositForm.transaction_id,
        deposit_date: depositForm.deposit_date,
        remarks: depositForm.remarks
      });
      toast.success(`Deposit request of ${formatINR(amt)} submitted! Awaiting clearance.`);
      setDepositForm({
        amount: "",
        payment_method: "",
        transaction_id: "",
        deposit_date: new Date().toISOString().split("T")[0],
        remarks: ""
      });
      setPreviewImage(null);
      setShowDepositModal(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Deposit request failed");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }
    if (amt > (summary?.withdrawable_amount || 0)) {
      toast.error(`Insufficient withdrawable balance. Max limit is ${formatINR(summary?.withdrawable_amount)}`);
      return;
    }

    setSubmittingWithdraw(true);
    try {
      await api.post("/withdrawals", { amount: amt });
      toast.success(`Withdrawal request of ${formatINR(amt)} submitted. Pending approval.`);
      setWithdrawAmount("");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Withdrawal request failed");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Screenshot file size must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // Milestone Calculations
  const principalVal = summary?.principal || 0;
  let vipTier = "Bronze";
  let vipProgressPct = 0;
  if (principalVal >= 1000000) {
    vipTier = "Platinum VIP";
    vipProgressPct = 100;
  } else if (principalVal >= 500000) {
    vipTier = "Gold";
    vipProgressPct = Math.round(((principalVal - 500000) / 500000) * 100);
  } else if (principalVal >= 100000) {
    vipTier = "Silver";
    vipProgressPct = Math.round(((principalVal - 100000) / 400000) * 100);
  } else {
    vipTier = "Bronze";
    vipProgressPct = Math.round((principalVal / 100000) * 100);
  }

  const filledFieldsCount = [
    user?.name,
    user?.email,
    user?.phone || user?.company_sms,
    user?.address_line1,
    user?.bank_name,
    user?.account_number,
    user?.ifsc,
    user?.nominee
  ].filter(Boolean).length;
  const profileProgressPct = Math.round((filledFieldsCount / 8) * 100);

  const investProgressPct = Math.min(Math.round((principalVal / 500000) * 100), 100);
  const referralProgressPct = Math.min(Math.round(((summary?.referral_count || 0) / 10) * 100), 100);

  if (loading) {
    return (
      <ClientLayout>
        <div className="space-y-8 animate-skeleton-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SkeletonChart /></div>
            <div><SkeletonCard /></div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Welcome back, {user?.name}
              {user?.kyc_status === "verified" && (
                <ShieldCheck className="w-6 h-6 text-blue-600 inline" title="KYC Verified" />
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your trades, referral commissions, and capital deposits.
            </p>
          </div>

          {/* KYC Status banner */}
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-100/60 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold">KYC Verification:</span>
            <span
              data-testid="client-kyc-badge"
              className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                user?.kyc_status === "verified"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : user?.kyc_status === "rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {user?.kyc_status || "pending"}
            </span>
          </div>
        </div>

        {/* 9 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Principal"
            value={<AnimatedNumber value={summary?.principal || 0} prefix="₹" />}
            icon={Wallet}
            sub="Active invested capital"
            colorClass="bg-blue-50 text-blue-700"
            testId="metric-principal"
          />
          <MetricCard
            label="Total Earned"
            value={<AnimatedNumber value={summary?.total_earned || 0} prefix="₹" />}
            icon={TrendingUp}
            sub="Profits + commissions"
            colorClass="bg-indigo-50 text-indigo-700"
            testId="metric-total-earned"
          />
          <MetricCard
            label="Monthly Credits"
            value={<AnimatedNumber value={summary?.monthly_credits || 0} prefix="₹" />}
            icon={Coins}
            sub="Current calendar month"
            colorClass="bg-emerald-50 text-emerald-700"
            testId="metric-today-earning"
          />
          <MetricCard
            label="Lock Period"
            value={summary?.lock_period || "6 Months"}
            icon={Lock}
            sub="Deposited lock-in duration"
            colorClass="bg-purple-50 text-purple-700"
            testId="metric-lock"
          />
          <MetricCard
            label="Referral Earnings"
            value={<AnimatedNumber value={summary?.total_referral_earned || 0} prefix="₹" />}
            icon={Users}
            sub="Commissions from direct network"
            colorClass="bg-sky-50 text-sky-700"
            testId="metric-ref-earnings"
          />
          <MetricCard
            label="Referrals Count"
            value={<AnimatedNumber value={summary?.referral_count || 0} />}
            icon={Users}
            sub="Direct referred partners"
            colorClass="bg-orange-50 text-orange-700"
            testId="metric-ref-count"
          />
          <MetricCard
            label="Total Withdrawn"
            value={<AnimatedNumber value={summary?.total_withdrawn || 0} prefix="₹" />}
            icon={ArrowUpRight}
            sub="Capital successfully cashed out"
            colorClass="bg-rose-50 text-rose-700"
            testId="metric-withdrawn"
          />
          <MetricCard
            label="Pending Withdrawals"
            value={<AnimatedNumber value={summary?.pending_withdrawals || 0} prefix="₹" />}
            icon={Clock}
            sub="Under admin review"
            colorClass="bg-amber-50 text-amber-700"
            testId="metric-pending-withdrawals"
          />
          <MetricCard
            label="Pending Deposits"
            value={<AnimatedNumber value={summary?.pending_deposits || 0} prefix="₹" />}
            icon={Clock}
            sub="Awaiting bank clearance"
            colorClass="bg-slate-100 text-slate-600"
            testId="metric-pending-deposits"
          />
        </div>

        {/* Row: Active Investments & Lock Progress */}
        {lockStatus && lockStatus.length > 0 && (
          <div className="glass-card kanak-card p-6 space-y-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capital Security</span>
              <h2 className="text-lg font-bold text-slate-800">Active Investment Lock Periods</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lockStatus.map((lock, idx) => {
                const isUnlocked = lock.lock_status === "completed";
                return (
                  <div key={lock.id} className="p-5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Deposit #{idx + 1}</span>
                        <h3 className="text-xl font-bold text-white mt-1">{formatINR(lock.amount)}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isUnlocked 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse"
                      }`}>
                        {isUnlocked ? "✓ Eligible to Withdraw" : "🔒 Capital Locked"}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-2 gap-3 text-xs border-y border-white/5 py-3">
                      <div>
                        <span className="text-slate-500 font-medium">Approval Date:</span>
                        <p className="text-white font-semibold mt-0.5">{formatDate(lock.approved_at)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Expected Unlock Date:</span>
                        <p className="text-white font-semibold mt-0.5">{formatDate(lock.lock_until)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Months Completed:</span>
                        <p className="text-white font-semibold mt-0.5">{lock.months_completed} of {lock.lock_duration_months} Months</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Remaining Period:</span>
                        <p className="text-white font-semibold mt-0.5">
                          {isUnlocked ? "0 Days" : `${lock.months_remaining} Months (${lock.days_remaining} Days)`}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar indicator */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Lock Progress</span>
                        <span>{lock.progress_percent}% Complete</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${lock.progress_percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Monthly Progress checkboxes */}
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Monthly Unlock Timeline</span>
                      <div className="flex gap-2 text-center text-[10px]">
                        {lock.monthly_checklist.map((m) => (
                          <div 
                            key={m.month} 
                            className={`flex-1 py-1.5 rounded-lg border flex flex-col items-center justify-center ${
                              m.status === "completed"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : m.status === "active"
                                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-bold shadow-sm shadow-blue-500/5 ring-1 ring-blue-500/10"
                                  : "bg-slate-900/40 border-slate-800 text-slate-500"
                            }`}
                          >
                            <span className="font-mono-num font-bold">M{m.month}</span>
                            <span className="text-[8px] mt-0.5">
                              {m.status === "completed" ? "✅" : m.status === "active" ? "⏳" : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Status text message */}
                    <div className="pt-2 border-t border-white/5">
                      {isUnlocked ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                            <span>✅</span>
                            <span>Lock Period Completed. You are now eligible to withdraw your investment.</span>
                          </div>
                          <button
                            onClick={() => navigate("/withdrawals")}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition duration-300 text-xs shadow-lg shadow-emerald-500/20"
                          >
                            Request Capital Withdrawal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold bg-purple-500/5 p-2 rounded-xl border border-purple-500/10">
                          <span>🔒</span>
                          <span>Investment currently locked. Remaining: {lock.months_remaining} Months {lock.days_remaining % 30} Days</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 2: Chart & Deposit request triggers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart Card */}
          <div className="glass-card kanak-card p-6 lg:col-span-2 flex flex-col justify-between" data-testid="chart-daily-earning">
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Earnings History</span>
              <h2 className="text-lg font-bold text-slate-800">30-Day Growth Curve</h2>
            </div>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002FA7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#002FA7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v) => [formatINR(v), "Profit"]} labelStyle={{ color: "#0f172a", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="earning" stroke="#002FA7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarning)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deposit Trigger Card */}
          <div className="glass-card kanak-card p-6 flex flex-col justify-between" data-testid="deposit-form">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Invest Capital</span>
              <h2 className="text-lg font-bold text-slate-800">Add Principal Funds</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Commit funds to Kanak Infosys' algorithmic compound generator. Payouts are pro-rated and credited daily.
              </p>
            </div>

            <div className="mt-6">
              {user?.kyc_status !== "verified" ? (
                <div className="p-4 bg-rose-50/70 border border-rose-100/50 rounded-2xl flex gap-3 text-rose-700">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold">KYC Required:</span> Complete identity verification settings to clear deposits.
                    <a href="/profile" className="underline font-semibold block mt-1 hover:text-rose-800">Go to KYC Settings →</a>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full py-3.5 text-xs font-semibold text-white kanak-gradient-btn flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 transition-all btn-ripple"
                >
                  ✅ Deposit Money
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Account details, Milestone Targets & Withdrawals Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdrawable Balance Info */}
          <div className="glass-card kanak-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Locked Balance details</span>
              <h2 className="text-lg font-bold text-slate-800">Funds Liquidation</h2>
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-500 font-medium">Withdrawable Balance</span>
                  </div>
                  <span className="font-mono-num font-bold text-slate-800 text-sm">
                    {formatINR(summary?.withdrawable_amount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-slate-500 font-medium">Earnings Accumulation</span>
                  </div>
                  <span className="font-mono-num font-bold text-slate-800 text-sm">
                    {formatINR(summary?.total_earned || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500 font-medium">Locked Principal</span>
                  </div>
                  <span className="font-mono-num font-bold text-slate-800 text-sm">
                    {formatINR(summary?.locked_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl text-[11px] leading-relaxed text-blue-800/80 flex items-start gap-2.5 border border-blue-100/30 mt-4">
              <InfoIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Daily profits and referral commissions are always available for withdrawal. Deposited principal is locked for 6 months per deposit policies.
              </span>
            </div>
          </div>

          {/* Account Milestone & Achievements Progress Card */}
          <div className="glass-card kanak-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Account Tiers</span>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Milestones & progress</h2>
              
              <div className="space-y-3.5">
                {/* VIP Level Progress */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Tier: {vipTier}</span>
                    <span className="text-slate-800">{vipProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000"
                      style={{ width: `${vipProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Profile Completion */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Profile Completion</span>
                    <span className="text-slate-800">{profileProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${profileProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Investment Milestone */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Invest Goal (₹5L)</span>
                    <span className="text-slate-800">{investProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                      style={{ width: `${investProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Referral Milestone */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-slate-500">Referrals Milestone (10)</span>
                    <span className="text-slate-800">{referralProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${referralProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] text-slate-400 mt-4 leading-relaxed font-semibold">
              Increase active investments and invite affiliates to unlock Gold/Platinum VIP rank and earn yields at higher volume thresholds.
            </div>
          </div>

          {/* Withdrawal Request Form */}
          <div className="glass-card kanak-card p-6" data-testid="withdraw-form">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cashing Out</span>
            <h2 className="text-lg font-bold text-slate-800">Request Payout</h2>

            {!user?.bank_name ? (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold">Missing Bank Details:</span> You must register bank details in your profile to request withdrawals.
                  <a href="/profile" className="underline font-semibold block mt-1 hover:text-amber-900">Configure Bank Account →</a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Registered Bank Destination</label>
                  <div className="border border-slate-100 rounded-xl px-4 py-2.5 bg-slate-50 text-[10px] space-y-0.5">
                    <div><span className="text-slate-400 font-bold">Bank:</span> <span className="font-bold text-slate-700">{user.bank_name}</span></div>
                    <div><span className="text-slate-400 font-bold">Account:</span> <span className="font-mono font-bold text-slate-700">{user.account_number}</span></div>
                    <div><span className="text-slate-400 font-bold">Holder:</span> <span className="font-bold text-slate-700">{user.account_holder}</span></div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Amount to Withdraw (INR)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono-num font-semibold"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1.5 px-1">
                    <span>Max Limit:</span>
                    <span className="font-bold">{formatINR(summary?.withdrawable_amount || 0)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingWithdraw || (summary?.withdrawable_amount || 0) <= 0}
                  className="w-full py-3 text-xs font-semibold text-white kanak-gradient-btn disabled:opacity-50 btn-ripple"
                  data-testid="withdraw-button"
                >
                  {submittingWithdraw ? "Requesting Withdrawal..." : "Submit Withdrawal Request"}
                </button>
              </form>
            )}
          </div>
        </div>


        {/* Row 4: Deposit History Table */}
        <div className="glass-card kanak-card p-6" data-testid="deposit-ledger">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ledger ledger</span>
              <h2 className="text-lg font-bold text-slate-800">Deposit History</h2>
            </div>
          </div>
          {deposits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-100 rounded-2xl">
              No deposit requests registered under this client portal.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Reference ID</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {deposits.map((d) => (
                    <tr key={d.id} className="text-slate-700 font-medium hover:bg-slate-50/50">
                      <td className="py-3 font-mono text-slate-500">{d.id.slice(-8).toUpperCase()}</td>
                      <td className="py-3">{formatDate(d.created_at)}</td>
                      <td className="py-3 font-mono-num font-semibold">{formatINR(d.amount)}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            d.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : d.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Request Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in-up relative">
            <button
              onClick={() => {
                setShowDepositModal(false);
                setPreviewImage(null);
              }}
              className="absolute top-6 right-6 p-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Add Funds</span>
              <h2 className="text-xl font-bold text-slate-800">Deposit Request</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Initiate a deposit to grow your capital. Complete details of transfer below to submit validation screenshot proof.
              </p>

              {/* Company Bank Credentials Card */}
              <div className="mt-5 p-4 bg-blue-50/50 border border-blue-100/30 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Company Bank Coordinates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <div className="text-[9px] text-blue-500/80 uppercase">Bank Name</div>
                    <div className="text-slate-800 flex items-center gap-1">
                      {settings?.company_bank_name || "Kanak Infosys Bank"}
                      <button
                        onClick={() => copyToClipboard(settings?.company_bank_name || "Kanak Infosys Bank", "Bank Name")}
                        className="p-1 hover:bg-white rounded text-blue-700 transition"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] text-blue-500/80 uppercase">Account Holder</div>
                    <div className="text-slate-800 flex items-center gap-1">
                      {settings?.company_account_holder || "Kanak Infosys Ltd"}
                      <button
                        onClick={() => copyToClipboard(settings?.company_account_holder || "Kanak Infosys Ltd", "Account Holder")}
                        className="p-1 hover:bg-white rounded text-blue-700 transition"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] text-blue-500/80 uppercase">Account Number</div>
                    <div className="text-slate-800 flex items-center gap-1 font-mono">
                      {settings?.company_account_number || "9876543210123"}
                      <button
                        onClick={() => copyToClipboard(settings?.company_account_number || "9876543210123", "Account Number")}
                        className="p-1 hover:bg-white rounded text-blue-700 transition"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] text-blue-500/80 uppercase">IFSC Code</div>
                    <div className="text-slate-800 flex items-center gap-1 font-mono">
                      {settings?.company_ifsc || "KNK000123"}
                      <button
                        onClick={() => copyToClipboard(settings?.company_ifsc || "KNK000123", "IFSC Code")}
                        className="p-1 hover:bg-white rounded text-blue-700 transition"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {settings?.company_branch && (
                    <div className="space-y-1">
                      <div className="text-[9px] text-blue-500/80 uppercase">Branch</div>
                      <div className="text-slate-800">{settings.company_branch}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deposit request Form */}
              <form onSubmit={handleDepositSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Deposit Amount (INR)</label>
                    <input
                      type="number"
                      required
                      min={settings?.min_deposit || 100000}
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono-num font-semibold"
                    />
                    <div className="text-[9px] text-slate-400 mt-1 px-1">
                      Minimum limit: {formatINR(settings?.min_deposit || 100000)}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Payment Method</label>
                    <select
                      required
                      value={depositForm.payment_method}
                      onChange={(e) => setDepositForm({ ...depositForm, payment_method: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold bg-white"
                    >
                      <option value="">Select Method...</option>
                      <option value="Bank Transfer">Bank Wire Transfer</option>
                      <option value="IMPS/NEFT">IMPS / NEFT / RTGS</option>
                    </select>
                  </div>


                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Transaction ID / UTR</label>
                    <input
                      type="text"
                      required
                      value={depositForm.transaction_id}
                      onChange={(e) => setDepositForm({ ...depositForm, transaction_id: e.target.value })}
                      placeholder="Enter Txn Reference UTR..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">Transfer Date</label>
                    <input
                      type="date"
                      required
                      value={depositForm.deposit_date}
                      onChange={(e) => setDepositForm({ ...depositForm, deposit_date: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Remarks (Optional)</label>
                  <input
                    type="text"
                    value={depositForm.remarks}
                    onChange={(e) => setDepositForm({ ...depositForm, remarks: e.target.value })}
                    placeholder="E.g. investment for my lockup period..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold"
                  />
                </div>

                {/* Screenshot upload proof */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Transfer Screenshot Proof (Required)</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition relative group bg-slate-50">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {previewImage ? (
                      <div className="space-y-2">
                        <img
                          src={previewImage}
                          alt="Payment Receipt Preview"
                          className="max-h-36 mx-auto rounded-lg shadow-sm border border-slate-100"
                        />
                        <span className="text-[10px] text-blue-700 font-bold hover:underline block">Replace screenshot</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto group-hover:text-blue-700 transition" />
                        <div className="text-xs font-bold text-slate-700">Click to upload transfer screenshot</div>
                        <div className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG (Max size: 2MB)</div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingDeposit || !previewImage}
                  className="w-full py-3.5 text-xs font-semibold text-white kanak-gradient-btn flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50 btn-ripple"
                >
                  {submittingDeposit ? "Submitting..." : "Submit Deposit Request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}

function InfoIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
