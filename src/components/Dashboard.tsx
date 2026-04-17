import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { buildAnalyzeEndpoint, requestDashboardAnalysis } from "./dashboardApi.js";

type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  gap?: string;
  priority?: "CRITICAL" | "IMPORTANT" | "NICE TO HAVE";
  priority_level?: "CRITICAL" | "IMPORTANT" | "NICE TO HAVE";
  priorityLevel?: "CRITICAL" | "IMPORTANT" | "NICE TO HAVE";
  learnability?: "FAST" | "MEDIUM" | "SLOW";
  action?: string;
  actionable_steps?: string;
  actionableStep?: string;
};

type FitResponse = {
  job_title: string;
  overall_fit: "STRONG" | "MODERATE" | "WEAK" | "SEVERELY UNDERQUALIFIED";
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  gaps?: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

type AnalyzeApiResponse =
  | { success: true; data: FitResponse; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: unknown } };

const priorityToneMap: Record<NonNullable<MatchItem["priority"]>, string> = {
  CRITICAL: "bg-red-100 text-zinc-900 border-red-300",
  IMPORTANT: "bg-amber-100 text-zinc-900 border-amber-300",
  "NICE TO HAVE": "bg-blue-100 text-zinc-900 border-blue-300",
};

function getMatchPriority(match: MatchItem) {
  return match.priority ?? match.priority_level ?? match.priorityLevel;
}

function getMatchAction(match: MatchItem) {
  return match.action ?? match.actionable_steps ?? match.actionableStep ?? "";
}

function getMatchGapDetail(match: MatchItem) {
  return match.gap_detail ?? match.gap ?? "";
}

function getReadinessVisual(score: number) {
  if (score <= 20) return { tone: "bg-red-500/80", label: "Poor" };
  if (score <= 40) return { tone: "bg-orange-500/80", label: "Fair" };
  if (score <= 60) return { tone: "bg-amber-500/80", label: "Moderate" };
  if (score <= 80) return { tone: "bg-lime-500/80", label: "Strong" };
  return { tone: "bg-emerald-500/85", label: "Excellent" };
}



