import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Pricing() {
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
          <motion.p variants={itemVariants} className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-700 mb-2">Pricing</motion.p>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-zinc-900 leading-tight tracking-tight">Simple, Transparent Plans</motion.h1>
          <motion.p variants={itemVariants} className="mt-6 text-zinc-800 max-w-2xl mx-auto text-lg leading-relaxed">
            Start free, then upgrade when you want saved history, advanced prompts, and progress tracking.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '$0',
              points: ['Unlimited sample runs', 'Instant fit summary', 'Gap + bridge steps output'],
              cta: 'Get Started',
              featured: false,
            },
            {
              name: 'Growth',
              price: '$12',
              period: '/mo',
              points: ['Saved analyses', 'Progress dashboard', 'Priority gap reminders', 'Advanced roadmap'],
              cta: 'Try Growth',
              featured: true,
            },
            {
              name: 'Pro',
              price: '$29',
              period: '/mo',
              points: ['Team workspaces', 'Export PDF reports', 'Custom role scorecards', 'API Access'],
              cta: 'Go Pro',
              featured: false,
            },
          ].map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`rounded-3xl border ${plan.featured ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-black/10'} bg-white/75 backdrop-blur-md p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col hover:scale-[1.01] transition-all`}
            >
              <p className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{plan.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-sans font-extrabold text-zinc-900 tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-zinc-600 font-medium">{plan.period}</span>}
              </div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-800 flex-1">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`mt-10 inline-flex justify-center px-6 py-4 rounded-full text-sm font-bold transition-all ${
                  plan.featured
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-black/20'
                    : 'bg-white text-zinc-900 border border-black/10 hover:bg-zinc-50'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
