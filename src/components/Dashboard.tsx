import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  History,
  ListChecks,
  MoreHorizontal,
  Search,
  Target,
  User,
} from 'lucide-react';
import { buildAnalyzeEndpoint, requestDashboardAnalysis } from './dashboardApi.js';
import { useAuth } from '../lib/AuthContext';

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

type AnalyzeApiResponse =
  | { success: true; data: FitResponse; error: null }
  | { success: false; data: null; error: { code: string; message: string; details?: unknown } };

type HistoryEntry = {
  id: string;
  createdAt: string;
  jobDescription: string;
  candidateProfile: string;
  response: FitResponse;
};

type UsageStats = {
  totalRuns: number;
  lastRunAt: string | null;
  lastJobTitle: string | null;
};

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const normalizedPriority = priority.toUpperCase().replace(/_/g, ' ');
  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    IMPORTANT: 'bg-amber-50 text-amber-700 border-amber-200',
    'NICE TO HAVE': 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const currentStyle = styles[normalizedPriority] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap inline-block ${currentStyle}`}>
      {normalizedPriority}
    </span>
  );
}

function StatusBadge({ type }: { type: string }) {
  const styles = {
    STRONG: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    MODERATE: 'text-amber-600 bg-amber-50 border-amber-100',
    WEAK: 'text-red-600 bg-red-50 border-red-100',
  }[type] || 'text-slate-600 bg-slate-50 border-slate-100';

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles}`}>
      {type}
    </span>
  );
}

