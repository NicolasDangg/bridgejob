import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="flex-1 bg-surface-white py-24 px-6 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.2em] pt-2">Last Updated: April 16, 2026</p>
        </div>

        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">1. Data Collection</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              gapless collects professional data including resumes, job descriptions, and career history to provide accurate gap analysis. We don't sell your personal data to third parties.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">2. Usage of AI Models</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Your data is processed by our proprietary AI models to generate career intelligence. We use anonymized, aggregated data to improve our training sets, ensuring zero PII leakage.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">3. Security</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              All data is encrypted in transit and at rest using enterprise-grade AES-256 encryption. Access is restricted via strict MFA protocols.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">4. Contact</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              For any privacy-related queries, please <Link to="/contact" className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-slate-300">contact our support team</Link>.
            </p>
          </div>
        </section>

        <div className="pt-12 border-t border-border-subtle flex items-center justify-between">
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            ← Home
          </Link>
          <Link to="/terms" className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
