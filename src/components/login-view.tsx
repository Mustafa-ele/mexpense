'use client';

import React, { useState } from 'react';
import { useFinancials } from '@/context/financial-context';
import { ShieldCheck, User, KeyRound, ArrowRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginView() {
  const { login } = useFinancials();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const success = login(username.trim(), password);
      setLoading(false);
      if (!success) {
        setError("Incorrect password. Use 'password123' to authenticate.");
      }
    }, 800); // 800ms login feel
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none dark:bg-blue-500/5" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none dark:bg-emerald-500/5" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Logo and Brand */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Wallet size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            mExpense <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent font-extrabold text-sm px-1.5 py-0.5 rounded-md bg-blue-50/15 border border-blue-500/10">Fintech</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Secure Personal & Family Expenditure Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          {error && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-250/30 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 rounded-xl text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Your Name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="Enter your name (e.g. Murtaza)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-450 pt-1">
              <span>Standard credential:</span>
              <span className="font-bold text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-500/10">password123</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Enter Dashboard</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>AES Reconciled Session</span>
        </div>
      </motion.div>
    </div>
  );
}
