import React from 'react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-200 w-full max-w-md">
        <h1 className="text-2xl font-serif font-bold text-zinc-900 mb-6">Login</h1>
        <button className="w-full bg-zinc-900 text-white py-3 rounded-lg font-semibold">Sign In</button>
      </div>
    </div>
  );
}
