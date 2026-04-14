import Link from 'next/link';

const contacts = [
  { label: 'Support', value: 'help@bridgejob.app' },
  { label: 'Partnerships', value: 'team@bridgejob.app' },
  { label: 'Response time', value: 'Within one business day' },
];

export default function ContactPage() {
  return (
    <main className="page">
      <div className="shell route-shell">
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Contact us</p>
              <h2>We are here to help</h2>
            </div>
            <span className="meta-label">Short, direct, and human</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {contacts.map((item) => (
              <div key={item.label} className="rounded-3xl border border-[var(--border)] bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)] font-semibold">{item.label}</p>
                <p className="mt-3 text-sm font-medium text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="summary mt-6">
            Reach out if you want help with onboarding, setup, or making the fit summary feel more aligned with your workflow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="button">Back to home</Link>
            <Link href="/login" className="button secondary">Sign in</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
