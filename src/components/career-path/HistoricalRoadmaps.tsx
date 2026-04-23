import React from 'react';
import { motion } from 'framer-motion';
import { History, TrendingUp, ChevronRight, FileText } from 'lucide-react';
import { Analysis } from '../../hooks/useAnalysis';

interface HistoricalRoadmapsProps {
  history: Partial<Analysis>[];
}

export default function HistoricalRoadmaps({ history }: HistoricalRoadmapsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Historical Roadmaps</h3>
          <p className="text-xs text-gray-400">Track your career progression over time</p>
        </div>
        <History size={20} className="text-gray-300" />
      </div>

      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gray-100" />

        <div className="space-y-8">
          {history.map((analysis, index) => (
            <motion.div 
              key={analysis.analysisId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              className="relative flex gap-6 group cursor-pointer"
            >
              {/* Timeline Dot */}
              <div className={`mt-2 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 transition-colors ${
                index === 0 ? 'bg-blue-600 ring-2 ring-blue-100' : 'bg-gray-300 group-hover:bg-blue-400'
              }`} />

              <div className="flex-1 bg-gray-50/50 rounded-lg p-4 border border-transparent group-hover:border-blue-100 group-hover:bg-white transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900">{analysis.jobTitle}</h4>
                      {index === 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-tighter">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
                      <span>{analysis.company}</span>
                      <span>•</span>
                      <span>{analysis.dateAnalyzed ? new Date(analysis.dateAnalyzed).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{analysis.readinessScore}%</div>
                      <div className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Readiness</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                </div>

                {/* Micro-sparkline/progress bar */}
                <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                    style={{ width: `${analysis.readinessScore}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button className="w-full mt-10 py-3 rounded-lg border-2 border-dashed border-gray-200 text-xs font-bold text-gray-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2">
        <FileText size={14} />
        Generate Historical Report (PDF)
      </button>
    </div>
  );
}
