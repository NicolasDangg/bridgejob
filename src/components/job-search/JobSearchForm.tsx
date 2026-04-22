import React from 'react';
import { Search, MapPin, Building, SlidersHorizontal } from 'lucide-react';

interface JobSearchFormProps {
  onSearch: (query: string, company: string) => void;
}

export default function JobSearchForm({ onSearch }: JobSearchFormProps) {
  const [query, setQuery] = React.useState('');
  const [company, setCompany] = React.useState('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, company);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all text-sm outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:w-auto">
          <div className="relative md:w-48">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all text-sm outline-none appearance-none"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              <option value="All">All Companies</option>
              <option value="Google">Google</option>
              <option value="Meta">Meta</option>
              <option value="TikTok">TikTok</option>
              <option value="Amazon">Amazon</option>
            </select>
          </div>

          <button 
            type="submit"
            className="px-8 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            Search Jobs
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <SlidersHorizontal size={12} />
          Filters:
        </div>
        <div className="flex gap-2">
          <FilterTag label="Remote" selected />
          <FilterTag label="Full-time" />
          <FilterTag label="Senior Level" />
          <FilterTag label="$150k+" />
        </div>
      </div>
    </form>
  );
}

function FilterTag({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <button 
      type="button"
      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
        selected 
        ? 'bg-blue-50 border-blue-100 text-blue-600' 
        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
