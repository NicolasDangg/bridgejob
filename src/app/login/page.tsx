import Link from 'next/link';

const benefits = [
  'Keep saved analyses in one place.',
  'Return to bridge plans without starting over.',
  'Track your readiness history across revisions.',
];

export default function LoginPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="workspace">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Login</p>
                <h2>Sign in to BridgeJob</h2>
              </div>
              <span className="meta-label">Welcome back</span>
            </div>

            <div className="field" style={{ marginBottom: '14px' }}>
              <label>Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[rgba(37,99,235,0.4)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.10)]"
              />
            </div>

            <div className="field" style={{ marginBottom: '18px' }}>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[rgba(37,99,235,0.4)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.10)]"
              />
            </div>

            <div className="form-actions">
              <button className="button" type="button">Sign in</button>
              <p className="helper">
                New here? <Link href="/signup">Create an account</Link>.
              </p>
            </div>
          </div>

          <aside className="panel sticky">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Why sign in</p>
                <h2>Pick up where you left off</h2>
              </div>
              <span className="meta-label">Saved state</span>
            </div>

            <div className="trend-list">
              {benefits.map((item, index) => (
                <article key={item} className="trend-card">
                  <p className="trend-label">0{index + 1}</p>
                  <strong>{item}</strong>
                  <p className="feed-copy">
                    The login page stays minimal so the account action feels like part of the same calm flow.
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
