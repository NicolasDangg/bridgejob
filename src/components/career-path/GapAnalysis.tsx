import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { Gap } from '../../hooks/useAnalysis';

interface GapAnalysisProps {
  gaps: Gap[];
}

export default function GapAnalysis({ gaps }: GapAnalysisProps) {
  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Priority Gaps</h3>
        <span className="text-xs text-gray-400 font-medium">Ranked by importance for this role</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {gaps.map((gap, index) => (
          <motion.div
            key={gap.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
            className={`group relative overflow-hidden bg-white border rounded-xl shadow-sm transition-all hover:shadow-md ${
              gap.priority === 'critical' ? 'border-red-100' : 
              gap.priority === 'moderate' ? 'border-amber-100' : 'border-blue-100'
            }`}
          >
            {/* Priority Indicator Line */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${
              gap.priority === 'critical' ? 'bg-red-500' : 
              gap.priority === 'moderate' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />

            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      gap.priority === 'critical' ? 'bg-red-50 text-red-600' : 
                      gap.priority === 'moderate' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {gap.priority} Priority
                    </span>
                    <h4 className="text-base font-bold text-gray-900">{gap.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">
                    "{gap.recommendation}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <BookOpen size={12} />
                        Recommended Resources
                      </div>
                      <div className="space-y-2">
                        {gap.resources.map(res => (
                          <a 
                            key={res.title}
                            href={res.url}
                            className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all group"
                          >
                            <span>{res.title}</span>
                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                          <Clock size={12} />
                          Path to Proficiency
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                          {gap.timeToProficiency}
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-dashed border-gray-200">
                        <p className="text-[10px] text-gray-500 font-medium leading-normal">
                          <AlertTriangle size={10} className="inline mr-1 text-amber-500" />
                          Mastering this gap will increase your readiness score by <strong>~{(gap.priority === 'critical' ? 12 : 5)}%</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
