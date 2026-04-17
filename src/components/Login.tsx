import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setStatusMessage(null);

    try {

      if (!supabase) {
        setError("Supabase not configured.");
        return;
      }

      if (password.trim()) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        navigate("/dashboard");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setStatusMessage("Check your email for the magic link to sign in.");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-sans font-extrabold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-zinc-700">Enter your details to access your dashboard.</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="you@domain.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-700">Password</label>
              <Link to="/login" className="text-[10px] font-bold text-zinc-600 hover:text-zinc-900">Forgot?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/50 px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="Leave blank for a magic link"
              autoComplete="current-password"
            />
            <p className="ml-1 text-xs text-zinc-500">Leave blank to receive a magic link instead.</p>
          </div>

          {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
          {statusMessage && <p className="text-xs text-emerald-700 ml-1">{statusMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-700">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-zinc-900 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
