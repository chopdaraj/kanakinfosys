import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Users 
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleLogin = () => {
    toast.info("Institutional Google SSO: Single Sign-On is currently in audit mode.");
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 bg-[#F8F9FA] font-body text-slate-800">
      
      {/* ================= LEFT BRAND & FINANCIAL VISUAL PANEL ================= */}
      <section className="md:col-span-6 lg:col-span-7 bg-[#FFF6EE] p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-orange-100/70">
        
        {/* Background 3D Centerpiece Visual matching reference */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[58%] max-w-[480px] pointer-events-none select-none z-0">
          <img
            src="/assets/kanak-terminal-3d.png"
            alt="Kanak Infosys Quantitative Terminal"
            className="w-full h-full object-cover object-left"
          />
        </div>

        {/* Top Header: Logo & Category Label */}
        <div className="relative z-10">
          <Link to="/" data-testid="login-brand-link" className="inline-block group">
            <img
              src="/assets/kanak-logo.png"
              alt="Kanak Infosys"
              className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
          <div className="mt-6 text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
            Institutional Quantitative Capital
          </div>
        </div>

        {/* Middle Main Content */}
        <div className="my-auto py-6 relative z-10 max-w-sm space-y-4">
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] font-display text-[#0A192F]">
            Precision. <br />
            Discipline. <br />
            <span className="text-[#F26522]">Yield.</span>
          </h1>

          <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed max-w-[310px] font-normal pt-1">
            Access your investment portfolio, daily earnings distribution, and referral network in one premium workspace.
          </p>

          {/* 3 Feature items with soft-box icons and labels underneath */}
          <div className="flex items-start gap-3 sm:gap-4 pt-4">
            {/* 1. Automated Strategies */}
            <div className="flex flex-col items-center text-center w-[76px]">
              <div className="w-11 h-11 rounded-xl bg-white/95 border border-orange-100 shadow-sm flex items-center justify-center text-[#F26522] mb-1.5 transition-transform hover:scale-105">
                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">
                Automated<br />Strategies
              </span>
            </div>

            {/* 2. Secure & Transparent */}
            <div className="flex flex-col items-center text-center w-[76px]">
              <div className="w-11 h-11 rounded-xl bg-white/95 border border-orange-100 shadow-sm flex items-center justify-center text-[#F26522] mb-1.5 transition-transform hover:scale-105">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">
                Secure &<br />Transparent
              </span>
            </div>

            {/* 3. Grow with Referrals */}
            <div className="flex flex-col items-center text-center w-[76px]">
              <div className="w-11 h-11 rounded-xl bg-white/95 border border-orange-100 shadow-sm flex items-center justify-center text-[#F26522] mb-1.5 transition-transform hover:scale-105">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">
                Grow with<br />Referrals
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Details */}
        <div className="relative z-10 pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-[10px] tracking-wider text-slate-500">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-600 uppercase tracking-widest text-[10px]">
              KANAK INFOSYS - PRIVATE TERMINAL
            </div>
            <div className="font-medium text-slate-400 uppercase tracking-wider text-[9px]">
              DISCIPLINE TODAY, WEALTH TOMORROW
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
              YOUR CAPITAL. OUR DISCIPLINE.
            </div>
            <div className="w-8 h-0.5 bg-[#F26522] rounded-full mt-1.5 mx-auto sm:ml-auto sm:mr-0" />
          </div>
        </div>
      </section>

      {/* ================= RIGHT LOGIN FORM PANEL ================= */}
      <section className="md:col-span-6 lg:col-span-5 bg-[#F8F9FA] flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        
        {/* Top-Right Institutional Quote */}
        <div className="text-right hidden sm:block pr-2 pt-1">
          <div className="text-xs text-slate-500 font-medium tracking-tight font-serif italic">
            &ldquo;A Disciplined Approach to a Smarter Tomorrow.&rdquo;
          </div>
          <div className="w-8 h-0.5 bg-[#F26522] rounded-full mt-1.5 ml-auto" />
        </div>

        {/* Floating Centered Login Card */}
        <div className="my-auto flex justify-center py-6">
          <div className="w-full max-w-[430px] bg-white rounded-[26px] p-8 sm:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100/90 transition-all duration-200">
            
            <form onSubmit={onSubmit} data-testid="login-form" className="space-y-5">
              
              {/* Header */}
              <div>
                <span className="text-[11px] font-bold text-[#F26522] tracking-widest uppercase block mb-1">
                  CLIENT ACCESS
                </span>
                <h2 className="text-3xl font-extrabold text-[#0A192F] tracking-tight font-display">
                  Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  New to the platform?{" "}
                  <Link
                    to="/register"
                    data-testid="login-register-link"
                    className="text-[#F26522] font-bold hover:underline transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4 pt-1">
                
                {/* EMAIL */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="login-email-input"
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/15 focus:border-[#F26522] transition-all font-normal"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info("Password recovery: Contact support@kanakinfosys.com or your administrator.")}
                      className="text-xs text-[#F26522] font-semibold hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="login-password-input"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/15 focus:border-[#F26522] transition-all font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* SIGN IN BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D9480F] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{loading ? "Signing in to Terminal..." : "Sign in to Terminal"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </div>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-semibold text-slate-400 lowercase">
                  or
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* CONTINUE WITH GOOGLE */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 shadow-sm hover:border-slate-300 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.39 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* SECURITY ENCRYPTION FOOTER */}
              <div className="pt-1 text-center flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-[#F26522]" />
                <span>Your data is encrypted and secure</span>
              </div>

            </form>
          </div>
        </div>

        {/* Bottom spacer on right panel */}
        <div className="hidden sm:block h-2" />

      </section>

    </div>
  );
}
