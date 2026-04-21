import { useAuth } from "../lib/AuthContext";
import { Bell, Mail, Eye } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

export default function Notifications() {
  const { user } = useAuth();

  return (
    <DashboardLayout activeLabel="Settings">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="pb-8 border-b border-gray-100">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notification Settings</h1>
          <p className="text-sm text-slate-500 font-medium">
            Control how and when you receive career intelligence alerts
            {user?.email ? ` at ${user.email}` : ''}.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-md divide-y divide-gray-100 overflow-hidden shadow-sm">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-900" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Email Notifications</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Receive weekly reports and system status updates
                  {user?.email ? ` to ${user.email}` : ''}.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-900" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">Push Notifications</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Real-time alerts for identified job matches and roadmap milestones.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-slate-900" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">In-App Alerts</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Visual banners within the BridgeJob dashboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
