import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api, formatINR, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { Check, X, Clock, ShieldAlert, Image as ImageIcon, Eye } from "lucide-react";

export default function AdminPending() {
  const [activeTab, setActiveTab] = useState("deposits");
  const [deposits, setDeposits] = useState([]);
  const [kycClients, setKycClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [depRes, clientRes] = await Promise.all([
        api.get("/admin/deposits/pending"),
        api.get("/admin/clients")
      ]);
      setDeposits(depRes.data);
      
      const pendingKyc = clientRes.data.filter(
        (c) => c.kyc_status === "pending" && (c.aadhaar_number || c.pan_number || c.aadhaar_front)
      );
      setKycClients(pendingKyc);
    } catch (e) {
      console.error("Approvals load failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDepositAction = async (id, action) => {
    try {
      await api.post(`/admin/deposits/${id}/${action}`);
      toast.success(`Deposit request successfully ${action}ed.`);
      setSelectedDeposit(null);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Action failed");
    }
  };

  const handleKycAction = async (id, status) => {
    try {
      await api.post(`/admin/clients/${id}/kyc`, { status });
      toast.success(`KYC status updated to ${status} for this client.`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update KYC status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-pending-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Review center</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Pending Approvals</h1>
            <p className="text-slate-500 text-sm mt-1">
              Verify incoming deposit payments and client identity KYC documents.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-6 py-3.5 text-xs font-semibold capitalize border-b-2 transition-all ${
              activeTab === "deposits"
                ? "border-blue-700 text-blue-700 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Pending Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab("kyc")}
            className={`px-6 py-3.5 text-xs font-semibold capitalize border-b-2 transition-all ${
              activeTab === "kyc"
                ? "border-blue-700 text-blue-700 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            KYC Approvals ({kycClients.length})
          </button>
        </div>

        {/* Tab 1: Deposits */}
        {activeTab === "deposits" && (
          <div className="kanak-card p-6 overflow-hidden" data-testid="admin-pending-table">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-4">Client</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4">Transfer Date</th>
                    <th className="py-4 px-4 text-center">Audit Details</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        Loading pending deposits list...
                      </td>
                    </tr>
                  ) : deposits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No pending deposit requests.
                      </td>
                    </tr>
                  ) : (
                    deposits.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`pending-row-${r.id}`}>
                        <td className="py-4 px-4 text-slate-800 font-bold">{r.user_name}</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{r.user_email}</td>
                        <td className="py-4 px-4 font-mono-num font-bold text-slate-800 text-right">{formatINR(r.amount)}</td>
                        <td className="py-4 px-4 text-slate-500 font-medium">{r.deposit_date || formatDate(r.deposited_at)}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => setSelectedDeposit(r)}
                            className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg inline-flex items-center text-slate-600 transition shadow-sm"
                            title="Audit Receipt and Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDepositAction(r.id, "approve")}
                              data-testid={`approve-${r.id}`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition active:scale-95"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleDepositAction(r.id, "reject")}
                              data-testid={`reject-${r.id}`}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition active:scale-95"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: KYC */}
        {activeTab === "kyc" && (
          <div className="kanak-card p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-4">Client Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Aadhaar / PAN</th>
                    <th className="py-4 px-4">Joined Date</th>
                    <th className="py-4 px-4 text-center">View Documents</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        Loading pending KYC accounts list...
                      </td>
                    </tr>
                  ) : kycClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        No unverified client KYC profiles pending.
                      </td>
                    </tr>
                  ) : (
                    kycClients.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-slate-800 font-bold">{c.name}</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{c.email}</td>
                        <td className="py-4 px-4 space-y-1">
                          <div className="text-[10px] text-slate-500 font-medium">
                            <span className="font-semibold">Aadhaar:</span> {c.aadhaar_number || "—"}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            <span className="font-semibold">PAN:</span> {c.pan_number || "—"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium">{formatDate(c.created_at)}</td>
                        <td className="py-4 px-4 text-center">
                          <Link
                            to={`/admin/clients/${c.id}`}
                            className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg inline-flex items-center text-slate-600 transition shadow-sm"
                            title="Inspect KYC Images"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleKycAction(c.id, "verified")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition active:scale-95"
                            >
                              <Check className="w-3 h-3" /> Verify
                            </button>
                            <button
                              onClick={() => handleKycAction(c.id, "rejected")}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition active:scale-95"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Audit Detail Dialog */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-fade-in-up relative">
            <button
              onClick={() => setSelectedDeposit(null)}
              className="absolute top-6 right-6 p-2 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Audit verification</span>
              <h2 className="text-xl font-bold text-slate-800">Deposit Audit Log</h2>
              
              {/* Transaction Metadata */}
              <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Client Name</span>
                  <span className="font-bold text-slate-800">{selectedDeposit.user_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Client Email</span>
                  <span className="font-medium text-slate-600 break-all">{selectedDeposit.user_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Requested Amount</span>
                  <span className="font-mono-num font-bold text-slate-800">{formatINR(selectedDeposit.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Payment Method</span>
                  <span className="font-bold text-slate-800">{selectedDeposit.payment_method || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Transaction ID / UTR</span>
                  <span className="font-mono font-bold text-slate-800">{selectedDeposit.transaction_id || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider">Transfer Date</span>
                  <span className="font-bold text-slate-800">{selectedDeposit.deposit_date || formatDate(selectedDeposit.deposited_at)}</span>
                </div>
                {selectedDeposit.remarks && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider">Client Remarks</span>
                    <span className="font-medium text-slate-700">{selectedDeposit.remarks}</span>
                  </div>
                )}
              </div>

              {/* Receipt screenshot preview */}
              <div className="mt-5 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Payment Proof Screenshot</span>
                <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-100 max-h-60 flex items-center justify-center p-2">
                  {selectedDeposit.payment_screenshot ? (
                    <a href={selectedDeposit.payment_screenshot} target="_blank" rel="noreferrer" className="w-full h-full flex justify-center">
                      <img src={selectedDeposit.payment_screenshot} alt="Payment Proof" className="max-h-56 object-contain rounded-lg cursor-zoom-in" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold py-12 flex flex-col items-center gap-1">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      No screenshot uploaded.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => handleDepositAction(selectedDeposit.id, "approve")}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition active:scale-95"
                >
                  <Check className="w-4 h-4" /> Approve Deposit
                </button>
                <button
                  onClick={() => handleDepositAction(selectedDeposit.id, "reject")}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/10 transition active:scale-95"
                >
                  <X className="w-4 h-4" /> Reject Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
