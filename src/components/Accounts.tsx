/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";
import {
  Settings,
  Shield,
  CreditCard,
  ChevronRight,
  Lock,
  FileText,
  LogOut
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

export default function Accounts() {
  const { user, signOut, userPlan } = useAuth();

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-off-white p-6">
        <div className="enterprise-card p-12 text-center space-y-6 max-w-sm">
          <div className="w-12 h-12 bg-slate-50 border border-border-subtle rounded flex items-center justify-center mx-auto text-slate-300">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Please authenticate to manage your account settings.</p>
          </div>
          <Link to="/login" className="enterprise-button h-10 px-8 flex items-center justify-center mx-auto">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeLabel="Settings">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="pb-8 border-b border-gray-100 flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your credentials and system preferences.</p>
          </div>
          <div className="flex items-center bg-white p-2.5 rounded-md border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-2 pr-4 border-r border-gray-100">
              <div className="w-11 h-11 bg-slate-900 rounded-md flex items-center justify-center text-white text-xs font-bold uppercase tracking-tighter shrink-0">
                {user.email?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{userPlan}</p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 ml-1 rounded-md text-red-600 hover:bg-red-50 transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Section */}
          <div className="bg-white border border-gray-200 rounded-md flex flex-col h-full overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Security & Access</span>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Manage your profile credentials, authentication methods, and data portability settings.
              </p>
              <Link
                to="/security"
                className="w-full flex items-center justify-between p-4 rounded-md bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group"
              >
                <span className="text-xs font-bold text-slate-900">Go to Security and Access</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Billing Section */}
          <div className="bg-white border border-gray-200 rounded-md flex flex-col h-full overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing & Subscription</span>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-center space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                View your current plan, update payment methods, and access your invoice archive.
              </p>
              <Link
                to="/billing"
                className="w-full flex items-center justify-between p-4 rounded-md bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group"
              >
                <span className="text-xs font-bold text-slate-900">Go to Billing and Subscription</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white border border-gray-200 rounded-md flex flex-col h-full overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preferences</span>
            </div>
            <div className="flex-1 p-2">
              <div className="space-y-1">
                <Link to="/notifications" className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">Notifications</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Manage email and system alerts</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>
                <div className="w-full flex items-center justify-between p-3 rounded-md opacity-50 cursor-not-allowed">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">Region & Language</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Configure localization settings</div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-1.5 py-0.5 rounded">Soon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="bg-white border border-gray-200 rounded-md flex flex-col h-full overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legal & Compliance</span>
            </div>
            <div className="flex-1 p-2">
              <div className="space-y-1">
                <Link to="/privacy" className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">Privacy Policy</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Data handling and safety</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>
                <Link to="/terms" className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">Terms of Service</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Usage agreements and rules</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Help/Support Section */}
        <div className="bg-slate-900 rounded-md p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <h3 className="text-white text-lg font-bold tracking-tight">Need assistance?</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">Our support team is here to help with any technical or billing questions.</p>
            </div>
            <Link to="/contact" className="inline-block h-10 px-8 bg-white text-slate-900 text-[11px] font-bold uppercase tracking-widest rounded-md hover:bg-slate-100 transition-colors leading-10 text-center shrink-0">
              Contact Support
            </Link>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}
