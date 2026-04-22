/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  HelpCircle,
  Lightbulb,
  Download,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  History,
  RefreshCw,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { buildAnalyzeEndpoint, requestDashboardAnalysis } from './dashboardApi';
import DashboardLayout from './DashboardLayout';

// --- Types ---

export type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  priority?: 'CRITICAL' | 'IMPORTANT' | 'NICE TO HAVE';
  learnability?: 'FAST' | 'MEDIUM' | 'SLOW';
  action?: string;
};

export type FitResponse = {
  job_title: string;
  overall_fit: 'EXCELLENCE' | 'STRONG' | 'MODERATE' | 'WEAK' | 'SEVERELY UNDERQUALIFIED';
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

export type AnalyzeApiResponse = {
  success: boolean;
  data: FitResponse;
  error: {
    message: string;
  };
};

interface HistoryEntry {
  id: string;
  createdAt: string;
  jobDescription: string;
  candidateProfile: string;
  response: FitResponse;
}

interface UsageStats {
  totalRuns: number;
  lastRunAt: string | null;
  lastJobTitle: string | null;
}

const GUEST_HISTORY_KEY = 'gapless.analysis.history.guest';
const ANALYSIS_HISTORY_TABLE = 'analysis_history';
const DEFAULT_HISTORY_SUMMARY = 'No summary available.';

type StoredHistoryJobData = {
  jobTitle?: string;
  jobDescription?: string;
  candidateProfile?: string;
  [key: string]: unknown;
};

type AnalysisHistoryRow = {
  id?: string;
  userid?: string;
  user_id?: string;
  jobdata?: StoredHistoryJobData | string | null;
  job_data?: StoredHistoryJobData | string | null;
  analysisresult?: FitResponse | string | null;
  analysis_result?: FitResponse | string | null;
  stored_json?: string | Record<string, unknown> | null;
  created_at?: string;
  createdAt?: string;
};

function readGuestHistory(): HistoryEntry[] {
  try {
    const stored = window.localStorage.getItem(GUEST_HISTORY_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => mapHistoryRow(entry as AnalysisHistoryRow));
  } catch {
    return [];
  }
}

function writeGuestHistory(history: HistoryEntry[]) {
  window.localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

function parseMaybeJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readFirstString(values: unknown[]): string {
  const firstString = values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  return firstString?.trim() ?? '';
}

function readOptionalString(value: unknown): string | undefined {
  const parsed = readFirstString([value]);
  return parsed || undefined;
}

function normalizeReadinessScore(value: unknown): number {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizeMatchItem(value: unknown): MatchItem {
  const parsed = parseMaybeJsonObject(value);
  const priority = parsed.priority;
  const learnability = parsed.learnability;

  return {
    skill: readFirstString([parsed.skill]) || 'Unspecified skill',
    note: readOptionalString(parsed.note),
    gap_detail: readOptionalString(parsed.gap_detail),
    priority: priority === 'CRITICAL' || priority === 'IMPORTANT' || priority === 'NICE TO HAVE' ? priority : undefined,
    learnability: learnability === 'FAST' || learnability === 'MEDIUM' || learnability === 'SLOW' ? learnability : undefined,
    action: readOptionalString(parsed.action),
  };
}

function normalizeMatchArray(value: unknown): MatchItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeMatchItem(item));
}

function readJobDataField(jobData: unknown, field: 'jobDescription' | 'candidateProfile'): string {
  const parsedJobData = parseMaybeJsonObject(jobData);
  const fallbackKey = field === 'jobDescription' ? 'job_description' : 'candidate_profile';
  const nestedCandidates = [parsedJobData.jobdata, parsedJobData.job_data, parsedJobData.jobData]
    .filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object');

  return readFirstString([
    parsedJobData[field],
    parsedJobData[fallbackKey],
    ...nestedCandidates.map((nested) => nested[field]),
    ...nestedCandidates.map((nested) => nested[fallbackKey]),
  ]);
}

function deriveOverallFitFromReadiness(readinessScore: number): FitResponse['overall_fit'] {
  if (readinessScore >= 90) return 'EXCELLENCE';
  if (readinessScore >= 75) return 'STRONG';
  if (readinessScore >= 50) return 'MODERATE';
  if (readinessScore >= 25) return 'WEAK';
  return 'SEVERELY UNDERQUALIFIED';
}

function normalizeOverallFit(value: unknown, readinessScore: number): FitResponse['overall_fit'] {
  const normalizedFromValue = value === 'EXCELLENCE' ||
    value === 'STRONG' ||
    value === 'MODERATE' ||
    value === 'WEAK' ||
    value === 'SEVERELY UNDERQUALIFIED'
    ? value
    : undefined;

  const derivedFromReadiness = deriveOverallFitFromReadiness(readinessScore);

  if (!normalizedFromValue) return derivedFromReadiness;

  // Keep tag aligned with readiness so 100% cannot show "MODERATE".
  return derivedFromReadiness;
}

function normalizeFitResponse(value: unknown, jobData?: unknown): FitResponse {
  const response = parseMaybeJsonObject(value) as Partial<FitResponse>;
  const parsedJobData = parseMaybeJsonObject(jobData);
  const normalizedReadinessScore = normalizeReadinessScore(response.readiness_score);
  const fallbackJobTitle = readFirstString([
    parsedJobData.jobTitle,
    parsedJobData.job_title,
    parsedJobData.jobDescription,
    parsedJobData.job_description,
  ]);

  return {
    job_title: readFirstString([response.job_title]) || fallbackJobTitle || 'Untitled analysis',
    overall_fit: normalizeOverallFit(response.overall_fit, normalizedReadinessScore),
    overall_summary: readFirstString([response.overall_summary]) || DEFAULT_HISTORY_SUMMARY,
    strong_matches: normalizeMatchArray(response.strong_matches),
    partial_matches: normalizeMatchArray(response.partial_matches),
    noise_skills: normalizeStringArray(response.noise_skills),
    readiness_score: normalizedReadinessScore,
    bridge_steps: normalizeStringArray(response.bridge_steps),
    analyst_note: readFirstString([response.analyst_note]),
  };
}

function mapHistoryRow(row: AnalysisHistoryRow | null | undefined): HistoryEntry {
  const parsedRow = parseMaybeJsonObject(row);
  const rawJobData = row?.jobdata ?? row?.job_data ?? parsedRow.jobdata ?? parsedRow.job_data;
  
  // Prefer stored_json if available, otherwise fall back to analysisresult
  let rawAnalysisResult = row?.stored_json ?? row?.analysisresult ?? row?.analysis_result ?? parsedRow.stored_json ?? parsedRow.analysisresult ?? parsedRow.analysis_result ?? parsedRow.response;
  
  // If stored_json is a string, parse it
  if (typeof rawAnalysisResult === 'string') {
    try {
      rawAnalysisResult = JSON.parse(rawAnalysisResult);
    } catch {
      // If parsing fails, keep as is
    }
  }

  return {
    id: readFirstString([row?.id, parsedRow.id]) || 'run-' + Date.now(),
    createdAt: readFirstString([row?.created_at, row?.createdAt, parsedRow.created_at, parsedRow.createdAt]) || new Date().toISOString(),
    jobDescription: readJobDataField(rawJobData, 'jobDescription'),
    candidateProfile: readJobDataField(rawJobData, 'candidateProfile'),
    response: normalizeFitResponse(rawAnalysisResult, rawJobData),
  };
}

function buildHistoryEntry(response: FitResponse, jobDescription: string, candidateProfile: string): HistoryEntry {
  return {
    id: 'run-' + Date.now(),
    createdAt: new Date().toISOString(),
    jobDescription,
    candidateProfile,
    response,
  };
}
// --- Utils ---

function PriorityBadge({ priority }: { priority: string }) {
  const normalizedPriority = priority?.toUpperCase() || 'NICE TO HAVE';
  const styles = {
    CRITICAL: 'text-red-700 bg-red-50 border-red-100',
    IMPORTANT: 'text-orange-700 bg-orange-50 border-orange-100',
    'NICE TO HAVE': 'text-blue-700 bg-blue-50 border-blue-100',
    RESOLVED: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  }[normalizedPriority] || 'text-slate-600 bg-slate-50 border-slate-100';

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${styles}`}>
      {normalizedPriority}
    </span>
  );
}

function StatusBadge({ type }: { type: string }) {
  const styles = {
    EXCELLENCE: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    STRONG: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    MODERATE: 'text-amber-600 bg-amber-50 border-amber-100',
    WEAK: 'text-red-600 bg-red-50 border-red-100',
    'SEVERELY UNDERQUALIFIED': 'text-rose-700 bg-rose-50 border-rose-100',
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

// --- Components ---

const IconButton = ({ icon: Icon, className, ...props }: any) => (
  <button
    className={cn(
      "w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors",
      className
    )}
    {...props}
  >
    <Icon size={18} />
  </button>
);

const Card = ({ children, className, title, action, subtitle }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white border border-gray-200 rounded-md p-6 shadow-sm", className)}
  >
    {(title || subtitle || action) && (
      <div className="flex items-center justify-between mb-6">
        <div>
          {subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{subtitle}</p>}
          {title && <h3 className="text-sm font-bold text-gray-900 leading-none">{title}</h3>}
        </div>
        {action && <div className="flex items-center gap-1">{action}</div>}
      </div>
    )}
    {children}
  </motion.div>
);

type HistoryCardProps = {
  entry: HistoryEntry;
  onLoad: (entry: HistoryEntry) => void;
};

function HistoryCard({ entry, onLoad }: HistoryCardProps) {
  const historyTitle = entry.response?.job_title || entry.jobDescription || 'Untitled analysis';
  const historySummary = entry.response?.overall_summary || DEFAULT_HISTORY_SUMMARY;
  const historyReadiness = normalizeReadinessScore(entry.response?.readiness_score);
  const historyMatches = Array.isArray(entry.response?.strong_matches) ? entry.response.strong_matches.length : 0;

  return (
    <Card
      subtitle={timeLabel(entry.createdAt ?? null)}
      title={historyTitle}
      action={<button onClick={() => onLoad(entry)} className="text-xs font-bold text-blue-500">Load</button>}
    >
      <p className="text-sm text-gray-600 line-clamp-2">{historySummary}</p>
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">{historyReadiness}% Readiness</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">{historyMatches} Matches</span>
        </div>
      </div>
    </Card>
  );
}

// --- Main Component ---

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [jdText, setJdText] = useState('');
  const [candidateText, setCandidateText] = useState('');
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'priority', direction: 'asc' });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({ totalRuns: 0, lastRunAt: null, lastJobTitle: null });
  const [expandedOverviewGaps, setExpandedOverviewGaps] = useState<Set<string>>(new Set());
  const [expandedReadinessGaps, setExpandedReadinessGaps] = useState<Set<string>>(new Set());

  const toggleOverviewGap = (skill: string) => {
    setExpandedOverviewGaps((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const toggleReadinessGap = (skill: string) => {
    setExpandedReadinessGaps((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const statsStorageKey = useMemo(() => 'gapless.analysis.stats.' + (user?.email || 'guest'), [user?.email]);

  const loadHistory = useCallback(async () => {
    if (authLoading) return;

    if (supabase && user?.id) {
      const { data, error } = await supabase
        .from(ANALYSIS_HISTORY_TABLE)
        .select('*')
        .eq('userid', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        setHistory([]);
        return;
      }

      setHistory(Array.isArray(data) ? data.map((row) => mapHistoryRow(row as AnalysisHistoryRow)) : []);
      return;
    }

    setHistory(readGuestHistory());
  }, [authLoading, supabase, user?.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    try {
      const storedStats = window.localStorage.getItem(statsStorageKey);
      setUsageStats(storedStats ? JSON.parse(storedStats) : { totalRuns: 0, lastRunAt: null, lastJobTitle: null });
    } catch {
      setUsageStats({ totalRuns: 0, lastRunAt: null, lastJobTitle: null });
    }
  }, [statsStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(statsStorageKey, JSON.stringify(usageStats));
  }, [usageStats, statsStorageKey]);

  useEffect(() => {
    if (authLoading || (supabase && user?.id)) return;
    writeGuestHistory(history);
  }, [authLoading, supabase, user?.id, history]);
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

  const loadHistoryItem = (entry: HistoryEntry) => {
    setResponse(entry.response);
    setJdText(entry.jobDescription);
    setCandidateText(entry.candidateProfile);
    setError(null);
    setExpandedOverviewGaps(new Set());
    setExpandedReadinessGaps(new Set(entry.response.partial_matches.map(m => m.skill)));
    setActiveTab('Overview');
  };

  const handleReset = () => {
    setResponse(null);
    setJdText('');
    setCandidateText('');
    setError(null);
    setExpandedOverviewGaps(new Set());
    setExpandedReadinessGaps(new Set());
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
        const normalizedResult = normalizeFitResponse(result.data, {
          jobTitle: result.data?.job_title,
          jobDescription: jdText,
          candidateProfile: candidateText,
        });

        setResponse(normalizedResult);
        setExpandedOverviewGaps(new Set());
        setExpandedReadinessGaps(new Set(normalizedResult.partial_matches.map((m) => m.skill)));

        const savedRun = buildHistoryEntry(normalizedResult, jdText, candidateText);
        setHistory((current) => [savedRun, ...current.filter((item) => item.response.job_title !== normalizedResult.job_title)].slice(0, 10));

        if (supabase && user?.id) {
          const { error: saveError } = await supabase.from(ANALYSIS_HISTORY_TABLE).insert({
            userid: user.id,
            jobdata: {
              jobTitle: normalizedResult.job_title,
              jobDescription: jdText,
              candidateProfile: candidateText,
            },
            analysisresult: normalizedResult,
            stored_json: JSON.stringify(result.data),
            created_at: new Date().toISOString(),
          });

          if (saveError) {
            setError(saveError.message || 'Failed to save analysis history.');
          }
        }

        setUsageStats((current) => ({
          totalRuns: current.totalRuns + 1,
          lastRunAt: savedRun.createdAt,
          lastJobTitle: normalizedResult.job_title,
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

  const netWorthData = useMemo(() => {
    const points = history.map(entry => ({
      date: new Date(entry.createdAt),
      value: entry.response.readiness_score,
      label: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(entry.createdAt))
    }));

    if (response) {
      const isNew = !history.some(h => h.response.job_title === response.job_title && (Date.now() - new Date(h.createdAt).getTime()) < 5000);
      if (isNew) {
        points.push({
          date: new Date(),
          value: response.readiness_score,
          label: 'Now'
        });
      }
    }

    points.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (points.length === 0) {
      return [
        { month: 'No Data', value: 0 }
      ];
    }

    return points.slice(-10).map(p => ({ month: p.label, value: p.value }));
  }, [history, response]);

  return (
    <DashboardLayout 
      activeLabel={activeTab} 
      onTabChange={setActiveTab}
      headerContent={response && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-gray-500">{response.job_title}</span>
          <StatusBadge type={response.overall_fit} />
        </div>
      )}
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200/50 p-1 rounded-md w-fit mb-8">
        {['Overview', 'Readiness', 'History'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {activeTab === 'Overview' && (
            <>
              {/* Analysis Input Card */}
              <AnimatePresence>
                {!response && (
                  <motion.div
                    key="analysis-input"
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <Card
                      subtitle="Analysis Input"
                      title="Job Assessment"
                    >
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Job Description</label>
                            <textarea
                              value={jdText}
                              onChange={(e) => setJdText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all h-32 resize-none"
                              placeholder="Paste JD requirements..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Experience Profile</label>
                            <textarea
                              value={candidateText}
                              onChange={(e) => setCandidateText(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all h-32 resize-none"
                              placeholder="Paste resume or skills..."
                            />
                          </div>
                        </div>
                        {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
                        <button
                          disabled={isLoading}
                          onClick={runAnalysis}
                          className="w-full py-2.5 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Analyzing...' : 'Run Analysis'}
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Analysis Placeholder */}
              {!response && !isLoading && (
                <Card className="bg-slate-50 border-dashed border-2">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center shadow-sm mb-4">
                      <Target className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Run analysis to show readiness report</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Provide a job description and your experience above to generate a precision gap analysis and strategic roadmap.
                    </p>
                  </div>
                </Card>
              )}

              {/* Skill Comparison Card */}
              {response && (
                <Card
                  subtitle="Skill Comparison"
                  title={response.job_title}
                  action={<IconButton icon={Lightbulb} className="bg-blue-50 text-blue-600" />}
                >
                  <div className="mb-6 pt-2">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                      <h2 className="text-3xl font-bold tracking-tight">
                        {response.strong_matches.length} <span className="text-lg text-gray-400 font-medium">Matches</span>
                      </h2>
                      <div className="text-right">
                        <span className="text-xl font-bold text-red-500">
                          {response.partial_matches.filter(m => m.priority === 'CRITICAL').length}
                        </span>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Critical Gaps</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {sortedResults.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="flex flex-col border-b border-gray-50 last:border-0">
                        <button
                          onClick={() => item.status === 'GAP' && toggleOverviewGap(item.skill)}
                          disabled={item.status !== 'GAP'}
                          className={cn(
                            "flex items-center gap-3 p-2 w-full text-left transition-colors rounded-md group",
                            item.status === 'GAP' ? "hover:bg-red-50/50 cursor-pointer" : "cursor-default"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                            item.status === 'MATCH' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                            {item.status === 'MATCH' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-semibold">{item.skill}</h4>
                            <p className="text-[10px] text-gray-400">{item.status === 'MATCH' ? 'Strong Match' : 'Notable Gap'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={(item as any).priority} />
                            {item.status === 'GAP' && (
                              <ChevronRight 
                                size={14} 
                                className={cn(
                                  "text-gray-300 transition-transform group-hover:text-red-400",
                                  expandedOverviewGaps.has(item.skill) && "rotate-90 text-red-500"
                                )} 
                              />
                            )}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedOverviewGaps.has(item.skill) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-11 pr-2 pb-3 text-[11px] text-gray-600 leading-relaxed">
                                <div className="bg-red-50/30 p-3 rounded-md border border-red-100/50">
                                  <p className="font-bold text-[10px] text-red-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Sparkles size={10} /> Gap Analysis
                                  </p>
                                  <div className="text-gray-700 font-medium">
                                    {item.gap_detail || "The AI identified this as a significant requirement that isn't fully matched in your profile."}
                                  </div>
                                  {item.action && (
                                    <div className="mt-2.5 pt-2.5 border-t border-red-100/50">
                                      <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <Target size={10} /> Recommended Action
                                      </p>
                                      <p className="text-slate-600">{item.action}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    {sortedResults.length > 10 && (
                      <button onClick={() => setActiveTab('Readiness')} className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2 hover:underline">
                        View all {sortedResults.length} skills
                      </button>
                    )}
                  </div>
                </Card>
              )}

              {/* Readiness Score Card */}
              {response && (
                <Card
                  subtitle="Readiness Score"
                  title={response.job_title}
                  action={
                    <>
                      <IconButton icon={Download} onClick={() => alert('Exporting...')} />
                      <IconButton icon={Plus} className="bg-blue-50 text-blue-600" onClick={handleReset} />
                    </>
                  }
                >
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">{response.readiness_score}%</h2>
                      <p className={cn(
                        "text-sm font-medium mt-1",
                        response.readiness_score > 70 ? "text-emerald-500" : "text-orange-500"
                      )}>
                        {response.readiness_score > 70 ? "Above average" : "Keep improving"}
                      </p>
                    </div>
                  </div>

                  <div className="h-64 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={netWorthData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis
                          dataKey="month"
                          stroke="#9CA3AF"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          orientation="right"
                          stroke="#9CA3AF"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                          dot={{ r: 3, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === 'Readiness' && (
            <>
              {!response && (
                <Card className="bg-slate-50 border-dashed border-2">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center shadow-sm mb-4">
                      <Target className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Run analysis to show readiness report</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Provide a job description and your experience above to generate a precision gap analysis and strategic roadmap.
                    </p>
                  </div>
                </Card>
              )}
              {response && (
                <Card subtitle="Detailed Mapping" title={response.job_title}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Skill</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sortedResults.map((item, idx) => (
                          <React.Fragment key={idx}>
                            <tr
                              onClick={() => item.status === 'GAP' && toggleReadinessGap(item.skill)}
                              className={cn(
                                "hover:bg-gray-50 transition-colors group",
                                item.status === 'GAP' && "cursor-pointer"
                              )}
                            >
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  {item.status === 'GAP' && (
                                    <ChevronRight
                                      size={12}
                                      className={cn(
                                        "text-gray-300 transition-transform group-hover:text-red-400",
                                        expandedReadinessGaps.has(item.skill) && "rotate-90 text-red-500"
                                      )}
                                    />
                                  )}
                                  {item.skill}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {item.status === 'MATCH' ? (
                                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Match
                                  </span>
                                ) : (
                                  <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                    <AlertCircle size={12} /> Gap
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <PriorityBadge priority={(item as any).priority} />
                              </td>
                            </tr>
                            <AnimatePresence>
                              {expandedReadinessGaps.has(item.skill) && (
                                <tr className="border-none">
                                  <td colSpan={3} className="px-4 py-0 border-none">
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pb-4 pt-1">
                                        <div className="bg-red-50/30 p-4 rounded-md border border-red-100/50 shadow-inner">
                                          <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                              <p className="font-bold text-[10px] text-red-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <Sparkles size={10} /> In-Depth Gap Analysis
                                              </p>
                                              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                                {item.gap_detail || "Detailed AI assessment of this specific skill gap based on your profile and JD requirements."}
                                              </p>
                                            </div>
                                            {item.action && (
                                              <div className="flex-1 border-l border-red-100/50 pl-4 ml-4">
                                                <p className="font-bold text-[10px] text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                  <Target size={10} /> Strategic Action
                                                </p>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                  {item.action}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}

          {activeTab === 'History' && (
            <div className="space-y-6">
              {history.length > 0 ? (
                history.map((entry) => (
                  <HistoryCard key={entry.id} entry={entry} onLoad={loadHistoryItem} />
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-md p-12 text-center shadow-sm">
                  <History size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">No history yet</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">Your analysis results will appear here once you run them.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Run Another Analysis Button */}
          {response && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-slate-900 rounded-md text-sm font-bold shadow-sm hover:bg-slate-50 transition-all group"
            >
              <RefreshCw size={18} className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
              Run Another Analysis
            </motion.button>
          )}

          {/* Career Roadmap Card */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-md p-6 text-white shadow-lg shadow-blue-200"
          >
            <div className="flex justify-between items-start mb-8">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Strategic Roadmap</p>
            </div>
            <h3 className="text-3xl font-serif mb-4 leading-tight">
              Bridge your <span className="italic font-light opacity-80">skills</span> to <span className="italic font-bold">success</span>
            </h3>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs border border-white/10">
              <Clock size={14} />
              <span>{response?.bridge_steps.length ?? 0} strategic steps identified</span>
            </div>
            <div className="mt-6 space-y-3">
              {(response?.bridge_steps || []).map((step, idx) => (
                <div key={idx} className="flex gap-2 text-xs opacity-90">
                  <div className="shrink-0 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold">{idx + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
              {!response && (
                <p className="text-xs opacity-50 italic">Run analysis to see roadmap</p>
              )}
            </div>
            {/* Decorative particles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </motion.div>

          {/* Growth Card */}
          <Card subtitle="Career Growth" title="" action={<IconButton icon={Sparkles} className="bg-blue-50 text-blue-600" />}>
            <div className="flex items-end justify-between mb-4">
              <h3 className="text-2xl font-bold tracking-tight">
                {response?.readiness_score ?? 0}% <span className="text-sm font-medium text-gray-400">Readiness</span>
              </h3>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${response?.readiness_score ?? 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </Card>

          {/* AI Analyst Note Card */}
          {response && (
            <Card subtitle="AI Analyst Note" title="Expert Perspective">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {response.overall_summary}
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles size={12} className="text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Strategic Insight</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
