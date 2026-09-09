import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const formatErr = (d) => {
  if (!d) return "Something went wrong";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => e.msg || JSON.stringify(e)).join(", ");
  if (d.msg) return d.msg;
  return String(d);
};

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referral_code: params.get("ref") || "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.referral_code) delete payload.referral_code;
      const u = await register(payload);
      toast.success(`Welcome to Kanak Infosys, ${u.name}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatErr(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8F9FB] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Access Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-black/20 animate-fade-in-up transition-colors">
          <form onSubmit={onSubmit} data-testid="register-form" className="space-y-6">
            <div className="lg:hidden mb-6 flex justify-center">
              <Link to="/" className="inline-block bg-white p-2 px-5 rounded-2xl shadow-sm border border-slate-100">
                <img src="/assets/kanak-logo.png" alt="Kanak Infosys" className="h-8 w-auto object-contain" />
              </Link>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Join the fund</span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Create Account</h1>
              <p className="text-xs text-slate-500 mt-2">
                Already registered?{" "}
                <Link to="/login" data-testid="register-login-link" className="text-[#F26522] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={set("name")}
                  data-testid="register-name-input"
                  placeholder="Rajesh Kumar"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  data-testid="register-email-input"
                  placeholder="you@company.com"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set("password")}
                  data-testid="register-password-input"
                  placeholder="Min. 6 characters"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 block mb-1.5">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={form.referral_code}
                  onChange={set("referral_code")}
                  data-testid="register-referral-input"
                  placeholder="KNK-XXXXXXXX"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F26522]/20 focus:border-[#F26522] font-mono font-bold uppercase placeholder:text-slate-300 dark:placeholder:text-slate-650 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                data-testid="register-submit-button"
                className="w-full py-3.5 text-sm font-semibold text-white kanak-gradient-btn"
              >
                {loading ? "Creating Account..." : "Register Account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Visual side panel */}
      <div className="hidden lg:block relative bg-[#FFF5EF] order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFE6D5] to-[#FFF5EF] opacity-95" />
        <div className="relative h-full flex flex-col justify-between p-12 text-slate-800 z-10">
          <Link to="/" data-testid="register-brand-link" className="flex items-center gap-3 self-end">
            <div className="bg-white p-2 px-5 rounded-2xl shadow-md border border-orange-100">
              <img src="/assets/kanak-logo.png" alt="Kanak Infosys Logo" className="h-8 w-auto object-contain" />
            </div>
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight max-w-sm font-display text-slate-900">
              Compounding <br />Network & <br /><span className="text-[#F26522]">Yield.</span>
            </h2>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-sm font-medium">
              Each new investor compounds the network scale. Lock your principal for structured yields and earn passive commissions from direct partners.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            6-Month Lock-in · Min ₹1,00,000 · Daily Payouts
          </div>
        </div>
      </div>
    </div>
  );
}
