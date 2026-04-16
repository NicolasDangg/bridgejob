import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Pricing() {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-surface-off-white py-24 px-4 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing & Tiers</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Plans for active career growth.</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Choose the subscription that matches your analysis volume. Simple, predictable pricing for professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '$0',
              description: 'For individuals starting their search.',
              points: ['3 analysis runs / mo', 'Basic fit summaries', 'Gap identification'],
              cta: user ? 'Current Plan' : 'Get Started',
              featured: false,
              path: user ? '/accounts' : '/signup',
              disabled: !!user
            },
            {
              name: 'Growth',
              price: '$12',
              period: '/mo',
              description: 'Most popular for active job seekers.',
              points: ['Unlimited analysis', 'Saved history', 'Detailed bridge roadmaps', 'PDF Exports'],
              cta: user ? 'Manage Subscription' : 'Subscribe to Growth',
              featured: true,
              path: user ? '/billing' : '/signup'
            },
            {
              name: 'Enterprise',
              price: 'Contact',
              description: 'For agencies and HR teams.',
              points: ['Team workspaces', 'Resume fitness checker (for HR)', 'Bulk analyze processes', 'Priority support'],
              cta: 'Contact Sales',
              featured: false,
              path: '/contact'
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`enterprise-card flex flex-col ${plan.featured ? 'border-accent-blue ring-1 ring-accent-blue/10' : ''}`}
            >
              <div className="p-8 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.name}</span>
                  {plan.featured && <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100 italic">Recommended</span>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-sm font-medium text-slate-400">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {plan.description}
                </p>
                <div className="h-px bg-border-subtle my-2" />
                <ul className="space-y-3 pt-2">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-xs text-slate-600 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-surface-off-white border-t border-border-subtle">
                <Link
                  to={plan.path}
                  className={`w-full h-10 flex items-center justify-center text-xs font-bold ${plan.featured ? 'enterprise-button' : 'enterprise-button-outline'
                    } ${(plan as any).disabled ? 'opacity-50 cursor-default pointer-events-none' : ''}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
