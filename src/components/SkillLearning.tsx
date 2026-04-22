import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ExternalLink, Clock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useLatestAnalysis } from '../hooks/useAnalysis';

export default function SkillLearning() {
  const { data: analysis, loading } = useLatestAnalysis();

  return (
    <DashboardLayout activeLabel="Skill Learning">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skill Learning</h1>
            <p className="text-sm text-gray-500">Curated resources to bridge your identified skill gaps.</p>
          </div>
          {analysis && (
            <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700">Estimated: {analysis.gaps.length * 2} weeks to optimal match</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl" />
            ))}
          </div>
        ) : analysis && analysis.gaps.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {analysis.gaps.map((gap, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      <PlayCircle size={24} className="text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{gap.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          gap.priority === 'critical' ? 'bg-red-50 text-red-600 border-red-100' : 
                          gap.priority === 'moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {gap.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{gap.recommendation}</p>
                    </div>
                    <div className="flex items-center gap-3 md:border-l border-gray-100 md:pl-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Est. Time</p>
                        <p className="text-xs font-bold text-gray-900">{gap.timeToProficiency}</p>
                      </div>
                      <a 
                        href={gap.resources[0]?.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        Start Learning
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-sm font-bold text-gray-900 mb-1">Weekly Learning Digest</h4>
                <p className="text-xs text-gray-500">We've identified 4 high-impact courses specifically for your {analysis.jobTitle} trajectory.</p>
              </div>
              <button className="px-5 py-2 border border-gray-200 bg-white rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
                Configure Schedule
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <BookOpen size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Learning Gaps Identified</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
              Complete an analysis on the Dashboard to get high-impact learning recommendations tailored to your goals.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Sparkles size={16} />
              Start Analysis
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
