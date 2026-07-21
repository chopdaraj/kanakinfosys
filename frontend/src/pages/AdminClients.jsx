import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { api, formatINR, formatDate, API } from "@/lib/api";
import { toast } from "sonner";
import { Download, Search, Trash2, Eye, ShieldCheck } from "lucide-react";
import { useModal } from "@/context/ModalContext";

export default function AdminClients() {
  const modal = useModal();
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/clients");
        setClients(data);
      } catch (e) {
        console.error("Clients load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const download = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await api.get("/admin/clients/export", {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kanak_clients.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel sheet exported successfully!");
    } catch (e) {
      console.error("Export failed:", e);
      toast.error("Export failed: " + (e.response?.data?.detail || e.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  const deleteClient = async (id, name) => {
    const yes = await modal.confirm(
      `Delete client ${name}? All deposits, profits, and record associations will be permanently purged.`,
      "Purge Client Profile",
      "delete",
      { confirmLabel: "Delete Client", cancelLabel: "Cancel" }
    );
    if (!yes) return;
    try {
      await api.delete(`/admin/clients/${id}`);
      toast.success(`Client ${name} and related history purged successfully.`);
      setClients(clients.filter((c) => c.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to purge client");
    }
  };

  const filtered = clients.filter((c) => {
    const s = q.toLowerCase();
    return (
      !s ||
      c.name?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.referral_code?.toLowerCase().includes(s) ||
      c.client_id?.toLowerCase().includes(s) ||
      (c.serial_number && String(c.serial_number).includes(s)) ||
      (c.phone && c.phone.toLowerCase().includes(s))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-clients-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registry database</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Client Register</h1>
            <p className="text-slate-500 text-sm mt-1">
              Active clients currently registered in the Kanak Infosys ledger ({clients.length} total).
            </p>
          </div>
          <button
            onClick={download}
            disabled={exporting}
            data-testid="admin-export-excel-button"
            className="p-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? "Exporting..." : "Export to Excel"}
          </button>
        </div>

        {/* Search */}
        <div className="kanak-card p-4 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="admin-clients-search"
              placeholder="Search by ID, code, phone, email, name, serial..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="kanak-card p-6 overflow-hidden" data-testid="admin-clients-table">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-3">Serial</th>
                  <th className="py-4 px-3">Client ID</th>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">KYC Status</th>
                  <th className="py-4 px-4">Ref Code</th>
                  <th className="py-4 px-4 text-center">Total Referrals</th>
                  <th className="py-4 px-4 text-right">Principal</th>
                  <th className="py-4 px-4 text-right">Total Earned</th>
                  <th className="py-4 px-4">Joined</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-sm text-slate-400">
                      Loading registered clients list...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-sm text-slate-400">
                      No matching clients found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const kyc = (c.kyc_status || "pending").toUpperCase();
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-3 text-xs font-mono font-bold text-slate-400">#{c.serial_number ?? "—"}</td>
                        <td className="py-4 px-3 text-xs font-mono font-bold text-slate-800">{c.client_id ?? "—"}</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                          {c.name}
                          {kyc === "VERIFIED" && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 font-medium">{c.email}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${
                              kyc === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                                : kyc === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200/40"
                                : "bg-amber-50 text-amber-700 border-amber-200/40"
                            }`}
                          >
                            {kyc}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-mono font-bold text-slate-800">{c.referral_code}</td>
                        <td className="py-4 px-4 text-xs font-mono-num font-bold text-slate-800 text-center">{c.referral_count ?? 0}</td>
                        <td className="py-4 px-4 text-xs font-mono-num font-bold text-slate-800 text-right">{formatINR(c.principal)}</td>
                        <td className="py-4 px-4 text-xs font-mono-num font-bold text-emerald-600 text-right">{formatINR(c.total_earned)}</td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-medium">{formatDate(c.created_at)}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/admin/clients/${c.id}`}
                              data-testid={`view-client-${c.id}`}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-sm"
                              title="Inspect and Audit Client"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => deleteClient(c.id, c.name)}
                              data-testid={`delete-client-${c.id}`}
                              className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition shadow-sm"
                              title="Delete Client Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
