import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import TreeNode from "@/components/TreeNode";
import { api } from "@/lib/api";
import { Compass, Users } from "lucide-react";

export default function AdminTree() {
  const [forest, setForest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/referral-tree");
        setForest(data);
      } catch (e) {
        console.error("Referral tree load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8" data-testid="admin-tree-page">
        {/* Header */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Network hierarchy</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Affiliation Tree</h1>
          <p className="text-slate-500 text-sm mt-1">
            Visual tree rendering parent-child referral connections across all tiers.
          </p>
        </div>

        <div className="kanak-card p-6" data-testid="admin-tree-container">
          {loading && <div className="text-slate-400 text-xs">Loading tree structure...</div>}
          {!loading && forest.length === 0 && (
            <div className="text-slate-400 text-xs py-8 text-center">
              No registered client downlines found in database.
            </div>
          )}
          <div className="space-y-6">
            {forest.map((root) => (
              <TreeNode key={root.id} node={root} depth={0} />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
