import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, LineChart, Users, Compass, Coins, Award } from "lucide-react";

const Stat = ({ label, value }) => (
  <div className="border-l-2 border-blue-700 pl-4">
    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="text-xl font-bold font-mono-num text-slate-800 mt-1">{value}</div>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-800 flex flex-col justify-between">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3" data-testid="landing-brand">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/10">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <div>
              <div className="font-bold text-base leading-none text-slate-900 tracking-tight">KANAK</div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider">INFOSYS</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" data-testid="landing-login-link" className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition">
              Login
            </Link>
            <Link
              to="/register"
              data-testid="landing-register-link"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 active:scale-95 transition-all"
            >
              Open Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative bg-white border-b border-slate-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Institutional Quantitative Capital
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-none">
                Systematic returns, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">engineered daily.</span>
              </h1>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Kanak Infosys deploys automated quantitative strategies, targeting a projected <strong className="text-slate-800 font-bold">3% monthly yield</strong> credited daily, protected by a disciplined 6-month capital lock-in structure.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/register"
                  data-testid="hero-cta-register"
                  className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-95 transition-all"
                >
                  Start Investing <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  data-testid="hero-cta-login"
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
                >
                  Client Access
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-50 max-w-md">
                <Stat label="Monthly Yield" value="3.00%" />
                <Stat label="Min. Deposit" value="₹1,00,000" />
                <Stat label="Lock-in Duration" value="6 Months" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden relative shadow-xl shadow-slate-100">
                <img
                  src="https://images.pexels.com/photos/6203470/pexels-photo-6203470.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=600"
                  alt="Financial analytics"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-16 bg-[#F7F9FC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: LineChart, title: "Daily Earning Crediting", body: "Your share of the 3% monthly yield targets is computed and credited to your ledger dashboard daily." },
                { icon: ShieldCheck, title: "Capital Safeguards", body: "Risk-managed strategies deploy principal under a mandatory 6-month capital commit." },
                { icon: Users, title: "Affiliate Commissions", body: "Unlock recurring daily referral payouts by introducing partners to our platform network." }
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="kanak-card p-8 hover:border-blue-100 transition duration-300">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl inline-block">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mt-6">{f.title}</h3>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-100 text-center text-xs text-slate-400 font-semibold">
        © {new Date().getFullYear()} Kanak Infosys. Private Algorithmic Trading Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
