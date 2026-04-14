import { useMemo, useState } from 'react';

type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  priority?: 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
  learnability?: 'FAST' | 'MEDIUM' | 'SLOW';
  action?: string;
};

type FitResponse = {
  job_title: string;
  overall_fit: 'STRONG' | 'MODERATE' | 'LOW';
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

const mockAiResponse: FitResponse = {
  job_title: 'Senior operations associate for a fast-growing hiring platform',
  overall_fit: 'MODERATE',
  overall_summary:
    'Candidate has relevant experience with student projects and basic skills in Excel and SQL, but lacks experience with ATS tools and deeper SQL skills.',
  strong_matches: [
    {
      skill: 'Structured workflows, checklists, and repetitive admin tasks',
      note: 'Candidate has relevant experience with student projects.',
    },
  ],
  partial_matches: [
    {
      skill: 'Basic SQL queries',
      gap_detail: 'Limited experience with SQL queries and no mention of more complex queries.',
      priority: 'IMPORTANT',
      learnability: 'FAST',
      action: 'Complete a course on SQL fundamentals, such as DataCamp\'s "Intro to SQL".',
    },
    {
      skill: 'Spreadsheets (data tracking and visualization)',
      gap_detail: 'Limited experience with dashboard building and no mention of data visualization tools.',
      priority: 'IMPORTANT',
      learnability: 'FAST',
      action:
        'Practice building more complex dashboards in Google Sheets or Excel using templates from platforms like Tableau or Power BI.',
    },
    {
      skill: 'Communication and coordination',
      gap_detail: 'Mentions of communication with teachers and classmates are limited to academic setting.',
      priority: 'CRITICAL',
      learnability: 'MEDIUM',
      action:
        'Practice coordinating with multiple stakeholders and taking on customer-facing roles, such as in online communities or freelance writing.',
    },
    {
      skill: 'Familiarity with ATS tools and reporting',
      gap_detail: 'No experience with ATS tools and only mentions basic SQL.',
      priority: 'CRITICAL',
      learnability: 'MEDIUM',
      action:
        'Familiarize yourself with popular ATS tools like Workday or BambooHR by watching tutorials or attending webinars, and practice generating reports using basic SQL queries.',
    },
  ],
  noise_skills: ['Strong communication, attention to detail, and comfort with spreadsheets'],
  readiness_score: 50,
  bridge_steps: [
    'Take online courses to further develop SQL skills and practice with real-world data.',
    'Build experience working with ATS tools and reporting through internships, freelance work, or volunteering.',
  ],
  analyst_note:
    'Candidate has a good foundation in basic skills like SQL and spreadsheets, but lacks experience in critical areas like ATS tools and reporting, and more complex SQL queries.',
};

const fitToneMap: Record<FitResponse['overall_fit'], string> = {
  STRONG: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  MODERATE: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  LOW: 'bg-red-500/20 text-red-300 border-red-400/40',
};

const priorityToneMap: Record<NonNullable<MatchItem['priority']>, string> = {
  CRITICAL: 'bg-red-500/20 text-red-300 border-red-400/40',
  IMPORTANT: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  OPTIONAL: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
};

export default function SampleResult() {
  const jdText =
    'Senior operations associate role supporting recruiter workflows, ATS reporting, SQL-based reporting, and stakeholder coordination.';
  const candidateText =
    'Student project coordinator with Excel and basic SQL familiarity, strong attention to detail, and experience running repeatable processes.';
  const [response, setResponse] = useState<FitResponse | null>(mockAiResponse);

  const readinessTone = useMemo(() => {
    if (!response) return 'bg-white/10 text-white/70 border-white/20';
    if (response.readiness_score >= 75) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    if (response.readiness_score >= 45) return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    return 'bg-red-500/20 text-red-300 border-red-400/40';
  }, [response]);

  const runSampleAnalysis = () => {
    if (!jdText.trim() || !candidateText.trim()) return;
    setResponse(mockAiResponse);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6 lg:gap-8 xl:gap-10 px-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-[460px] min-h-[530px] mx-auto lg:mx-0 p-8 bg-white/[0.08] backdrop-blur-md rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.25)] lg:self-center">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Try The Fit Analyzer</h2>
        <p className="text-white/70 text-sm mb-6">
          Enter a job description and candidate experience. This preview uses your provided JSON as the AI response.
        </p>

        <div className="h-[calc(100%-6rem)] flex flex-col justify-between">
          <div className="space-y-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-2">Job Description</span>
            <textarea
              value={jdText}
              readOnly
              className="w-full h-24 rounded-2xl bg-black/20 text-white/90 placeholder:text-white/40 p-4 text-sm leading-relaxed resize-none focus:outline-none"
              placeholder="Paste the JD here"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-[0.2em] font-semibold text-white/60 mb-2">Candidate Experience</span>
            <textarea
              value={candidateText}
              readOnly
              className="w-full h-24 rounded-2xl bg-black/20 text-white/90 placeholder:text-white/40 p-4 text-sm leading-relaxed resize-none focus:outline-none"
              placeholder="Paste resume or experience summary"
            />
          </label>
          </div>

          <button
            type="button"
            onClick={runSampleAnalysis}
            disabled
            className="mt-auto w-full sm:w-auto px-6 py-3 bg-white/70 text-zinc-900 rounded-full font-semibold cursor-not-allowed"
          >
            Login/Signup to Run Analysis
          </button>
        </div>
      </div>

      <div className="w-full lg:flex-1 lg:max-w-[960px]">
        {response ? (
          <div className="space-y-4 lg:space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-semibold">Fit Summary</p>
                <h3 className="text-3xl lg:text-4xl font-serif font-bold text-white mt-1 leading-tight">{response.job_title}</h3>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${fitToneMap[response.overall_fit]}`}>
                  {response.overall_fit} FIT
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${readinessTone}`}>
                  {response.readiness_score}% READY
                </span>
              </div>
            </div>

            <p className="text-white/75 text-sm leading-relaxed">{response.overall_summary}</p>

            <div className="rounded-3xl bg-white/[0.07] backdrop-blur-sm border border-white/15 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.15em] text-white/60 font-semibold mb-2">Strong Match</p>
              {response.strong_matches.map((match, index) => (
                <div key={index} className="text-sm text-white/85">
                  <p className="font-semibold text-white">{match.skill}</p>
                  {match.note ? <p className="text-white/65 mt-1">{match.note}</p> : null}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
              {response.partial_matches.map((match, index) => (
                <div key={index} className="rounded-3xl bg-white/[0.07] backdrop-blur-sm border border-white/15 p-4 h-[clamp(240px,31vh,340px)] shadow-[0_10px_30px_rgba(0,0,0,0.14)] flex flex-col overflow-y-auto pr-2 [scrollbar-gutter:stable] card-scroll">
                  <p className="font-semibold text-white text-sm leading-snug">{match.skill}</p>
                  {match.priority ? (
                    <span className={`mt-2 mb-2 self-start text-[11px] font-bold uppercase px-2 py-1 rounded border ${priorityToneMap[match.priority]}`}>
                      {match.priority}
                    </span>
                  ) : null}
                  {match.gap_detail ? <p className="text-white/70 text-xs mb-2">{match.gap_detail}</p> : null}
                  {match.action ? <p className="text-white/80 text-xs">Action: {match.action}</p> : null}
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white/[0.07] backdrop-blur-sm border border-white/15 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <p className="text-xs uppercase tracking-[0.15em] text-white/60 font-semibold mb-2">Bridge Steps</p>
              <ul className="space-y-2 text-xs text-white/80">
                {response.bridge_steps.map((step, index) => (
                  <li key={index} className="leading-relaxed">{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-52 flex items-center justify-center text-white/50 text-sm">
            Run analysis to see the fit summary.
          </div>
        )}
      </div>
    </div>
  );
}
