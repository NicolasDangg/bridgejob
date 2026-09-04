/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Target,
  TrendingUp,
  Search,
  Plus,
  HelpCircle,
  Settings,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Briefcase,
  BookOpen,
  Receipt,
  Gift,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { Button } from '@/src/components/ui/button';
import { NativeButton } from './uitripled/native-button-shadcnui';
import { AnimatedProfileMenu } from './uitripled/animated-profile-menu-shadcnui';
import { FloatingChatBox } from './FloatingChatBox';

// --- Constants ---

export const SIDEBAR_NAV = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Readiness', icon: Search },
  { label: 'History', icon: History },
  { label: 'Career Path', icon: TrendingUp },
];

export const SERVICES_NAV = [
  { label: 'Job Search', icon: Briefcase },
  { label: 'Skill Learning', icon: BookOpen },
  { label: 'Resume Review', icon: Receipt },
  { label: 'Resume Creator', icon: FileText },
  { label: 'HR Workspace', icon: Users },
];

// --- Sub-components ---

export const IconButton = ({ icon: Icon, className, ...props }: any) => (
  <NativeButton
    variant="ghost"
    size="icon"
    className={cn(
      "h-11 w-11 rounded-xl flex items-center justify-center transition-all",
      className
    )}
    {...props}
  >
    <Icon size={20} />
  </NativeButton>
);

interface SidebarItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  badge?: ReactNode;
  onClick: () => void;
  isCollapsed: boolean;
  reduceMotion?: boolean | null;
}

