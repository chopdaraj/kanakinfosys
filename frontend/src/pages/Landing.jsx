import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, LineChart, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

const Stat = ({ label, value }) => (
  <div className="border-l-2 border-[#F26522] pl-4">
    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="text-xl font-bold font-mono-num text-slate-800 dark:text-white mt-1">{value}</div>
  </div>
);

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col justify-between font-body transition-colors duration-300">
      {/* Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center" data-testid="landing-brand">
            <img 
              src="/assets/kanak-logo.png" 
              alt="Kanak Infosys Logo" 
              className="h-10 w-auto object-contain hover:scale-105 transition duration-300" 
            />
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="px-5 py-2.5 bg-[#F26522] hover:bg-[#E45516] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/15 active:scale-95 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  data-testid="landing-login-link" 
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#F26522] transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  data-testid="landing-register-link"
                  className="px-5 py-2.5 bg-[#F26522] hover:bg-[#E45516] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/15 active:scale-95 transition-all"
                >
                  Open Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 py-16 lg:py-24 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#F26522] border border-orange-200/50 dark:border-orange-800/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Institutional Quantitative Capital
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] font-display">
                Systematic returns, <br />
                <span className="text-[#F26522] bg-gradient-to-r from-[#F26522] to-amber-500 bg-clip-text text-transparent">
                  engineered daily.
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Kanak Infosys deploys automated quantitative strategies, targeting a projected{" "}
                <strong className="text-slate-800 dark:text-slate-200 font-bold">3% monthly yield</strong> credited daily, protected by a disciplined 6-month capital lock-in structure.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register"}
                  data-testid="hero-cta-register"
                  className="px-6 py-3.5 bg-[#F26522] hover:bg-[#E45516] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                >
                  {user ? "Open Dashboard" : "Start Investing"} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"}
                  data-testid="hero-cta-login"
                  className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-orange-200 hover:text-[#F26522] hover:bg-orange-50/40 dark:hover:bg-slate-750 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  {user ? "My Account" : "Client Access"}
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100 dark:border-slate-800 max-w-md">
                <Stat label="Monthly Yield" value="3.00%" />
                <Stat label="Min. Deposit" value="₹1,00,000" />
                <Stat label="Lock-in Duration" value="6 Months" />
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300">
                <img
                  src="/assets/kanak-hero.png"
                  alt="Kanak Infosys Yield Growth"
                  className="w-full h-auto object-contain rounded-3xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-16 bg-[#F8F9FB] dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: LineChart, 
                  title: "Daily Earning Crediting", 
                  body: "Your share of the 3% monthly yield targets is computed and credited to your ledger dashboard daily." 
                },
                { 
                  icon: ShieldCheck, 
                  title: "Capital Safeguards", 
                  body: "Risk-managed strategies deploy principal under a mandatory 6-month capital commit." 
                },
                { 
                  icon: Users, 
                  title: "Affiliate Commissions", 
                  body: "Unlock recurring daily referral payouts by introducing partners to our platform network." 
                }
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div 
                    key={i} 
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-200/60 dark:hover:border-orange-500/30 transition-all duration-300"
                  >
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/50 text-[#F26522] border border-orange-100 dark:border-orange-900/50 rounded-2xl inline-block">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6">{f.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold transition-colors">
        © {new Date().getFullYear()} Kanak Infosys. Private Algorithmic Trading Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
