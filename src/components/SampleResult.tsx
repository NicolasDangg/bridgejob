import { useMemo, useState } from 'react';
import sampleDataJson from '../lib/sampleData.json';

type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  priority?: string;
  learnability?: string;
  action?: string;
};

type FitResponse = {
  job_title: string;
  overall_fit: 'STRONG' | 'MODERATE' | 'WEAK' | 'SEVERELY_UNDERQUALIFIED';
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

const sampleData = sampleDataJson as FitResponse;

const READINESS_BANDS = [
  { label: 'Mismatch', start: 0, end: 20, color: '#ef4444' },
  { label: 'Stretch', start: 20, end: 40, color: '#f59e0b' },
  { label: 'Workable', start: 40, end: 60, color: '#22c55e' },
  { label: 'Strong', start: 60, end: 80, color: '#38bdf8' },
  { label: 'Ready', start: 80, end: 100, color: '#6366f1' },
];

const fitToneMap: Record<FitResponse['overall_fit'], string> = {
  STRONG: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  MODERATE: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  WEAK: 'bg-red-500/20 text-red-300 border-red-400/40',
  SEVERELY_UNDERQUALIFIED: 'bg-red-500/20 text-red-300 border-red-400/40',
};

const priorityToneMap: Record<string, string> = {
  CRITICAL: 'priority-chip--critical',
  IMPORTANT: 'priority-chip--important',
  NICE_TO_HAVE: 'priority-chip--nice',
};

function normalizePriority(value?: string) {
  const normalized = String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  if (normalized === 'NICE_TO_HAVE' || normalized === 'NICE_TOHAVE') return 'NICE_TO_HAVE';
  if (normalized === 'CRITICAL') return 'CRITICAL';
  return 'IMPORTANT';
}

export default function SampleResult() {
  const jdText =
    'Senior operations associate role supporting recruiter workflows, ATS reporting, SQL-based reporting, and stakeholder coordination.';
  const candidateText =
    'Student project coordinator with Excel and basic SQL familiarity, strong attention to detail, and experience running repeatable processes.';
  const [response, setResponse] = useState<FitResponse | null>(sampleData);

  const readinessTone = useMemo(() => {
    if (!response) return 'bg-white/10 text-white/70 border-white/20';
    if (response.readiness_score >= 75) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    if (response.readiness_score >= 45) return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    return 'bg-red-500/20 text-red-300 border-red-400/40';
  }, [response]);

  const runSampleAnalysis = () => {
    if (!jdText.trim() || !candidateText.trim()) return;
    setResponse(sampleData);
  };

  return (
    <div className="sample-result-layout">
      <div className="sample-panel sample-panel--input">
        <h2 className="sample-heading">Try The Fit Analyzer</h2>
        <p className="sample-lede">Enter a job description and candidate experience. This preview uses the sample JSON response so the UI stays populated.</p>

        <div className="sample-inputs">
          <label className="sample-field">
            <span className="sample-field__label">Job Description</span>
            <textarea value={jdText} readOnly placeholder="Paste the JD here" />
          </label>

          <label className="sample-field">
            <span className="sample-field__label">Candidate Experience</span>
            <textarea value={candidateText} readOnly placeholder="Paste resume or experience summary" />
          </label>
        </div>

        <button type="button" onClick={runSampleAnalysis} className="sample-button">
          Login/Signup to Run Analysis
        </button>
      </div>

      <div className="sample-panel sample-panel--output">
        {response ? (
          <div className="sample-output-stack">
            <div className="sample-output-head">
              <div>
                <p className="sample-kicker">Fit Summary</p>
                <h3>{response.job_title}</h3>
              </div>
              <div className="sample-pill-row">
                <span className={'sample-pill ' + fitToneMap[response.overall_fit]}>{response.overall_fit} FIT</span>
                <span className={'sample-pill ' + readinessTone}>{response.readiness_score}% READY</span>
              </div>
            </div>

            <div className="note-card analyst-note-card">
              <strong>Analyst note</strong>
              <p className="helper">{response.analyst_note}</p>
            </div>

            <div className="readiness-card">
              <div className="readiness-card__head">
                <div>
                  <p className="panel-kicker">Readiness score</p>
                  <strong>{response.readiness_score}</strong>
                </div>
                <span className="meta-label">Apple Weather style bar</span>
              </div>
              <div className="readiness-bar" aria-label={'Readiness score ' + response.readiness_score + ' out of 100'}>
                {READINESS_BANDS.map((band) => {
                  const width = band.end - band.start;
                  return <div key={band.label} className="readiness-band" style={{ width: width + '%', backgroundColor: band.color }} title={band.label} />;
                })}
                <span className="readiness-marker" style={{ left: response.readiness_score + '%' }} />
              </div>
              <div className="readiness-labels">
                {READINESS_BANDS.map((band) => <span key={band.label}>{band.label}</span>)}
              </div>
            </div>

            <p className="sample-summary">{response.overall_summary}</p>

            <div className="metric-row sample-metric-row">
              <div className="metric"><span>Strong matches</span><strong>{response.strong_matches.length}</strong></div>
              <div className="metric"><span>Priority gaps</span><strong>{response.partial_matches.length}</strong></div>
              <div className="metric"><span>Readiness</span><strong>{response.readiness_score}%</strong></div>
            </div>

            <div className="sample-section-card">
              <p className="sample-section-label">Strong Match</p>
              {response.strong_matches.map((match, index) => (
                <div key={index} className="sample-strong-match">
                  <p className="sample-strong-match__title">{match.skill}</p>
                  {match.note ? <p className="helper">{match.note}</p> : null}
                </div>
              ))}
            </div>

            <div className="sample-gap-list">
              {response.partial_matches.map((match, index) => {
                const priority = normalizePriority(match.priority);
                return (
                  <div key={index} className="sample-gap-card">
                    <div className="sample-gap-head">
                      <p className="sample-gap-title">{match.skill}</p>
                      <span className={'priority-chip ' + priorityToneMap[priority]}>{priority.replace(/_/g, ' ')}</span>
                    </div>
                    {match.gap_detail ? <p className="helper">{match.gap_detail}</p> : null}
                    {match.action ? <p className="helper">Action: {match.action}</p> : null}
                    {match.learnability ? <p className="helper">Learnability: {match.learnability}</p> : null}
                  </div>
                );
              })}
            </div>

            <div className="sample-section-card">
              <p className="sample-section-label">Bridge Steps</p>
              <ul className="list sample-list">
                {response.bridge_steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="sample-empty">Run analysis to see the fit summary.</div>
        )}
      </div>
    </div>
  );
}
