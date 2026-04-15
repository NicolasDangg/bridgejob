import { motion } from "framer-motion";

export default function Contact() {
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
        className="w-full max-w-4xl space-y-12"
      >
        <div className="text-center">
          <motion.p variants={itemVariants} className="text-[10px] uppercase tracking-[0.3em] font-semibold text-zinc-700 mb-2">Contact</motion.p>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-zinc-900 leading-tight tracking-tight">We Build With User Feedback</motion.h1>
          <motion.p variants={itemVariants} className="mt-6 text-zinc-800 max-w-2xl mx-auto text-lg leading-relaxed">
            Share your role, your pain points, and what the analyzer should do next. We read every message.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="rounded-[2.5rem] border border-black/10 bg-white/70 backdrop-blur-md p-8 lg:p-12 shadow-[0_12px_48px_rgba(0,0,0,0.08)]"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Name</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="you@domain.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Message</label>
              <textarea
                className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="Tell us what would make BridgeJob more useful for you."
              />
            </div>
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="px-12 py-4 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Send Message
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
