/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import Dashboard from "./components/Dashboard";
import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Signup from "./components/Signup";
import SampleResult from "./components/SampleResult";

function Hero() {
  const navigate = useNavigate();
  const sampleRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = false; // Mock auth state

  const scrollToSample = () => {
    sampleRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyzeClick = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "cubic-bezier(0.21,0.47,0.32,0.98)",
      },
    },
  };

  return (
    <div className="h-screen overflow-y-auto scroll-smooth relative">
      {/* Fixed Background Video - Persists across sections */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Floating Navigation Bar */}
      <nav className="fixed top-6 z-50 w-full px-6 flex justify-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between w-full max-w-5xl h-14 px-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.05] relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-center gap-8 relative z-10">
            <Link to="/" className="font-serif font-bold text-xl text-white tracking-tight">
              BridgeJob
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[
                { name: "Dashboard", path: "/dashboard" },
                { name: "Pricing", path: "/pricing" },
                { name: "Features", path: "/features" },
                { name: "Contact us", path: "/contact" }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
              Login
            </Link>
            <Link to="/signup" className="text-sm font-semibold text-zinc-900 bg-white px-5 py-2 rounded-full hover:bg-zinc-100 transition-all shadow-sm">
              Sign up
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center z-10">
        {/* Content Container with Glassy Fade Effect */}
        <div className="relative z-20 flex items-center justify-center w-full max-w-5xl px-6">
          <div className="absolute inset-0 -z-10 bg-white/5 backdrop-blur-md rounded-[4rem] scale-110 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-80" />

          <motion.div
            className="text-center py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={itemVariants}
              className="block text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-white/60 mb-4"
            >
              Career intelligence, no sugarcoating
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.1] drop-shadow-lg"
            >
              Know exactly where <br className="hidden sm:block" /> you stand.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-white/80 font-normal max-w-[520px] mx-auto mb-10 leading-relaxed"
            >
              Paste a job description and your skills. Get a readiness score,
              every gap ranked by urgency, and a step-by-step plan to close them.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={handleAnalyzeClick}
                className="w-full sm:w-auto px-10 py-4 bg-white text-zinc-900 font-semibold rounded-full hover:bg-zinc-100 transition-all duration-300 shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Analyze My Fit
              </button>
              <button
                onClick={scrollToSample}
                className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white font-medium border border-white/20 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                See a sample result
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sample Result Section */}
      <section ref={sampleRef} className="min-h-screen flex items-center justify-center z-10 relative pt-14">
        <div className="w-full max-w-none px-0 py-[50px]">
          <SampleResult />
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
