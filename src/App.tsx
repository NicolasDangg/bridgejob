import { motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, ReactNode } from "react";
import { User as UserIcon, LogOut, LayoutDashboard, CreditCard, Sparkles, Mail } from "lucide-react";
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
import { FeaturesShowcase } from "./components/FeaturesShowcase";
import { AuthProvider, useAuth } from "./lib/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}

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

  return (
    <div className="min-h-screen bg-surface-off-white flex flex-col">
      {/* Stable Header/Top Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-border-subtle h-14 flex items-center shadow-sm">
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
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

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
    </div>
  );
}

function Hero() {
  const scrollToSample = () => {
    document.getElementById('sample-result')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-center py-32 px-4 bg-surface-white">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider border border-slate-200">
          Career Intelligence
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Close the gap between you and your dream job.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
          BridgeJob analyzes job descriptions against your experience to provide ranked readiness scores and actionable roadmaps. Trained by real-world data.
        </p>
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link to="/signup" className="enterprise-button h-11 px-8 flex items-center justify-center text-base">
              Start Free Analysis
            </Link>
            <Link to="/dashboard" className="enterprise-button-outline h-11 px-8 flex items-center justify-center text-base">
              Explore Dashboard
            </Link>
          </div>
          <button
            onClick={scrollToSample}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest transition-colors"
          >
            Look at a sample result
          </button>
        </div>

        <div className="pt-16 grid grid-cols-3 gap-8 py-12 border-t border-border-subtle mt-16 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">10K+</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Users</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">95%</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">&lt;1 day</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Gap Closing</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function LandingPage() {
  return (
    <>
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

