import Link from 'next/link';

const features = [
  {
    title: 'Readable fit summary',
    copy: 'The output stays blunt and compact, so the analysis feels useful instead of overwhelming.',
  },
  {
    title: 'Readiness bar',
    copy: 'A calm score bar keeps the decision visible while you scan the rest of the panel.',
  },
  {
    title: 'Priority chips',
    copy: 'Critical, important, and nice-to-have gaps are color-coded for faster review.',
  },
  {
    title: 'Onboarding modal',
    copy: 'A floating skip-able walkthrough makes the first run feel guided without being heavy.',
  },
];

export default function FeaturesPage() {
  return (
    <main className="page">
      <div className="shell route-shell">
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Features</p>
              <h2>Close the right skill gaps</h2>
            </div>
            <span className="meta-label">The useful parts, kept visible</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-[var(--border)] bg-white/70 p-5">
                <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{feature.copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="button">See the analyzer</Link>
            <Link href="/pricing" className="button secondary">View pricing</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
