import React, { useEffect, useState, useMemo } from "react";
import ClientLayout from "@/components/ClientLayout";
import { api, formatINR, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { Search, Filter, Download, Printer, ArrowDownCircle, ArrowUpCircle, Coins, HeartHandshake, Eye } from "lucide-react";

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api
      .get("/transactions")
      .then((res) => {
        setTxs(res.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load transactions:", e);
        setLoading(false);
      });
  }, []);

  const filteredTxs = useMemo(() => {
    return txs.filter((t) => {
      const matchesSearch =
        t.note.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.amount.toString().includes(search) ||
        t.status.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === "all" ? true : t.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [txs, search, filterType]);

  const paginatedTxs = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredTxs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTxs, page]);

  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      toast.error("No transaction data to export");
      return;
    }
    const headers = ["Transaction ID", "Date", "Type", "Amount", "Status", "Description"];
    const rows = filteredTxs.map((t) => [
      t.id,
      formatDate(t.date),
      t.type.toUpperCase(),
      t.amount,
      t.status.toUpperCase(),
      t.note,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kanak_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  return (
    <ClientLayout>
      <div className="space-y-8" data-testid="transactions-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Ledger</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Transaction History</h1>
            <p className="text-slate-500 text-sm mt-1">
              Verify your deposits, withdrawals, daily yields, and referral commissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" /> Print Statement
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="kanak-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, status, amount, desc..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["all", "deposit", "withdrawal", "profit", "referral"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  filterType === type
                    ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="kanak-card p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Transaction ID</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                      Loading transaction ledger...
                    </td>
                  </tr>
                ) : paginatedTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : (
                  paginatedTxs.map((t) => {
                    const status = t.status.toUpperCase();
                    const isCredit = t.type === "profit" || t.type === "referral" || (t.type === "deposit" && status === "APPROVED");
                    
                    let TypeIcon = Coins;
                    let typeColor = "bg-emerald-50 text-emerald-600";
                    if (t.type === "deposit") {
                      TypeIcon = ArrowDownCircle;
                      typeColor = "bg-blue-50 text-blue-600";
                    } else if (t.type === "withdrawal") {
                      TypeIcon = ArrowUpCircle;
                      typeColor = "bg-rose-50 text-rose-600";
                    } else if (t.type === "referral") {
                      TypeIcon = HeartHandshake;
                      typeColor = "bg-indigo-50 text-indigo-600";
                    }

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-xs font-mono font-bold text-slate-800">{t.id}</td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-medium">{formatDate(t.date)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold capitalize ${typeColor}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            {t.type}
                          </span>
                        </td>
                        <td className={`py-4 px-4 text-sm font-mono-num font-bold text-right ${isCredit ? "text-emerald-600" : "text-slate-800"}`}>
                          {isCredit ? "+" : "-"} {formatINR(t.amount)}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-medium max-w-xs truncate" title={t.note}>
                          {t.note}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-xl text-[10px] font-bold uppercase border ${
                              status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                                : status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200/40"
                                : "bg-amber-50 text-amber-700 border-amber-200/40"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <span className="text-xs text-slate-500">
                Showing page {page} of {totalPages} ({filteredTxs.length} items)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
