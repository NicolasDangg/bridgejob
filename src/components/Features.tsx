import { Link } from "react-router-dom";
import { BarChart2, ShieldCheck, Zap, Layers } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import ScrollFadeSection from "./ScrollFadeSection";

export default function Features() {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-surface-off-white py-24 px-4 overflow-auto">
      <ScrollFadeSection className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Capabilities</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Engineered for accuracy.</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            BridgeJob uses specialized analysis models to identify non-obvious fit signals and automate the career optimization workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Readiness Scoring',
              icon: BarChart2,
              copy: 'A high-precision percentage based on semantically mapped experience tokens. We look past job titles to actual capability match.',
            },
            {
              title: 'Gap Prioritization',
              icon: ShieldCheck,
              copy: 'Our engine ranks every gap by its impact on the hiring decision. Focus on the 20% of skills that drive 80% of the fit.',
            },
            {
              title: 'Bridge Roadmaps',
              icon: Zap,
              copy: 'Instant, actionable learning paths. We don\'t just tell you what\'s missing; we tell you the shortest path to closing it.',
            },
            {
              title: 'Semantic Filtering',
              icon: Layers,
              copy: 'Ignore keyword-stuffed "filler" requirements. We highlight the core operational needs of every job description.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="enterprise-card p-8 flex gap-6 hover:bg-white transition-colors group"
            >
              <div className="shrink-0 w-12 h-12 rounded bg-slate-50 border border-border-subtle flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">{feature.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-md p-12 text-center space-y-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">Ready to optimize your next move?</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Join thousands of professionals using BridgeJob to navigate their career with data-driven precision.
          </p>
          <div className="pt-2">
            <Link to={user ? "/dashboard" : "/signup"} className="enterprise-button h-11 px-8 text-sm border border-white/20">
              {user ? "Go to Dashboard" : "Start Free Analysis"}
            </Link>
          </div>
        </div>
      </ScrollFadeSection>
    </div>
  );
}
