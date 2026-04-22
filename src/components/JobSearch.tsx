import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import JobSearchForm from './job-search/JobSearchForm';
import JobCard from './job-search/JobCard';
import { searchJobs, Job } from '../services/jobService';

export default function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string = '', company: string = 'All') => {
    setSearching(true);
    setError(null);
    try {
      const results = await searchJobs(query, company);
      console.log('[JobSearch] Results fetched:', results.length, 'jobs');
      setJobs(results);
    } catch (err) {
      console.error('[JobSearch] Error fetching jobs:', err);
      setError('An error occurred while fetching job listings. Please try again.');
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[JobSearch] Component mounted, performing initial search');
    performSearch();
  }, []);

  return (
    <DashboardLayout activeLabel="Job Search">
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Job Opportunities</h1>
            <p className="text-sm text-gray-500 font-medium">Discover roles at top tech companies tailored to your skill set.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Real-time Data Active</span>
          </div>
        </div>

        <JobSearchForm onSearch={performSearch} />

        {error && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 text-red-600 mb-8">
            <AlertCircle size={24} />
            <div className="flex-1">
              <h4 className="text-sm font-bold">Search Error</h4>
              <p className="text-xs">{error}</p>
            </div>
            <button 
              onClick={() => performSearch()}
              className="px-4 py-2 bg-white border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {searching || loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-white border border-gray-100 rounded-xl animate-pulse shadow-sm" />
                ))}
              </motion.div>
            ) : jobs.length > 0 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{jobs.length} Results Found</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Sorted by: <strong className="text-gray-900">Relevance</strong></span>
                  </div>
                </div>
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
                
                <div className="pt-10 flex justify-center">
                  <button className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2">
                    <RefreshCw size={16} />
                    Load More Positions
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl"
              >
                <div className="w-16 h-16 bg-white rounded-full border border-gray-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No matching jobs found</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
                  Try adjusting your search filters or searching for more general role titles.
                </p>
                <button 
                  onClick={() => performSearch('', 'All')}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
