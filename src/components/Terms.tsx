import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="flex-1 bg-surface-white py-24 px-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.2em] pt-2">Last Updated: April 16, 2026</p>
        </div>

        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              By accessing BridgeJob, you agree to be bound by these terms. Our service provides career intelligence and analysis results meant for professional development.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Professional Accuracy</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              While our AI-driven insights are highly accurate, they are intended as advisory intelligence. Users are responsible for verifying specific certification requirements with governing bodies.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Subscription Tiers</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Usage is governed by your selected subscription plan. Abuse of the API or scraping our intelligence data is strictly prohibited and will result in immediate termination. View our <Link to="/pricing" className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-slate-300">pricing plans</Link>.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Liability</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              BridgeJob is not liable for career decisions or recruitment outcomes. We provide the tools to visualize gaps; the bridging remains the user's professional journey.
            </p>
          </div>
        </section>

        <div className="pt-12 border-t border-border-subtle flex items-center justify-between">
          <Link to="/privacy" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            ← Privacy Policy
          </Link>
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
