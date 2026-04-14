'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import SampleResult from '../components/SampleResult';
import { getSupabaseBrowserClient } from '../lib/supabase';

type FitClass = 'strong' | 'moderate' | 'weak' | 'severely_underqualified';

type MatchItem = {
  skill?: string;
  note?: string;
  gap_detail?: string;
  priority?: string;
  learnability?: string;
  action?: string;
};

type AnalysisResponse = {
  job_title?: string;
  overall_fit?: string;
  overall_summary?: string;
  strong_matches?: MatchItem[];
  partial_matches?: MatchItem[];
  gaps?: MatchItem[];
  bridge_steps?: string[];
  noise_skills?: string[];
  readiness_score?: number;
  analyst_note?: string;
};

type RecentAnalysisItem = {
  id: string;
  job_title: string;
  overall_fit: string;
  readiness_score: number | null;
  created_at: string | null;
  analysis: AnalysisResponse | null;
};

type FitDisplay = {
  label: string;
  className: FitClass;
};

const SAMPLE_JD = 'Senior operations associate for a fast-growing hiring platform.\n\nYou will own candidate intake, coordinate with recruiters, keep records organized, and help teams move quickly. Strong communication, attention to detail, and comfort with spreadsheets are important. Familiarity with ATS tools, reporting, and basic SQL is a plus.';
const SAMPLE_SKILLS = 'Coordinated student projects, built simple dashboards in spreadsheets, wrote basic SQL queries, and communicated with teachers and classmates. Comfortable with structured workflows, checklists, and repetitive admin tasks.';

const FEATURE_CARDS = [
  {
    title: 'Professional by default',
    copy: 'Quiet hierarchy, clear spacing, and honest language that makes the analysis feel credible instead of loud.',
  },
  {
    title: 'Minimalist and light',
    copy: 'A warm neutral surface palette with restrained blue accents keeps the page calm and easy to read.',
  },
  {
    title: 'Cozy but efficient',
    copy: 'Soft cards, readable copy, and a compact workflow that feels supportive without hiding the hard parts.',
  },
];

const FIT_MAP: Record<string, FitDisplay> = {
  STRONG: { label: 'Strong fit', className: 'strong' },
  MODERATE: { label: 'Moderate fit', className: 'moderate' },
  WEAK: { label: 'Weak fit', className: 'weak' },
  SEVERELY_UNDERQUALIFIED: { label: 'Severely underqualified', className: 'severely_underqualified' },
};