export const SidebarItem = ({ icon: Icon, label, active, badge, onClick, isCollapsed, reduceMotion }: SidebarItemProps) => (
  <NativeButton
    variant={active ? "default" : "ghost"}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={cn(
      "w-full flex items-center justify-start gap-6 px-4 py-4 rounded-2xl text-sm font-bold transition-all group",
      active
        ? "shadow-lg shadow-slate-200"
        : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900",
      isCollapsed && "justify-center px-0 h-14"
    )}
    shimmer={active && !reduceMotion}
  >
    <Icon size={22} className={cn("transition-colors shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
    {!isCollapsed && <span className="truncate">{label}</span>}
    {!isCollapsed && badge && (
      <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
        {badge}
      </span>
    )}
  </NativeButton>
);

// --- Layout Component ---

interface DashboardLayoutProps {
  children: ReactNode;
  activeLabel?: string;
  onTabChange?: (label: string) => void;
  headerContent?: ReactNode;
}

export default function DashboardLayout({ children, activeLabel, onTabChange, headerContent }: DashboardLayoutProps) {
  const { user, userPlan, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isPro = userPlan.toLowerCase().includes('pro') || userPlan.toLowerCase().includes('enterprise');

  const handleCoachClick = () => {
    if (!isPro) {
      alert('AI Career Coach is a Pro feature. Please upgrade your plan to access this feature.');
      return;
    }
    setIsChatOpen(true);
  };

  const handleSidebarClick = (label: string) => {
    // If it's an internal Dashboard tab and we are on the Dashboard
    const internalTabs = ['Overview', 'Readiness', 'History'];
    const isDashboard = location.pathname === '/dashboard';

    if (internalTabs.includes(label)) {
      if (isDashboard && onTabChange) {
        onTabChange(label);
      } else {
        // Navigate to dashboard and ideally set the tab, but for now just navigate
        navigate('/dashboard');
        // Note: we could pass state to navigate to set the tab on arrival
      }
      return;
    }

    // External routes
    switch (label) {

      case 'Career Path':
        navigate('/career-path');
        break;
      case 'Job Search':
        navigate('/job-search');
        break;
      case 'Skill Learning':
        navigate('/skill-learning');
        break;
      case 'Resume Review':
        navigate('/resume-review');
        break;
      case 'Resume Creator':
        navigate('/resume-creator');
        break;
      case 'HR Workspace':
        navigate('/hr');
        break;
      default:
        break;
    }
  };
  const mobileNavItems = [...SIDEBAR_NAV, ...SERVICES_NAV];
  const hasActiveMobileNavItem = mobileNavItems.some((item) => item.label === activeLabel);

  return (
    <div className="flex flex-1 min-h-0 bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "hidden md:flex border-r border-gray-200 bg-white flex-col sticky top-0 h-screen z-20 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn("p-6 flex-1 overflow-hidden", isCollapsed && "px-4")}>
          <Link to="/" className="flex items-center gap-2 mb-8 overflow-hidden hover:opacity-80 transition-opacity">
            <img 
              src="https://jxpnnzaddesjmkcl.public.blob.vercel-storage.com/Generated%20Image%20April%2022%2C%202026%20-%208_25AM.svg" 
              alt="gapless logo" 
              className="w-12 h-12 object-contain shrink-0" 
            />
            {!isCollapsed && <span className="font-bold text-xl tracking-tight truncate">gapless</span>}
          </Link>

          <div className="space-y-6">
            <div>
              {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Track</p>}
              <nav className="space-y-1">
                {SIDEBAR_NAV.map((item) => (
                  <SidebarItem
                    key={item.label}
                    reduceMotion={reduceMotion}
                    {...item}
                    isCollapsed={isCollapsed}
                    active={activeLabel === item.label}
                    onClick={() => handleSidebarClick(item.label)}
                  />
                ))}
              </nav>
            </div>

            <div>
              {!isCollapsed && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Services</p>}
              <nav className="space-y-1">
                {SERVICES_NAV.map((item) => (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    reduceMotion={reduceMotion}
                    isCollapsed={isCollapsed}
                    active={activeLabel === item.label}
                    onClick={() => handleSidebarClick(item.label)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 space-y-4 border-t border-gray-100 bg-white">
          <AnimatedProfileMenu user={user} userPlan={userPlan} signOut={signOut} isCollapsed={isCollapsed} />

          {!isCollapsed && (
            <div className="grid grid-cols-4 gap-2 px-2">
              <IconButton 
                icon={Plus} 
                className="bg-gray-100 hover:bg-gray-200" 
                title="New Analysis"
                onClick={() => { navigate('/dashboard'); }} 
              />
              <IconButton 
                icon={Gift} 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100" 
                title="Referrals"
                onClick={() => alert('Referral program coming soon!')}
              />
              <IconButton 
                icon={HelpCircle} 
                title="Support"
                onClick={() => navigate('/contact')}
              />
              <IconButton 
                icon={MoreHorizontal} 
                title="Settings"
                onClick={() => navigate('/accounts')}
              />
            </div>
          )}

          <NativeButton
            onClick={handleCoachClick}
            variant="outline"
            className={cn(
              "w-full flex items-center justify-center gap-4 py-6 px-4 rounded-2xl text-sm font-bold shadow-sm overflow-hidden h-auto",
              isCollapsed && "p-0 h-14 w-14 mx-auto",
              !isPro && "opacity-80"
            )}
            shimmer={isPro && !reduceMotion}
          >
            <Sparkles size={20} className={cn("shrink-0", isPro ? "text-blue-500" : "text-gray-400")} />
            {!isCollapsed && (
              <span className="flex items-center gap-2">
                AI Career Coach
                {!isPro && <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">PRO</span>}
              </span>
            )}
          </NativeButton>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="min-h-10 w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isCollapsed ? <ChevronRight aria-hidden="true" size={20} /> : <ChevronLeft aria-hidden="true" size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-y-auto flex flex-col h-screen">
        <div className="flex-1">
          <motion.div
            key={location.pathname} // Only re-animate on actual route changes, not tab changes
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, ...(reduceMotion ? {} : { y: 0 }) }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            className="px-4 pt-8 pb-12 sm:px-6 md:px-8"
          >
            <div className="mb-6 md:hidden">
              <label htmlFor="mobile-navigation" className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">
                Navigate
              </label>
              <select
                id="mobile-navigation"
                value={activeLabel ?? ""}
                onChange={(event) => handleSidebarClick(event.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 shadow-sm outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                {!activeLabel && <option value="">Choose a destination</option>}
                {activeLabel && !hasActiveMobileNavItem && <option value={activeLabel}>{activeLabel}</option>}
                <optgroup label="Track">
                  {SIDEBAR_NAV.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
                </optgroup>
                <optgroup label="Services">
                  {SERVICES_NAV.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
                </optgroup>
              </select>
            </div>
            {/* Greeting Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.email?.split('@')[0] || 'User'}
              </h1>
              {headerContent}
            </div>

            {children}
          </motion.div>
        </div>
      </main>

      <FloatingChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
