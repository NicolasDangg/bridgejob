import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
        <div className="p-4 bg-slate-900 rounded-md space-y-3">
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  },
};

export const FeaturesShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const rotateBackground = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section ref={containerRef} className="relative bg-surface-white border-t border-border-subtle overflow-hidden">
      <motion.div 
        style={{ y: yBackground, rotate: rotateBackground }}
        className="absolute top-1/4 right-[5%] w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10"
      />
      
      <Marquee />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-6 py-32"
      >
        <div className="text-center space-y-4 mb-24">
          <motion.h2 variants={itemVariants} className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">Operational Capabilities</motion.h2>
          <motion.h3 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto">
            Precision engineered for career intelligence.
          </motion.h3>
          <motion.h2 variants={itemVariants} className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] pt-4">Suitable for modern recruitment cycles</motion.h2>
        </div>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row items-stretch justify-center max-w-6xl mx-auto border border-border-subtle rounded-md overflow-hidden shadow-2xl shadow-slate-100 bg-white"
        >
          {/* Left Panel - Buttons */}
          <div className="w-full md:w-[350px] flex flex-col border-r border-border-subtle bg-slate-50/50">
            {FEATURES.map((feature, idx) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(idx)}
                className={`flex flex-col items-start p-8 text-left transition-all relative border-b border-border-subtle last:border-b-0 ${activeTab === idx
                  ? 'bg-white z-10'
                  : 'hover:bg-slate-100/50 opacity-50'
                  }`}
              >
                {activeTab === idx && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-900"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="flex items-center gap-4 mb-3">
                  <feature.icon className={`w-5 h-5 ${activeTab === idx ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                    {feature.title}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 leading-snug">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 bg-white p-16 flex flex-col justify-center relative min-h-[550px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.02, x: -10 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-10"
              >
                <div className="w-16 h-16 rounded-md bg-slate-900 flex items-center justify-center mb-10 shadow-lg shadow-slate-200">
                  {(() => {
                    const Icon = FEATURES[activeTab].icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>

                <div className="prose-container">
                  {FEATURES[activeTab].content}
                </div>

                <div className="pt-10 border-t border-border-subtle flex items-center justify-between">
                  <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors group">
                    View technical documentation 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="flex gap-1.5">
                    {FEATURES.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeTab ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
