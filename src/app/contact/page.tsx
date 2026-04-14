import Link from 'next/link';

const contacts = [
  {
    label: 'Support',
    value: 'help@bridgejob.app',
    detail: 'Best for product questions, account help, and onboarding issues.',
  },
  {
    label: 'Partnerships',
    value: 'team@bridgejob.app',
    detail: 'Best for school, advisor, or recruiting team conversations.',
  },
  {
    label: 'Response time',
    value: 'Within one business day',
    detail: 'Most simple requests are answered sooner during weekday hours.',
  },
];

const hours = ['Monday to Friday', '09:00–18:00 GMT+7', 'Short replies, human tone'];

export default function ContactPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="hero">
          <div className="hero-copy panel">
            <p className="eyebrow">Contact</p>
            <h1>Direct, human, and easy to reach.</h1>
            <p className="lede">
              A small contact page with enough warmth to feel real, and enough restraint to stay consistent with the rest of the revamp.
            </p>

            <div className="actions">
              <Link href="/signup" className="button">Create account</Link>
              <Link href="/login" className="button secondary">Sign in</Link>
            </div>
          </div>

          <aside className="hero-stack panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Support window</p>
                <h3>When to expect a reply</h3>
              </div>
              <span className="meta-label">Weekdays only</span>
            </div>

            <div className="trend-list">
              {hours.map((item, index) => (
                <article key={item} className="trend-card">
                  <p className="trend-label">0{index + 1}</p>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="workspace">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Reach out</p>
                <h2>Contact points</h2>
              </div>
              <span className="meta-label">Short and clear</span>
            </div>

            <div className="mini-grid">
              {contacts.map((item) => (
                <article key={item.label} className="mini-panel">
                  <p className="trend-label">{item.label}</p>
                  <strong>{item.value}</strong>
                  <p className="feed-copy">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Message draft</p>
                <h2>What to include</h2>
              </div>
              <span className="fit-pill moderate">Helpful context</span>
            </div>

            <div className="field" style={{ marginBottom: '14px' }}>
              <label>Name</label>
              <input
                type="text"
                readOnly
                value="Your name"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="field" style={{ marginBottom: '14px' }}>
              <label>Subject</label>
              <input
                type="text"
                readOnly
                value="Account setup and a quick question"
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="field">
              <label>Message</label>
              <textarea
                readOnly
                value={'Hi BridgeJob team,\n\nI would like help with onboarding and a small question about the new layout.\n\nThank you.'}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
