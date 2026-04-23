import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useLatestAnalysis } from '../hooks/useAnalysis';

export default function ResumeReview() {
  const { data: analysis, loading } = useLatestAnalysis();

  return (
    <DashboardLayout activeLabel="Resume Review">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resume Review</h1>
          <p className="text-sm text-gray-500">Expert AI feedback on how your experience aligns with your target roles.</p>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center animate-pulse">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4" />
            <div className="h-6 bg-gray-100 rounded w-48 mx-auto mb-2" />
            <div className="h-4 bg-gray-100 rounded w-64 mx-auto" />
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Header Feedback */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <FileText size={48} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-100">AI Verified</span>
                  <span className="text-sm font-medium text-gray-400">Targeting: <span className="text-gray-900 font-bold">{analysis.jobTitle}</span></span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Resume Optimization Status</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your resume effectively highlights <span className="font-bold text-gray-900">{analysis.skills.length} core strengths</span>. 
                  Closing the remaining <span className="font-bold text-gray-900">{analysis.gaps.length} gaps</span> will significantly increase your interview conversion rate.
                </p>
              </div>
            </motion.div>

            {/* Analyst Note */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Executive Summary</span>
                </div>
                <h3 className="text-lg font-bold mb-4 italic leading-relaxed">
                  "{analysis.rawResponse?.analyst_note || "Our analysis indicates you have a strong foundation, though specific technical refinements are recommended for top-tier roles."}"
                </h3>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">AI</div>
                  <div>
                    <p className="text-xs font-bold">gapless Analyst Engine</p>
                    <p className="text-[10px] text-slate-400">Analysis completed on {new Date(analysis.dateAnalyzed).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Improvement Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Quick Wins" icon={CheckCircle2} color="text-emerald-500">
                <ul className="space-y-3">
                  <li className="flex gap-3 text-xs text-gray-600">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    Update profile summary to include target title
                  </li>
                  <li className="flex gap-3 text-xs text-gray-600">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    Quantify impact in your current Software Engineer role
                  </li>
                </ul>
              </Card>
              <Card title="Structural Gaps" icon={AlertCircle} color="text-amber-500">
                <ul className="space-y-3">
                  {analysis.gaps.slice(0, 2).map((gap, i) => (
                    <li key={i} className="flex gap-3 text-xs text-gray-600">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Evidence of <span className="font-bold">{gap.name}</span> project work is missing
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Resume Analysis Found</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
              Run an analysis on the Dashboard to get high-performance feedback on your resume.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Sparkles size={16} />
              Analyze Resume Now
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Card({ title, subtitle, icon: Icon, color, children }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
        <Icon size={16} className={color} />
      </div>
      {children}
    </motion.div>
  );
}
