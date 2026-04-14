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
          <button className="button" type="button">Sign in</button>
          <p className="helper" style={{ marginTop: '14px' }}>
            New here? <Link href="/signup">Create an account</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
