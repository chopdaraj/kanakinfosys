import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { api, formatINR, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Coins, Landmark, User, FileText, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

const Row = ({ label, value, mono }) => (
  <div className="flex justify-between py-2.5 border-b border-slate-50 last:border-0 text-xs">
    <span className="text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
    <span className={`font-semibold text-slate-800 ${mono ? "font-mono-num" : ""}`}>{value || "—"}</span>
  </div>
);

export default function AdminClientDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/clients/${id}`);
      setDetail(data);
      setEditForm({
        name: data.user.name || "",
        email: data.user.email || "",
        address_line1: data.user.address_line1 || "",
        address_line2: data.user.address_line2 || "",
        bank_name: data.user.bank_name || "",
        account_holder: data.user.account_holder || "",
        account_number: data.user.account_number || "",
        ifsc: data.user.ifsc || "",
        branch_name: data.user.branch_name || "",
        nominee: data.user.nominee || "",
        aadhaar_number: data.user.aadhaar_number || "",
        pan_number: data.user.pan_number || "",
      });
    } catch (e) {
      console.error("Client detail load failed:", e);
    }
  }, [id]);

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/clients/${id}`, editForm);
      toast.success("Client data updated successfully.");
      setEditing(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update client details");
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const creditProfit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast.error("Please enter a valid amount");
    setSubmitting(true);
    try {
      await api.post(`/admin/clients/${id}/credit-profit`, { amount: amt, note });
      toast.success(`Credited ${formatINR(amt)} to client balance.`);
      setAmount("");
      setNote("");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to credit profit");
    } finally {
      setSubmitting(false);
    }
  };

  const updateKycStatus = async (status) => {
    try {
      await api.post(`/admin/clients/${id}/kyc`, { status });
      toast.success(`KYC status updated to ${status}.`);
      await load();
    } catch (e) {
      toast.error("Failed to update KYC status");
    }
  };

  if (!detail) {
    return (
      <AdminLayout>
        <div className="text-slate-400 text-xs">Loading client auditor...</div>
      </AdminLayout>
    );
  }

  const u = detail.user;
  const badgeClass = (s) => {
    const S = (s || "pending").toUpperCase();
    if (S === "APPROVED" || S === "VERIFIED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (S === "REJECTED") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-client-detail-page">
        {/* Back Link & Header */}
        <div>
          <Link
            to="/admin/clients"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-700 transition"
            data-testid="back-to-clients"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Client Register
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Client Auditor</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
                {u.name}
                {u.kyc_status === "verified" && <ShieldCheck className="w-6 h-6 text-blue-600 inline" />}
              </h1>
              <p className="text-slate-400 text-xs mt-1">Email: {u.email} · Ref Code: {u.referral_code}</p>
            </div>
            
            {/* KYC Controls */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold">KYC Verification:</span>
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border uppercase ${badgeClass(u.kyc_status)}`}>
                {u.kyc_status || "pending"}
              </span>
              <button
                onClick={() => updateKycStatus("verified")}
                data-testid="kyc-verify"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase transition"
              >
                Verify
              </button>
              <button
                onClick={() => updateKycStatus("rejected")}
                data-testid="kyc-reject"
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold uppercase transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity & Bank Form Info */}
          <div className="kanak-card p-6 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Identity & Bank Coordinates</h3>
              <button
                onClick={() => setEditing(!editing)}
                data-testid="edit-client-toggle"
                className="text-xs px-3 py-1 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {editing ? (
              <form onSubmit={saveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="edit-client-form">
                {Object.keys(editForm).map((k) => (
                  <div key={k}>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {k.replace(/_/g, " ")}
                    </label>
                    <input
                      value={editForm[k] || ""}
                      onChange={(e) => setEditForm({ ...editForm, [k]: e.target.value })}
                      data-testid={`edit-${k}`}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    data-testid="edit-client-save"
                    className="w-full py-2.5 text-xs font-semibold text-white kanak-gradient-btn"
                  >
                    Save Edited Settings
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <Row label="Aadhaar" value={u.aadhaar_number} mono />
                  <Row label="PAN" value={u.pan_number} mono />
                  <Row label="Address 1" value={u.address_line1} />
                  <Row label="Address 2" value={u.address_line2} />
                  <Row label="Referred By" value={u.referred_by_code || "—"} mono />
                </div>
                <div>
                  <Row label="Bank Name" value={u.bank_name} />
                  <Row label="Account Holder" value={u.account_holder} />
                  <Row label="Account No" value={u.account_number} mono />
                  <Row label="IFSC Code" value={u.ifsc} mono />
                  <Row label="Branch Name" value={u.branch_name} />
                  <Row label="Nominee" value={u.nominee} />
                  <Row label="Joined" value={formatDate(u.created_at)} />
                </div>
              </div>
            )}

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider">Principal</span>
                <div className="font-mono-num text-lg font-bold text-slate-800 mt-1">{formatINR(u.principal)}</div>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider">Total Earned</span>
                <div className="font-mono-num text-lg font-bold text-emerald-600 mt-1">{formatINR(u.total_earned)}</div>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase tracking-wider">Today Credited</span>
                <div className="font-mono-num text-lg font-bold text-slate-800 mt-1">{formatINR(u.today_earning)}</div>
              </div>
            </div>

            {/* Image viewer for documents */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">KYC Verification Files</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  ["Aadhaar Front", "aadhaar_front"],
                  ["Aadhaar Back", "aadhaar_back"],
                  ["PAN Front", "pan_front"],
                  ["PAN Back", "pan_back"]
                ].map(([lbl, k]) => (
                  <div key={k} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{lbl}</span>
                    <div className="h-20 border border-slate-200/50 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      {u[k] ? (
                        <a href={u[k]} target="_blank" rel="noreferrer" data-testid={`doc-${k}`}>
                          <img src={u[k]} alt={lbl} className="w-full h-full object-cover cursor-zoom-in" />
                        </a>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-semibold">Not Uploaded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manual credit form */}
          <div className="kanak-card p-6 flex flex-col justify-between h-80" data-testid="credit-profit-form">
            <form onSubmit={creditProfit} className="space-y-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Manual Profit Credit</h3>
              </div>
              <p className="text-[10px] text-slate-400">Credit yields manually directly to this investor's ledger balance.</p>
              
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Amount (INR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="3000"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono-num font-semibold"
                  data-testid="credit-amount-input"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Manual yield adjustment"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
                  data-testid="credit-note-input"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-semibold text-white kanak-gradient-btn"
                data-testid="credit-submit-button"
              >
                {submitting ? "Crediting..." : "Credit Payout"}
              </button>
            </form>
          </div>
        </div>

        {/* Row 4: Client history tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Requests */}
          <div className="kanak-card p-6" data-testid="deposits-history">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Audit log</span>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Deposit Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                  {detail.deposits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 font-medium">
                        No deposits found.
                      </td>
                    </tr>
                  ) : (
                    detail.deposits.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">{formatDate(d.deposited_at)}</td>
                        <td className="py-2.5 font-mono-num text-right text-slate-800">{formatINR(d.amount)}</td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${badgeClass(d.status)}`}>
                            {(d.status || "pending").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Profit Payouts */}
          <div className="kanak-card p-6" data-testid="profits-history">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Audit log</span>
            <h3 className="text-sm font-bold text-slate-800 mb-4">Yield Payouts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                  {detail.profits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 font-medium">
                        No profit payouts credited yet.
                      </td>
                    </tr>
                  ) : (
                    detail.profits.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">{formatDate(p.credited_at)}</td>
                        <td className="py-2.5 font-mono-num text-right text-emerald-600">+{formatINR(p.amount)}</td>
                        <td className="py-2.5 text-slate-400 max-w-xs truncate" title={p.note}>{p.note || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
