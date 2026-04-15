import React from 'react';
import { Link } from 'react-router-dom';

export default function Features() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">Features</p>
          <h1 className="text-4xl font-serif font-bold text-zinc-900 mt-1">From Job Post to Action Plan</h1>
          <p className="mt-3 text-zinc-600 max-w-2xl">BridgeJob converts raw job descriptions into concrete, skill-building next moves.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Readiness Score',
              copy: 'A clear percentage that tells you exactly how close you are to the role.',
            },
            {
              title: 'Gap Prioritization',
              copy: 'Critical vs. important gaps are separated so your effort is spent where it matters most.',
            },
            {
              title: 'Bridge Steps',
              copy: 'Concrete, sequence-based actions that move you from partial fit to strong fit.',
            },
            {
              title: 'Noise Filtering',
              copy: 'Highlights credentials that sound strong but do not materially improve match quality.',
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-zinc-900">{feature.title}</h2>
              <p className="mt-2 text-zinc-600 text-sm leading-relaxed">{feature.copy}</p>
            </div>
          ))}
        </div>

        <Link to="/" className="inline-flex px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
          Try the Analyzer
        </Link>
      </div>
    </div>
  );
}
