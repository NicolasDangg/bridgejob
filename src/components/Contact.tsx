import { useAuth } from "../lib/AuthContext";
import { useState, useEffect } from "react";

export default function Contact() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  return (
    <div className="flex-1 bg-surface-off-white flex items-center justify-center p-6 overflow-auto">
      <div className="w-full max-w-3xl space-y-12">
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Communications</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Partner with our engineers.</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            We prioritize direct feedback from senior professionals and hiring managers to refine our intelligence models.
          </p>
        </div>

        <div className="enterprise-card p-8 lg:p-12 bg-white">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="enterprise-input"
                  placeholder="Professional name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="enterprise-input"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Your Inquiry</label>
              <textarea
                required
                className="enterprise-input h-32 resize-none py-3"
                placeholder="Describe your use case or platform feedback..."
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-border-subtle">
              <button
                type="submit"
                className="enterprise-button px-10 h-10 text-xs"
              >
                Dispatch Message
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[
            { label: 'Technical Support', value: 'support@bridgejob.io' },
            { label: 'Enterprise Sales', value: 'sales@bridgejob.io' },
            { label: 'Press Inquiries', value: 'media@bridgejob.io' },
          ].map((item) => (
            <div key={item.label} className="text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xs font-bold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
