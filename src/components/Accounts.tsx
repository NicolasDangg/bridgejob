import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";
import {
  User,
  Settings,
  Shield,
  Bell,
  CreditCard,
  ChevronRight,
  Mail,
  Lock,
  FileText
} from "lucide-react";

export default function Accounts() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-off-white p-6">
        <div className="enterprise-card p-12 text-center space-y-6 max-w-sm">
          <div className="w-12 h-12 bg-slate-50 border border-border-subtle rounded flex items-center justify-center mx-auto text-slate-300">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Please authenticate to manage your professional profile and account settings.</p>
          </div>
          <Link to="/login" className="enterprise-button h-10 px-8 flex items-center justify-center mx-auto">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: "Security & Access",
      icon: Shield,
      items: [
        { label: "Profile Credentials", value: user.email, sublabel: "Primary workspace email", path: "/security" },
        { label: "Authentication", sublabel: "Two-factor and session management", path: "/security" },
        { label: "Data Portability", sublabel: "Export your analysis history", path: "/security" }
      ]
    },
    {
      title: "Billing & Subscription",
      icon: CreditCard,
      items: [
        { label: "Current Tier", value: "Starter Plan", sublabel: "Standard individual access", path: "/billing" },
        { label: "Payment Method", sublabel: "Manage cards and billing address", path: "/billing" },
        { label: "Invoice Archive", sublabel: "Review past transaction history", path: "/billing" }
      ]
    },
    {
      title: "Legal & Compliance",
      icon: FileText,
      items: [
        { label: "Privacy Policy", sublabel: "Data handling and safety", path: "/privacy" },
        { label: "Terms of Service", sublabel: "Usage agreements and rules", path: "/terms" }
      ]
    },
    {
      title: "Preferences",
      icon: Settings,
      items: [
        { label: "Notifications", sublabel: "Manage email and system alerts", path: "/notifications" },
        { label: "Region & Language", sublabel: "Configure localization settings", path: "#" }
      ]
    }
  ];

  return (
    <div className="flex-1 bg-surface-off-white overflow-auto py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="pb-8 border-b border-border-subtle flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your professional credentials and system preferences.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded border border-border-subtle shadow-sm">
            <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold uppercase tracking-tighter">
              {user.email?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Standard User</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="enterprise-card flex flex-col h-full">
              <div className="px-5 py-4 bg-surface-off-white border-b border-border-subtle flex items-center gap-3">
                <section.icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{section.title}</span>
              </div>
              <div className="flex-1 p-2">
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path || "#"}
                      className="w-full flex items-center justify-between p-3 rounded hover:bg-surface-off-white transition-colors group text-left"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.sublabel}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.value && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.value}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Help/Support Section */}
          <div className="enterprise-card bg-slate-900 h-full flex flex-col justify-center p-8 space-y-4">
            <h3 className="text-white text-lg font-bold tracking-tight">Need assistance?</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">Our support team is available 24/7 for technical queries and account management help.</p>
            <div className="pt-2">
              <Link to="/contact" className="inline-block h-9 px-6 bg-white text-slate-900 text-[11px] font-bold uppercase tracking-widest rounded hover:bg-slate-100 transition-colors leading-9 text-center">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
