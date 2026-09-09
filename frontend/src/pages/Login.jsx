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
  TrendingUp, 
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid grid-cols-1 md:grid-cols-12 lg:grid-cols-2 bg-[#F7F8FA] font-body text-slate-800">
      
      {/* ================= LEFT BRAND / VISUAL PANEL ================= */}
      <section className="md:col-span-5 lg:col-span-1 bg-gradient-to-br from-[#FFF4EA] via-[#FFF9F4] to-[#FDEEE4] p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-orange-100/70">
        
        {/* Subtle decorative background ambient glow */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top-Left Logo (Clean, properly sized, no bulky container) */}
        <div className="relative z-10">
          <Link to="/" data-testid="login-brand-link" className="inline-block group">
            <img
              src="/assets/kanak-logo.png"
              alt="Kanak Infosys"
              className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* Middle Main Content */}
        <div className="my-auto py-8 lg:py-4 relative z-10 max-w-lg space-y-6">
          
          {/* Main Headline */}
          <div>
            <h1 className="text-4xl sm:text-5xl xl:text-[54px] font-extrabold tracking-tight leading-[1.08] font-display text-[#0A192F]">
              Precision. <br />
              Discipline. <br />
              <span className="text-[#F26522]">Yield.</span>
            </h1>
            <p className="mt-4 text-slate-600 text-sm sm:text-[15px] leading-relaxed max-w-md font-normal">
              Access your investment portfolio, daily earnings distribution, and referral network in one premium workspace.
            </p>
          </div>

          {/* Subtle Institutional Finance Graphic */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-orange-200/50 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono tracking-wider uppercase">Institutional Quant Feed</span>
              </div>
              <span className="font-bold text-[#F26522] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/40">
                3.00% / MO
              </span>
            </div>

            {/* Rising Financial Chart SVG */}
            <div className="h-20 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 340 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F26522" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F26522" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#F26522" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="18" x2="340" y2="18" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="42" x2="340" y2="42" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="65" x2="340" y2="65" stroke="#F1F5F9" />

                {/* Area Gradient Fill */}
                <path
                  d="M 0 65 Q 40 50, 75 48 T 150 40 T 220 28 T 290 18 T 340 10 L 340 65 L 0 65 Z"
                  fill="url(#chartGrad)"
                />
                {/* Rising Growth Line */}
                <path
                  d="M 0 65 Q 40 50, 75 48 T 150 40 T 220 28 T 290 18 T 340 10"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Peak Glowing Data Point */}
                <circle cx="340" cy="10" r="4" fill="#F26522" />
                <circle cx="340" cy="10" r="8" fill="#F26522" opacity="0.25" className="animate-ping" />
              </svg>
            </div>

            {/* Micro Metrics bar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <span>Lock: <strong className="text-slate-800 font-semibold">6 Months</strong></span>
              <span>Daily Rate: <strong className="text-slate-800 font-semibold">~0.10%</strong></span>
              <span>Min. Deposit: <strong className="text-slate-800 font-semibold">₹1,00,000</strong></span>
            </div>
          </div>

          {/* Three Feature Badges with Orange Line Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-orange-100/60">
              <div className="w-6 h-6 rounded-lg bg-orange-100/80 flex items-center justify-center text-[#F26522] shrink-0">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="truncate">Automated Strategies</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-orange-100/60">
              <div className="w-6 h-6 rounded-lg bg-orange-100/80 flex items-center justify-center text-[#F26522] shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="truncate">Secure & Transparent</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-orange-100/60">
              <div className="w-6 h-6 rounded-lg bg-orange-100/80 flex items-center justify-center text-[#F26522] shrink-0">
                <Users className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="truncate">Grow with Referrals</span>
            </div>
          </div>
        </div>

        {/* Bottom Left Footer Info */}
        <div className="relative z-10 pt-4 border-t border-orange-200/40 text-[11px] font-semibold text-slate-500 tracking-wider flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span className="text-slate-600 font-bold uppercase tracking-widest">
            KANAK INFOSYS • PRIVATE TERMINAL
          </span>
          <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
            DISCIPLINE TODAY, WEALTH TOMORROW
          </span>
        </div>
      </section>

      {/* ================= RIGHT LOGIN FORM PANEL ================= */}
      <section className="md:col-span-7 lg:col-span-1 bg-[#F7F8FA] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
        <div className="w-full max-w-[490px] bg-white rounded-[26px] p-8 sm:p-11 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-200">
          
          <form onSubmit={onSubmit} data-testid="login-form" className="space-y-6">
            
            {/* Header */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase block mb-1">
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

            {/* Input Fields */}
            <div className="space-y-5 pt-1">
              
              {/* EMAIL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/15 focus:border-[#F26522] transition-all font-normal"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between mb-2">
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
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/15 focus:border-[#F26522] transition-all font-normal"
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

            {/* LOGIN BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D9480F] text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                <span>{loading ? "Signing in to Terminal..." : "Sign in to Terminal"}</span>
                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </div>

            {/* DIVIDER: ──────── or ──────── */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                or
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* GOOGLE SSO BUTTON */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 shadow-sm hover:border-slate-300 active:scale-[0.99] transition-all"
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

            {/* SECURITY BADGE */}
            <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-[#F26522]" />
              <span>Your data is encrypted and secure</span>
            </div>

          </form>
        </div>
      </section>

    </div>
  );
}
