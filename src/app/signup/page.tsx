import Link from 'next/link';

const benefits = [
  'Start with the sample analyzer and explore the layout immediately.',
  'Save bridge steps once you begin refining real roles.',
  'Move into a cleaner review flow when you are ready.',
];

export default function SignupPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="workspace">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Sign up</p>
                <h2>Create your BridgeJob account</h2>
              </div>
              <span className="meta-label">Start simple</span>
            </div>

            <div className="field" style={{ marginBottom: '14px' }}>
              <label>Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[rgba(37,99,235,0.4)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.10)]"
              />
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
                placeholder="Choose a password"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[rgba(37,99,235,0.4)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.10)]"
              />
            </div>

            <div className="form-actions">
              <button className="button" type="button">Create account</button>
              <p className="helper">
                Already have an account? <Link href="/login">Sign in</Link>.
              </p>
            </div>
          </div>

          <aside className="panel sticky">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Why join</p>
                <h2>A smoother first step</h2>
              </div>
              <span className="meta-label">Ready when you are</span>
            </div>

            <div className="trend-list">
              {benefits.map((item, index) => (
                <article key={item} className="trend-card">
                  <p className="trend-label">0{index + 1}</p>
                  <strong>{item}</strong>
                  <p className="feed-copy">
                    The signup flow mirrors the same calm layout language as the rest of the product.
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
