import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildAuthRedirectUrl, supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    if (import.meta.env.DEV && !supabase) {
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName, plan: 'free' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser as any);
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    if (!supabase) {
      setError('Backend not configured.');
      setLoading(false);
      return;
    }

    const redirectTo = buildAuthRedirectUrl('/dashboard');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: fullName, plan: 'free' },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      setTimeout(() => navigate('/login'), 2500);
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 bg-surface-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">BJ</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 font-medium">Enter your details and we’ll send you a magic link.</p>
        </div>

        <div className="enterprise-card p-6 bg-white space-y-5">
          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Magic link sent. Check your email to finish creating your account.
            </div>
          ) : null}

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

            {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full enterprise-button h-10 mt-2"
            >
              {loading ? 'Sending Link...' : 'Create Magic Link'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-slate-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
