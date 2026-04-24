/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
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
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
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
];

// --- Sub-components ---

export const IconButton = ({ icon: Icon, className, ...props }: any) => (
  <button
    className={cn(
      "w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors",
      className
    )}
    {...props}
  >
    <Icon size={18} />
  </button>
);

export const SidebarItem = ({ icon: Icon, label, active, badge, onClick, isCollapsed }: any) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
      active
        ? "bg-gray-200 text-gray-900"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
      isCollapsed && "justify-center px-0"
    )}
  >
    <Icon size={18} className={cn("transition-colors shrink-0", active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900")} />
    {!isCollapsed && <span className="truncate">{label}</span>}
    {!isCollapsed && badge && (
      <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
        {badge}
      </span>
    )}
  </button>
);

// --- Layout Component ---

interface DashboardLayoutProps {
  children: ReactNode;
  activeLabel?: string;
  onTabChange?: (label: string) => void;
  headerContent?: ReactNode;
}

export default function DashboardLayout({ children, activeLabel, onTabChange, headerContent }: DashboardLayoutProps) {
  const { user, userPlan } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      default:
        break;
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-gray-200 bg-white flex flex-col sticky top-0 h-screen z-20 transition-all duration-300",
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
          <div className={cn("flex items-center justify-between", isCollapsed ? "flex-col gap-4" : "px-2")}>
            <Link to="/accounts" className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm uppercase shrink-0">
                {user?.email?.substring(0, 2) || 'g'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-bold text-gray-900 truncate">{user?.email?.split('@')[0] || 'User'}</span>
                  <span className="text-[10px] text-gray-400">Personal Account</span>
                </div>
              )}
            </Link>
            {!isCollapsed && <IconButton icon={Settings} onClick={() => navigate('/accounts')} />}
          </div>

          {!isCollapsed && (
            <div className="flex items-center justify-between gap-1 px-1">
              <IconButton 
                icon={Plus} 
                className="bg-gray-100 hover:bg-gray-200 flex-1" 
                title="New Analysis"
                onClick={() => { navigate('/dashboard'); }} 
              />
              <IconButton 
                icon={Gift} 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 flex-1" 
                title="Referrals"
                onClick={() => alert('Referral program coming soon!')}
              />
              <IconButton 
                icon={HelpCircle} 
                className="flex-1" 
                title="Support"
                onClick={() => navigate('/contact')}
              />
              <IconButton 
                icon={MoreHorizontal} 
                className="flex-1" 
                title="Settings"
                onClick={() => navigate('/accounts')}
              />
            </div>
          )}

          <button
            title="AI Career Coach"
            onClick={handleCoachClick}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm overflow-hidden",
              isCollapsed && "p-0 h-10",
              !isPro && "opacity-80"
            )}
          >
            <Sparkles size={16} className={cn("shrink-0", isPro ? "text-blue-500" : "text-gray-400")} />
            {!isCollapsed && (
              <span className="flex items-center gap-2">
                AI Career Coach
                {!isPro && <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-100">PRO</span>}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col h-screen">
        <div className="flex-1">
          <motion.div
            key={location.pathname + (activeLabel || '')}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="px-8 pt-8 pb-12"
          >
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
