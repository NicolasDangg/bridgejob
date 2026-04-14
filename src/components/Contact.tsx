import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 md:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">Contact</p>
          <h1 className="text-4xl font-serif font-bold text-zinc-900 mt-1">We Build With User Feedback</h1>
          <p className="mt-3 text-zinc-600 max-w-2xl">Share your role, your pain points, and what the analyzer should do next. We read every message.</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-zinc-700">
              Name
              <input type="text" className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300" placeholder="Your name" />
            </label>
            <label className="text-sm text-zinc-700">
              Email
              <input type="email" className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300" placeholder="you@domain.com" />
            </label>
          </div>
          <label className="text-sm text-zinc-700 block">
            Message
            <textarea className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-zinc-900 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-300" placeholder="Tell us what would make BridgeJob more useful for you." />
          </label>
          <button className="px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
