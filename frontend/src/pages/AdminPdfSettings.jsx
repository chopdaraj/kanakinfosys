import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  GripVertical,
  Layers,
  Sparkles,
  Save,
  X
} from "lucide-react";

export default function AdminPdfSettings() {
  const modal = useModal();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    company_name: "Kanak Infosys",
    phone_primary: "+91 94084 09798",
    phone_secondary: "+91 93165 96408",
    email: "kanakinfosyss@gmail.com",
    website: "www.kanakinfosys.com",
    office_address: "E-1025, Ganesh Glory-11, Jagatpur Road, Gota, Ahmedabad, Gujarat-382470"
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [currentTerm, setCurrentTerm] = useState({ id: "", title: "", description: "", enabled: true });
  const [submittingTerm, setSubmittingTerm] = useState(false);

  // PDF Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);

  // Load terms & settings
  const loadData = useCallback(async () => {
    try {
      const [termsRes, settingsRes] = await Promise.all([
        api.get("/admin/pdf/terms"),
        api.get("/admin/pdf/settings")
      ]);
      setTerms(termsRes.data || []);
      if (settingsRes.data) {
        setCompanySettings(settingsRes.data);
      }
    } catch (err) {
      console.error("Failed to load PDF terms/settings:", err);
      toast.error("Failed to load PDF configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Add Modal
  const openAddModal = () => {
    setCurrentTerm({
      id: "",
      title: "",
      description: "",
      enabled: true
    });
    setModalMode("add");
  };

  // Open Edit Modal
  const openEditModal = (term) => {
    setCurrentTerm({
      id: term.id,
      title: term.title,
      description: term.description,
      enabled: term.enabled
    });
    setModalMode("edit");
  };

  // Close Term Form Modal
  const closeModal = () => {
    setModalMode(null);
    setCurrentTerm({ id: "", title: "", description: "", enabled: true });
  };

  // Save Add or Edit
  const handleSaveTerm = async (e) => {
    e.preventDefault();
    if (!currentTerm.title.trim()) {
      return toast.error("Please enter a term title.");
    }
    setSubmittingTerm(true);
    try {
      if (modalMode === "add") {
        const { data } = await api.post("/admin/pdf/terms", {
          title: currentTerm.title.trim(),
          description: currentTerm.description.trim(),
          enabled: currentTerm.enabled
        });
        setTerms((prev) => [...prev, data]);
        toast.success(`Point "${data.title}" added successfully!`);
      } else if (modalMode === "edit") {
        const { data } = await api.put(`/admin/pdf/terms/${currentTerm.id}`, {
          title: currentTerm.title.trim(),
          description: currentTerm.description.trim(),
          enabled: currentTerm.enabled
        });
        setTerms((prev) =>
          prev.map((t) => (t.id === currentTerm.id ? { ...t, ...data } : t))
        );
        toast.success(`Point updated successfully!`);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving term:", err);
      toast.error(err.response?.data?.detail || "Failed to save term.");
    } finally {
      setSubmittingTerm(false);
    }
  };

  // Toggle enabled/disabled
  const handleToggleEnabled = async (term) => {
    const updatedStatus = !term.enabled;
    try {
      await api.put(`/admin/pdf/terms/${term.id}`, { enabled: updatedStatus });
      setTerms((prev) =>
        prev.map((t) => (t.id === term.id ? { ...t, enabled: updatedStatus } : t))
      );
      toast.success(
        `Point "${term.title}" ${updatedStatus ? "enabled" : "disabled"}`
      );
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  // Duplicate point
  const handleDuplicate = async (term) => {
    try {
      const { data } = await api.post(`/admin/pdf/terms/${term.id}/duplicate`);
      toast.success(`Duplicated "${term.title}"`);
      await loadData();
    } catch (err) {
      toast.error("Failed to duplicate point.");
    }
  };

  // Delete point with confirmation
  const handleDelete = async (term) => {
    const confirmed = await modal.confirm(
      `Are you sure you want to delete "${term.title}"? Remaining points will be automatically renumbered.`,
      "Delete Terms & Conditions Point",
      "danger",
      { confirmLabel: "Delete Point", cancelLabel: "Keep Point" }
    );
    if (!confirmed) return;

    try {
      await api.delete(`/admin/pdf/terms/${term.id}`);
      toast.success("Point deleted and numbering updated.");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete point.");
    }
  };

  // Move Up
  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newItems = [...terms];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setTerms(newItems);
    await syncReorder(newItems);
  };

  // Move Down
  const handleMoveDown = async (index) => {
    if (index === terms.length - 1) return;
    const newItems = [...terms];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setTerms(newItems);
    await syncReorder(newItems);
  };

  // Sync new order to server
  const syncReorder = async (orderedList) => {
    setSavingOrder(true);
    try {
      const orderIds = orderedList.map((t) => t.id);
      const { data } = await api.put("/admin/pdf/terms/reorder", {
        order_ids: orderIds
      });
      setTerms(data);
      toast.success("Order updated and renumbered.");
    } catch (err) {
      toast.error("Failed to save new order.");
      await loadData();
    } finally {
      setSavingOrder(false);
    }
  };

  // Reset to default 8 terms
  const handleResetDefaults = async () => {
    const ok = await modal.confirm(
      "Reset all Terms & Conditions to the official default 8 points from the reference document?",
      "Reset to Default Terms",
      "danger",
      { confirmLabel: "Reset to Defaults", cancelLabel: "Cancel" }
    );
    if (!ok) return;

    try {
      const { data } = await api.post("/admin/pdf/terms/reset");
      setTerms(data);
      toast.success("Reset to 8 default terms successfully.");
    } catch (err) {
      toast.error("Failed to reset terms.");
    }
  };

  // Save company settings
  const handleSaveCompanySettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { data } = await api.put("/admin/pdf/settings", companySettings);
      setCompanySettings(data);
      toast.success("Company PDF details updated successfully!");
    } catch (err) {
      toast.error("Failed to update company details.");
    } finally {
      setSavingSettings(false);
    }
  };

  // PDF Preview
  const handlePreviewPdf = async () => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const res = await api.get("/admin/pdf/preview", {
        responseType: "blob"
      });
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err) {
      console.error("Preview failed:", err);
      toast.error("Unable to generate PDF preview.");
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreviewModal = () => {
    setPreviewOpen(false);
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  const handleDownloadSample = async () => {
    toast.info("Generating sample PDF...");
    try {
      const res = await api.get("/admin/pdf/preview", {
        responseType: "blob"
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Customer_Deposit_Form_KNK0052_Sample.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Sample PDF downloaded successfully!");
    } catch (err) {
      toast.error("Download failed.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl mx-auto" data-testid="admin-pdf-settings-page">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Document System 2.0
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-medium text-slate-500">Official Theme Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              Customer Deposit PDF & Terms
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage the dynamic Terms & Conditions and letterhead settings for the official Customer Deposit Agreement PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePreviewPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D9480F] text-white rounded-xl text-xs font-bold shadow-sm shadow-orange-500/20 active:scale-[0.99] transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Live PDF</span>
            </button>

            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-sm active:scale-[0.99] transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download Sample</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Reset terms to standard 8 points"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Theme Specification Banner */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 border border-orange-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  New Kanak Infosys Corporate Theme
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Production Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Matches the official reference PDF (<span className="font-mono text-slate-800 font-semibold">Customer_Deposit_Form_KNK0052_New_Theme</span>) with geometric chevron header, light graph watermark, zebra customer table, dynamic page continuation, and dual signature block.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <span className="text-xs text-slate-500 font-medium">Page count:</span>
            <span className="text-xs font-bold text-orange-700 bg-white border border-orange-200 px-3 py-1 rounded-lg">
              Dynamic (Auto 2+ Pages)
            </span>
          </div>
        </div>

        {/* Terms & Conditions Editor */}
        <div className="kanak-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <h2 className="text-base font-bold text-slate-900">Terms & Conditions Points</h2>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                  {terms.filter((t) => t.enabled).length} of {terms.length} active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Points are automatically renumbered in real time. Drag or click arrows to reorder. Only enabled points appear in the PDF.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F26522] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold shadow-sm shadow-orange-500/20 active:scale-[0.99] transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Point</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading Terms & Conditions...</div>
          ) : terms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No terms configured. Click "Reset Defaults" or "Add Point" to create terms.
            </div>
          ) : (
            <div className="space-y-3">
              {terms.map((term, index) => {
                const isFirst = index === 0;
                const isLast = index === terms.length - 1;

                return (
                  <div
                    key={term.id}
                    className={`group border rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      term.enabled
                        ? "bg-white border-slate-200/90 hover:border-orange-300 hover:shadow-sm"
                        : "bg-slate-50/80 border-slate-200 text-slate-400 opacity-60"
                    }`}
                  >
                    {/* Left: Drag Handle, Number, Title & Description */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="flex flex-col items-center gap-1 pt-1 text-slate-300 group-hover:text-slate-400">
                        <GripVertical className="w-4 h-4 cursor-grab" />
                      </div>

                      {/* Number Badge */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          term.enabled
                            ? "bg-orange-100 text-[#F26522]"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold truncate ${
                              term.enabled ? "text-slate-900" : "text-slate-500 line-through"
                            }`}
                          >
                            {term.title}
                          </h4>
                          {!term.enabled && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {term.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                      {/* Move Up */}
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={isFirst}
                        title="Move Up"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={isLast}
                        title="Move Down"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Enable / Disable Toggle */}
                      <button
                        onClick={() => handleToggleEnabled(term)}
                        title={term.enabled ? "Disable this point" : "Enable this point"}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          term.enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {term.enabled ? "Active" : "Disabled"}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(term)}
                        title="Edit point"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicate(term)}
                        title="Duplicate point"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(term)}
                        title="Delete point"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Company & Header Settings */}
        <div className="kanak-card p-6 md:p-8 space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-800">Company & Contact Header Details</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Standard Kanak Infosys Defaults</span>
          </div>

          <form onSubmit={handleSaveCompanySettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={companySettings.company_name}
                    onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Primary Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={companySettings.phone_primary}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone_primary: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Secondary Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={companySettings.phone_secondary}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone_secondary: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Office Location / Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={companySettings.office_address}
                    onChange={(e) => setCompanySettings({ ...companySettings, office_address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? "Saving Settings..." : "Save Company Information"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Add / Edit Point Modal */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#F26522] flex items-center justify-center text-xs font-extrabold">
                    {modalMode === "add" ? terms.length + 1 : currentTerm.order || "•"}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalMode === "add" ? "Add New Terms & Conditions Point" : "Edit Point"}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTerm} className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Point Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Withdrawal Policy"
                    value={currentTerm.title}
                    onChange={(e) => setCurrentTerm({ ...currentTerm, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Point Description / Clauses
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter the full policy wording for this clause..."
                    value={currentTerm.description}
                    onChange={(e) => setCurrentTerm({ ...currentTerm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="termEnabled"
                    checked={currentTerm.enabled}
                    onChange={(e) => setCurrentTerm({ ...currentTerm, enabled: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="termEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Enable this point (include in generated customer PDFs)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTerm}
                    className="px-5 py-2 rounded-xl bg-[#F26522] hover:bg-[#EA580C] text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition disabled:opacity-60 cursor-pointer"
                  >
                    {submittingTerm ? "Saving Point..." : "Save Point"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live PDF Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F26522] flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Live Customer Deposit Form Preview
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Showing real-time letterhead, dynamic terms numbering, and watermark
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F26522] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={closePreviewModal}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {previewLoading ? (
                  <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-medium">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span>Generating live PDF preview...</span>
                  </div>
                ) : previewBlobUrl ? (
                  <iframe
                    src={previewBlobUrl}
                    title="Customer Deposit Form PDF Preview"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="text-xs text-rose-500">Failed to render preview.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
