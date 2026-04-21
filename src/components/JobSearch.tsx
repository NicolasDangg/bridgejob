import React from 'react';
import { Briefcase } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function JobSearch() {
  return (
    <DashboardLayout activeLabel="Job Search">
      <div className="bg-white border border-gray-200 rounded-md p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-6">
          <Briefcase size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Search</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Find relevant job openings that match your profile and current skill set.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-md border border-gray-100 p-4" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
