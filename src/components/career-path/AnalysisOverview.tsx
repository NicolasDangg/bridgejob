import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { Analysis } from '../../hooks/useAnalysis';

interface AnalysisOverviewProps {
  analysis: Analysis;
}

export default function AnalysisOverview({ analysis }: AnalysisOverviewProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Primary Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Target size={120} />
        </div>
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Latest Analysis</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{analysis.jobTitle}</h2>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} />
                <span>{analysis.company}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{new Date(analysis.dateAnalyzed).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-8">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-gray-100"
                strokeDasharray="100, 100"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${analysis.readinessScore}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-blue-600"
                strokeWidth="3"
                strokeDashcap="round"
                stroke="currentColor"
                fill="transparent"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{analysis.readinessScore}%</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Readiness Score</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Based on your current profile and the target job requirements. You're {analysis.readinessScore > 80 ? 'highly qualified' : analysis.readinessScore > 50 ? 'a strong match' : 'developing'} for this role.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Career Trajectory Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 p-4 opacity-10">
          <TrendingUp size={80} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Career Trajectory</h3>
        
        <div className="relative space-y-8">
          <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-slate-800"></div>
          
          <div className="relative flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center z-10">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Current</p>
              <p className="text-sm font-medium">Software Engineer</p>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center z-10">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase">Target</p>
              <p className="text-sm font-bold">{analysis.jobTitle}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 mb-1">Estimated Gap Closure</p>
          <p className="text-lg font-bold">4-6 Weeks</p>
        </div>
      </motion.div>
    </div>
  );
}
