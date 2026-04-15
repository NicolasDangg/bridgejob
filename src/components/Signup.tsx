import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Optional: Auto-redirect or ask to check email
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md rounded-[2.5rem] border border-black/10 bg-white/70 backdrop-blur-md p-10 shadow-[0_12px_48px_rgba(0,0,0,0.08)]"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-sans font-extrabold text-zinc-900 tracking-tight">Create Account</h1>
          <p className="mt-2 text-zinc-700">Start your career intelligence journey today.</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-100">
              <p className="font-bold">Check your email!</p>
              <p className="text-sm">We've sent a confirmation link to your inbox. Redirecting to login...</p>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="you@domain.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-red-600 ml-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-700">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-zinc-900 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
