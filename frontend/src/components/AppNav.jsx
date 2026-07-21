import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { LogOut, LineChart, User, Shield, FileText, Users, TrendingUp } from "lucide-react";

const NavLink = ({ to, label, icon: Icon, testId }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      data-testid={testId}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
        active
          ? "text-[#002FA7] border-b-2 border-[#002FA7]"
          : "text-slate-600 hover:text-slate-900 border-b-2 border-transparent"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
};

export default function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3" data-testid="nav-brand">
            <img src="/assets/kanak-logo.png" alt="Kanak Infosys" className="h-10 w-10 object-contain" />
            <div className="font-display font-bold text-lg tracking-tight leading-none">
              KANAK<span className="text-[#002FA7]"> INFOSYS</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <NavLink to="/admin" label="Overview" icon={LineChart} testId="nav-admin-overview" />
                <NavLink to="/admin/pending" label="Approvals" icon={FileText} testId="nav-admin-pending" />
                <NavLink to="/admin/withdrawals" label="Withdrawals" icon={FileText} testId="nav-admin-withdrawals" />
                <NavLink to="/admin/clients" label="Clients" icon={Users} testId="nav-admin-clients" />
                <NavLink to="/admin/tree" label="Referral Tree" icon={Shield} testId="nav-admin-tree" />
              </>
            ) : (
              <>
                <NavLink to="/dashboard" label="Dashboard" icon={LineChart} testId="nav-dashboard" />
                <NavLink to="/profile" label="Profile" icon={User} testId="nav-profile" />
                <NavLink to="/policy" label="Policy" icon={FileText} testId="nav-policy" />
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider">{user?.role}</div>
              <div className="text-sm font-medium">{user?.name}</div>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
