import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="page">
      <div className="shell route-shell">
        <section className="panel auth-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">Sign up</p>
              <h2>Create your BridgeJob account</h2>
            </div>
          </div>
          <button className="button" type="button">Create account</button>
          <p className="helper" style={{ marginTop: '14px' }}>
            Already have an account? <Link href="/login">Sign in</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
