import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildAuthRedirectUrl, supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    if (import.meta.env.DEV) {
      try {
        const { testUser } = await import('../lib/testCredentials.json');
        if (email === testUser.email) {
          const mockUser = {
            id: 'test-user-id',
            email: testUser.email,
            user_metadata: { full_name: testUser.fullName },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
          };
          setUser(mockUser as any);
          setLoading(false);
          navigate('/dashboard');
          return;
        }
      } catch {
        console.log('No test credentials file found, continuing with Supabase magic link flow.');
      }
    }

    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }

    const redirectTo = buildAuthRedirectUrl('/dashboard');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 bg-surface-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center text-white text-sm font-bold mx-auto mb-4">BJ</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to BridgeJob</h1>
          <p className="text-sm text-slate-500 font-medium">We’ll email you a magic link to continue.</p>
        </div>

        <div className="enterprise-card p-6 bg-white space-y-5">
          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Magic link sent. Check your inbox and open the link to continue.
            </div>
          ) : null}

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

            {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full enterprise-button h-10 mt-2"
            >
              {loading ? 'Sending Link...' : 'Send Magic Link'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-4 decoration-slate-300">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}
