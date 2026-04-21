import React from 'react';
import { Receipt } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function ResumeReview() {
  return (
    <DashboardLayout activeLabel="Resume Review">
      <div className="bg-white border border-gray-200 rounded-md p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-6">
          <Receipt size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Resume Review</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Get AI-powered feedback on your resume to ensure it's optimized for the roles you're targeting.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed border-gray-100 rounded-md text-center">
          <p className="text-sm text-gray-400">Upload your resume here</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
