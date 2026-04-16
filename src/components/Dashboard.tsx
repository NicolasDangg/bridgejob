import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, Download, MoreHorizontal, CheckCircle2, AlertCircle, Clock, ChevronRight, BarChart3, ListChecks, Target } from "lucide-react";
import { buildAnalyzeEndpoint, requestDashboardAnalysis } from "./dashboardApi.js";

type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  priority?: "CRITICAL" | "IMPORTANT" | "NICE TO HAVE";
  learnability?: "FAST" | "MEDIUM" | "SLOW";
  action?: string;
};

type FitResponse = {
  job_title: string;
  overall_fit: "STRONG" | "MODERATE" | "WEAK" | "SEVERELY UNDERQUALIFIED";
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

type AnalyzeApiResponse =
  | { success: true; data: FitResponse; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: unknown } };

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const styles = {
    CRITICAL: "bg-red-50 text-red-700 border-red-200",
    IMPORTANT: "bg-amber-50 text-amber-700 border-amber-200",
    "NICE TO HAVE": "bg-blue-50 text-blue-700 border-blue-200",
  }[priority] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${styles}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ type }: { type: string }) {
  const styles = {
    STRONG: "text-emerald-600 bg-emerald-50 border-emerald-100",
    MODERATE: "text-amber-600 bg-amber-50 border-amber-100",
    WEAK: "text-red-600 bg-red-50 border-red-100",
  }[type] || "text-slate-600 bg-slate-50 border-slate-100";
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles}`}>
      {type}
    </span>
  )
}

export default function Dashboard() {
  const [jdText, setJdText] = useState("");
  const [candidateText, setCandidateText] = useState("");
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex-1 flex flex-col min-h-0 bg-surface-off-white">
      {/* Action Bar */}
      <div className="h-12 border-b border-border-subtle bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Workspace / Intelligence</h2>
          <div className="h-4 w-px bg-slate-200" />
          {response && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{response.job_title}</span>
              <StatusBadge type={response.overall_fit} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="enterprise-button-outline h-8 px-3 flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button 
            disabled={isLoading}
            onClick={runAnalysis}
            className="enterprise-button h-8 px-4 flex items-center gap-2 text-xs"
          >
            {isLoading ? "Running..." : "Run Analysis"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Readiness Score</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{response?.readiness_score ?? "0"}%</span>
              <span className="text-[10px] text-emerald-600 font-bold">+4% vs avg</span>
            </div>
          </div>
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical Gaps</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {response?.partial_matches.filter(m => m.priority === "CRITICAL").length ?? "0"}
            </div>
          </div>
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bridge Steps</span>
              <ListChecks className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{response?.bridge_steps.length ?? "0"}</div>
          </div>
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Level</span>
              <Target className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">Senior Staff Engineer</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column: Input + Summary */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="enterprise-card">
              <div className="border-b border-border-subtle px-4 py-3 bg-surface-off-white flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Analysis Input</span>
                {response && (
                   <button 
                    onClick={() => { setResponse(null); setJdText(""); setCandidateText(""); }}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Job Description</label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="enterprise-input h-32 resize-none leading-relaxed"
                    placeholder="Paste JD requirements..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Experience Profile</label>
                  <textarea
                    value={candidateText}
                    onChange={(e) => setCandidateText(e.target.value)}
                    className="enterprise-input h-32 resize-none leading-relaxed"
                    placeholder="Paste resume or skills..."
                  />
                </div>
                {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
              </div>
            </div>

            {response && (
              <div className="enterprise-card">
                <div className="border-b border-border-subtle px-4 py-3 bg-surface-off-white flex items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Analyst Summary</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {response.overall_summary}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border-subtle flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported 2 mins ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Comparison Table + Steps */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {!response ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="enterprise-card flex flex-col items-center justify-center p-24 text-center space-y-4 bg-white"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">No active analysis</h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                      Enter job requirements and your professional experience on the left to generate a readiness report.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Comparison Table */}
                  <div className="enterprise-card">
                    <div className="border-b border-border-subtle px-4 py-3 bg-surface-off-white flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Skill Comparison & Mapping</span>
                        <div className="flex gap-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Matches
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> Gaps
                          </span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto overflow-y-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-border-subtle">
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Skill</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fit Analysis</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actionable Step</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                            <th className="px-4 py-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                          {response.strong_matches.map((item, idx) => (
                            <tr key={`strong-${idx}`} className="group hover:bg-surface-off-white transition-colors">
                              <td className="px-4 py-3">
                                <span className="text-xs font-bold text-slate-900">{item.skill}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Strong Match
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-slate-500">—</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-slate-50 text-slate-400 border-slate-200 uppercase">Resolved</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <MoreHorizontal className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer" />
                              </td>
                            </tr>
                          ))}
                          {response.partial_matches.map((item, idx) => (
                            <tr key={`partial-${idx}`} className="group hover:bg-surface-off-white transition-colors">
                              <td className="px-4 py-3">
                                <span className="text-xs font-bold text-slate-900">{item.skill}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" /> Notable Gap
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-tight pr-4">
                                    {item.gap_detail}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-slate-900 font-medium">"{item.action}"</span>
                              </td>
                              <td className="px-4 py-3">
                                <PriorityBadge priority={item.priority} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <MoreHorizontal className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Strategic Roadmap */}
                  <div className="enterprise-card">
                    <div className="border-b border-border-subtle px-4 py-3 bg-surface-off-white flex items-center">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Strategic Roadmap</span>
                    </div>
                    <div className="p-4 space-y-4">
                      {response.bridge_steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="shrink-0 w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            0{idx + 1}
                          </div>
                          <div className="flex-1 pb-4 border-b border-slate-100 group-last:border-0">
                            <p className="text-xs text-slate-900 font-medium leading-relaxed">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
