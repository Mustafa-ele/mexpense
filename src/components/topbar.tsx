'use client';

import React, { useState } from 'react';
import { useFinancials } from '@/context/financial-context';
import { 
  Search, 
  Plus, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  LogOut, 
  User, 
  CreditCard, 
  Settings as SettingsIcon,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Topbar() {
  const { 
    darkMode, 
    setDarkMode, 
    notifications, 
    markNotificationRead, 
    clearNotifications,
    setIsExpenseOpen,
    setIsIncomeOpen
  } = useFinancials();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('June 2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => markNotificationRead(n.id));
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/40 dark:border-white/5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      {/* Search Input Box */}
      <div className="hidden sm:flex items-center gap-2.5 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-xl px-3.5 py-2 w-72 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
        <Search size={16} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search transactions, accounts..." 
          className="bg-transparent border-none text-xs outline-none w-full text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
        <kbd className="hidden lg:inline-block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 shadow-sm">
          ⌘K
        </kbd>
      </div>
      
      {/* Spacer for mobile view */}
      <div className="sm:hidden w-10"></div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Month Filter Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
          >
            <span>{currentMonth}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showMonthDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showMonthDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMonthDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-xl shadow-xl py-1 z-20"
                >
                  {['June 2026', 'May 2026', 'April 2026', 'March 2026'].map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setCurrentMonth(month);
                        setShowMonthDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {month}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Add Income Button */}
        <button 
          onClick={() => setIsIncomeOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add Income</span>
        </button>

        {/* Add Expense Button */}
        <button 
          onClick={() => setIsExpenseOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add Expense</span>
        </button>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-white/5 transition-all"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/40 dark:border-white/5 transition-all relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-20"
                >
                  <div className="px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Notifications</span>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead} 
                          title="Mark all as read"
                          className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <CheckCheck size={14} />
                        </button>
                      )}
                      <button 
                        onClick={clearNotifications}
                        title="Clear all"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-4 border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer flex gap-3 ${
                            !notif.read ? 'bg-blue-50/15 dark:bg-blue-950/5' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            notif.type === 'success' ? 'bg-emerald-500' :
                            notif.type === 'alert' ? 'bg-rose-500' : 'bg-blue-500'
                          }`} />
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{notif.message}</p>
                            <span className="text-[9px] text-slate-400">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JD
            </div>
            <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-300">John Doe</span>
            <ChevronDown size={14} className="hidden lg:block text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 rounded-xl shadow-xl py-1 z-20 text-slate-700 dark:text-slate-300"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">John Doe</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">john.doe@mexpense.com</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-2">
                    <User size={14} />
                    <span>My Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-2">
                    <CreditCard size={14} />
                    <span>Billing & Plans</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-2">
                    <SettingsIcon size={14} />
                    <span>Account Settings</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
