import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileCheck2,
  ArrowUpRight,
  Users,
  Compass,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Settings,
  FileText,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";
import { useModal } from "@/context/ModalContext";

export default function AdminLayout({ children }) {
  const modal = useModal();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

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

  const adminMenuItems = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Approvals", path: "/admin/pending", icon: FileCheck2 },
    { label: "Withdrawals", path: "/admin/withdrawals", icon: ArrowUpRight },
    { label: "Clients", path: "/admin/clients", icon: Users },
    { label: "Referrals", path: "/admin/tree", icon: Compass },
    { label: "Broadcasts", path: "/admin/broadcasts", icon: Bell },
    { label: "PDF & Terms", path: "/admin/pdf-settings", icon: FileText },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col lg:flex-row pb-20 lg:pb-0 font-body transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex-col shrink-0 hidden lg:flex sticky top-0 h-screen z-20 shadow-sm shadow-orange-500/5 transition-colors">
        {/* Brand Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-50 dark:border-slate-800/40">
          <Link to="/admin" className="flex items-center">
            <img src="/assets/kanak-logo.png" alt="Kanak Infosys Logo" className="h-10 w-auto object-contain hover:scale-105 transition duration-300" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? "bg-orange-50/50 dark:bg-orange-950/20 text-[#F26522] shadow-sm"
                    : "text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[#F26522]" : "text-slate-400"}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="adminActiveIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#F26522] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center font-bold text-[#F26522] uppercase">
              A
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">Kanak Admin</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium capitalize">Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Navbar */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100/60 dark:border-slate-800/60 sticky top-0 z-30 flex items-center px-4 sm:px-8 justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl lg:hidden text-slate-600 dark:text-slate-450 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kanak Admin</span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-none mt-1">Management Terminal</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">


            {/* Notification Bell */}
            <button className="p-2.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl relative text-slate-600 dark:text-slate-400">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Admin Profile Dropdown */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-[#F26522] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/10">
                KA
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-800 dark:text-white leading-none">Kanak Admin</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">Administrator</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
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
        className={`fixed top-0 bottom-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-50 shadow-xl border-r border-slate-100 dark:border-slate-800 flex flex-col transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50 dark:border-slate-800/40">
          <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center">
            <img src="/assets/kanak-logo.png" alt="Kanak Infosys Logo" className="h-10 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 ${
                  isActive
                    ? "bg-orange-50 dark:bg-orange-950/20 text-[#F26522]"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F26522]" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card Mobile */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center font-bold text-[#F26522] uppercase">
              A
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">Kanak Admin</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium capitalize">Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Menu Bar for Admin */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center justify-around z-40 lg:hidden shadow-[0_-4px_20px_rgba(242,101,34,0.03)] px-2">
        {adminMenuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl transition-all duration-300 ${
                isActive ? "text-[#F26522]" : "text-slate-400"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110 text-[#F26522]" : ""}`} />
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
    </div>
  );
}
