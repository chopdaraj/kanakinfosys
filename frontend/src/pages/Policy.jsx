import React from "react";
import ClientLayout from "@/components/ClientLayout";
import { ShieldCheck, Lock, Coins, AlertTriangle } from "lucide-react";

const SectionCard = ({ title, children, icon: Icon }) => (
  <div className="kanak-card p-6 flex gap-4 items-start hover:border-blue-100 transition-colors duration-200">
    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mt-2">{children}</p>
    </div>
  </div>
);

export default function Policy() {
  return (
    <ClientLayout>
      <div className="space-y-8" data-testid="policy-page">
        {/* Header */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Operational terms</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Company Policy</h1>
          <p className="text-slate-500 text-sm mt-1">
            Transparent and disciplined capital protocols protecting investors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <SectionCard title="Minimum Investment" icon={Coins}>
            The minimum capital deposit accepted on the platform is <strong>₹1,00,000</strong> (one lakh rupees). Requests below this threshold will be automatically rejected.
          </SectionCard>

          <SectionCard title="6-Month Lock-in Period" icon={Lock}>
            All deposits are committed for a mandatory <strong>6-month duration</strong> from approval date. Principal withdraws are not allowed before expiry, providing strategic algorithmic market runway.
          </SectionCard>

          <SectionCard title="Daily Earning Payouts" icon={ShieldCheck}>
            Clients receive a target <strong>3% monthly yield</strong> distributed daily (pro-rated at approximately <strong>0.10% daily</strong>). A ₹1,00,000 principal receives ₹100 daily (~₹3,000/mo).
          </SectionCard>

          <SectionCard title="Risk Disclosure Statement" icon={AlertTriangle}>
            Algorithmic quantitative strategies carry inherent financial risks. Returns are target estimates and not legally guaranteed. Volatilities might affect payout distributions.
          </SectionCard>
        </div>
      </div>
    </ClientLayout>
  );
}
