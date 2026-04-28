import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { NativeStartNow } from './uitripled/native-start-now-shadcnui';
import {
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  Info,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Types ---

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
  overall_fit: 'EXCELLENCE' | 'STRONG' | 'MODERATE' | 'WEAK' | 'SEVERELY UNDERQUALIFIED';
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

const mockAiResponse: FitResponse = {
  job_title: 'Senior Operations Associate',
  overall_fit: 'MODERATE',
  overall_summary:
    'The candidate demonstrates competency in administrative execution and basic data management. However, there is a distinct gap in enterprise-level SQL complexity and ATS reporting workflows required for this specific role.',
  strong_matches: [
    {
      skill: 'Process Optimization',
      note: 'Proven track record of managing repeatable workflows in project environments.',
    },
  ],
  partial_matches: [
    {
      skill: 'SQL Systems Reporting',
      gap_detail: 'Candidate uses basic queries; role requires complex joins and automated data pipelines.',
      priority: 'CRITICAL',
      learnability: 'MEDIUM',
      action: 'Targeted advanced SQL certification or 20+ hours of sandbox practice with multi-table joins.',
    },
    {
      skill: 'ATS Workflow Management',
      gap_detail: 'No direct experience with Workday or Greenhouse environments.',
      priority: 'IMPORTANT',
      learnability: 'FAST',
      action: 'Review ATS API documentation and reporting structures for top-tier hiring platforms.',
    },
    {
      skill: 'Stakeholder Coordination',
      gap_detail: 'Experience is primarily internal; role requires cross-functional external management.',
      priority: 'IMPORTANT',
      learnability: 'MEDIUM',
      action: 'Engagement in stakeholder management seminars or customer-facing project assignments.',
    },
  ],
  noise_skills: ['General team player', 'Familiarity with standard browser tools'],
  readiness_score: 58,
  bridge_steps: [
    'Complete "Advanced SQL for Operations" modules focusing on window functions and CTEs.',
    'Enroll in "ATS Systems Mastery" (Workday/Greenhouse) focused on recruiting workflow automation.',
    'Execute a mock data pipeline project using PostgreSQL and hiring API documentation.',
    'Draft a stakeholder communication plan for a high-priority recruitment cycle.',
    'Optimize professional portfolio to emphasize quantitative process improvements.',
    'Participate in a 20-hour sandbox environment for cross-functional project management simulation.'
  ],
  analyst_note:
    'Prioritize the SQL and ATS workflow gaps as these are non-negotiable hurdles for the screening stage. While the candidate\'s foundational process skills are excellent, the shift from internal coordination to external cross-functional stakeholder management requires a more robust "Product-Mindset" for operations. Closing the technical gaps first will unlock the credibility needed for the senior-level coordination responsibilities.',
};

// --- Local Utils/Components from Dashboard ---

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

const IconButton = ({ icon: Icon, className, ...props }: any) => (
  <button
    className={cn(
      "w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors",
      className
    )}
    {...props}
  >
    <Icon size={16} />
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

// --- Main Component ---

export default function SampleResult() {
  const { user } = useAuth();
  const [jdText] = useState(
    'Senior operations associate role supporting recruiter workflows, ATS reporting, SQL-based reporting, and stakeholder coordination.',
  );
  const [candidateText] = useState(
    'Student project coordinator with Excel and basic SQL familiarity, strong attention to detail, and experience running repeatable processes.',
  );
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set());

  const toggleGap = (skill: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const runSampleAnalysis = () => new Promise<void>((resolve) => {
    setIsLoading(true);
    setTimeout(() => {
      setResponse(mockAiResponse);
      // Auto-expand gaps in sample view for better presentation
      setExpandedGaps(new Set(mockAiResponse.partial_matches.map(m => m.skill)));
      setIsLoading(false);
      resolve();
    }, 1500);
  });

  return (
    <section id="sample-result" className="bg-surface-white py-32 px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto space-y-16"
      >
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 italic">Try the analysis engine.</h2>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Simulate a high-density intelligence report. Compare a complex job description against baseline candidate data to see how <span className="font-bold text-slate-900">gapless</span> identifies gaps and generates roadmaps.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!response ? (
            <motion.div
              key="analyzer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, rotate: -1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center"
            >
              <Card
                subtitle="Intelligence Demo"
                title="Job Assessment"
                className="w-full max-w-xl"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600">Job Description</label>
                        <Lock size={12} className="text-slate-300" />
                      </div>
                      <textarea
                        value={jdText}
                        readOnly
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-md text-sm text-slate-500 h-32 resize-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600">Experience Profile</label>
                        <Lock size={12} className="text-slate-300" />
                      </div>
                      <textarea
                        value={candidateText}
                        readOnly
                        className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-md text-sm text-slate-500 h-32 resize-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <NativeStartNow
                    onStart={runSampleAnalysis}
                    label="Run Analysis"
                    loadingLabel="Analyzing..."
                    successLabel="Analysis Complete"
                    className="w-full"
                  />
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header with Results */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analysis Results</p>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{response.job_title}</h1>
                    <StatusBadge type={response.overall_fit} />
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-end justify-end gap-2">
                    <span className="text-4xl font-bold tracking-tighter text-slate-900">{response.readiness_score}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 leading-none">Readiness</span>
                  </div>
                  <div className="h-1.5 w-48 bg-gray-100 rounded-full overflow-hidden mt-2 ml-auto">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${response.readiness_score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  {/* Executive Summary */}
                  <Card
                    subtitle="Executive Summary"
                    title="Intelligence Overview"
                    action={<IconButton icon={Zap} className="bg-amber-50 text-amber-600" />}
                  >
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                      "{response.overall_summary}"
                    </p>
                  </Card>

                  {/* Skill Mapping */}
                  <Card
                    subtitle="Detailed Mapping"
                    title="Skill Comparison"
                    action={<IconButton icon={Lightbulb} className="bg-blue-50 text-blue-600" />}
                  >
                    <div className="space-y-3">
                      {[...response.strong_matches.map(m => ({ ...m, status: 'MATCH' })), ...response.partial_matches.map(m => ({ ...m, status: 'GAP' }))].map((item, idx) => (
                        <div key={idx} className="flex flex-col border-b border-gray-50 last:border-0">
                          <button
                            onClick={() => item.status === 'GAP' && toggleGap(item.skill)}
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
                              {item.priority && <PriorityBadge priority={item.priority} />}
                              {item.status === 'GAP' && (
                                <ChevronRight
                                  size={14}
                                  className={cn(
                                    "text-gray-300 transition-transform group-hover:text-red-400",
                                    expandedGaps.has(item.skill) && "rotate-90 text-red-500"
                                  )}
                                />
                              )}
                            </div>
                          </button>
                          <AnimatePresence>
                            {expandedGaps.has(item.skill) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
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
                    </div>
                  </Card>

                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Strategic Roadmap Card - Blue Premium Style */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-md p-6 text-white shadow-lg shadow-blue-200"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Strategic Roadmap</p>
                      <ShieldCheck size={18} className="text-white/40" />
                    </div>
                    <h3 className="text-3xl font-serif mb-4 leading-tight">
                      Bridge your <span className="italic font-light opacity-80">skills</span> to <span className="italic font-bold">success</span>
                    </h3>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs border border-white/10">
                      <Clock size={14} />
                      <span>{response.bridge_steps.length} strategic steps identified</span>
                    </div>
                    <div className="mt-6 space-y-4">
                      {response.bridge_steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3 text-xs opacity-95 group">
                          <div className="shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold border border-white/10 group-hover:bg-white/40 transition-colors">{idx + 1}</div>
                          <p className="leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>

                    {!user && (
                      <div className="pt-8 mt-8 border-t border-white/10 space-y-4">
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest text-center">Unlock Full Intelligence</p>
                        <Link to="/signup" className="flex items-center justify-center h-10 w-full bg-white text-blue-800 rounded-md text-[11px] font-bold hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20">
                          Create Free Account
                        </Link>
                      </div>
                    )}

                    {/* Decorative particles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                  </motion.div>

                  {/* Analyst Note */}
                  <Card subtitle="Expert Insight" title="Analyst Guidelines" action={<IconButton icon={Info} className="bg-slate-50 text-slate-400" />}>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-4">
                      "{response.analyst_note}"
                    </p>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
