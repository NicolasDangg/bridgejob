"use client";

import { Link } from "react-router-dom";
import { Sparkles, Target, BarChart2, ShieldCheck, Zap, Layers, ArrowRight, FileText, ListChecks, TrendingUp } from "lucide-react";
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

const gaps = [
  {
    title: "Skill Deficits",
    icon: Target,
    copy: "Hard skills you lack relative to a target role. Our semantic engine maps your experience tokens against the job's core competencies.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Experience Depth",
    icon: TrendingUp,
    copy: "Years and scope of experience required vs. your timeline. We weight recency and relevance over raw duration.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Credential Alignment",
    icon: ListChecks,
    copy: "Certifications, degrees, and formal qualifications that influence hiring filters. Non-obvious credential substitutions are surfaced.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "Semantic Fit",
    icon: FileText,
    copy: "Contextual mismatch between how you describe your work and how the job description frames the same activity.",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

const capabilities = [
  {
    title: "Readiness Scoring",
    icon: BarChart2,
    copy: "A high-precision percentage based on semantically mapped experience tokens. We look past job titles to actual capability match.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Gap Prioritization",
    icon: ShieldCheck,
    copy: "Our engine ranks every gap by its impact on the hiring decision. Focus on the 20% of skills that drive 80% of the fit.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Bridge Roadmaps",
    icon: Zap,
    copy: "Instant, actionable learning paths. We don't just tell you what's missing; we tell you the shortest path to closing it.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "Semantic Filtering",
    icon: Layers,
    copy: "Ignore keyword-stuffed filler requirements. We highlight the core operational needs of every job description.",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

export default function About() {
  const { user } = useAuth();

  return (
    <div className="flex-1 bg-surface-off-white py-24 px-4 overflow-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-5xl mx-auto space-y-24"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="w-3 h-3 mr-2 text-blue-500" />
            About gapless
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Built to close the gap.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <span className="font-bold text-slate-900">gapless</span> is a career intelligence platform that analyzes job descriptions against your professional experience, producing ranked readiness scores and actionable roadmaps to your next role.
          </p>
        </motion.div>

        {/* What is the Gap List */}
        <motion.div variants={itemVariants} className="space-y-4 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Gap Analysis</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Understand what stands between you and the role.
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Every job description encodes requirements across multiple dimensions. The <span className="font-bold text-slate-900">gapless</span> engine decomposes both the job and your profile into structured capability tokens, then measures the distance between them across four gap categories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gaps.map((gap) => (
            <motion.div
              key={gap.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="enterprise-card p-8 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-white group relative overflow-hidden"
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${gap.bg}`} />

              <div className={`shrink-0 w-14 h-14 rounded-2xl ${gap.bg} flex items-center justify-center border border-transparent group-hover:border-white shadow-sm transition-all duration-300`}>
                <gap.icon className={`w-6 h-6 ${gap.color}`} />
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{gap.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{gap.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Capabilities */}
        <motion.div variants={itemVariants} className="space-y-4 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Capabilities</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Purpose-built intelligence for your career.
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Every feature is designed to answer one question: <span className="font-bold text-slate-900">"How do I move forward?"</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap) => (
            <motion.div
              key={cap.title}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="enterprise-card p-8 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-white group relative overflow-hidden"
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${cap.bg}`} />

              <div className={`shrink-0 w-14 h-14 rounded-2xl ${cap.bg} flex items-center justify-center border border-transparent group-hover:border-white shadow-sm transition-all duration-300`}>
                <cap.icon className={`w-6 h-6 ${cap.color}`} />
              </div>
              <div className="space-y-3 relative z-10">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{cap.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{cap.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage */}
        <motion.div variants={itemVariants} className="space-y-12">
          <div className="space-y-4 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">How It Works</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Three steps. No fluff.
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              From job description to actionable roadmap in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Paste the job description",
                copy: "Drop the full job listing into the analyzer. Our semantic engine extracts structured requirements automatically.",
              },
              {
                step: "02",
                title: "Add your experience",
                copy: "Paste your resume or describe your professional background. We map your experience tokens against the role's needs.",
              },
              {
                step: "03",
                title: "Get your roadmap",
                copy: "Receive a ranked readiness score, a prioritized gap list, and concrete learning paths to close each gap.",
              },
            ].map((step) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="enterprise-card p-8 text-center space-y-4 bg-white group hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <span className="text-4xl font-bold text-slate-200 group-hover:text-blue-100 transition-colors">{step.step}</span>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.copy}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-slate-900 rounded-3xl p-12 lg:p-20 text-center shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)]" />

          <div className="relative z-10 space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready to see your gaps?</h3>
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