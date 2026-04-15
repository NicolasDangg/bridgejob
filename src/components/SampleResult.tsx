import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  priority?: 'CRITICAL' | 'IMPORTANT' | 'NICE TO HAVE';
  learnability?: 'FAST' | 'MEDIUM' | 'SLOW';
  action?: string;
};

type FitResponse = {
  job_title: string;
  overall_fit: 'STRONG' | 'MODERATE' | 'WEAK' | 'SEVERELY UNDERQUALIFIED';
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


type AnalyzeApiResponse =
  | { success: true; data: FitResponse; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: unknown } };

const priorityToneMap: Record<NonNullable<MatchItem['priority']>, string> = {
  CRITICAL: 'bg-red-100 text-zinc-900 border-red-300',
  IMPORTANT: 'bg-amber-100 text-zinc-900 border-amber-300',
  'NICE TO HAVE': 'bg-blue-100 text-zinc-900 border-blue-300',
};

export default function SampleResult() {
  const [jdText, setJdText] = useState(
    'Senior operations associate role supporting recruiter workflows, ATS reporting, SQL-based reporting, and stakeholder coordination.',
  );
  const [candidateText, setCandidateText] = useState(
    'Student project coordinator with Excel and basic SQL familiarity, strong attention to detail, and experience running repeatable processes.',
  );
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const readinessVisual = useMemo(() => {
    const score = response?.readiness_score ?? 0;
    if (score <= 20) return { tone: 'bg-red-500/80', label: 'LOW FIT' };
    if (score <= 40) return { tone: 'bg-orange-500/80', label: 'BUILDING FIT' };
    if (score <= 60) return { tone: 'bg-amber-500/80', label: 'MODERATE FIT' };
    if (score <= 80) return { tone: 'bg-lime-500/80', label: 'GOOD FIT' };
    return { tone: 'bg-emerald-500/85', label: 'STRONG FIT' };
  }, [response]);

  const runSampleAnalysis = async () => {
    setResponse(mockAiResponse);
  };

  return (
    <div className="relative overflow-hidden px-1 sm:px-2 lg:px-2 py-[22px]">
      <div className="relative z-10 max-w-[1380px] mx-auto px-0.5 sm:px-1 lg:px-2">
        <AnimatePresence mode="wait">
          {!response ? (
            <motion.div
              key="analyzer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full min-h-[calc(100vh-220px)] flex items-center justify-center"
            >
              <div className="w-full max-w-[470px] min-h-[462px] p-6 bg-white/78 border border-black/12 rounded-md shadow-[0_14px_38px_rgba(0,0,0,0.14)]">
                <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Try The Fit Analyzer</h2>
                <p className="text-zinc-700 text-sm mb-4">
                  A sample job description and candidate experience to run an instant fit check.
                </p>
                <div className="h-[calc(100%-5.25rem)] flex flex-col">
                  <div className="space-y-3">
                  <label className="block">
                    <span className="block text-xs uppercase tracking-[0.2em] font-semibold text-zinc-700 mb-2">Job Description</span>
                    <textarea
                      value={jdText}
                      onChange={(event) => setJdText(event.target.value)}
                      className="w-full h-[95px] rounded-sm border border-black/16 bg-white/92 text-zinc-900 placeholder:text-zinc-500 p-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-black/20"
                      placeholder="Paste the JD here"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs uppercase tracking-[0.2em] font-semibold text-zinc-700 mb-2">Candidate Experience</span>
                    <textarea
                      value={candidateText}
                      onChange={(event) => setCandidateText(event.target.value)}
                      className="w-full h-[95px] rounded-sm border border-black/16 bg-white/92 text-zinc-900 placeholder:text-zinc-500 p-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-black/20"
                      placeholder="Paste resume or experience summary"
                    />
                  </label>
                  </div>

                  <div className="pt-4 mt-auto flex justify-center">
                    <button
                      type="button"
                      onClick={runSampleAnalysis}
                      disabled={isLoading}
                      className="w-full sm:w-[220px] px-6 py-3 bg-white text-zinc-900 border border-black/12 rounded-sm font-semibold hover:bg-zinc-100 transition-colors"
                    >
                      {isLoading ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                  </div>
                  {error ? <p className="pt-3 text-xs text-red-700">{error}</p> : null}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full min-h-[calc(100vh-220px)]"
            >
              <div className="w-full space-y-3 lg:space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-700 font-semibold">Fit Summary</p>
                  <h3 className="text-3xl lg:text-4xl font-serif font-bold text-zinc-900 mt-1 leading-tight">{response.job_title}</h3>
                </div>
                <div className="w-full lg:max-w-[420px]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-800 font-semibold mb-2">
                    {readinessVisual.label}
                  </p>
                  <div className="relative h-8 rounded-sm border border-black/20 overflow-hidden bg-white/92">
                    <div className="absolute inset-0 grid grid-cols-5">
                      <div className="bg-red-200/70" />
                      <div className="bg-orange-200/70" />
                      <div className="bg-amber-200/80" />
                      <div className="bg-lime-200/70" />
                      <div className="bg-emerald-200/70" />
                    </div>
                    <div
                      className={`absolute left-0 top-0 h-full ${readinessVisual.tone}`}
                      style={{ width: `${response.readiness_score}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-900 bg-white/95 border border-black/20 px-2 py-[1px] rounded-sm"
                      style={{ left: `clamp(8px, calc(${response.readiness_score}% - 22px), calc(100% - 52px))` }}
                    >
                      {response.readiness_score}%
                    </div>
                    <div className="absolute inset-0 border-l border-r border-black/15 [background:linear-gradient(to_right,transparent_calc(20%-0.5px),rgba(0,0,0,0.2)_calc(20%-0.5px),rgba(0,0,0,0.2)_calc(20%+0.5px),transparent_calc(20%+0.5px),transparent_calc(40%-0.5px),rgba(0,0,0,0.2)_calc(40%-0.5px),rgba(0,0,0,0.2)_calc(40%+0.5px),transparent_calc(40%+0.5px),transparent_calc(60%-0.5px),rgba(0,0,0,0.2)_calc(60%-0.5px),rgba(0,0,0,0.2)_calc(60%+0.5px),transparent_calc(60%+0.5px),transparent_calc(80%-0.5px),rgba(0,0,0,0.2)_calc(80%-0.5px),rgba(0,0,0,0.2)_calc(80%+0.5px),transparent_calc(80%+0.5px))]" />
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-white/78 border border-black/12 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-zinc-700 font-semibold mb-1">Overall Summary</p>
                    <p className="text-zinc-800 text-sm leading-relaxed">{response.overall_summary}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-zinc-700">Save this result? </span>
                    <Link to="/login" className="px-3 py-1.5 rounded-sm text-[11px] font-semibold text-zinc-900 border border-black/20 hover:bg-black/5 transition-colors">
                      Log in
                    </Link>
                    <Link to="/signup" className="px-3 py-1.5 rounded-sm text-[11px] font-semibold bg-white text-zinc-900 border border-black/12 hover:bg-zinc-100 transition-colors">
                      Create an account
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-white/75 border border-black/12 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-700 font-semibold mb-1">Strong Match</p>
                {response.strong_matches.map((match, index) => (
                  <div key={index} className="text-sm text-zinc-800">
                    <p className="font-semibold text-zinc-900">{match.skill}</p>
                    {match.note ? <p className="text-zinc-700 mt-1">{match.note}</p> : null}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
                {response.partial_matches.map((match, index) => (
                  <div key={index} className="rounded-md bg-white/75 border border-black/12 p-4 min-h-[210px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col gap-2">
                    <p className="font-semibold text-zinc-900 text-sm leading-snug">{match.skill}</p>
                    {match.priority ? (
                      <span className={`self-start text-[11px] font-bold uppercase px-2 py-1 rounded-sm border ${priorityToneMap[match.priority]}`}>
                        {match.priority}
                      </span>
                    ) : null}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-700 font-semibold">Gap</p>
                      <p className="text-zinc-800 text-xs leading-relaxed">{match.gap_detail ?? 'No gap detail provided.'}</p>
                    </div>
                    <div className="space-y-1 mt-auto">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-700 font-semibold">Action</p>
                      <p className="text-zinc-900 text-xs leading-relaxed">{match.action ?? 'No action step provided.'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-md bg-white/80 border border-black/12 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.12)]">
                <p className="text-xs uppercase tracking-[0.15em] text-zinc-800 font-semibold mb-2">Bridge Steps</p>
                <ul className="space-y-2 text-sm text-zinc-800">
                  {response.bridge_steps.map((step, index) => (
                    <li key={index} className="leading-relaxed bg-white border border-black/10 rounded-sm px-3 py-1.5">
                      <span className="font-semibold text-zinc-900 mr-2">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
