"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  Bell, 
  Shield, 
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

interface AnimatedProfileMenuProps {
  user: any;
  userPlan: string;
  signOut: () => void;
  isCollapsed?: boolean;
}

export function AnimatedProfileMenu({ user, userPlan, signOut, isCollapsed = false }: AnimatedProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Account Settings", icon: Settings, path: "/accounts" },
    { label: "Billing & Plans", icon: CreditCard, path: "/billing" },
    { label: "Security", icon: Shield, path: "/security" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 group",
          isCollapsed ? "justify-center w-12 h-12" : "w-full"
        )}
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        
        {!isCollapsed && (
          <div className="flex flex-col items-start overflow-hidden text-left">
            <span className="text-xs font-bold text-slate-900 truncate w-full">
              {user?.email?.split('@')[0] || 'Account'}
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
              {userPlan}
            </span>
          </div>
        )}
        
        {!isCollapsed && (
          <ChevronRight className={cn(
            "w-4 h-4 ml-auto text-slate-300 transition-transform duration-300",
            isOpen && "rotate-90 text-slate-900"
          )} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "absolute z-[100] w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden",
              isCollapsed ? "left-14 bottom-0" : "left-0 bottom-full mb-2 lg:bottom-auto lg:top-full lg:mt-2"
            )}
          >
            <div className="px-4 py-3 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
              <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
            </div>

            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    <item.icon className="w-4 h-4" />
                  </div>
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            <div className="mt-1 pt-1 border-t border-slate-50">
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-rose-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                  <LogOut className="w-4 h-4" />
                </div>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
