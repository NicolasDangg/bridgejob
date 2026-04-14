import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    tone: 'best for trying the flow',
    highlighted: false,
    features: ['Sample analysis preview', 'Basic fit summary', 'One saved bridge plan'],
  },
  {
    name: 'Pro',
    price: '$12',
    tone: 'for personal job search loops',
    highlighted: true,
    features: ['Unlimited saved analyses', 'Priority gap cards', 'Exportable bridge steps'],
  },
  {
    name: 'Team',
    price: '$34',
    tone: 'for advisors and small cohorts',
    highlighted: false,
    features: ['Shared workspace', 'Comment-ready views', 'Guided review checklist'],
  },
];

const include = [
  'Clean, calm layouts that keep the analysis easy to scan.',
  'No distracting upsells or noisy interface layers.',
  'A simple upgrade path from solo use to guided review.',
];

export default function PricingPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="hero">
          <div className="hero-copy panel">
            <p className="eyebrow">Pricing</p>
            <h1>Simple plans, no clutter.</h1>
            <p className="lede">
              Pricing stays intentionally lightweight so the product feels approachable at first glance and still scales cleanly for frequent use.
            </p>

            <div className="actions">
              <Link href="/signup" className="button">Start free</Link>
              <Link href="/contact" className="button secondary">Talk to us</Link>
            </div>
          </div>

          <aside className="hero-stack panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">What’s included</p>
                <h3>Shared across every plan</h3>
              </div>
              <span className="meta-label">Consistent baseline</span>
            </div>

            <div className="trend-list">
              {include.map((item, index) => (
                <article key={item} className="trend-card">
                  <p className="trend-label">0{index + 1}</p>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="feature-grid">
          {plans.map((plan) => (
            <article key={plan.name} className={`role-card ${plan.highlighted ? 'selected' : ''}`}>
              <div className="role-top">
                <div>
                  <p className="trend-label">{plan.tone}</p>
                  <strong>{plan.name}</strong>
                </div>
                {plan.highlighted ? <span className="fit-pill strong">Most popular</span> : <span className="fit-pill moderate">Included</span>}
              </div>

              <p className="summary-title" style={{ margin: '0 0 14px' }}>
                <span style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif), Georgia, serif' }}>{plan.price}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>/ month</span>
              </p>

              <ul className="list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="actions" style={{ marginTop: '18px' }}>
                <Link href={plan.highlighted ? '/signup' : '/contact'} className="button">
                  {plan.highlighted ? 'Choose Pro' : 'Select plan'}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
