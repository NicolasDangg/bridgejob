import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Marquee } from './Marquee';
import { Database, Map, Share2, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    id: 'data',
    title: 'Up-to-date training data',
    icon: Database,
    description: 'Our context engine is synchronized with the live global job market.',
    content: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">1.2M+ Real-world signals</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            BridgeJob is trained on a proprietary dataset of 1.2M+ live job descriptions and verified candidate outcomes from 2024-2026. This ensure your analysis reflects current standards, not outdated trends.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="enterprise-card p-4 bg-slate-50 border-none">
            <div className="text-xl font-bold text-slate-900">99.8%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy Rate</div>
          </div>
          <div className="enterprise-card p-4 bg-slate-50 border-none">
            <div className="text-xl font-bold text-slate-900">24h</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Cycle</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'roadmap',
    title: 'Detailed roadmap',
    icon: Map,
    description: 'Turn identified gaps into actionable professional milestones.',
    content: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Precision Pathing</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every analysis generates a clinical-grade gap analysis roadmap. We don't just tell you what's missing; we provide the exact sequence of projects, certifications, and skills required to achieve eligibility.
          </p>
        </div>
        <ul className="space-y-2">
          {[
            'Prioritized skill acquisition hierarchy',
            'Time-to-competency estimations',
            'Resource mapping to specific coursework',
            'Direct project-based verification steps'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  },
  {
    id: 'compatibility',
    title: 'Real-world compatible',
    icon: Share2,
    description: 'Seamlessly integrate with modern recruitment workflows.',
    content: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">ATS-Native Intelligence</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our data structure is built to mirror the exact schemas used by Workday, Greenhouse, and Lever. Export your gap analysis directly to your career profile or recruiting platforms with total fidelity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {['JSON Export', 'Workday API', 'Greenhouse XML', 'Cloud Sync'].map((tag) => (
            <span key={tag} className="px-2 py-1 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-500 uppercase">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'speed',
    title: 'Fast and reliable',
    icon: Zap,
    description: 'Enterprise-grade infrastructure for mission-critical analysis.',
    content: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Sub-5s Processing</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our optimized inference engine delivers deep contextual analysis in under 5 seconds. Built on globally distributed infrastructure to ensure 99.99% availability for enterprise users.
          </p>
        </div>
        <div className="p-4 bg-slate-900 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Latency</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">420ms</span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-3/4" />
          </div>
        </div>
      </div>
    )
  }
];

export const FeaturesShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-surface-white border-t border-border-subtle">
      <Marquee />
      
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Capabilities</h2>
          <h3 className="text-4xl font-bold tracking-tight text-slate-900">Precision engineered for career intelligence.</h3>
        </div>

        <div className="flex items-stretch justify-center max-w-5xl mx-auto border border-border-subtle rounded-xl overflow-hidden shadow-sm bg-white">
          {/* Left Panel - Buttons */}
          <div className="w-1/3 flex flex-col border-r border-border-subtle bg-slate-50/50">
            {FEATURES.map((feature, idx) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(idx)}
                className={`flex flex-col items-start p-6 py-8 text-left transition-all relative border-b border-border-subtle last:border-b-0 ${
                  activeTab === idx 
                    ? 'bg-white z-10' 
                    : 'hover:bg-slate-100/50 opacity-60'
                }`}
              >
                {activeTab === idx && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900"
                  />
                )}
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className={`w-4 h-4 ${activeTab === idx ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                    {feature.title}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-snug">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 bg-white p-12 flex flex-col justify-center relative min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-8"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-8">
                  {(() => {
                    const Icon = FEATURES[activeTab].icon;
                    return <Icon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                
                {FEATURES[activeTab].content}
                
                <div className="pt-8 border-t border-border-subtle">
                  <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                    View technical documentation <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
