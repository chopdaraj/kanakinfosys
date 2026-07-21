import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api, formatDate } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  History,
  Users2,
  FileSpreadsheet,
  LogOut,
  Bell,
  Copy,
  Check,
  Menu,
  X,
  Compass,
  Trash2,
  CheckCheck,
  ChevronDown,
  Wallet,
  CompassIcon
} from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { toast } from "sonner";

export default function ClientLayout({ children }) {
  const modal = useModal();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = () => {
    if (user?.role === "client") {
      api.get("/notifications")
        .then((res) => {
          setNotifications(res.data);
          setUnreadCount(res.data.filter((n) => !n.read).length);
        })
        .catch((e) => console.error("Failed to load notifications:", e));
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = async () => {
    const yes = await modal.confirm(
      "Are you sure you want to log out?",
      "Confirm Logout",
      "logout",
      { confirmLabel: "Logout", cancelLabel: "Cancel" }
    );
    if (!yes) return;
    await logout();
    navigate("/login");
  };

  const copyRef = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    toast.success("Referral code copied successfully!");
    setTimeout(() => setCopied(false), 2000);
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      toast.success("Notification cleared.");
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => api.post(`/notifications/${n.id}/read`)));
      toast.success("All notifications marked as read.");
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Profile", path: "/profile", icon: User },
    { label: "Transactions", path: "/transactions", icon: History },
    { label: "Referral", path: "/referral", icon: Users2 },
    { label: "Policy", path: "/policy", icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col lg:flex-row pb-20 lg:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="w-[280px] bg-white/75 backdrop-blur-md border-r border-slate-100 flex-col shrink-0 hidden lg:flex sticky top-0 h-screen z-20 shadow-sm shadow-blue-500/5">
        {/* Brand Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/10 hover:scale-105 transition duration-300">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <div>
            <div className="font-bold text-base leading-none text-slate-900 tracking-tight">KANAK</div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider">INFOSYS</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50/70 to-indigo-50/20 text-blue-700 font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Advertisement Card */}
        <div className="p-4">
          <div className="sidebar-gradient-card p-5 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-900/10">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <Compass className="w-8 h-8 text-white/80 mb-3" />
            <h4 className="font-bold text-sm text-white">Grow Together,</h4>
            <h4 className="font-bold text-sm text-white">Earn Together!</h4>
            <p className="text-[10px] text-blue-100/70 mt-1 leading-relaxed">
              Empowering network, building success. Share code now.
            </p>
            <button
              onClick={() => navigate("/referral")}
              className="mt-4 w-full bg-white hover:bg-slate-50 text-blue-700 text-xs font-semibold py-2 px-4 rounded-xl transition-all duration-200"
            >
              Invite Friends
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 uppercase">
              {user?.name?.slice(0, 2)}
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-medium capitalize">{user?.client_id || user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Navbar */}
        <header className="h-20 bg-white/75 backdrop-blur-md border-b border-slate-100/60 sticky top-0 z-30 flex items-center px-4 sm:px-8 justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl lg:hidden text-slate-600 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{user?.client_id || "Kanak Portal"}</span>
              <h2 className="text-lg font-bold text-slate-800 leading-none mt-1">Client Terminal</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Referral code copy panel */}
            {user?.role === "client" && (
              <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 pl-4 pr-1.5 rounded-xl text-sm">
                <span className="text-xs text-slate-500 font-medium">Referral Code:</span>
                <span className="font-mono font-bold text-slate-800">{user?.referral_code}</span>
                <button
                  onClick={copyRef}
                  className="p-2 bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm active:scale-95 transition-all duration-150"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 border border-slate-100 hover:bg-slate-50 rounded-xl relative text-slate-600 active:scale-95 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full ring-2 ring-white flex items-center justify-center text-[8px] text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-fade-in-up">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-xs font-bold text-slate-800">Notifications ({notifications.length})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-[11px] text-slate-400 font-medium">
                          No alerts or broadcasts on record.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex justify-between gap-2 items-start ${
                              n.read
                                ? "bg-white border-slate-100 text-slate-600 hover:bg-slate-50/50"
                                : "bg-indigo-50/20 border-indigo-100/40 text-slate-800 hover:bg-indigo-50/30"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                {!n.read && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />}
                                {n.title}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed mt-1 font-medium break-words">
                                {n.description}
                              </p>
                              <span className="text-[9px] text-slate-400 block mt-1.5">{formatDate(n.created_at)}</span>
                            </div>
                            <button
                              onClick={(e) => deleteNotification(n.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 shrink-0 transition"
                              title="Clear Notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider leading-none">{user?.client_id || user?.role}</div>
                <div className="text-sm font-semibold text-slate-800 mt-1">{user?.name}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-700/10">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[280px] bg-white z-50 shadow-xl border-r border-slate-100 flex flex-col transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/10">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <div className="font-bold text-base leading-none text-slate-900 tracking-tight">KANAK</div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider">INFOSYS</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 border border-slate-100 hover:bg-slate-50 rounded-xl text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50/30 text-blue-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-700" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card Mobile */}
        <div className="p-4 border-t border-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 uppercase">
              {user?.name?.slice(0, 2)}
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-medium capitalize">{user?.client_id || user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Menu Bar (Mobile-First responsive navigation layout) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-around z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,47,167,0.03)] px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-300 ${
                isActive ? "text-blue-700" : "text-slate-400"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110 text-blue-700" : ""}`} />
              <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-400 hover:text-rose-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide">Logout</span>
        </button>
      </div>

      {/* Floating Action Button (Quick Actions) */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition duration-300"
        >
          {showFabMenu ? <X className="w-5 h-5" /> : <span className="text-xl font-bold">+</span>}
        </button>
        
        <AnimatePresence>
          {showFabMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-14 right-0 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl space-y-1 text-xs"
            >
              <button
                onClick={() => { setShowFabMenu(false); navigate("/dashboard?deposit=true"); }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-white font-medium flex items-center gap-2"
              >
                <span>💰</span> Deposit Money
              </button>

              <button
                onClick={() => { setShowFabMenu(false); navigate("/profile"); }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-white font-medium flex items-center gap-2"
              >
                <span>👤</span> KYC Verification
              </button>
              <button
                onClick={() => { setShowFabMenu(false); copyRef(); }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-white font-medium flex items-center gap-2"
              >
                <span>🔗</span> Copy Referral
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
