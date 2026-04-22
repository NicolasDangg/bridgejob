import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, ExternalLink, Bookmark, TrendingUp } from 'lucide-react';
import { Job } from '../../services/jobService';

interface JobCardProps {
  job: Job;
}

const COMPANY_LOGOS: Record<Job['company'], string> = {
  Google: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
  Meta: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/200px-Meta_Platforms_Inc._logo.svg.png',
  TikTok: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png',
  Amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
};

export default function JobCard({ job }: JobCardProps) {
  const [logoFailed, setLogoFailed] = React.useState(false);
  const logoSrc = COMPANY_LOGOS[job.company as keyof typeof COMPANY_LOGOS] ?? job.logo;

  React.useEffect(() => {
    setLogoFailed(false);
  }, [job.id]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row shadow-sm"
    >
      {/* Visual Indicator of Source */}
      <div className={`w-1.5 shrink-0 ${
        job.source === 'Google' ? 'bg-blue-500' :
        job.source === 'Meta' ? 'bg-blue-400' :
        job.source === 'TikTok' ? 'bg-black' : 'bg-gray-300'
      }`} />

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg border border-gray-100 bg-white flex items-center justify-center p-2 shadow-inner overflow-hidden">
              {logoSrc && !logoFailed ? (
                <img
                  src={logoSrc}
                  alt={`${job.company} logo`}
                  className="w-full h-full object-contain"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <Globe className="text-gray-300" size={20} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <span className="text-gray-900">{job.company}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Save Job">
              <Bookmark size={18} />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-6">
          {job.description}
        </p>

        <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-50">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Salary Range</p>
              <p className="text-xs font-bold text-gray-900">{job.salary || 'Competitive'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Posted</p>
              <p className="text-xs font-medium text-gray-600">{job.postedAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
              <TrendingUp size={12} />
              88% Match
            </div>
            <a 
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all group/btn"
            >
              Apply 
              <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
