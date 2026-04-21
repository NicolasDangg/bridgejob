import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, ReactNode } from "react";
import { User as UserIcon, LogOut, LayoutDashboard, CreditCard, Sparkles, Mail, ChevronDown } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Contact from "./components/Contact";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Accounts from "./components/Accounts";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import Security from "./components/Security";
import Billing from "./components/Billing";
import Notifications from "./components/Notifications";
import SampleResult from "./components/SampleResult";
import Roadmaps from "./components/Roadmaps";
import CareerPath from "./components/CareerPath";
import JobSearch from "./components/JobSearch";
import SkillLearning from "./components/SkillLearning";
import ResumeReview from "./components/ResumeReview";
import { FeaturesShowcase } from "./components/FeaturesShowcase";
import { AuthProvider, useAuth } from "./lib/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    }
  },
};

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-surface-off-white">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <div className="text-center p-12">Please log in to access this page.</div>;
  return <>{children}</>;
}

function NavLink({ to, children, icon: Icon }: { to: string, children: ReactNode, icon: any }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${isActive
        ? "text-slate-900 bg-slate-100"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
}

function PageLayout({ children }: { children: ReactNode }) {
  const { user, signOut, userPlan } = useAuth();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 50], [0, -10]);
  const headerHeight = useTransform(scrollY, [0, 50], ["3.5rem", "3rem"]);
  const headerShadow = useTransform(scrollY, [0, 50], ["0 0 0 0 rgba(0,0,0,0)", "0 4px 6px -1px rgb(0 0 0 / 0.1)"]);
  const headerBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(8px)"]);
  const headerBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.8)"]);

  const dashboardPaths = [
    '/dashboard', '/roadmaps', '/career-path', '/job-search', '/skill-learning',
    '/resume-review', '/accounts', '/security', '/billing', '/notifications'
  ];
  const isDashboardView = dashboardPaths.includes(pathname);

  return (
    <div className="min-h-screen bg-surface-off-white flex flex-col">
      {/* Stable Header/Top Nav */}
      {!isDashboardView && (
        <motion.header
          style={{ height: headerHeight, boxShadow: headerShadow, backdropFilter: headerBlur, backgroundColor: headerBg }}
          className="sticky top-0 z-50 border-b border-border-subtle flex items-center"
        >
          <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white text-[10px]">BJ</div>
                BridgeJob
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/pricing" icon={CreditCard}>Pricing</NavLink>
                <NavLink to="/features" icon={Sparkles}>Features</NavLink>
                <NavLink to="/contact" icon={Mail}>Contact</NavLink>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[11px] font-semibold text-slate-900">{user.email?.split('@')[0]}</span>
                    <span className="text-[10px] text-slate-500">{userPlan}</span>
                  </div>
                  <Link
                    to="/accounts"
                    className="w-8 h-8 rounded-full bg-slate-50 border border-border-subtle flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-600" />
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5">
                    Log in
                  </Link>
                  <Link to="/signup" className="enterprise-button">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.header>
      )}

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {!isDashboardView && (
        <footer className="bg-white border-t border-border-subtle py-8">
          <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2026 BridgeJob Career Intelligence. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-slate-400">
              <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-slate-600 transition-colors">Support</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  const scrollToSample = () => {
    const element = document.getElementById('sample-result');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center py-40 px-4 bg-surface-white overflow-hidden">
      {/* Complex background parallax elements */}
      <motion.div
        style={{ y: y1, rotate }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-50 rounded-full blur-[120px] -z-10"
      />
      <motion.div
        style={{ y: y2, rotate: -rotate }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] -z-10"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl text-center space-y-8"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider border border-slate-200">
          <Sparkles className="w-3 h-3 text-slate-400" />
          Career Intelligence
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl lg:text-8xl">
          <span style={{ backgroundColor: '#FFE066', padding: '0 8px', borderRadius: 2 }}>Close the gap</span> <br className="hidden md:block" /> between you and <br className="hidden md:block" /> your dream job.
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          BridgeJob analyzes job descriptions against your experience to provide ranked readiness scores and actionable roadmaps. Trained by real-world data.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link to="/signup" className="enterprise-button h-12 px-10 flex items-center justify-center text-base shadow-xl shadow-slate-200">
              Start Free Analysis
            </Link>
            <Link to="/dashboard" className="enterprise-button-outline h-12 px-10 flex items-center justify-center text-base">
              Explore Dashboard
            </Link>
          </div>
          <button
            onClick={scrollToSample}
            className="group flex flex-col items-center gap-2 text-[10px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-[0.2em] transition-all"
          >
            Look at a sample result
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
            </motion.div>
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-20 grid grid-cols-3 gap-12 py-12 border-t border-border-subtle mt-16 max-w-2xl mx-auto">
          <div className="text-center group">
            <div className="text-3xl font-bold text-slate-900 group-hover:scale-110 transition-transform">10K+</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-2">Active Users</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-slate-900 group-hover:scale-110 transition-transform">95%</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-2">Analysis Bias Check</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-slate-900 group-hover:scale-110 transition-transform">&lt;1 day</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-2">Gap Closing Rate</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-slate-900 origin-left z-[60]"
        style={{ scaleX }}
      />
      <Hero />
      <FeaturesShowcase />
      <div id="sample-result" />
      <SampleResult />
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
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmaps"
              element={
                <ProtectedRoute>
                  <Roadmaps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-path"
              element={
                <ProtectedRoute>
                  <CareerPath />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-search"
              element={
                <ProtectedRoute>
                  <JobSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-learning"
              element={
                <ProtectedRoute>
                  <SkillLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-review"
              element={
                <ProtectedRoute>
                  <ResumeReview />
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
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </PageLayout>
      </AuthProvider>
    </Router>
  );
}

