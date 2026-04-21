import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { Search, ArrowRight, Zap, Target, ShieldCheck, Info, Lock } from 'lucide-react';

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

export default function SampleResult() {
  const { user } = useAuth();
  const [jdText, setJdText] = useState(
    'Senior operations associate role supporting recruiter workflows, ATS reporting, SQL-based reporting, and stakeholder coordination.',
  );
  const [candidateText, setCandidateText] = useState(
    'Student project coordinator with Excel and basic SQL familiarity, strong attention to detail, and experience running repeatable processes.',
  );
  const [response, setResponse] = useState<FitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSampleAnalysis = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResponse(mockAiResponse);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <section id="sample-result" className="bg-surface-white py-32 px-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto space-y-16"
      >
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 italic">Try the analysis engine.</h2>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Simulate a high-density intelligence report. Compare a complex job description against baseline candidate data to see how BridgeJob identifies gaps and generates roadmaps.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!response ? (
            <motion.div
              key="analyzer"
              initial={{ opacity: 0, y: 40, scale: 0.95, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2
              }}
              className="flex items-center justify-center p-4"
            >
              <div className="enterprise-card w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 bg-surface-off-white border-b border-border-subtle flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Intelligence Demo</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Target Role Context</label>
                      <Lock className="w-3 h-3 text-slate-300" />
                    </div>
                    <textarea
                      value={jdText}
                      readOnly
                      className="enterprise-input h-24 resize-none leading-relaxed bg-slate-50/50 cursor-not-allowed"
                      placeholder="Target Job Description..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Candidate Capabilities</label>
                      <Lock className="w-3 h-3 text-slate-300" />
                    </div>
                    <textarea
                      value={candidateText}
                      readOnly
                      className="enterprise-input h-24 resize-none leading-relaxed bg-slate-50/50 cursor-not-allowed"
                      placeholder="Candidate Resume/Profile..."
                    />
                  </div>
                  <button
                    onClick={runSampleAnalysis}
                    disabled={isLoading}
                    className="w-full enterprise-button h-11 flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Processing...' : 'Run Analysis'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 pb-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Analysis Output</p>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {response.job_title}
                  </h1>
                </div>
                <div className="flex flex-col w-48 mr-[65px] space-y-0">
                  <div className="flex items-baseline gap-1 leading-none">
                    <span className={`text-3xl font-bold tracking-tighter leading-none ${response.readiness_score > 90 ? 'text-indigo-600' :
                      response.readiness_score > 75 ? 'text-emerald-600' :
                      response.readiness_score > 45 ? 'text-amber-600' :
                      response.readiness_score > 25 ? 'text-red-600' : 'text-rose-700'
                      }`}>
                      {response.readiness_score}%
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Score</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest inline-block ${response.readiness_score > 90 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' :
                      response.readiness_score > 75 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                      response.readiness_score > 45 ? 'text-amber-600 bg-amber-50 border-amber-100' :
                      response.readiness_score > 25 ? 'text-red-600 bg-red-50 border-red-100' : 'text-rose-700 bg-rose-50 border-rose-100'
                      }`}>
                      {response.readiness_score > 90 ? 'Excellence' :
                        response.readiness_score > 75 ? 'Strong Match' :
                          response.readiness_score > 45 ? 'Moderate Fit' :
                            response.readiness_score > 25 ? 'Weak Fit' : 'Severely Underqualified'}
                    </span>

                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-border-subtle">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${response.readiness_score > 90 ? 'bg-indigo-600' :
                          response.readiness_score > 75 ? 'bg-emerald-600' :
                          response.readiness_score > 45 ? 'bg-amber-600' :
                          response.readiness_score > 25 ? 'bg-red-600' : 'bg-rose-700'
                          }`}
                        style={{ width: `${response.readiness_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="enterprise-card bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Executive Summary</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                      "{response.overall_summary}"
                    </p>
                  </div>

                  <div className="enterprise-card overflow-hidden">
                    <div className="px-5 py-3 bg-surface-off-white border-b border-border-subtle flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Skill Mapping & Gaps</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border-subtle bg-slate-50/50">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capability</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Priority</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gap Detail</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {response.partial_matches.map((item, idx) => {
                            const priorityStyles = {
                              'CRITICAL': "bg-red-50 text-red-700 border-red-200",
                              'IMPORTANT': "bg-amber-50 text-amber-700 border-amber-200",
                              'NICE TO HAVE': "bg-blue-50 text-blue-700 border-blue-200",
                            }[item.priority || 'NICE TO HAVE'] || "bg-slate-50 text-slate-600 border-slate-200";

                            return (
                              <tr key={idx} className="border-b border-border-subtle last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{item.skill}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-tight ${priorityStyles}`}>
                                    {item.priority}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 font-medium leading-relaxed max-w-xs">{item.gap_detail}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="enterprise-card p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Analyst Note</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                      "{response.analyst_note}"
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="enterprise-card flex flex-col h-full bg-slate-900 text-white p-8 space-y-6 shadow-xl shadow-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 opacity-60">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Bridge Roadmap</span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Direct action steps for role eligibility.</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      {response.bridge_steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className="shrink-0 w-6 h-6 rounded border border-white/20 flex items-center justify-center text-[10px] font-bold font-mono">
                            {idx + 1}
                          </span>
                          <p className="text-xs font-medium text-slate-300 leading-relaxed tracking-normal">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                    {!user && (
                      <div className="pt-8 mt-auto border-t border-white/10 space-y-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Account Required</p>
                        <Link to="/signup" className="enterprise-button h-10 w-full flex items-center justify-center text-xs">
                          Save Full Report
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setResponse(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  New Analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
