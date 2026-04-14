import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 md:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">Dashboard</p>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 mt-1">Career Intelligence Hub</h1>
            <p className="mt-3 text-zinc-600 max-w-2xl">
              Track analysis history, monitor readiness trends, and prioritize the highest-impact gap closures.
            </p>
          </div>
          <Link to="/" className="px-5 py-3 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors">
            Run New Analysis
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Latest Readiness', value: '50%', note: 'From your most recent run' },
            { label: 'Critical Gaps', value: '2', note: 'Need immediate action' },
            { label: 'Bridge Steps Done', value: '0/2', note: 'Start with SQL fundamentals' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 font-semibold">{item.label}</p>
              <p className="text-3xl font-bold text-zinc-900 mt-3">{item.value}</p>
              <p className="text-sm text-zinc-600 mt-1">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-zinc-900">Next Focus Sprint</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="font-semibold text-zinc-900">1. SQL Skill Upgrade</p>
              <p className="mt-1 text-zinc-600">Complete one fundamentals module and solve five practice queries.</p>
            </div>
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="font-semibold text-zinc-900">2. ATS Familiarity</p>
              <p className="mt-1 text-zinc-600">Watch a Workday or BambooHR tutorial and document key reporting workflows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
