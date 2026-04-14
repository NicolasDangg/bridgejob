import Link from 'next/link';

const stats = [
  { label: 'Active analyses', value: '12' },
  { label: 'Saved bridge plans', value: '38' },
  { label: 'Ready to review', value: '7' },
];

const updates = [
  'The latest sample analysis is already pinned to the top of your workspace.',
  'Your readiness bars stay visible while you scroll through longer fit summaries.',
  'Priority chips now keep the gap hierarchy easy to scan at a glance.',
];

export default function DashboardPage() {
  return (
    <main className="page">
      <div className="shell route-shell">
        <section className="panel overflow-hidden">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Dashboard</p>
              <h2>Career intelligence hub</h2>
            </div>
            <span className="meta-label">Quiet overview, sharper actions</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-[var(--border)] bg-white/70 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)] font-semibold">{stat.label}</p>
                <p className="mt-3 text-3xl font-serif font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            {updates.map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.68)] p-4 text-sm leading-6 text-[var(--text)]">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="button">Open analyzer</Link>
            <Link href="/features" className="button secondary">Browse features</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
