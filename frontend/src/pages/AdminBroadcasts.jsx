import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { Bell, Plus, Edit2, Trash2, X, Send } from "lucide-react";
import { useModal } from "@/context/ModalContext";

export default function AdminBroadcasts() {
  const modal = useModal();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/broadcasts")
      .then((res) => {
        setBroadcasts(res.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load broadcasts:", e);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and description");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/broadcasts/${editingId}`, { title, description });
        toast.success("Broadcast message updated successfully.");
      } else {
        await api.post("/admin/broadcasts", { title, description });
        toast.success("Global broadcast notification dispatched!");
      }
      setTitle("");
      setDescription("");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error("Failed to dispatch broadcast notification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setTitle(b.title);
    setDescription(b.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const yes = await modal.confirm(
      "Delete this broadcast notification permanently? All client notifications associated with it will disappear.",
      "Delete Broadcast",
      "delete",
      { confirmLabel: "Delete", cancelLabel: "Cancel" }
    );
    if (!yes) return;
    try {
      await api.delete(`/admin/broadcasts/${id}`);
      toast.success("Broadcast alert deleted.");
      load();
    } catch (err) {
      toast.error("Failed to delete broadcast");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-broadcasts-page">
        {/* Header */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Broadcast panel</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Global Broadcasts</h1>
          <p className="text-slate-500 text-sm mt-1">
            Dispatch announcements to every investor's notification panel in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Form (Left 1/3) */}
          <div className="kanak-card p-6 flex flex-col justify-between h-96">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {editingId ? "Edit Announcement" : "New Broadcast Alert"}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">
                Type the parameters. Click dispatch to push notification instantly.
              </p>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maintenance Scheduled"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide announcement details..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-medium resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow py-2.5 text-xs font-semibold text-white kanak-gradient-btn flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {editingId ? "Update Alert" : "Dispatch Broadcast"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setDescription("");
                    }}
                    className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition active:scale-95"
                    title="Cancel Edit"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Broadcasts History (Right 2/3) */}
          <div className="kanak-card p-6 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Broadcast Archive</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-2">Announcement</th>
                    <th className="py-2.5 px-2">Dispatched Date</th>
                    <th className="py-2.5 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                        Loading archive data...
                      </td>
                    </tr>
                  ) : broadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                        No global broadcasts dispatched yet.
                      </td>
                    </tr>
                  ) : (
                    broadcasts.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 max-w-sm">
                          <div className="font-bold text-slate-800">{b.title}</div>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">{b.description}</div>
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-400 shrink-0">
                          {formatDate(b.created_at)}
                        </td>
                        <td className="py-3 px-2 text-center shrink-0">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(b)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-sm"
                              title="Edit Alert"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-1.5 border border-rose-200 hover:bg-rose-50 rounded-lg text-rose-600 transition shadow-sm"
                              title="Delete Alert"
                            >
                              <Trash2 className="w-3 h-3" />
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
        </div>
      </div>
    </AdminLayout>
  );
}
