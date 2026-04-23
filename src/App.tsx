import { motion, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, ReactNode, useRef } from "react";
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

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-off-white p-6">
        <div className="enterprise-card p-12 text-center space-y-6 max-w-sm">
          <div className="w-12 h-12 bg-slate-50 border border-border-subtle rounded flex items-center justify-center mx-auto text-slate-300">
            <UserIcon className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Authentication Required</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Please log in or sign up to access this feature.</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/login" className="enterprise-button h-10 px-8 flex items-center justify-center">
              Log In
            </Link>
            <Link to="/signup" className="enterprise-button-outline h-10 px-8 flex items-center justify-center">
              Sign Up
            </Link>
            <Link to="/" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    '/dashboard', '/career-path', '/job-search', '/skill-learning',
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
              <Link to="/" className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2.5">
                <img
                  src="https://jxpnnzaddesjmkcl.public.blob.vercel-storage.com/Generated%20Image%20April%2022%2C%202026%20-%208_25AM.svg"
                  alt="gapless logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xl tracking-tighter">gapless</span>
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
            <p className="text-xs text-slate-500">© 2026 gapless Career Intelligence. All rights reserved.</p>
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

  const scrollToLiveDemo = () => {
    const element = document.getElementById('live-demo');
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
          <span className="relative isolate inline-block px-4 py-1 mx-1"><span className="absolute inset-0 bg-amber-200/60 -rotate-1 rounded-sm -z-10"></span>Close the gap</span> <br className="hidden md:block" /> between you and <br className="hidden md:block" /> your dream job.
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          <span className="font-bold text-slate-900">gapless</span> analyzes job descriptions against your experience to provide ranked readiness scores and actionable roadmaps. Trained by real-world data.
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
            onClick={scrollToLiveDemo}
            className="group flex flex-col items-center gap-2 text-[10px] text-slate-400 hover:text-slate-900 font-bold uppercase tracking-[0.2em] transition-all"
          >
            See how it works
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

function LiveDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      videoRef.current?.play().catch(e => console.error("Autoplay prevented:", e));
    } else {
      videoRef.current?.pause();
    }
  }, [isInView]);

  const scrollToSample = () => {
    const element = document.getElementById('sample-result');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="live-demo" className="py-24 px-4 bg-slate-50 border-y border-border-subtle">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl mx-auto space-y-12"
      >
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Live Demo</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Watch <span className="font-bold text-slate-900">gapless</span> in action.</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">
            See how we process complex requirements and candidate data to generate a strategic career roadmap in seconds.
          </p>
        </div>

        <div className="relative group">
          {/* Decorative frame */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-slate-200 to-indigo-100 rounded-xl opacity-50 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative bg-white p-2 rounded-xl border border-border-subtle shadow-2xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto rounded-lg"
              muted
              loop
              playsInline
            >
              <source src="https://jxpnnzaddesjmkcl.public.blob.vercel-storage.com/output3.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={scrollToSample}
            className="enterprise-button h-11 px-8 flex items-center justify-center text-sm shadow-lg shadow-slate-200 gap-2"
          >
            <span>View a sample result</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
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
      <LiveDemo />
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

