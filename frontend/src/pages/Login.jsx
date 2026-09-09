import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const formatErr = (d) => {
  if (!d) return "Something went wrong";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => e.msg || JSON.stringify(e)).join(", ");
  if (d.msg) return d.msg;
  return String(d);
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(formatErr(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8F9FB] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Visual side panel */}
      <div className="hidden lg:block relative bg-[#FFF5EF]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5EF] to-[#FFE6D5] opacity-95" />
        <div className="relative h-full flex flex-col justify-between p-12 text-slate-800 z-10">
          <Link to="/" data-testid="login-brand-link" className="flex items-center gap-3">
            <div className="bg-white p-2 px-5 rounded-2xl shadow-md border border-orange-100">
              <img src="/assets/kanak-logo.png" alt="Kanak Infosys Logo" className="h-8 w-auto object-contain" />
            </div>
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight max-w-sm font-display text-slate-900">
              Precision. <br />Discipline. <br /><span className="text-[#F26522]">Yield.</span>
            </h2>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-sm font-medium">
              Access your investment portfolio, daily earnings distribution, and referral network in one premium workspace.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            Kanak Infosys · Private Terminal
          </div>
        </div>
      </div>

      {/* Access Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-black/20 animate-fade-in-up transition-colors">
          <form onSubmit={onSubmit} data-testid="login-form" className="space-y-6">
            <div className="lg:hidden mb-6 flex justify-center">
              <Link to="/" className="inline-block bg-white p-2 px-5 rounded-2xl shadow-sm border border-slate-100">
                <img src="/assets/kanak-logo.png" alt="Kanak Infosys" className="h-8 w-auto object-contain" />
              </Link>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Client Access</span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Sign In</h1>
              <p className="text-xs text-slate-500 mt-2">
                New to the platform?{" "}
                <Link to="/register" data-testid="login-register-link" className="text-[#F26522] font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  placeholder="you@company.com"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 block">Password</label>
                  <button type="button" onClick={() => toast.info("Password recovery structure is mock-ready.")} className="text-[10px] text-[#F26522] font-bold hover:underline">Forgot password?</button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full py-3.5 text-sm font-semibold text-white kanak-gradient-btn"
              >
                {loading ? "Signing in..." : "Sign in to Terminal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
