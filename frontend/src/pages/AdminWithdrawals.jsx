import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api, formatINR, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { Check, X, Clock, Landmark, CreditCard, User, LandmarkIcon } from "lucide-react";
import { useModal } from "@/context/ModalContext";

export default function AdminWithdrawals() {
  const modal = useModal();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/withdrawals/pending");
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusUpdate = async (id, status, transactionId = "") => {
    try {
      await api.post(`/admin/withdrawals/${id}/status`, { status, transaction_id: transactionId });
      toast.success(`Withdrawal status updated to ${status}`);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-withdrawals-page">
        {/* Header */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payout processing</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Withdrawal Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and clear cash-out requests. Process status updates through Requested, Under Review, Approved, and Paid.
          </p>
        </div>

        {/* Ledger Table */}
        <div className="kanak-card p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Client Details</th>
                  <th className="py-4 px-4">Destination Bank Account</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Requested Date</th>
                  <th className="py-4 px-4 text-center">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                      Loading withdrawals list...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No active withdrawal requests.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-slate-800">{r.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{r.user_email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] max-w-xs space-y-1">
                          <div className="flex items-center gap-1.5"><LandmarkIcon className="w-3.5 h-3.5 text-slate-400" /><span className="font-semibold text-slate-700">{r.bank_name || "—"}</span></div>
                          <div className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-400" /><span className="font-mono font-bold text-slate-700">{r.account_number || "—"}</span></div>
                          <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-500">{r.account_holder || "—"}</span></div>
                          <div className="text-slate-400 pl-5">IFSC: <span className="font-mono font-bold text-slate-600">{r.ifsc || "—"}</span></div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono-num font-bold text-slate-800 text-right">
                        {formatINR(r.amount)}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                        {formatDate(r.requested_at)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            r.status === "pending" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                            r.status === "under_review" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse" :
                            r.status === "approved" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                            r.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {r.status === "pending" ? "Requested" : r.status === "under_review" ? "Reviewing" : r.status}
                          </span>

                          <div className="flex items-center justify-center gap-2">
                            {r.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(r.id, "under_review")}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(r.id, "rejected")}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {r.status === "under_review" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(r.id, "approved")}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(r.id, "rejected")}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {r.status === "approved" && (
                              <button
                                onClick={() => {
                                  (async () => {
                                    const tx = await modal.prompt(
                                      "Enter Bank Transaction ID (Optional):",
                                      "",
                                      "Submit Payout Proof",
                                      { placeholder: "e.g. TXN987654321", confirmLabel: "Submit", cancelLabel: "Cancel" }
                                    );
                                    if (tx !== null) {
                                      handleStatusUpdate(r.id, "paid", tx);
                                    }
                                  })();
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