function normalizeFit(value: unknown) {
  return String(value || 'MODERATE').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

function asList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

function formatDate(value: string | null) {
  if (!value) return 'just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'just now';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(parsed);
}

function fitLabel(value: unknown) {
  return FIT_MAP[normalizeFit(value)] || FIT_MAP.MODERATE;
}

function normalizePriority(value: unknown) {
  const normalized = String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (normalized === 'NICE_TO_HAVE' || normalized === 'NICE_TOHAVE') return 'NICE_TO_HAVE';
  if (normalized === 'CRITICAL') return 'CRITICAL';
  if (normalized === 'IMPORTANT') return 'IMPORTANT';
  return 'IMPORTANT';
}

function priorityTone(value: unknown) {
  const normalized = normalizePriority(value);
  if (normalized === 'NICE_TO_HAVE') return { label: 'NICE TO HAVE', className: 'nice_to_have' };
  if (normalized === 'CRITICAL') return { label: 'CRITICAL', className: 'critical' };
  return { label: 'IMPORTANT', className: 'important' };
}

export default function Home() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [jd, setJd] = useState('');
  const [skills, setSkills] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [recent, setRecent] = useState<RecentAnalysisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setLoadingHistory(false);
      setRecent([]);
      setMessage('Add Supabase env vars to enable saved history.');
      return;
    }

    let alive = true;

    async function loadHistory() {
      setLoadingHistory(true);
      const response = await client!
        .from('analyses')
        .select('id, job_title, overall_fit, readiness_score, created_at, analysis')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!alive) return;

      if (response.error) {
        setRecent([]);
        setMessage('Supabase is connected, but the analyses table is not ready yet.');
      } else {
        setRecent((response.data || []) as RecentAnalysisItem[]);
        setMessage('Saved history is live through Supabase.');
      }

      setLoadingHistory(false);
    }

    void loadHistory();

    return () => {
      alive = false;
    };
  }, [supabase]);

  async function refreshHistory() {
    const client = supabase;
    if (!client) return;

    const response = await client!
      .from('analyses')
      .select('id, job_title, overall_fit, readiness_score, created_at, analysis')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!response.error) {
      setRecent((response.data || []) as RecentAnalysisItem[]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, skills }),
      });

      const payload = (await response.json()) as AnalysisResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'The analysis request failed.');
      }

      setAnalysis(payload);

      if (supabase) {
        const insert = {
          job_title: payload.job_title || 'Untitled role',
          overall_fit: payload.overall_fit || 'MODERATE',
          overall_summary: payload.overall_summary || '',
          readiness_score: typeof payload.readiness_score === 'number' ? payload.readiness_score : null,
          job_description: jd,
          candidate_skills: skills,
          analysis: payload,
        };

        const saved = await supabase.from('analyses').insert(insert);

        if (saved.error) {
          setMessage('Analysis ran, but Supabase save needs the table and insert policy.');
        } else {
          setMessage('Saved to Supabase and ready in history.');
          void refreshHistory();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setJd(SAMPLE_JD);
    setSkills(SAMPLE_SKILLS);
    setMessage('Sample text loaded into the workspace.');
    setError('');
  }

  const fit = fitLabel(analysis?.overall_fit);
  const strongMatches = asList<MatchItem>(analysis?.strong_matches);
  const partialMatches = asList<MatchItem>(analysis?.partial_matches);
  const gaps = asList<MatchItem>(analysis?.gaps);
  const bridgeSteps = asList<string>(analysis?.bridge_steps);
  const noiseSkills = asList<string>(analysis?.noise_skills);
  const readinessScore = typeof analysis?.readiness_score === 'number' ? analysis.readiness_score : null;
  const readinessPercent = readinessScore === null ? 0 : Math.max(0, Math.min(100, readinessScore));
  const analystNote = analysis?.analyst_note ? String(analysis.analyst_note) : '';
  const canUseHistory = Boolean(supabase);

  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-copy">
              <strong>BridgeJob</strong>
              <span>Calm job-fit analysis for candidates and recruiters.</span>
            </div>
          </div>
          <div className="badges">
            <Link className="badge nav-link" href="/dashboard">Dashboard</Link>
            <Link className="badge nav-link" href="/pricing">Pricing</Link>
            <Link className="badge nav-link" href="/features">Features</Link>
            <Link className="badge nav-link" href="/contact">Contact</Link>
            <Link className="badge nav-link" href="/login">Login</Link>
            <Link className="badge nav-link" href="/signup">Sign up</Link>
          </div>
        {showOnboarding ? (
          <div className="onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
            <button className="onboarding-backdrop" type="button" aria-label="Dismiss onboarding" onClick={() => setShowOnboarding(false)} />
            <section className="onboarding-card">
              <div className="onboarding-card__header">
                <div>
                  <p className="panel-kicker">Onboarding</p>
                  <h2 id="onboarding-title">A calmer starting point</h2>
                  <p className="helper">The new design keeps the analysis approachable while the fit logic stays honest underneath.</p>
                </div>
                <button type="button" className="button secondary onboarding-skip" onClick={() => setShowOnboarding(false)}>
                  Skip
                </button>
              </div>
              <div className="onboarding-steps">
                {ONBOARDING_STEPS.map((step) => (
                  <article className="onboarding-step" key={step.id}>
                    <span className="onboarding-step__id">{step.id}</span>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Professional / minimalist / cozy</p>
            <h1>See the real fit before someone hits apply.</h1>
            <p className="lede">
              BridgeJob turns a job description and a candidate profile into a blunt, readable analysis.
              The new shell keeps the experience warm and calm, while the backend keeps the honest matching logic.
            </p>
            <div className="actions">
              <button className="button" type="button" onClick={() => document.getElementById('analyze-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Start analyzing
              </button>
              <button className="button secondary" type="button" onClick={loadSample}>
                Load sample inputs
              </button>
            </div>
            {message ? <p className="helper" style={{ marginTop: '16px' }}>{message}</p> : null}
            {error ? <p className="helper" style={{ marginTop: '10px', color: 'var(--danger)' }}>{error}</p> : null}
          </div>

          <div className="hero-stack">
            {FEATURE_CARDS.map((card) => (
              <div className="stack-card" key={card.title}>
                <strong>{card.title}</strong>
                <p>{card.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="sample-section">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Designed sample output</p>
                <h2>Reference analysis card</h2>
              </div>
            </div>
            <SampleResult />
          </div>
        </section>

        <section className="workspace" id="analyze-workspace">
          <div className="panel workspace-panel workspace-panel--input">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Analysis workspace</p>
                <h2>Paste a job and a candidate profile</h2>
              </div>
              <span className="meta-label">Honest output, no fluff</span>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="jd">Job description</label>
                <textarea
                  id="jd"
                  value={jd}
                  onChange={(event) => setJd(event.target.value)}
                  placeholder="Paste the JD here. Include responsibilities, tools, must-haves, and preferred skills."
                />
              </div>

              <div className="field">
                <label htmlFor="skills">Candidate skills</label>
                <textarea
                  id="skills"
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="Paste a resume, profile summary, or bullet list of the candidate's experience."
                />
              </div>

              <div className="form-actions">
                <button className="button" type="submit" disabled={loading}>
                  {loading ? 'Analyzing…' : 'Analyze match'}
                </button>
                <span className="form-status">{loading ? 'Waiting on the OpenRouter response.' : 'Result appears instantly in the right panel.'}</span>
              </div>
            </form>
          </div>

          <aside className="panel sticky workspace-panel workspace-panel--summary">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Output</p>
                <h2>Fit summary</h2>
              </div>
              <span className={'fit-pill ' + fit.className}>{fit.label}</span>
            </div>

            {analysis ? (
              <>
                {analystNote ? (
                  <div className="note-card analyst-note-card">
                    <strong>Analyst note</strong>
                    <p className="helper">{analystNote}</p>
                  </div>
                ) : null}

                <div className="readiness-card">
                  <div className="readiness-card__head">
                    <div>
                      <p className="panel-kicker">Readiness score</p>
                      <strong>{readinessScore === null ? "—" : readinessScore}</strong>
                    </div>
                    <span className="meta-label">Apple Weather style bar</span>
                  </div>

                  <div
                    className="readiness-bar"
                    aria-label={readinessScore === null ? "Readiness score unavailable" : "Readiness score " + readinessScore + " out of 100"}
                  >
                    {READINESS_BANDS.map((band) => {
                      const width = band.end - band.start;
                      return <div key={band.label} className="readiness-band" style={{ width: width + "%", backgroundColor: band.color }} title={band.label} />;
                    })}
                    {readinessScore !== null ? <span className="readiness-marker" style={{ left: readinessPercent + "%" }} /> : null}
                  </div>

                  <div className="readiness-labels">
                    {READINESS_BANDS.map((band) => <span key={band.label}>{band.label}</span>)}
                  </div>
                </div>

                <p className="summary">{analysis.overall_summary}</p>

                <div className="metric-row">
                  <div className="metric">
                    <span>Readiness score</span>
                    <strong>{readinessScore === null ? '—' : readinessScore}</strong>
                  </div>
                  <div className="metric">
                    <span>Strong matches</span>
                    <strong>{strongMatches.length}</strong>
                  </div>
                  <div className="metric">
                    <span>Gaps</span>
                    <strong>{gaps.length}</strong>
                  </div>
                </div>

                <div className="mini-grid">
                  <div className="mini-panel">
                    <h3>Strong matches</h3>
                    <div className="chips">
                      {strongMatches.length ? strongMatches.map((item, index) => (
                        <span className="chip" key={item.skill || index}>{item.skill}</span>
                      )) : <p className="helper">No strong matches were called out.</p>}
                    </div>
                  </div>

                  <div className="mini-panel">
                    <h3>Priority gaps</h3>
                    {gaps.length || partialMatches.length ? (
                      <div className="note-row">
                        {partialMatches.map((item, index) => {
                          const priority = priorityTone(item.priority);
                          return (
                            <div className="note-card gap-card" key={(item.skill || 'partial') + index}>
                              <div className="note-card-head">
                                <strong>{item.skill}</strong>
                                <span className={'priority-chip priority-chip--' + priority.className}>{priority.label}</span>
                              </div>
                              <p className="helper">{item.gap_detail}</p>
                              <p className="helper">Learnability: {item.learnability}</p>
                              <p className="helper">{item.action}</p>
                            </div>
                          );
                        })}
                        {gaps.map((item, index) => {
                          const priority = priorityTone(item.priority);
                          return (
                            <div className="note-card gap-card" key={(item.skill || 'gap') + index}>
                              <div className="note-card-head">
                                <strong>{item.skill}</strong>
                                <span className={'priority-chip priority-chip--' + priority.className}>{priority.label}</span>
                              </div>
                              <p className="helper">Learnability: {item.learnability}</p>
                              <p className="helper">{item.action}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="helper">No concrete gaps were identified.</p>
                    )}
                  </div>
                </div>

                <div className="mini-panel" style={{ marginBottom: '14px' }}>
                  <h3>Bridge steps</h3>
                  {bridgeSteps.length ? (
                    <ol className="list">
                      {bridgeSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="helper">The analyst did not return action steps for this run.</p>
                  )}
                </div>

                <div className="note-row">
                  {noiseSkills.length ? (
                    <div className="note-card">
                      <strong>Noise filtered out</strong>
                      <p className="helper">{noiseSkills.join(', ')}</p>
                    </div>
                  ) : null}
                  {analysis.analyst_note ? (
                    <div className="note-card">
                      <strong>Analyst note</strong>
                      <p className="helper">{analysis.analyst_note}</p>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>No analysis yet</h3>
                <p>
                  Paste a JD and candidate profile to get a blunt fit summary, a gap map, and a ranked next-step plan.
                  This panel stays calm and readable so the result feels like a product, not a wall of JSON.
                </p>
              </div>
            )}
          </aside>
        </section>

        <section className="history-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Recent analyses</p>
                <h2>Supabase history</h2>
              </div>
              <span className="meta-label">{canUseHistory ? 'Saved automatically after each run' : 'Connect Supabase to turn this on'}</span>
            </div>

            {loadingHistory ? (
              <p className="helper">Loading saved analyses…</p>
            ) : recent.length ? (
              <div className="history-list">
                {recent.map((item) => {
                  const recentFit = fitLabel(item.overall_fit);
                  const recentAnalysis = item.analysis || null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="history-item"
                      onClick={() => recentAnalysis && setAnalysis(recentAnalysis)}
                    >
                      <div>
                        <strong>{item.job_title}</strong>
                        <span>{typeof item.readiness_score === 'number' ? 'Readiness score ' + item.readiness_score : 'Saved analysis'} · {formatDate(item.created_at)}</span>
                      </div>
                      <div className="history-meta">
                        <span className={'fit-pill ' + recentFit.className}>{recentFit.label}</span>
                        <span className="meta-label">Load this result</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="helper">No saved analyses yet. Run one to populate the history list.</p>
            )}
          </div>

          <div className="note-panel panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">Deployment setup</p>
                <h2>Vercel + Supabase</h2>
              </div>
              <span className="meta-label">Same lightweight setup as the dashboard</span>
            </div>

            <div className="deployment-list">
              <div className="deployment-step">
                <div className="step-bullet">1</div>
                <div>
                  <strong>Deploy on Vercel</strong>
                  <p className="footer-note">Connect the migrate branch, keep the default Next.js build, and let Vercel generate previews for the PR.</p>
                </div>
              </div>
              <div className="deployment-step">
                <div className="step-bullet">2</div>
                <div>
                  <strong>Add env vars</strong>
                  <p className="footer-note">Set OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Vercel project settings.</p>
                </div>
              </div>
              <div className="deployment-step">
                <div className="step-bullet">3</div>
                <div>
                  <strong>Create the Supabase table</strong>
                  <p className="footer-note">Use the schema in README so analysis runs can save into the analyses table and show up in the history list.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
