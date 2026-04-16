import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";
import { CreditCard, History, Zap } from "lucide-react";

export default function Billing() {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-surface-off-white py-12 px-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="pb-8 border-b border-border-subtle flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Subscription</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your subscription tier and payment instruments.</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded border border-border-subtle shadow-sm">
              <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-bold uppercase">
                {user.email?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Billing Owner</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="enterprise-card md:col-span-2 p-8 space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Current Plan</h2>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Starter Professional</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your plan includes 10 full AI gap analyses per month and basic roadmap tracking.
                </p>
                {user && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Billing email: {user.email}
                  </p>
                )}
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-bold uppercase tracking-widest">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="enterprise-button h-10 px-8 text-[11px]">Upgrade to Enterprise</button>
              <button className="h-10 px-8 border border-border-subtle rounded text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel Subscription</button>
            </div>
          </div>

          <div className="enterprise-card p-8 space-y-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Payment</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold italic text-slate-400">VISA</div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">•••• 4242</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Exp 12/28</p>
                </div>
              </div>
              <button className="w-full h-8 border border-border-subtle rounded text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50">Edit Method</button>
            </div>
          </div>

          <div className="enterprise-card md:col-span-3">
            <div className="px-5 py-4 bg-surface-off-white border-b border-border-subtle flex items-center gap-3">
              <History className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Billing History</span>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                {[
                  { id: 'INV-2026-003', date: 'Mar 1, 2026', amount: '$29.00', status: 'Paid' },
                  { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '$29.00', status: 'Paid' },
                  { id: 'INV-2026-001', date: 'Jan 1, 2026', amount: '$29.00', status: 'Paid' }
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded transition-colors group">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{inv.id}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{inv.date}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xs font-bold text-slate-900">{inv.amount}</p>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                        {inv.status}
                      </span>
                      <button className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10">
          <Link to="/accounts" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            ← Back to Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}
