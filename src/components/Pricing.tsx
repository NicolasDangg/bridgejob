import React from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">Pricing</p>
          <h1 className="text-4xl font-serif font-bold text-zinc-900 mt-1">Simple, Transparent Plans</h1>
          <p className="mt-3 text-zinc-600 max-w-2xl">Start free, then upgrade when you want saved history, advanced prompts, and progress tracking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Starter',
              price: '$0',
              points: ['Unlimited sample runs', 'Instant fit summary', 'Gap + bridge steps output'],
            },
            {
              name: 'Growth',
              price: '$12/mo',
              points: ['Saved analyses', 'Progress dashboard', 'Priority gap reminders'],
            },
            {
              name: 'Pro',
              price: '$29/mo',
              points: ['Team workspaces', 'Export reports', 'Custom role scorecards'],
            },
          ].map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col">
              <p className="text-sm font-semibold text-zinc-900">{plan.name}</p>
              <p className="text-3xl font-bold text-zinc-900 mt-2">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600 flex-1">
                {plan.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
              <Link to="/signup" className="mt-5 inline-flex justify-center px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
