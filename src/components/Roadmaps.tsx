import React from 'react';
import { Target } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function Roadmaps() {
  return (
    <DashboardLayout activeLabel="Roadmaps">
      <div className="bg-white border border-gray-200 rounded-md p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-6">
          <Target size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Strategic Roadmaps</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          This section will contain your personalized career progression roadmaps based on your analysis history.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-50 rounded-md border border-dashed border-gray-200" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
