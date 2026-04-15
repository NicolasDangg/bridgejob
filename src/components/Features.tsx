import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl space-y-12"
      >
        <div className="text-center">
          <motion.p variants={itemVariants} className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-700 mb-2">Features</motion.p>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-zinc-900 leading-tight tracking-tight">From Job Post to Action Plan</motion.h1>
          <motion.p variants={itemVariants} className="mt-6 text-zinc-800 max-w-2xl mx-auto text-lg leading-relaxed">
            BridgeJob converts raw job descriptions into concrete, skill-building next moves using advanced career intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: 'Readiness Score',
              copy: 'A clear percentage that tells you exactly how close you are to the role, based on your current experience profile.',
            },
            {
              title: 'Gap Prioritization',
              copy: 'Critical vs. important gaps are separated so your effort is spent where it matters most, saving you months of trial and error.',
            },
            {
              title: 'Bridge Steps',
              copy: 'Concrete, sequence-based actions that move you from partial fit to strong fit with specific learning resources.',
            },
            {
              title: 'Noise Filtering',
              copy: 'Highlights credentials that sound strong but do not materially improve match quality, letting you ignore "filler" requirements.',
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:bg-white/85 transition-colors group"
            >
              <h2 className="text-2xl font-sans font-extrabold text-zinc-900 group-hover:text-zinc-950 transition-colors tracking-tight">{feature.title}</h2>
              <p className="mt-4 text-zinc-800 leading-relaxed text-sm lg:text-base">{feature.copy}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="flex justify-center pt-6">
          <Link to="/" className="px-10 py-4 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]">
            Try the Analyzer
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
