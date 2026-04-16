import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (import.meta.env.DEV) {
      try {
        const { testUser } = await import('../lib/testCredentials.json');
        if (email === testUser.email && password === testUser.password) {
          const mockUser = {
            id: 'test-user-id',
            email: testUser.email,
            user_metadata: { full_name: testUser.fullName },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString()
          };
          setUser(mockUser as any);
          setLoading(false);
          navigate("/dashboard");
          return;
        }
      } catch (e) {
        console.log("No test credentials file found, proceeding with Supabase.");
      }
    }

    if (!supabase) {
      setError("Supabase not configured.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex-1 bg-surface-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">BJ</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to BridgeJob</h1>
          <p className="text-sm text-slate-500 font-medium">Professional Career Intelligence Workspace</p>
        </div>

        <div className="enterprise-card p-6 bg-white">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="enterprise-input"
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Password</label>
                <Link to="/login" className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="enterprise-input"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full enterprise-button h-10 mt-2"
            >
              {loading ? "Signing In..." : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-slate-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
