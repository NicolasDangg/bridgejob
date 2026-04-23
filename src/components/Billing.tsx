import { useAuth } from "../lib/AuthContext";
import { CreditCard, History, Zap } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

export default function Billing() {
  const { user, userPlan } = useAuth();

  const handleStripePortal = async () => {
    // --- STRIPE IMPLEMENTATION PLACEHOLDER ---
    // In production, this would call your backend to create a Stripe Checkout or Portal session
    // Example: 
    // const { data } = await supabase.functions.invoke('create-portal-session');
    // window.location.assign(data.url);
    console.log("Stripe portal requested");
    alert("Billing portal integration is coming soon. Please contact support for tier changes.");
  };

  return (
    <DashboardLayout activeLabel="Settings">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="pb-8 border-b border-gray-100 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Subscription</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your subscription tier and payment instruments.</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-md border border-gray-200 shadow-sm">
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white text-[10px] font-bold uppercase">
                {user.email?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Billing Owner</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-md md:col-span-2 p-8 space-y-8 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Current Plan</h2>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{userPlan}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {userPlan.includes('Free')
                    ? "Your current free tier includes basic AI analysis and limited roadmap tracking."
                    : userPlan.includes('Pro')
                      ? "Your Pro plan includes unlimited AI gap analyses and full strategic roadmap features."
                      : "Your Enterprise plan includes team-wide oversight and advanced HR reporting tools."}
                </p>
                {user && (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Billing email: {user.email}
                  </p>
                )}
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-widest">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleStripePortal}
                className="w-full py-2 bg-slate-900 text-white rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                {userPlan.includes('Enterprise') ? 'Manage Organization' : 'Upgrade Plan'}
              </button>
              <button
                onClick={handleStripePortal}
                className="w-full py-2 border border-gray-200 rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Manage Billing
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Payment</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold italic text-slate-400">VISA</div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">•••• 4242</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Exp 12/28</p>
                </div>
              </div>
              <button className="w-full h-8 border border-gray-200 rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">Edit Method</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md md:col-span-3 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <History className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing History</span>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                {[
                  { id: 'INV-2026-003', date: 'Mar 1, 2026', amount: '$29.00', status: 'Paid' },
                  { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '$29.00', status: 'Paid' },
                  { id: 'INV-2026-001', date: 'Jan 1, 2026', amount: '$29.00', status: 'Paid' }
                ].map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-md transition-colors group">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{inv.id}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{inv.date}</p>
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
      </div>
    </DashboardLayout>
  );
}
