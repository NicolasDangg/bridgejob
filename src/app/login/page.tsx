import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="page">
      <div className="shell route-shell">
        <section className="panel auth-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Login</p>
              <h2>Sign in to BridgeJob</h2>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4 text-sm text-[var(--muted)]">
              Keep your saved analyses, bridge steps, and readiness history in one place.
            </div>
            <button className="button" type="button">Sign in</button>
          </div>

          <p className="helper" style={{ marginTop: '14px' }}>
            New here? <Link href="/signup">Create an account</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
