import React from 'react';
import { BookOpen } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function SkillLearning() {
  return (
    <DashboardLayout activeLabel="Skill Learning">
      <div className="bg-white border border-gray-200 rounded-md p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-6">
          <BookOpen size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Skill Learning</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Recommended courses and resources to help you bridge your identified skill gaps.
        </p>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-md border border-gray-100 items-center">
              <div className="w-10 h-10 bg-white rounded-md border border-gray-100" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