function timeLabel(value: string | null) {
  if (!value) return 'No runs yet';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [jdText, setJdText] = useState('');
  const [candidateText, setCandidateText] = useState('');
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'priority', direction: 'asc' });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({ totalRuns: 0, lastRunAt: null, lastJobTitle: null });

  const storageKey = useMemo(() => {
    const suffix = user?.email || 'guest';
    return {
      history: `bridgejob.analysis.history.${suffix}`,
      stats: `bridgejob.analysis.stats.${suffix}`,
    };
  }, [user?.email]);

  useEffect(() => {
    try {
      const storedHistory = window.localStorage.getItem(storageKey.history);
      const storedStats = window.localStorage.getItem(storageKey.stats);
      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
      setUsageStats(storedStats ? JSON.parse(storedStats) : { totalRuns: 0, lastRunAt: null, lastJobTitle: null });
    } catch {
      setHistory([]);
      setUsageStats({ totalRuns: 0, lastRunAt: null, lastJobTitle: null });
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey.history, JSON.stringify(history.slice(0, 10)));
    window.localStorage.setItem(storageKey.stats, JSON.stringify(usageStats));
  }, [history, usageStats, storageKey]);

  const sortedResults = useMemo(() => {
    if (!response) return [];

    const allItems = [
      ...response.strong_matches.map((m) => ({ ...m, status: 'MATCH', priority: 'RESOLVED' as const })),
      ...response.partial_matches.map((m) => ({ ...m, status: 'GAP' })),
    ];

    const priorityOrder = { CRITICAL: 0, IMPORTANT: 1, 'NICE TO HAVE': 2, RESOLVED: 3 };

    return [...allItems].sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'skill':
          comparison = a.skill.localeCompare(b.skill);
          break;
        case 'priority':
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'action':
          comparison = (a.action || '').localeCompare(b.action || '');
          break;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [response, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const loadHistoryItem = (entry: HistoryEntry) => {
    setResponse(entry.response);
    setJdText(entry.jobDescription);
    setCandidateText(entry.candidateProfile);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!jdText || !candidateText) {
      setError('Please provide both a job description and your experience.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = buildAnalyzeEndpoint(import.meta.env.VITE_API_BASE_URL);
      const fallbackEndpoint = import.meta.env.DEV ? 'http://localhost:3001/api/analyze' : undefined;
      const result = (await requestDashboardAnalysis(fetch, endpoint, { jd: jdText, skills: candidateText }, fallbackEndpoint)) as AnalyzeApiResponse;

      if (result.success) {
        setResponse(result.data);

        const savedRun: HistoryEntry = {
          id: `run-${Date.now()}`,
          createdAt: new Date().toISOString(),
          jobDescription: jdText,
          candidateProfile: candidateText,
          response: result.data,
        };

        setHistory((current) => [savedRun, ...current.filter((item) => item.response.job_title !== result.data.job_title)].slice(0, 10));
        setUsageStats((current) => ({
          totalRuns: current.totalRuns + 1,
          lastRunAt: savedRun.createdAt,
          lastJobTitle: result.data.job_title,
        }));
      } else {
        setError(result.error.message || 'An error occurred during analysis.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to the analysis service.');
    } finally {
      setIsLoading(false);
    }
  };

  const recentHistory = history.slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-off-white">
      <div className="h-12 border-b border-border-subtle bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {user?.email?.split('@')[0] || 'Guest'}'s Workspace
            </h2>
          </div>
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
            {isLoading ? 'Running...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Readiness Score</span>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{response?.readiness_score ?? '0'}%</span>
            </div>
          </div>
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical Gaps</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {response?.partial_matches.filter((m) => m.priority === 'CRITICAL').length ?? '0'}
            </div>
          </div>
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bridge Steps</span>
              <ListChecks className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{response?.bridge_steps.length ?? '0'}</div>
          </div>
          <div className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Usage Runs</span>
              <Target className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{usageStats.totalRuns}</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="enterprise-card">
              <div className="border-b border-border-subtle px-4 py-3 bg-surface-off-white flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Analysis Input</span>
                {response && (
                  <button
                    onClick={() => {
                      setResponse(null);
                      setJdText('');
                      setCandidateText('');
                    }}
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
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{response.overall_summary}</p>
                  <div className="mt-4 pt-4 border-t border-border-subtle flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved to history</span>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          Sorting by {sortConfig.key} ({sortConfig.direction})
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto overflow-y-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-border-subtle">
                            <th onClick={() => requestSort('skill')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors">
                              <div className="flex items-center gap-1">
                                Target Skill
                                {sortConfig.key === 'skill' && (sortConfig.direction === 'asc' ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />)}
                              </div>
                            </th>
                            <th onClick={() => requestSort('status')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors">
                              <div className="flex items-center gap-1">
                                Fit Analysis
                                {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />)}
                              </div>
                            </th>
                            <th onClick={() => requestSort('action')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors">
                              <div className="flex items-center gap-1">
                                Actionable Step
                                {sortConfig.key === 'action' && (sortConfig.direction === 'asc' ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />)}
                              </div>
                            </th>
                            <th onClick={() => requestSort('priority')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors">
                              <div className="flex items-center gap-1">
                                Priority
                                {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? <ChevronRight className="w-3 h-3 rotate-90" /> : <ChevronRight className="w-3 h-3 -rotate-90" />)}
                              </div>
                            </th>
                            <th className="px-4 py-3 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                          {sortedResults.map((item, idx) => (
                            <tr key={`${item.skill}-${idx}`} className="group hover:bg-surface-off-white transition-colors">
                              <td className="px-4 py-3">
                                <span className="text-xs font-bold text-slate-900">{item.skill}</span>
                              </td>
                              <td className="px-4 py-3">
                                {item.status === 'MATCH' ? (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Strong Match
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                      <AlertCircle className="w-3.5 h-3.5" /> Notable Gap
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight pr-4">{(item as any).gap_detail}</p>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={item.status === 'MATCH' ? 'text-xs text-slate-500' : 'text-xs text-slate-900 font-medium leading-tight inline-block'}>
                                  {item.status === 'MATCH' ? '—' : item.action}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {item.status === 'MATCH' ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-slate-50 text-slate-400 border-slate-200 uppercase">Resolved</span>
                                ) : (
                                  <PriorityBadge priority={(item as any).priority} />
                                )}
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="enterprise-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Usage Tracking</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 border border-border-subtle p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Runs</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{usageStats.totalRuns}</div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-border-subtle p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Run</div>
                <div className="mt-2 text-xs font-medium text-slate-700 leading-relaxed">{timeLabel(usageStats.lastRunAt)}</div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 border border-border-subtle p-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Job Title</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{usageStats.lastJobTitle || 'No analysis yet'}</div>
            </div>
          </div>

          <div className="enterprise-card p-5 xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Analysis History</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{recentHistory.length} recent runs</span>
            </div>

            <div className="space-y-3 max-h-[24rem] overflow-auto pr-1">
              {recentHistory.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Run an analysis to start building your history.
                </div>
              ) : (
                recentHistory.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => loadHistoryItem(entry)}
                    className="w-full text-left rounded-xl border border-border-subtle bg-slate-50 hover:bg-white transition-colors p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{entry.response.job_title}</div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">
                          {timeLabel(entry.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge type={entry.response.overall_fit} />
                        <span className="text-xs font-bold text-slate-900">{entry.response.readiness_score}%</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {entry.response.overall_summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>{entry.response.bridge_steps.length} bridge steps</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        Load <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
