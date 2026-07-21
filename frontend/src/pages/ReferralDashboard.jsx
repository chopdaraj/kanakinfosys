import React, { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { api, formatINR, formatDate } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import AnimatedNumber from "@/components/AnimatedNumber";
import { SkeletonCard, SkeletonTable } from "@/components/Skeleton";
import {
  Copy,
  Share2,
  Users,
  Coins,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  Timer,
  Plus,
  Minus,
  Maximize2,
  Search,
  ChevronDown,
  Info
} from "lucide-react";

// Interactive Node Component
const VisualTreeNode = ({ node, searchQuery, level = 1, isLast = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  
  // Highlight if node name or client ID matches search query
  const isMatch = searchQuery && (
    node.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.client_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative pl-6 mt-4 first:mt-0">
      {/* Node connector line */}
      <div className="absolute left-0 top-6 w-6 h-[1.5px] bg-slate-200" />
      {!isLast && (
        <div className="absolute left-0 top-6 bottom-0 w-[1.5px] bg-slate-200" />
      )}

      {/* Node Card */}
      <div className="relative inline-block align-middle select-none">
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 w-72 bg-white ${
            isMatch
              ? "ring-4 ring-amber-400 border-amber-300 scale-105 shadow-lg shadow-amber-500/10"
              : "border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5"
          }`}
        >
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
            {node.name?.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
              {node.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              {node.client_id || "CLIXXXXXX"}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider ${
                node.kyc_status === "verified"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}
            >
              {node.kyc_status === "verified" ? "Verified" : "Pending"}
            </span>
            <div className="text-[10px] font-bold text-slate-700 mt-1">{formatINR(node.principal)}</div>
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-1 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition shrink-0 ml-1"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Hover / Click Detail Card Tooltip */}
        {showTooltip && (
          <div className="absolute left-0 mt-2.5 z-30 w-80 p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3 pointer-events-auto border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Node Details</span>
              <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-md font-bold uppercase">
                Level {level} Referral
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-semibold">{node.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Principal Investment:</span> <span className="font-bold text-emerald-400">{formatINR(node.principal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Status Badge:</span> <span className="font-bold capitalize">{node.kyc_status || "pending"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Sub-Network Count:</span> <span className="font-bold">{node.children?.length || 0} direct downlines</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Render children sub-nodes */}
      {hasChildren && isOpen && (
        <div className="ml-2 pl-4 border-l border-slate-100 mt-2 relative">
          {node.children.map((child, idx) => (
            <VisualTreeNode
              key={child.id}
              node={child}
              searchQuery={searchQuery}
              level={level + 1}
              isLast={idx === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tree Canvas Controls
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/referrals/summary"),
      api.get("/referrals/my")
    ])
      .then(([sumRes, treeRes]) => {
        setSummary(sumRes.data);
        setTree(treeRes.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load referral data:", e);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyRefLink = () => {
    if (!user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral registration link copied!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Kanak Infosys",
        text: `Use my referral code ${user?.referral_code} to invest and earn daily yields!`,
        url: `${window.location.origin}/register?ref=${user?.referral_code}`,
      })
      .catch(console.error);
    } else {
      copyRefLink();
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.6));
  const resetZoom = () => setZoom(1);

  if (loading) {
    return (
      <ClientLayout>
        <div className="space-y-8 animate-skeleton-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><SkeletonTable rows={5} /></div>
            <div><SkeletonCard /></div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-8" data-testid="referrals-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Partner network</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Referrals & Affiliates</h1>
            <p className="text-slate-500 text-sm mt-1">
              Invite friends to invest and earn a 1% monthly commission for 12 months.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyRefLink}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all btn-ripple"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all btn-ripple"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card kanak-card p-6 flex flex-col justify-between h-36">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Referral Income</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                <AnimatedNumber value={summary?.total_earnings || 0} prefix="₹" />
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-1">Total commission credited</div>
            </div>
          </div>

          <div className="glass-card kanak-card p-6 flex flex-col justify-between h-36">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Monthly Earnings</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                <AnimatedNumber value={summary?.monthly_commission_estimate || 0} prefix="₹" />
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-1">1% of active direct principal</div>
            </div>
          </div>

          <div className="glass-card kanak-card p-6 flex flex-col justify-between h-36">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Growth</span>
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 mt-2">
                <AnimatedNumber value={summary?.direct_count || 0} /> <span className="text-xs text-slate-400 font-medium">Direct</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-1">Direct referred members</div>
            </div>
          </div>
        </div>

        {/* Network Breakdown & Tree Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Organization hierarchy tree (Left) */}
          <div className="glass-card kanak-card p-6 lg:col-span-2 flex flex-col justify-between min-h-[550px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Visual Organization</span>
                  <h2 className="text-lg font-bold text-slate-800">Your Affiliation Tree</h2>
                </div>
                
                {/* Search & Canvas Zoom Controls Panel */}
                <div className="flex items-center gap-3">
                  {/* Search box filter */}
                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search node..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  {/* Zoom controls */}
                  <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50 p-1">
                    <button onClick={zoomOut} className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition" title="Zoom Out">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[9px] font-bold text-slate-400 px-1.5 min-w-8 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={zoomIn} className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition" title="Zoom In">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={resetZoom} className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition ml-1" title="Reset Zoom">
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Infinite Interactive Tree Canvas */}
              <div className="overflow-auto bg-slate-50/50 rounded-2xl p-6 min-h-[400px] border border-slate-100 relative">
                {!tree || Object.keys(tree).length === 0 || !tree.children || tree.children.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-xs text-slate-400">
                    <UserPlus className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                    No downline members registered under your network yet. 
                    <button onClick={copyRefLink} className="underline text-blue-700 font-bold block mt-2 hover:text-blue-800">Copy your Invite Link →</button>
                  </div>
                ) : (
                  <div 
                    className="origin-left transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* Root Self Node */}
                    <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-100/30 p-3 rounded-2xl w-72 mb-2 relative">
                      <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        YOU
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{tree.name} (You)</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{tree.client_id}</div>
                      </div>
                      <div className="absolute left-5 top-12 bottom-0 w-[1.5px] bg-slate-200 h-6" />
                    </div>

                    {/* Children List */}
                    <div className="ml-5 pl-1 border-l border-slate-200">
                      {tree.children.map((child, idx) => (
                        <VisualTreeNode
                          key={child.id}
                          node={child}
                          searchQuery={searchQuery}
                          level={1}
                          isLast={idx === tree.children.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50/40 rounded-xl text-[10px] text-blue-800 border border-blue-100/30 mt-4 leading-relaxed font-semibold">
              <Info className="w-4 h-4 shrink-0 text-blue-700" />
              <span>Hover or tap on node cards in the tree network chart to review detailed investor yield metrics. Use search filters to trace sub-partners instantly.</span>
            </div>
          </div>

          {/* Commission history logs (Right) */}
          <div className="glass-card kanak-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Affiliate earnings</span>
              <h2 className="text-lg font-bold text-slate-800">Commission Log</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4">Real-time daily credits received from referred principal.</p>

              {!summary?.history || summary.history.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No commission payouts received yet.
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
                  {summary.history.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl flex items-center justify-between text-xs hover:border-indigo-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-700 truncate">{h.referred_user_name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Timer className="w-3 h-3 text-slate-400" />
                          Credited: {formatDate(h.credited_at)}
                        </div>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <span className="font-mono-num font-bold text-emerald-600">+{formatINR(h.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 rounded-2xl text-[10px] leading-relaxed text-slate-500 flex items-start gap-2 border border-slate-100 mt-4 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Commissions expire exactly 12 months after the referred client registration. All payouts are automatically computed and credited.
              </span>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
