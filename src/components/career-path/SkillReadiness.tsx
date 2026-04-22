import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Skill } from '../../hooks/useAnalysis';

interface SkillReadinessProps {
  skills: Skill[];
}

export default function SkillReadiness({ skills }: SkillReadinessProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Skill Breakdown</h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{skills.length} Categories Analyzed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {skills.map((skill, index) => (
          <motion.div 
            key={skill.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">{skill.name}</span>
                <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">{skill.category}</span>
              </div>
              <span className={`text-sm font-bold ${
                skill.score >= 80 ? 'text-green-600' : 
                skill.score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {skill.score}%
              </span>
            </div>
            
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${skill.score}%` }}
                transition={{ duration: 1, delay: 0.2 + (index * 0.05) }}
                className={`absolute top-0 left-0 h-full rounded-full ${
                  skill.score >= 80 ? 'bg-green-500' : 
                  skill.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
            
            <div className="mt-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {skill.score >= 80 ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : skill.score >= 60 ? (
                  <AlertCircle size={12} className="text-amber-500" />
                ) : (
                  <HelpCircle size={12} className="text-red-500" />
                )}
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                  {skill.score >= 80 ? 'Market Ready' : skill.score >= 60 ? 'Competitive' : 'Gap Identified'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
