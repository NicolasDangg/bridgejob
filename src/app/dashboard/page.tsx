import Link from 'next/link';

const stats = [
  { label: 'Sessions this week', value: '18', note: '+4 from last week' },
  { label: 'Saved bridge plans', value: '42', note: '12 ready to revisit' },
  { label: 'Roles in review', value: '7', note: '3 need a final pass' },
];

const activity = [
  {
    title: 'Latest fit analysis',
    copy: 'Senior operations role scored as a moderate fit with clear SQL and workflow gaps.',
  },
  {
    title: 'Resume notes',
    copy: 'A cleaner summary block was pinned to the top of the candidate workspace.',
  },
  {
    title: 'Priority review',
    copy: 'Critical gaps are now grouped ahead of optional ones so the next step is easier to see.',
  },
];

const nextSteps = [
  'Refine the strongest match section before sharing the result.',
  'Add one more bridge step for each critical gap.',
  'Prepare a short version for mobile review and quick copy.',
];

export default function DashboardPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="hero">
          <div className="hero-copy panel">
            <p className="eyebrow">Dashboard</p>
            <h1>Quiet overview, sharper next moves.</h1>
            <p className="lede">
              A restrained workspace for tracking analyses, revisiting saved bridge plans, and keeping the next action visible without adding noise.
            </p>

            <div className="actions">
              <Link href="/" className="button">Open analyzer</Link>
              <Link href="/features" className="button secondary">Explore features</Link>
            </div>
          </div>

          <aside className="hero-stack panel sticky">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Snapshot</p>
                <h3>Workspace status</h3>
              </div>
              <span className="meta-label">Live sample data</span>
            </div>

            <div className="metric-row">
              {stats.map((stat) => (
                <div key={stat.label} className="metric">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>

            <div className="mini-grid">
              {activity.map((item) => (
                <article key={item.title} className="mini-panel">
                  <h3>{item.title}</h3>
                  <p className="feed-copy">{item.copy}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="workspace">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Next steps</p>
                <h2>What to polish next</h2>
              </div>
              <span className="meta-label">Focused by design</span>
            </div>

            <div className="trend-list">
              {nextSteps.map((step, index) => (
                <div key={step} className="trend-card">
                  <p className="trend-label">Step 0{index + 1}</p>
                  <strong>{step}</strong>
                  <p className="feed-copy">
                    Keep the wording short, keep the hierarchy visible, and let the strongest signal stay at the top.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Bridge plan</p>
                <h2>Current analysis tone</h2>
              </div>
              <span className="fit-pill moderate">Moderate fit</span>
            </div>

            <div className="note-card analyst-note-card">
              <div className="note-card-head">
                <strong>Analyst note</strong>
                <span className="meta-label">Balanced</span>
              </div>
              <p className="helper">
                Candidate has a useful base in structured work and spreadsheets, with the main gaps clustered around reporting depth and ATS familiarity.
              </p>
            </div>

            <div className="chips">
              <span className="chip">SQL fundamentals</span>
              <span className="chip">Spreadsheet reporting</span>
              <span className="chip">Stakeholder coordination</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
