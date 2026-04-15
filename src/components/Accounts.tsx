/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Mail,
  Lock
} from "lucide-react";

export default function Accounts() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 border border-black/5 shadow-sm">
          <Lock className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-3xl font-sans font-extrabold text-zinc-900 mb-2 tracking-tight">Please sign in</h1>
        <p className="text-zinc-600 mb-8 max-w-sm">You need to be authenticated to view your account settings and preferences.</p>
        <a href="/login" className="px-8 py-3 bg-zinc-900 text-white rounded-full font-semibold hover:bg-zinc-800 transition-all shadow-lg">
          Go to Login
        </a>
      </div>
    );
  }

  const sections = [
    {
      title: "Account Settings",
      description: "Manage your personal information and profile settings.",
      icon: Settings,
      items: [
        { label: "Profile Information", value: user.email, sublabel: "Your primary email address" },
        { label: "Account Security", sublabel: "Password and authentication settings" },
        { label: "Linked Accounts", sublabel: "Manage your connected social accounts" }
      ]
    },
    {
      title: "Privacy & Security",
      description: "Control your data and how it's shared with others.",
      icon: Shield,
      items: [
        { label: "Privacy Checklist", sublabel: "Review your privacy settings", highlight: true },
        { label: "Data Export", sublabel: "Download a copy of your personal data" },
        { label: "Two-Factor Authentication", sublabel: "Add an extra layer of security" }
      ]
    },
    {
      title: "Preferences",
      description: "Customize your experience and notifications.",
      icon: Bell,
      items: [
        { label: "Email Notifications", sublabel: "Choose what updates you receive" },
        { label: "Theme Preferences", sublabel: "Toggle between light and dark modes" },
        { label: "Language", sublabel: "Select your preferred language" }
      ]
    },
    {
      title: "Billing & Subscription",
      description: "Manage your plan and payment methods.",
      icon: CreditCard,
      items: [
        { label: "Current Plan", value: "Free Tier", sublabel: "Explore pro features for more analysis" },
        { label: "Payment Methods", sublabel: "Add or remove cards and accounts" },
        { label: "Billing History", sublabel: "View and download your past invoices" }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/5">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-sans font-extrabold text-zinc-900 tracking-tight">
              My Account
            </h1>
            <p className="text-zinc-600">
              Manage your personal settings, security, and preferences.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-xl px-5 py-3 rounded-2xl border border-black/5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 leading-none">{user.email?.split('@')[0]}</p>
              <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="bg-white/72 backdrop-blur-xl rounded-3xl border border-black/10 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.1)] transition-all flex flex-col"
            >
              <div className="flex items-start gap-5 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center text-zinc-700">
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 mb-1">{section.title}</h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">{section.description}</p>
                </div>
              </div>

              <div className="space-y-1">
                {section.items.map((item, i) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 transition-colors group text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                        {item.label}
                        {item.highlight && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] text-blue-600 font-bold uppercase tracking-wider border border-blue-100">
                            New
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-500 mt-0.5">{item.sublabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.value && (
                        <span className="text-xs font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md border border-black/5">
                          {item.value}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Help Center</button>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Privacy Policy</button>
            <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Terms of Service</button>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Account ID: {user.id}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