export default function Dashboard() {
  const [jdText, setJdText] = useState("");
  const [candidateText, setCandidateText] = useState("");
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const readinessVisual = useMemo(() => {
    const score = response?.readiness_score ?? 0;
    return getReadinessVisual(score);
  }, [response]);

  const runAnalysis = async () => {
    if (!jdText || !candidateText) {
      setError("Please provide both a job description and your experience.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = buildAnalyzeEndpoint(import.meta.env.VITE_API_BASE_URL);
      const fallbackEndpoint = import.meta.env.DEV
        ? 'http://localhost:3001/api/analyze'
        : undefined;
      const result = (await requestDashboardAnalysis(fetch, endpoint, {
        jd: jdText,
        skills: candidateText,
      }, fallbackEndpoint)) as AnalyzeApiResponse;
      if (result.success) {
        setResponse(result.data);
      } else {
        setError(result.error.message || "An error occurred during analysis.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to the analysis service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-6rem)] p-6 space-y-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl space-y-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <motion.div variants={itemVariants}>
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-700 mb-2">Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-sans font-extrabold text-zinc-900 leading-tight tracking-tight">Career Intelligence Hub</h1>
            <p className="mt-4 text-zinc-800 max-w-2xl leading-relaxed">
              Track analysis history, monitor readiness trends, and prioritize the highest-impact gap closures.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Latest Readiness", value: response ? `${response.readiness_score}%` : "50%", note: "From your most recent run" },
            { label: "Critical Gaps", value: response ? [...response.partial_matches, ...(response.gaps ?? [])].filter((m) => getMatchPriority(m) === "CRITICAL").length.toString() : "2", note: "Need immediate action" },
            { label: "Bridge Steps", value: response ? response.bridge_steps.length.toString() : "2", note: "Recommended actions" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-semibold">{item.label}</p>
              <p className="text-4xl font-bold text-zinc-900 mt-4">{item.value}</p>
              <p className="text-sm text-zinc-700 mt-2">{item.note}</p>
            </motion.div>
          ))}
        </div>

        {/* Real Analyzer Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-md p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <h2 className="text-2xl font-sans font-extrabold text-zinc-900 tracking-tight">Live Fit Analyzer</h2>
            {response && (
              <button
                onClick={() => { setResponse(null); setJdText(""); setCandidateText(""); }}
                className="text-xs font-bold text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
              >
                Clear Results
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!response ? (
              <motion.div
                key="inputs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Job Description</label>
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className="w-full h-48 rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm leading-relaxed"
                      placeholder="Paste the full JD requirements here..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Your Experience</label>
                    <textarea
                      value={candidateText}
                      onChange={(e) => setCandidateText(e.target.value)}
                      className="w-full h-48 rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm leading-relaxed"
                      placeholder="Paste your resume or key experience points..."
                    />
                  </div>
                </div>
                {error && <p className="text-xs font-medium text-red-600 ml-1">{error}</p>}
                <div className="flex justify-center">
                  <button
                    onClick={runAnalysis}
                    disabled={isLoading}
                    className="px-12 py-4 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? "AI Analysis in Progress..." : "Run AI Analysis"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex-1 min-w-[300px]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold mb-1">Target Role</p>
                    <h3 className="text-3xl font-sans font-extrabold text-zinc-900 tracking-tight">{response.job_title}</h3>
                  </div>
                  <div className="w-full lg:max-w-[420px]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold mb-2">{readinessVisual.label}</p>
                    <div className="relative h-10 rounded-xl border border-black/10 overflow-hidden bg-white/50">
                      <div className="absolute inset-0 grid grid-cols-5">
                        <div className="bg-red-200/40" />
                        <div className="bg-orange-200/40" />
                        <div className="bg-amber-200/40" />
                        <div className="bg-lime-200/40" />
                        <div className="bg-emerald-200/40" />
                      </div>
                      <div
                        className={`absolute left-0 top-0 h-full ${readinessVisual.tone}`}
                        style={{ width: `${response.readiness_score}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-900 bg-white border border-black/10 px-3 py-1 rounded-full shadow-sm"
                        style={{ left: `clamp(12px, calc(${response.readiness_score}% - 22px), calc(100% - 62px))` }}
                      >
                        {response.readiness_score}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/60 border border-black/5 p-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold mb-2">Overall Summary</p>
                  <p className="text-zinc-800 leading-relaxed text-sm">{response.overall_summary}</p>
                </div>

                <div className="space-y-8">
                  {response.partial_matches.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">Partial Matches</p>
                          <p className="text-sm text-zinc-700">Relevant experience that still needs a closing step.</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">{response.partial_matches.length} items</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {response.partial_matches.map((match, index) => {
                          const priority = getMatchPriority(match);
                          const gapDetail = getMatchGapDetail(match);
                          const action = getMatchAction(match);

                          return (
                            <div key={`partial-${index}-${match.skill}`} className="rounded-2xl border border-black/5 bg-white/60 p-6 flex flex-col space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-bold text-zinc-900 text-sm leading-tight">{match.skill}</h4>
                                {priority && (
                                  <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityToneMap[priority]}`}>
                                    {priority}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600 font-bold">Gap</p>
                                <p className="text-zinc-800 text-[13px] leading-relaxed">{gapDetail || 'No gap detail provided.'}</p>
                              </div>
                              <div className="space-y-1 mt-auto pt-2 border-t border-black/5">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600 font-bold">Actionable step</p>
                                <p className="text-zinc-900 text-[13px] leading-relaxed font-medium">{action || 'No action step provided.'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(response.gaps?.length ?? 0) > 0 && (
                    <div className="space-y-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-6">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-rose-700 font-bold">Gaps</p>
                          <p className="text-sm text-rose-800/80">Missing requirements with a direct plan to close them.</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-rose-700/70 font-semibold">{response.gaps?.length ?? 0} items</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(response.gaps ?? []).map((match, index) => {
                          const priority = getMatchPriority(match);
                          const gapDetail = getMatchGapDetail(match);
                          const action = getMatchAction(match);

                          return (
                            <div key={`gap-${index}-${match.skill}`} className="rounded-2xl border border-rose-100 bg-white/80 p-6 flex flex-col space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-bold text-zinc-900 text-sm leading-tight">{match.skill}</h4>
                                {priority && (
                                  <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityToneMap[priority]}`}>
                                    {priority}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600 font-bold">Gap</p>
                                <p className="text-zinc-800 text-[13px] leading-relaxed">{gapDetail || 'No gap detail provided.'}</p>
                              </div>
                              <div className="space-y-1 mt-auto pt-2 border-t border-black/5">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-zinc-600 font-bold">Actionable step</p>
                                <p className="text-zinc-900 text-[13px] leading-relaxed font-medium">{action || 'No action step provided.'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-black/5 bg-zinc-900/5 p-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold mb-4">Strategic Roadmap</p>
                  <div className="space-y-3">
                    {response.bridge_steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white/80 p-4 rounded-xl border border-black/5 shadow-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <p className="text-sm text-zinc-900 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-md p-8 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        >
          <h2 className="text-2xl font-sans font-extrabold text-zinc-900 tracking-tight">Next Focus Sprint</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white/50 border border-black/5 p-6 hover:bg-white/80 transition-colors">
              <p className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center">1</span>
                SQL Skill Upgrade
              </p>
              <p className="mt-3 text-sm text-zinc-800 leading-relaxed">Complete one fundamentals module and solve five practice queries.</p>
            </div>
            <div className="rounded-2xl bg-white/50 border border-black/5 p-6 hover:bg-white/80 transition-colors">
              <p className="font-bold text-zinc-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center">2</span>
                ATS Familiarity
              </p>
              <p className="mt-3 text-sm text-zinc-800 leading-relaxed">Watch a Workday or BambooHR tutorial and document key reporting workflows.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
