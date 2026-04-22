import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, History, Sparkles, Filter, MoreHorizontal, Download } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useLatestAnalysis, useAnalysisHistory } from '../hooks/useAnalysis';
import AnalysisOverview from './career-path/AnalysisOverview';
import SkillReadiness from './career-path/SkillReadiness';
import GapAnalysis from './career-path/GapAnalysis';
import HistoricalRoadmaps from './career-path/HistoricalRoadmaps';

type Tab = 'current' | 'history';

export default function CareerPath() {
  const { data: latestAnalysis, loading: latestLoading, error: latestError } = useLatestAnalysis();
  const { data: history, loading: historyLoading } = useAnalysisHistory();
  const [activeTab, setActiveTab] = useState<Tab>('current');

  const isLoading = latestLoading || historyLoading;

  if (latestError) {
    return (
      <DashboardLayout activeLabel="Career Path">
        <div className="p-12 text-center bg-white border border-red-100 rounded-xl">
          <p className="text-red-600 font-medium">Failed to load career analysis data.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeLabel="Career Path">
      <div className="max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'current' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Current Analysis
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'history' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analysis History
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">
              <Download size={14} />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
              <Sparkles size={14} />
              New Analysis
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-64 bg-gray-100 rounded-xl"></div>
              <div className="h-64 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-96 bg-gray-100 rounded-xl"></div>
          </div>
        ) : latestAnalysis ? (
          <AnimatePresence mode="wait">
            {activeTab === 'current' ? (
              <motion.div
                key="current"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AnalysisOverview analysis={latestAnalysis} />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <SkillReadiness skills={latestAnalysis.skills} />
                    <GapAnalysis gaps={latestAnalysis.gaps} />
                  </div>
                  
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Quick Statistics</h4>
                        <MoreHorizontal size={16} className="text-gray-300" />
                      </div>
                      <div className="space-y-4">
                        <StatItem label="Market Competitiveness" value="Top 15%" color="text-green-600" />
                        <StatItem label="Salary Potential" value="$165k - $190k" color="text-blue-600" />
                        <StatItem label="Interview Prep Level" value="Intermediate" color="text-amber-600" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp size={60} />
                      </div>
                      <h4 className="text-sm font-bold mb-4">Ready to level up?</h4>
                      <p className="text-xs text-blue-100 leading-relaxed mb-6">
                        You're only 2 major skills away from qualifying for Senior roles at top tech companies.
                      </p>
                      <button className="w-full py-2.5 rounded-lg bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors">
                        View Skills Path
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-8">
                    <HistoricalRoadmaps history={history || []} />
                  </div>
                  <div className="md:col-span-4 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        Growth Over Time
                      </h4>
                      <div className="h-48 flex items-end gap-2 mb-4">
                        {(history || []).slice(0, 4).reverse().map((entry, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${entry.readinessScore}%` }}
                               className="w-full bg-blue-100 rounded-t-sm relative group"
                             >
                               <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </motion.div>
                             <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                               {new Date(entry.dateAnalyzed).toLocaleDateString(undefined, { month: 'short' })}
                             </span>
                           </div>
                         ))}
                      </div>
                      {history && history.length > 1 ? (
                        <p className="text-[10px] text-gray-500 leading-normal italic">
                          "You've shown significant progress across your analysis history."
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-500 leading-normal italic">
                          Start more analyses to track your career growth over time.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 border-dashed rounded-2xl text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-inner">
              <TrendingUp size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Analysis Data Found</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              To unlock your career path and readiness report, you first need to run an AI analysis on the Dashboard.
            </p>
            <Link 
              to="/dashboard" 
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              <Sparkles size={16} />
              Run First Analysis
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}
