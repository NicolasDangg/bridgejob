import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface UserMetadata {
  full_name?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  userPlan: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock session in localStorage first
    const mockUser = localStorage.getItem('mock_user');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
      setLoading(false);
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('mock_user');
    setUser(null);
    setSession(null);
    if (supabase) await supabase.auth.signOut();
  };

  const setManualUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('mock_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mock_user');
    }
    setUser(user);
  };

  const getUserPlan = (): string => {
    const metadata = user?.user_metadata as UserMetadata | undefined;
    const plan = metadata?.plan || 'free';
    return plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, setUser: setManualUser, userPlan: getUserPlan() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
