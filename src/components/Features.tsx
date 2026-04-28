"use client";

import { Link } from "react-router-dom";
import { BarChart2, ShieldCheck, Zap, Layers, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/src/lib/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

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
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Features() {
  const { user } = useAuth();

  const featuresList = [
    {
      title: 'Readiness Scoring',
      icon: BarChart2,
      copy: 'A high-precision percentage based on semantically mapped experience tokens. We look past job titles to actual capability match.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Gap Prioritization',
      icon: ShieldCheck,
      copy: 'Our engine ranks every gap by its impact on the hiring decision. Focus on the 20% of skills that drive 80% of the fit.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Bridge Roadmaps',
      icon: Zap,
      copy: 'Instant, actionable learning paths. We don\'t just tell you what\'s missing; we tell you the shortest path to closing it.',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      title: 'Semantic Filtering',
      icon: Layers,
      copy: 'Ignore keyword-stuffed "filler" requirements. We highlight the core operational needs of every job description.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="flex-1 bg-surface-off-white py-24 px-4 overflow-auto">
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-5xl mx-auto space-y-20"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="w-3 h-3 mr-2 text-blue-500" />
            Core Capabilities
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Engineered for accuracy.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <span className="font-bold text-slate-900">gapless</span> uses specialized analysis models to identify non-obvious fit signals and automate the career optimization workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuresList.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="enterprise-card p-8 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-white group relative overflow-hidden"
            >
              {/* Subtle background glow on hover */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${feature.bg}`} />
              
              <div className={`shrink-0 w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center border border-transparent group-hover:border-white shadow-sm transition-all duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div className="space-y-3 relative z-10">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{feature.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden bg-slate-900 rounded-3xl p-12 lg:p-20 text-center shadow-2xl"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)]" />
          
          <div className="relative z-10 space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready to optimize your next move?</h3>
            <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
              Join thousands of professionals using gapless to navigate their career with data-driven precision.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button size="lg" className="px-10 h-14 text-base font-bold bg-white text-slate-900 hover:bg-slate-100 group">
                  {user ? "Go to Dashboard" : "Start Free Analysis"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
