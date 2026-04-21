import React from 'react';
import { TrendingUp } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function CareerPath() {
  return (
    <DashboardLayout activeLabel="Career Path">
      <div className="bg-white border border-gray-200 rounded-md p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Career Pathing</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Explore potential career trajectories and the skills required to move into more senior or adjacent roles.
        </p>
        <div className="mt-8 space-y-4 max-w-lg mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-md border border-gray-100" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
