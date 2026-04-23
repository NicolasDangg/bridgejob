/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { Lock, Smartphone, Monitor, Mail } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

interface ProfileData {
  last_password_change: string;
  mfa_enabled: boolean;
  mfa_type: string;
}

interface UserSession {
  id: string;
  device: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

export default function Security() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSecurityData() {
      if (!user?.id) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('last_password_change, mfa_enabled, mfa_type')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Fetch sessions
        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('last_active', { ascending: false });

        if (sessionsData) setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching security data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSecurityData();
  }, [user?.id]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    
    if (diffInMonths === 0) return "less than a month ago";
    if (diffInMonths === 1) return "1 month ago";
    return `${diffInMonths} months ago`;
  };

  return (
    <DashboardLayout activeLabel="Settings">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="pb-8 border-b border-gray-100 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Security & Authentication</h1>
            <p className="text-sm text-slate-500 font-medium">Protect your professional profile and data access.</p>
          </div>
          {user && (
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-md border border-gray-200 shadow-sm">
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white text-[10px] font-bold uppercase">
                {user.email?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.email}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Authenticated</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Credentials */}
          <div className="bg-white border border-gray-200 rounded-md p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Profile Credentials</h2>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Email</p>
                <p className="text-sm font-bold text-slate-900">{user?.email || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account ID</p>
                <p className="text-xs font-mono text-gray-500">{user?.id || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</p>
                <p className="text-xs text-gray-500 font-medium">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white border border-gray-200 rounded-md p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Password</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Your password was last changed {profile?.last_password_change ? formatRelativeTime(profile.last_password_change) : "recently"}. We recommend regular updates for maximum security.
            </p>
            <button className="w-full py-2 bg-slate-900 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">Update Password</button>
          </div>

          {/* Two-Factor Auth */}
          <div className="bg-white border border-gray-200 rounded-md p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Two-Factor Auth</h2>
            </div>
            <p className={`text-xs font-bold leading-relaxed ${profile?.mfa_enabled ? "text-emerald-600" : "text-amber-600"}`}>
              {profile?.mfa_enabled ? `Enabled — ${profile.mfa_type || "Authenticator"}` : "Disabled — Protect your account with 2FA"}
            </p>
            <button className="w-full py-2 border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
              {profile?.mfa_enabled ? "Manage MFA" : "Setup MFA"}
            </button>
          </div>

          {/* Active Sessions */}
          <div className="bg-white border border-gray-200 rounded-md p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-5 h-5 text-slate-900" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Active Sessions</h2>
            </div>
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-3 border-t border-gray-50 first:border-0">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">{session.device}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {session.location} • {session.is_current ? "Active Now" : formatRelativeTime(session.last_active)}
                      </p>
                    </div>
                    {!session.is_current && (
                      <button className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Revoke</button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No session data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
