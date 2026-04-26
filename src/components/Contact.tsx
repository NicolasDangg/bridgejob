"use client";

import { useAuth } from "@/src/lib/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Mail, MessageSquare, Send, Sparkles, User } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Contact() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    alert("Message dispatched successfully!");
  };

  return (
    <div className="flex-1 bg-surface-off-white flex items-center justify-center p-6 overflow-auto py-24">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-4xl space-y-16"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            <Mail className="w-3 h-3 mr-2 text-blue-500" />
            Global Communications
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Partner with our engineers.</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            We prioritize direct feedback from senior professionals and hiring managers to refine our intelligence models.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Contact Info Sidebar */}
                <div className="lg:col-span-2 bg-slate-900 p-8 lg:p-12 text-white space-y-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-bold">Contact Information</h3>
                    <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      Fill out the form and our team will get back to you within 24 hours.
                    </p>
                  </div>

                  <div className="relative z-10 space-y-8">
                    {[
                      { label: 'Technical Support', value: 'support@gapless.io', icon: Sparkles },
                      { label: 'Enterprise Sales', value: 'sales@gapless.io', icon: Send },
                      { label: 'Press Inquiries', value: 'media@gapless.io', icon: MessageSquare },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-400 transition-all duration-300">
                          <item.icon className="w-4 h-4 text-slate-300 group-hover:text-white" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 pt-12 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors" />
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors" />
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors" />
                  </div>
                </div>

                {/* Form Area */}
                <div className="lg:col-span-3 p-8 lg:p-12">
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <Input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                            placeholder="Professional name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Business Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                            placeholder="name@company.com"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Your Inquiry</label>
                      <textarea
                        required
                        className="w-full min-h-[160px] p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                        placeholder="Describe your use case or platform feedback..."
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        loading={isSubmitting}
                        className="px-10 h-12 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 group"
                      >
                        Send Message
                        <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
