import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import loginBackground from "@/assets/kanak-login-background.png";
import loginMobileVisual from "@/assets/kanak-login-mobile.png";
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

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#F8F9FA] font-body text-slate-800 overflow-x-hidden">
      
      {/* ================= LEFT / HERO SECTION ================= */}
      <section className="w-full lg:w-[64%] xl:w-[65%] min-h-auto lg:min-h-screen flex flex-col justify-between p-4 xs:p-6 sm:p-10 lg:p-12 xl:p-14 relative overflow-hidden bg-gradient-to-b from-[#FFFBF7] via-[#FFF5EB] to-[#FFF9F3] lg:bg-none border-b lg:border-b-0 lg:border-r border-orange-100/70">
        
        {/* Desktop-only full-bleed background artwork */}
        <div 
          className="hidden lg:block absolute inset-0 pointer-events-none select-none z-0"
          style={{
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center"
          }}
        />

        {/* Desktop-only readability gradient mask over the left text area */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/75 via-white/35 to-transparent pointer-events-none z-0" />

        {/* Top Header: Logo & Category Label */}
        <div className="relative z-10">
          <Link to="/" data-testid="login-brand-link" className="inline-block group">
            <img
              src="/assets/kanak-logo.png"
              alt="Kanak Infosys"
              className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
          <div className="mt-2 sm:mt-5 text-[8.5px] xs:text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-[0.08em] xs:tracking-[0.14em] sm:tracking-[0.2em] uppercase max-w-full">
            Institutional Quantitative Capital
          </div>
        </div>

        {/* Mobile Financial Hero Visual Card - dedicated mobile composition */}
        <div className="lg:hidden my-3 sm:my-5 w-full h-[180px] xs:h-[210px] sm:h-[240px] rounded-2xl overflow-hidden shadow-md shadow-orange-500/10 border border-orange-200/70 relative bg-[#FFF3E6] z-10">
          <img
            src={loginMobileVisual}
            alt="Kanak Quantitative Yield Platform"
            className="w-full h-full object-cover object-center select-none pointer-events-none"
          />
        </div>

        {/* Middle Main Content */}
        <div className="my-auto py-1 sm:py-5 relative z-10 w-full max-w-sm space-y-3 sm:space-y-4">
          
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.08] font-display text-[#0A192F]">
            Precision. <br />
            Discipline. <br />
            <span className="text-[#F26522]">Yield.</span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed w-full max-w-[280px] xs:max-w-[340px] font-normal pt-0.5">
            Access your investment portfolio, daily earnings distribution, and referral network in one premium workspace.
          </p>

          {/* 3 Feature items with soft-box icons and labels underneath */}
          <div className="grid grid-cols-3 gap-1 xs:gap-2 sm:gap-4 pt-2.5 w-full max-w-[280px] xs:max-w-[340px]">
            {/* 1. Automated Strategies */}
            <div className="flex flex-col items-center text-center min-w-0">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 backdrop-blur-sm border border-orange-100 shadow-sm flex items-center justify-center text-[#F26522] mb-1 transition-transform hover:scale-105">
                <BarChart3 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="text-[8.5px] xs:text-[10px] font-bold text-slate-700 leading-tight">
                Automated<br />Strategies
              </span>
            </div>

            {/* 2. Secure & Transparent */}
            <div className="flex flex-col items-center text-center min-w-0">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 backdrop-blur-sm border border-orange-100 shadow-sm flex items-center justify-center text-[#F26522] mb-1 transition-transform hover:scale-105">
                <ShieldCheck className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="text-[8.5px] xs:text-[10px] font-bold text-slate-700 leading-tight">
                Secure &<br />Transparent
              </span>
            </div>

            {/* 3. Grow with Referrals */}
            <div className="flex flex-col items-center text-center min-w-0">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-xl bg-white/95 backdrop-blur-sm border border-orange-100 shadow-sm flex items-center justify-center text-[#F26522] mb-1 transition-transform hover:scale-105">
                <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <span className="text-[8.5px] xs:text-[10px] font-bold text-slate-700 leading-tight">
                Grow with<br />Referrals
              </span>
            </div>
          </div>
        </div>

        {/* Bottom spacing spacer on desktop */}
        <div className="hidden lg:block h-2" />
      </section>

      {/* ================= RIGHT / LOGIN FORM SECTION ================= */}
      <section className="w-full lg:w-[36%] xl:w-[35%] bg-[#F8F9FA] flex flex-col justify-between p-3 xs:p-6 sm:p-8 lg:p-10 xl:p-12 relative overflow-y-auto">
        
        {/* Top-Right Institutional Quote */}
        <div className="text-right hidden sm:block pr-2 pt-1">
          <div className="text-xs text-slate-500 font-medium tracking-tight font-serif italic">
            &ldquo;A Disciplined Approach to a Smarter Tomorrow.&rdquo;
          </div>
          <div className="w-8 h-0.5 bg-[#F26522] rounded-full mt-1.5 ml-auto" />
        </div>

        {/* Floating Centered Login Card */}
        <div className="my-auto flex justify-center py-3 sm:py-6 w-full min-w-0">
          <div className="w-full max-w-[430px] min-w-0 bg-white rounded-[24px] p-4 xs:p-7 sm:p-9 shadow-xl shadow-slate-200/50 border border-slate-100/90 transition-all duration-200">
            
            <form onSubmit={onSubmit} data-testid="login-form" className="space-y-4 sm:space-y-5 w-full min-w-0">
              
              {/* Header */}
              <div>
                <span className="text-[11px] font-bold text-[#F26522] tracking-widest uppercase block mb-1">
                  CLIENT ACCESS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight font-display">
                  Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 sm:mt-2 font-medium">
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
              <div className="space-y-3.5 sm:space-y-4 pt-1 w-full min-w-0">
                
                {/* EMAIL */}
                <div className="w-full min-w-0">
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative w-full min-w-0">
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
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/15 focus:border-[#F26522] transition-all font-normal"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="w-full min-w-0">
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
                  <div className="relative w-full min-w-0">
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
                      className="w-full min-w-0 pl-10 pr-11 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F26522]/15 focus:border-[#F26522] transition-all font-normal"
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
