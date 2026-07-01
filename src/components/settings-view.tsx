'use client';

import React, { useState, useEffect } from 'react';
import { useFinancials } from '@/context/financial-context';
import { 
  Settings, 
  Sun, 
  Moon, 
  DatabaseBackup, 
  Upload, 
  Bell, 
  Users, 
  Lock,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  const { 
    darkMode, 
    setDarkMode, 
    currency, 
    setCurrency, 
    language, 
    setLanguage,
    formatCurrency,
    resetData,
    loggedInUser
  } = useFinancials();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };
  const initials = getInitials(loggedInUser);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [pushReminders, setPushReminders] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Hydrate local preferences on Mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('mexpense_pref_email_alerts');
    if (storedEmail) setEmailAlerts(storedEmail === 'true');

    const storedWeekly = localStorage.getItem('mexpense_pref_weekly_digest');
    if (storedWeekly) setWeeklyDigest(storedWeekly === 'true');

    const storedPush = localStorage.getItem('mexpense_pref_push_reminders');
    if (storedPush) setPushReminders(storedPush === 'true');
  }, []);

  // Backup simulation
  const handleBackup = () => {
    const data: Record<string, string | null> = {};
    const keys = [
      'mexpense_dark_mode',
      'mexpense_currency',
      'mexpense_language',
      'mexpense_transactions',
      'mexpense_accounts',
      'mexpense_loans',
      'mexpense_family',
      'mexpense_categories',
      'mexpense_notifications',
      'mexpense_pref_email_alerts',
      'mexpense_pref_weekly_digest',
      'mexpense_pref_push_reminders'
    ];
    keys.forEach(k => {
      data[k] = localStorage.getItem(k);
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mexpense_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore simulation
  const handleRestore = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          Object.entries(data).forEach(([key, val]) => {
            if (val) localStorage.setItem(key, val as string);
          });
          alert("State successfully restored! Reloading page...");
          window.location.reload();
        } catch (err) {
          alert("Failed to parse backup JSON file. Ensure you uploaded a valid mExpense backup.");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  };

  const handleSavePreferences = () => {
    // Persist additional toggles
    localStorage.setItem('mexpense_pref_email_alerts', String(emailAlerts));
    localStorage.setItem('mexpense_pref_weekly_digest', String(weeklyDigest));
    localStorage.setItem('mexpense_pref_push_reminders', String(pushReminders));

    // Currency and Theme are already synced automatically in Context useEffects!
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure layout themes, currencies, export backups, and notification limits.</p>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Preference Settings */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">App Preferences</h3>
          </div>

          <div className="space-y-4">
            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appearance</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                    !darkMode 
                      ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-600 shadow-md' 
                      : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <Sun size={14} />
                  <span>Light Theme</span>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                    darkMode 
                      ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-400 shadow-md' 
                      : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <Moon size={14} />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="INR (₹)">Indian Rupee (INR - ₹)</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                </select>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language Selection</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleSavePreferences}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSaved ? <CheckCircle size={14} className="animate-pulse" /> : null}
              <span>{isSaved ? 'Preferences Saved!' : 'Save App Preferences'}</span>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-purple-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notification Alert Caps</h3>
          </div>

          <div className="space-y-5">
            {[
              { id: 'email', label: 'Email alerts on high expenses', desc: `Trigger email notice if single purchase exceeds ${formatCurrency(5000)}.`, state: emailAlerts, setState: setEmailAlerts },
              { id: 'weekly', label: 'Weekly spend analysis report digests', desc: 'Summary of family contribution sent on Sunday night.', state: weeklyDigest, setState: setWeeklyDigest },
              { id: 'push', label: 'Direct push reminders on loans', desc: 'Send popup alert when lending due-date approaches.', state: pushReminders, setState: setPushReminders }
            ].map(item => (
              <div key={item.id} className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450">{item.desc}</p>
                </div>
                {/* Custom toggle slider switch */}
                <button
                  onClick={() => item.setState(!item.state)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-all shrink-0 ${
                    item.state ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                    item.state ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Database Backup & Restore */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2">
            <DatabaseBackup size={18} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Data Backups</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              Export your entire account ledgers, family registers, loan histories, and preference states into a single JSON file. You can import this file at any time to restore your state.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBackup}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-355 transition-all"
              >
                <DatabaseBackup size={14} />
                <span>Backup JSON</span>
              </button>
              <button
                onClick={handleRestore}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-355 transition-all"
              >
                <Upload size={14} />
                <span>Restore State</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-slate-200/25 dark:border-white/5">
              <button
                onClick={() => {
                  const confirm = window.confirm("Are you sure you want to delete ALL transactions, active loans, family balances, and set all account balances to zero?");
                  if (confirm) {
                    resetData(true);
                    alert("All ledger balances have been reset to zero!");
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 transition-all"
              >
                <span>Reset to Zero Balance</span>
              </button>
              <button
                onClick={() => {
                  const confirm = window.confirm("This will restore the default demonstration mock transactions, accounts, and categories. Proceed?");
                  if (confirm) {
                    resetData(false);
                    alert("Demo mock data restored successfully!");
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 transition-all"
              >
                <span>Restore Demo Mock Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Management & Security */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white font-sans">{loggedInUser}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-450">Super Administrator</p>
            </div>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => alert("Password reset link sent to your administrator email!")}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <Lock size={13} />
              <span>Reset Administrator Password</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
