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
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8F9FB] text-slate-800 font-body">
      {/* Left Visual side panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 xl:p-20 bg-[#FDEEE4] relative">
        {/* Top Logo Container */}
        <div>
          <Link to="/" data-testid="login-brand-link" className="inline-block">
            <div className="bg-white p-2.5 px-6 rounded-2xl shadow-sm border border-orange-100/60 inline-flex items-center">
              <img 
                src="/assets/kanak-logo.png" 
                alt="Kanak Infosys Logo" 
                className="h-7 w-auto object-contain" 
              />
            </div>
          </Link>
        </div>

        {/* Middle Typography */}
        <div className="my-auto py-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] font-display">
            Precision. <br />
            Discipline. <br />
            <span className="text-[#E8590C]">Yield.</span>
          </h1>
          <p className="mt-6 text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
            Access your investment portfolio, daily earnings distribution, and referral network in one premium workspace.
          </p>
        </div>

        {/* Bottom Terminal Label */}
        <div className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase">
          KANAK INFOSYS · PRIVATE TERMINAL
        </div>
      </div>

      {/* Right Access Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[440px] bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <form onSubmit={onSubmit} data-testid="login-form" className="space-y-6">
            {/* Mobile-only logo */}
            <div className="lg:hidden mb-6 flex justify-center">
              <Link to="/" className="inline-block bg-white p-2 px-5 rounded-2xl shadow-sm border border-slate-100">
                <img src="/assets/kanak-logo.png" alt="Kanak Infosys" className="h-7 w-auto object-contain" />
              </Link>
            </div>

            {/* Header */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                CLIENT ACCESS
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                New to the platform?{" "}
                <Link to="/register" data-testid="login-register-link" className="text-[#E8590C] font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-5 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="login-email-input"
                  placeholder="you@company.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8590C]/20 focus:border-[#E8590C] font-normal placeholder:text-slate-300 text-slate-800 bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => toast.info("Password recovery structure is mock-ready.")} 
                    className="text-xs text-[#E8590C] font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="login-password-input"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8590C]/20 focus:border-[#E8590C] font-normal placeholder:text-slate-300 text-slate-800 bg-white transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full py-3.5 px-4 bg-[#E8590C] hover:bg-[#D9480F] text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all disabled:opacity-70"
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
