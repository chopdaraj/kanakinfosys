import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { api, formatINR, formatDate, formatKycStatus } from "@/lib/api";
import { toast } from "sonner";
import { 
  Download, 
  Search, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  UserPlus, 
  FileText, 
  KeyRound, 
  Copy, 
  Check, 
  X, 
  Power, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useModal } from "@/context/ModalContext";

export default function AdminClients() {
  const modal = useModal();
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Create Client Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    client_id: "",
    phone: "",
    email: "",
    dob: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    pan_number: "",
    aadhaar_number: "",
    joining_date: new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY
    investment_amount: "",
    referral_code: "",
    account_status: "active",
    nominee: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc: "",
    branch_name: "",
  });

  // Success Modal State after client created
  const [createdSuccessData, setCreatedSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // PDF Preview Modal
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewTitle, setPdfPreviewTitle] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchClients = async () => {
    try {
      const { data } = await api.get("/admin/clients");
      setClients(data);
    } catch (e) {
      console.error("Clients load failed:", e);
      toast.error("Failed to load clients list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      toast.error("A valid 10-digit mobile number is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email address is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        investment_amount: form.investment_amount ? parseFloat(form.investment_amount) : 0.0,
      };
      const { data } = await api.post("/admin/clients", payload);
      toast.success("Client account created successfully!");
      setCreateModalOpen(false);
      setCreatedSuccessData(data);
      // Reset form
      setForm({
        name: "",
        client_id: "",
        phone: "",
        email: "",
        dob: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        pan_number: "",
        aadhaar_number: "",
        joining_date: new Date().toLocaleDateString("en-GB"),
        investment_amount: "",
        referral_code: "",
        account_status: "active",
        nominee: "",
        bank_name: "",
        account_holder: "",
        account_number: "",
        ifsc: "",
        branch_name: "",
      });
      await fetchClients();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to create client";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const downloadAccountPdf = async (clientId, clientName) => {
    setActionLoadingId(`pdf-dl-${clientId}`);
    try {
      const response = await api.get(`/admin/clients/${clientId}/account-pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (clientName || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `KANAK_INFOSYS_Client_${clientId}_${cleanName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Account PDF downloaded successfully.");
    } catch (e) {
      console.error("PDF download failed:", e);
      toast.error("Failed to download Account PDF");
    } finally {
      setActionLoadingId(null);
    }
  };

  const previewAccountPdf = async (clientId, clientName) => {
    setActionLoadingId(`pdf-prev-${clientId}`);
    try {
      const response = await api.get(`/admin/clients/${clientId}/account-pdf?preview=true`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setPdfPreviewTitle(`Client Account Form — ${clientName} (${clientId})`);
      setShowPreviewModal(true);
    } catch (e) {
      console.error("PDF preview failed:", e);
      toast.error("Failed to generate PDF preview");
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetClientPassword = async (client) => {
    const yes = await modal.confirm(
      `Reset password for ${client.name} (${client.client_id || client.id})? The password will be reset to their registered mobile number (${client.phone}), and they will be required to create a new password on their next login.`,
      "Reset Client Password",
      "warning",
      { confirmLabel: "Reset to Mobile Number", cancelLabel: "Cancel" }
    );
    if (!yes) return;

    setActionLoadingId(`reset-${client.id}`);
    try {
      const { data } = await api.post(`/admin/clients/${client.id}/reset-password`);
      toast.success(data.message || "Password reset successfully!");
      // Update local state
      setClients(clients.map((c) => (c.id === client.id ? { ...c, must_change_password: true, password_status: "initial" } : c)));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to reset password");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleAccountStatus = async (client) => {
    const currentStatus = client.account_status || "active";
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    const actionText = nextStatus === "active" ? "Activate" : "Deactivate";

    const yes = await modal.confirm(
      `Are you sure you want to ${actionText.toLowerCase()} account for ${client.name} (${client.client_id || client.id})? ${nextStatus === "inactive" ? "Client will be unable to log in while deactivated." : "Client will regain portal access."}`,
      `${actionText} Client Account`,
      nextStatus === "active" ? "info" : "danger",
      { confirmLabel: `${actionText} Account`, cancelLabel: "Cancel" }
    );
    if (!yes) return;

    setActionLoadingId(`status-${client.id}`);
    try {
      await api.put(`/admin/clients/${client.id}/status`, { status: nextStatus });
      toast.success(`Client account ${actionText.toLowerCase()}d successfully.`);
      setClients(clients.map((c) => (c.id === client.id ? { ...c, account_status: nextStatus } : c)));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update account status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyLoginDetails = () => {
    if (!createdSuccessData) return;
    const { user, client_id, temporary_password } = createdSuccessData;
    const text = `KANAK INFOSYS — CLIENT LOGIN DETAILS\n\nClient Name: ${user.name}\nClient ID / Username: ${client_id}\nRegistered Mobile: ${user.phone}\nInitial Password: ${temporary_password}\nLogin Portal: https://kanakinfosys.com/login\n\nImportant: You will be prompted to change your temporary password upon first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Login credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    if (pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
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
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Create Client Button */}
            <button
              onClick={() => setCreateModalOpen(true)}
              data-testid="admin-create-client-btn"
              className="px-4 py-2.5 bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D9480F] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Client Account</span>
            </button>

            {/* Export to Excel Button */}
            <button
              onClick={download}
              disabled={exporting}
              data-testid="admin-export-excel-button"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="kanak-card p-4 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="admin-clients-search"
              placeholder="Search by ID, name, mobile, email, serial..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] transition-all"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="kanak-card p-6 overflow-hidden" data-testid="admin-clients-table">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-3">Serial</th>
                  <th className="py-4 px-3">Client ID</th>
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Mobile</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Password</th>
                  <th className="py-4 px-4">KYC</th>
                  <th className="py-4 px-4 text-right">Investment</th>
                  <th className="py-4 px-4 text-right">Principal</th>
                  <th className="py-4 px-4 text-right">Total Earned</th>
                  <th className="py-4 px-4">Joined</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-sm text-slate-400">
                      Loading registered clients list...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-sm text-slate-400">
                      No matching clients found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const rawKyc = c.kyc_status || "pending";
                    const kyc = formatKycStatus(rawKyc).toUpperCase();
                    const isInitialPass = c.must_change_password || c.password_status === "initial";
                    const isInactive = c.account_status === "inactive";
                    const cid = c.client_id || c.id;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-3 text-xs font-mono font-bold text-slate-400">#{c.serial_number ?? "—"}</td>
                        <td className="py-4 px-3 text-xs font-mono font-bold text-[#F26522]">{c.client_id ?? "—"}</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {kyc === "VERIFIED" && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[11px] font-normal text-slate-400 block">{c.email}</span>
                        </td>
                        <td className="py-4 px-4 text-xs font-mono font-medium text-slate-700">{c.phone || "—"}</td>
                        
                        {/* Account Status Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              isInactive
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isInactive ? "Inactive" : "Active"}
                          </span>
                        </td>

                        {/* Password Status Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              isInitialPass
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                            title={isInitialPass ? "Temporary password (mobile number) active" : "Password has been customized by client"}
                          >
                            <KeyRound className="w-2.5 h-2.5" />
                            {isInitialPass ? "Initial" : "Changed"}
                          </span>
                        </td>

                        {/* KYC Badge */}
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

                        <td className="py-4 px-4 text-xs font-mono-num font-bold text-slate-700 text-right">
                          {c.investment_amount ? formatINR(c.investment_amount) : "—"}
                        </td>
                        <td className="py-4 px-4 text-xs font-mono-num font-bold text-slate-800 text-right">{formatINR(c.principal)}</td>
                        <td className="py-4 px-4 text-xs font-mono-num font-bold text-emerald-600 text-right">{formatINR(c.total_earned)}</td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-medium">{c.joining_date || formatDate(c.created_at)}</td>
                        
                        {/* Actions */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Inspect Client Profile */}
                            <Link
                              to={`/admin/clients/${c.id}`}
                              data-testid={`view-client-${c.id}`}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-sm"
                              title="Inspect Client Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* Download Account Creation PDF */}
                            <button
                              onClick={() => downloadAccountPdf(cid, c.name)}
                              disabled={actionLoadingId === `pdf-dl-${cid}`}
                              className="p-1.5 border border-orange-200 text-[#F26522] hover:bg-orange-50 rounded-lg transition shadow-sm"
                              title="Download Client Account PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => resetClientPassword(c)}
                              disabled={actionLoadingId === `reset-${c.id}`}
                              className="p-1.5 border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-lg transition shadow-sm"
                              title="Reset Password to Mobile Number"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Active/Inactive */}
                            <button
                              onClick={() => toggleAccountStatus(c)}
                              disabled={actionLoadingId === `status-${c.id}`}
                              className={`p-1.5 border rounded-lg transition shadow-sm ${
                                isInactive
                                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                  : "border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                              title={isInactive ? "Activate Client" : "Deactivate Client"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Client */}
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

      {/* ================= CREATE CLIENT ACCOUNT MODAL ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F26522] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create New Client Account</h3>
                  <p className="text-xs text-slate-500">
                    Generates official account, initial mobile password & branded onboarding PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Section 1: Basic Information */}
              <div>
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider block mb-2.5">
                  1. Client Identity & Credentials
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Raj Patel"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Client ID / Account ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.client_id}
                      onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                      placeholder="Leave blank for auto KNK####"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mobile Number * (Default Password)
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                    <span className="text-[10px] text-amber-600 font-medium mt-1 block">
                      * Default password will automatically be this mobile number.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="client@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Joining Date
                    </label>
                    <input
                      type="text"
                      value={form.joining_date}
                      onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Financial & Account Info */}
              <div>
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider block mb-2.5">
                  2. Investment & Account Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Investment Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.investment_amount}
                      onChange={(e) => setForm({ ...form, investment_amount: e.target.value })}
                      placeholder="e.g. 100000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Referral / Sponsor Code
                    </label>
                    <input
                      type="text"
                      value={form.referral_code}
                      onChange={(e) => setForm({ ...form, referral_code: e.target.value })}
                      placeholder="e.g. CLI0052"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Account Status
                    </label>
                    <select
                      value={form.account_status}
                      onChange={(e) => setForm({ ...form, account_status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Identity & Address */}
              <div>
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider block mb-2.5">
                  3. KYC & Address Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={form.pan_number}
                      onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={form.aadhaar_number}
                      onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value })}
                      placeholder="12-digit Aadhaar number"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Address (Line 1 & 2)
                    </label>
                    <input
                      type="text"
                      value={form.address_line1}
                      onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                      placeholder="Flat / House / Building details"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] mb-2"
                    />
                    <input
                      type="text"
                      value={form.address_line2}
                      onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                      placeholder="Street, Landmark, Area"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Ahmedabad"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        placeholder="e.g. Gujarat"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        placeholder="380001"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Nominee & Bank Details */}
              <div>
                <span className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider block mb-2.5">
                  4. Bank & Nominee (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nominee Name
                    </label>
                    <input
                      type="text"
                      value={form.nominee}
                      onChange={(e) => setForm({ ...form, nominee: e.target.value })}
                      placeholder="Nominee full name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={form.bank_name}
                      onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={form.account_number}
                      onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                      placeholder="Bank account number"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={form.ifsc}
                      onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D9480F] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{submitting ? "Creating Client Account..." : "Create Client Account"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= ACCOUNT CREATED SUCCESS MODAL ================= */}
      {createdSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                Client Account Created Successfully
              </h3>
              <p className="text-xs text-slate-500">
                Official onboarding credentials generated. The client will be forced to change password upon their first login.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-gradient-to-b from-orange-50/40 to-slate-50 rounded-xl p-4 border border-orange-200/60 space-y-2.5 text-xs">
              <div className="text-[10px] font-bold text-[#F26522] uppercase tracking-wider border-b border-orange-200/40 pb-1.5 flex items-center justify-between">
                <span>KANAK INFOSYS — CLIENT CREDENTIALS</span>
                <span className="font-mono font-bold text-slate-700">{createdSuccessData.client_id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client Name</span>
                  <span className="font-bold text-slate-900">{createdSuccessData.user.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client ID / Username</span>
                  <span className="font-mono font-bold text-[#F26522]">{createdSuccessData.client_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Mobile</span>
                  <span className="font-mono font-semibold">{createdSuccessData.user.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Initial Password</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    {createdSuccessData.temporary_password}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Portal URL</span>
                  <span className="text-blue-600 font-medium">kanakinfosys.com/login</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Security Status</span>
                  <span className="text-emerald-700 font-semibold">Forced Password Change</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadAccountPdf(createdSuccessData.client_id, createdSuccessData.user.name)}
                  className="py-2.5 px-3 bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D9480F] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Client PDF</span>
                </button>

                <button
                  onClick={() => previewAccountPdf(createdSuccessData.client_id, createdSuccessData.user.name)}
                  className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview PDF</span>
                </button>
              </div>

              <button
                onClick={copyLoginDetails}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Client Login Details"}</span>
              </button>
            </div>

            {/* Close */}
            <div className="text-center pt-1">
              <button
                onClick={() => setCreatedSuccessData(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Done / Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= PDF PREVIEW MODAL ================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#F26522]" />
                <h3 className="text-sm font-bold text-slate-800">{pdfPreviewTitle || "Document Preview"}</h3>
              </div>
              <div className="flex items-center gap-2">
                {pdfPreviewUrl && (
                  <a
                    href={pdfPreviewUrl}
                    download="Client_Account_Form.pdf"
                    className="px-3 py-1.5 bg-[#F26522] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
                <button
                  onClick={closePreviewModal}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Iframe */}
            <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
              {pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  title="PDF Document Preview"
                  className="w-full h-full rounded-lg border border-slate-200 bg-white"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Loading PDF preview...
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
