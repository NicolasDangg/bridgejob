/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, type Variants } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useRef, ReactNode, useEffect } from "react";
import { User as UserIcon, Settings, Shield, LogOut } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Accounts from "./components/Accounts";
import SampleResult from "./components/SampleResult";
import backgroundImage from "./assets/background.jpg";
import { AuthProvider, useAuth } from "./lib/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PageLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Fixed image background - persists across sections */}
      <div className="fixed inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          height={1080}
          width={1920}
        />
      </div>

      {/* Floating Navigation Bar */}
      <nav className="fixed top-6 z-50 w-full px-6 flex justify-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between w-full max-w-5xl h-14 px-6 rounded-full bg-white/72 backdrop-blur-xl border border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.03] relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/35 to-white/0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex items-center gap-8 relative z-10">
            <Link to="/" className="font-sans font-extrabold text-xl text-zinc-900 tracking-tight">
              BridgeJob
            </Link>
            <div className="hidden md:flex items-center gap-6">
                {[
                  { name: "Dashboard", path: "/dashboard" },
                  { name: "Pricing", path: "/pricing" },
                  { name: "Features", path: "/features" },
                  { name: "Contact", path: "/contact" }
                ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-zinc-500 hidden sm:inline">{user.email}</span>
                <Link 
                  to="/accounts" 
                  className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-zinc-50 hover:scale-105 transition-all shadow-sm group/profile"
                  title="Account Settings"
                >
                  <UserIcon className="w-5 h-5 text-zinc-700 group-hover/profile:text-zinc-900" />
                </Link>
                <button
                  onClick={signOut}
                  className="p-2.5 rounded-full bg-white border border-black/10 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm group/logout"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors px-4 py-2">
                  Login
                </Link>
                <Link to="/signup" className="text-sm font-semibold text-zinc-900 bg-white px-5 py-2 rounded-full border border-black/10 hover:bg-zinc-100 transition-all shadow-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </nav>

      <main className="relative z-10 pt-24 min-h-screen">
        {children}
      </main>
    </div>
  );
}

function Hero() {
  const sampleRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSample = () => {
    sampleRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyzeClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
        {/* Content Container with Glassy Fade Effect */}
        <div className="relative z-20 flex items-center justify-center w-full max-w-5xl px-6">
          <div className="absolute inset-0 -z-10 bg-white/45 backdrop-blur-md rounded-[4rem] scale-110 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-95" />

          <motion.div
            className="text-center py-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={itemVariants}
              className="block text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-zinc-700 mb-4"
            >
              Career intelligence
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold text-zinc-900 mb-6 leading-[1.1] tracking-tight drop-shadow-sm"
            >
              Know exactly where <br className="hidden sm:block" /> you stand.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-zinc-800 font-normal max-w-[520px] mx-auto mb-10 leading-relaxed"
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
                className="w-full sm:w-auto px-10 py-4 bg-white/70 text-zinc-900 font-medium border border-black/12 backdrop-blur-sm rounded-full hover:bg-white/85 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                See a sample result
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sample Result Section */}
      <section ref={sampleRef} className="min-h-screen flex items-center justify-center relative pt-14">
        <div className="w-full max-w-none px-0 py-0">
          <SampleResult />
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <PageLayout>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/accounts" 
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </PageLayout>
      </AuthProvider>
    </Router>
  );
}

