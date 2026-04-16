import { useState } from "react";
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
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <div className="flex-1 bg-surface-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">BJ</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 font-medium">Start your career intelligence journey</p>
        </div>

        <div className="enterprise-card p-6 bg-white">
          {success ? (
            <div className="py-4 text-center space-y-3">
              <div className="text-emerald-600 font-bold text-sm tracking-tight italic">Registration Successful</div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We've sent a confirmation link to your email. You will be redirected to the login page shortly.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="enterprise-input"
                  placeholder="John Doe"
                />
              </div>
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
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Password</label>
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
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-slate-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
