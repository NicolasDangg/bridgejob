import Link from 'next/link';

const features = [
  {
    title: 'Readable fit summary',
    copy: 'A short summary keeps the result grounded, with just enough detail to explain the decision.',
  },
  {
    title: 'Readiness score',
    copy: 'A calm score bar turns a fuzzy judgment into a quick visual anchor.',
  },
  {
    title: 'Priority gaps',
    copy: 'Critical and important gaps stay separated so the next action is obvious.',
  },
  {
    title: 'Bridge steps',
    copy: 'Practical next steps are written to feel specific, workable, and easy to reuse.',
  },
];

const principles = [
  'Everything stays legible on first pass.',
  'Each block has a clear role in the hierarchy.',
  'The interface breathes, even when the content is dense.',
];

export default function FeaturesPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="hero">
          <div className="hero-copy panel">
            <p className="eyebrow">Features</p>
            <h1>Built to stay calm under a lot of information.</h1>
            <p className="lede">
              The revamp keeps the interface compact and readable so the important parts of the analysis feel intentional instead of crowded.
            </p>

            <div className="actions">
              <Link href="/dashboard" className="button">Open dashboard</Link>
              <Link href="/pricing" className="button secondary">See pricing</Link>
            </div>
          </div>

          <aside className="hero-stack panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Design principles</p>
                <h3>Restraint first</h3>
              </div>
              <span className="meta-label">Quiet UI</span>
            </div>

            <div className="trend-list">
              {principles.map((item, index) => (
                <article key={item} className="trend-card">
                  <p className="trend-label">0{index + 1}</p>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="role-card">
              <p className="trend-label">Feature</p>
              <strong>{feature.title}</strong>
              <p className="feed-copy">{feature.copy}</p>
            </article>
          ))}
        </section>

        <section className="workspace">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Workflow</p>
                <h2>How the page reads</h2>
              </div>
              <span className="meta-label">Linear, then layered</span>
            </div>

            <div className="mini-grid">
              <article className="mini-panel">
                <h3>1. Role summary</h3>
                <p className="feed-copy">A compact opening sets the context before the deeper cards begin.</p>
              </article>
              <article className="mini-panel">
                <h3>2. Score and gaps</h3>
                <p className="feed-copy">The visual score gives a fast read while the gap cards keep detail close by.</p>
              </article>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Bridge output</p>
                <h2>What stays visible</h2>
              </div>
              <span className="fit-pill moderate">Sample ready</span>
            </div>

            <div className="note-card">
              <strong>Bridge steps remain practical</strong>
              <p className="helper">
                The placeholder content keeps the tone grounded so the layout feels like a real product page rather than a demo wall.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
