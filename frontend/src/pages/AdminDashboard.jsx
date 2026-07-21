import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api, formatINR, API } from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  Wallet,
  TrendingUp,
  Coins,
  Zap,
  Trash2,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Download,
  X,
  Search,
  UserCheck
} from "lucide-react";
import { useModal } from "@/context/ModalContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

const MetricCard = ({ label, value, sub, icon: Icon, gradientClass, iconColorClass }) => (
  <div className={`kanak-card p-6 flex flex-col justify-between h-36 ${gradientClass || "bg-white"}`}>
    <div className="flex items-start justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className={`p-2.5 rounded-xl ${iconColorClass || "bg-blue-50 text-blue-700"}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <div className="font-mono-num text-2xl font-bold text-slate-800 mt-2">{value}</div>
      {sub && <div className="text-[10px] font-semibold text-slate-400 mt-1">{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const modal = useModal();
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [rate, setRate] = useState("0.10");
  const [flat, setFlat] = useState("");
  const [bulking, setBulking] = useState(false);

  // Excel Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(String(new Date().getMonth() + 1));
  const [exportYear, setExportYear] = useState(String(new Date().getFullYear()));
  const [exportStatus, setExportStatus] = useState("All");
  const [exportClientName, setExportClientName] = useState("");
  const [exportScope, setExportScope] = useState("all");
  const [exporting, setExporting] = useState(false);
  
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const load = async () => {
    try {
      const [s, c] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/daily-chart?days=30")
      ]);
      setStats(s.data);
      setChart(c.data);
    } catch (e) {
      console.error("Admin dashboard load failed:", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openExportModal = async () => {
    setShowExportModal(true);
    setLoadingClients(true);
    try {
      const { data } = await api.get("/admin/clients");
      setClients(data);
    } catch (e) {
      toast.error("Failed to load client selector list");
    } finally {
      setLoadingClients(false);
    }
  };

  const handleDownloadReport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const params = {
        month: exportMonth,
        year: exportYear,
        payment_status: exportStatus
      };
      if (exportClientName) {
        params.client_name = exportClientName;
      }
      if (exportScope === "selected" && selectedIds.length > 0) {
        params.client_ids = selectedIds.join(",");
      }

      const response = await api.get("/admin/reports/monthly-payout", {
        params,
        responseType: "blob"
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kanak_Monthly_Report_${exportYear}_${exportMonth}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Monthly report downloaded successfully!");
      setShowExportModal(false);
    } catch (e) {
      console.error("Monthly report export failed:", e);
      toast.error(e.response?.data?.detail || e.message || "Failed to download monthly report");
    } finally {
      setExporting(false);
    }
  };

  const toggleSelectClientId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const bulkCredit = async (mode) => {
    setBulking(true);
    try {
      const body =
        mode === "flat"
          ? { flat_amount: parseFloat(flat), note: `Manual flat credit ₹${flat}` }
          : { rate_percent: parseFloat(rate), note: `Manual daily interest ${rate}%` };
      const { data } = await api.post("/admin/bulk-credit-profit", body);
      toast.success(`Credited ${data.credited_clients} clients · Total: ${formatINR(data.total_credited)}`);
      setFlat("");
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to issue bulk credit");
    } finally {
      setBulking(false);
    }
  };

  const clearHistory = async () => {
    const yes1 = await modal.confirm(
      "Wipe ALL deposits, profits, withdrawals? This cannot be undone.",
      "Wipe History Ledger",
      "delete",
      { confirmLabel: "Wipe Ledger", cancelLabel: "Cancel" }
    );
    if (!yes1) return;
    
    const yes2 = await modal.confirm(
      "Are you absolutely sure? All clients will lose their history!",
      "Critical Warning",
      "warning",
      { confirmLabel: "Yes, Purge Everything", cancelLabel: "No, Stop" }
    );
    if (!yes2) return;

    try {
      await api.post("/admin/reset-history");
      toast.success("All transaction histories cleared!");
      await load();
    } catch (e) {
      toast.error("Failed to clear ledger history");
    }
  };

  const formatCrores = (val) => {
    if (!val) return "₹0.00 Cr";
    const cr = val / 10000000;
    return `₹${cr.toFixed(2)} Cr`;
  };

  const pieData = [
    { name: "Deposits", value: stats?.active_principal || 126200000, color: "#002FA7" },
    { name: "Withdrawals", value: stats?.total_payout || 4820000, color: "#6366F1" },
    { name: "Pending", value: stats?.pending_deposits * 100000 || 12500000, color: "#38BDF8" }
  ];

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(clientSearchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.client_id?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-dashboard">
        {/* Header greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <span>Good Morning, 👋</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              Kanak Admin
              <ShieldCheck className="w-6 h-6 text-blue-600 inline" />
            </h1>
          </div>
          <button
            onClick={openExportModal}
            className="p-3.5 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" /> Download Monthly Payout Report
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Clients"
            value={stats?.total_clients ?? 0}
            sub="+ 24 this week"
            icon={Users}
            iconColorClass="bg-purple-50 text-purple-700"
            testId="admin-metric-clients"
          />
          <MetricCard
            label="Total Revenue"
            value={formatCrores(stats?.total_revenue || 0)}
            sub="+ 18.5% this month"
            icon={Wallet}
            iconColorClass="bg-emerald-50 text-emerald-700"
            testId="admin-metric-revenue"
          />
          <MetricCard
            label="Total Paid Out"
            value={formatCrores(stats?.total_payout || 0)}
            sub="+ 12.4% this month"
            icon={TrendingUp}
            iconColorClass="bg-blue-50 text-blue-700"
            testId="admin-metric-payout"
          />
          <MetricCard
            label="Monthly Payout"
            value={formatINR(stats?.monthly_payout || 0)}
            sub={`${stats?.pending_withdrawals || 0} withdrawals pending`}
            icon={Coins}
            iconColorClass="bg-orange-50 text-orange-700"
            testId="admin-metric-today-payout"
          />
        </div>

        {/* Bulk Profit Operations Panel */}
        <div className="kanak-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6" data-testid="bulk-credit-panel">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-700 text-white rounded-2xl shadow-md shadow-blue-500/10">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Bulk Credit Daily Profit</h3>
              <p className="text-xs text-slate-400 mt-0.5">Credit a % of principal to every approved client at once.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-xs font-semibold w-full sm:w-auto">
              <span className="text-slate-400 mr-2">Rate %</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-16 bg-transparent outline-none text-slate-800 font-mono font-bold text-right"
              />
              <button
                onClick={() => bulkCredit("rate")}
                disabled={bulking || !rate}
                className="ml-3 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg active:scale-95 transition"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-xs font-semibold w-full sm:w-auto">
              <span className="text-slate-400 mr-2">Flat ₹</span>
              <input
                type="number"
                min="1"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="Amount"
                className="w-20 bg-transparent outline-none text-slate-800 font-mono font-bold text-right"
              />
              <button
                onClick={() => bulkCredit("flat")}
                disabled={bulking || !flat}
                className="ml-3 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg active:scale-95 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="kanak-card p-6 lg:col-span-2 flex flex-col justify-between" data-testid="revenue-chart">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Revenue Stream</span>
                <h2 className="text-base font-bold text-slate-800">Operational Inflows</h2>
              </div>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002FA7" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#002FA7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip formatter={(v) => [formatCrores(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#002FA7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kanak-card p-6 flex flex-col justify-between" data-testid="donut-chart">
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Capital proration</span>
              <h2 className="text-base font-bold text-slate-800">Funds Allocation</h2>
            </div>
            <div className="relative flex items-center justify-center" style={{ height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Volume</span>
                <span className="text-base font-bold text-slate-800 mt-0.5">{formatCrores(stats?.total_revenue || 0)}</span>
              </div>
            </div>
            <div className="space-y-2 mt-4 text-xs font-semibold">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-500">{item.name}</span>
                  </div>
                  <span className="text-slate-800 font-mono">{formatCrores(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Top Referrers & System Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="kanak-card p-6 flex flex-col justify-between" data-testid="top-referrers">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Leaderboard</span>
                  <h2 className="text-base font-bold text-slate-800">Top Referrers</h2>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { rank: 1, name: "Rajesh Kumar", initials: "RK", clients: 48, earnings: 420000 },
                  { rank: 2, name: "Anita Sharma", initials: "AS", clients: 35, earnings: 285000 },
                  { rank: 3, name: "Vikram Singh", initials: "VS", clients: 29, earnings: 190000 }
                ].map((ref) => (
                  <div key={ref.rank} className="flex items-center justify-between text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">{ref.rank}</span>
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {ref.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{ref.name}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{ref.clients} Clients referred</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-slate-400 font-medium">Earnings generated</div>
                      <span className="font-mono-num font-bold text-emerald-600 text-xs">{formatINR(ref.earnings)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="kanak-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">System audit</span>
                  <h2 className="text-base font-bold text-slate-800">Recent Activities</h2>
                </div>
                <button className="text-xs text-blue-700 font-semibold hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                {[
                  { text: "Profit credited to 150 clients", time: "2 min ago", sub: "₹1,50,000 distributed", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
                  { text: "New client registered", time: "15 min ago", sub: "Referral ID: KANAK123", icon: Users, color: "bg-blue-50 text-blue-600" },
                  { text: "Withdrawal request", time: "1 hr ago", sub: "₹25,000 by Client ID: C1024", icon: ArrowUpRight, color: "bg-purple-50 text-purple-700" },
                  { text: "KYC Approved", time: "2 hrs ago", sub: "Client ID: C1018", icon: UserCheck, color: "bg-orange-50 text-orange-600" }
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex gap-3 text-xs items-start">
                      <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-700 leading-none truncate">{act.text}</div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-none">{act.sub}</div>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 mt-0.5">{act.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Global configuration purge utility */}
        <div className="flex justify-end pt-4">
          <button
            onClick={clearHistory}
            className="p-3 text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" /> Reset Platform Data History
          </button>
        </div>
      </div>

      {/* Export Report Filter Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in-up relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-6 right-6 p-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Export Ledger</span>
              <h2 className="text-xl font-bold text-slate-800">Monthly Payout Report</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure payout parameters and download report statements for profit yield distributions and referral network earnings.
              </p>

              <div className="mt-5 space-y-4">
                {/* Month and Year Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Month</label>
                    <select
                      value={exportMonth}
                      onChange={(e) => setExportMonth(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold bg-white"
                    >
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Year</label>
                    <select
                      value={exportYear}
                      onChange={(e) => setExportYear(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold bg-white"
                    >
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                    </select>
                  </div>
                </div>

                {/* Client Name Filter */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Filter by Name (Optional)</label>
                  <input
                    type="text"
                    value={exportClientName}
                    onChange={(e) => setExportClientName(e.target.value)}
                    placeholder="Enter client name query..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
                  />
                </div>

                {/* Payout Status Selector */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Payment Status</label>
                  <select
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold bg-white"
                  >
                    <option value="All">All Transactions</option>
                    <option value="Paid">Paid Out Ledger Only</option>
                    <option value="Pending">Awaiting Payout (Pending)</option>
                  </select>
                </div>

                {/* Scope Selection */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Export Scope</label>
                  <div className="flex items-center gap-6 mt-1.5 text-xs font-semibold text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportScope === "all"}
                        onChange={() => setExportScope("all")}
                        className="text-blue-700 focus:ring-blue-700"
                      />
                      <span>All Clients</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exportScope"
                        checked={exportScope === "selected"}
                        onChange={() => setExportScope("selected")}
                        className="text-blue-700 focus:ring-blue-700"
                      />
                      <span>Selected Clients</span>
                    </label>
                  </div>
                </div>

                {/* Selective Client List checkbox box */}
                {exportScope === "selected" && (
                  <div className="space-y-2.5 border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Select Target Clients ({selectedIds.length})</span>
                      <div className="relative w-36">
                        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full pl-7 pr-2 py-1 border border-slate-200 rounded-lg text-[10px] focus:outline-none bg-white font-medium"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {loadingClients ? (
                        <div className="text-center py-6 text-[10px] text-slate-400 font-medium">Loading client directory...</div>
                      ) : filteredClients.length === 0 ? (
                        <div className="text-center py-6 text-[10px] text-slate-400 font-medium">No clients found matching query.</div>
                      ) : (
                        filteredClients.map(c => (
                          <label key={c.id} className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(c.id)}
                                onChange={() => toggleSelectClientId(c.id)}
                                className="rounded text-blue-700 focus:ring-blue-700 w-3.5 h-3.5 border-slate-300"
                              />
                              <div className="text-slate-800 font-bold">{c.name}</div>
                            </div>
                            <span className="font-mono text-[9px] text-slate-400">{c.client_id}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDownloadReport}
                  disabled={exporting || (exportScope === "selected" && selectedIds.length === 0)}
                  className="w-full py-3.5 text-xs font-semibold text-white kanak-gradient-btn flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-60"
                >
                  {exporting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      Generating Excel Statement...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Report Statement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
