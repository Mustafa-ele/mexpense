'use client';

import React, { useState } from 'react';
import { useFinancials } from '@/context/financial-context';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Tags, 
  Wallet, 
  Users, 
  Handshake, 
  BarChart3, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Transactions', icon: ReceiptText },
  { name: 'Categories', icon: Tags },
  { name: 'Accounts', icon: Wallet },
  { name: 'Family', icon: Users },
  { name: 'Loans', icon: Handshake },
  { name: 'Reports', icon: BarChart3 },
  { name: 'Notifications', icon: Bell },
  { name: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, notifications } = useFinancials();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (tabName: string) => {
    setActiveTab(tabName);
    setIsMobileOpen(false); // Close mobile drawer when link clicked
  };

  const sidebarContent = (mobile = false) => {
    const collapsed = !mobile && isCollapsed;
    
    return (
      <div className="flex flex-col h-full py-6 px-4">
        {/* Brand Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-8 px-2`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <span className="font-extrabold text-lg">m</span>
            </div>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 font-sans"
              >
                mExpense
              </motion.span>
            )}
          </div>

          {/* Collapse Button (Desktop Only) */}
          {!mobile && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 transition-all"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            const isBell = item.name === 'Notifications';

            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 relative group ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-600 dark:border-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/30'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {/* Badge for Notifications */}
                  {isBell && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse border border-white dark:border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Menu label */}
                {(!collapsed || mobile) && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 text-left"
                  >
                    {item.name}
                  </motion.span>
                )}

                {/* Tooltip for collapsed desktop menu */}
                {collapsed && (
                  <div className="absolute left-16 hidden group-hover:block bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap z-50 shadow-lg border border-slate-800">
                    {item.name}
                    {isBell && unreadCount > 0 && ` (${unreadCount} unread)`}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Premium Upgrade Card */}
        {!collapsed && (
          <div className="mt-auto glass-panel p-4 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 dark:from-blue-950/10 dark:via-slate-950/40 dark:to-emerald-950/5 border-blue-100/40 dark:border-blue-900/20">
            <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles size={14} />
              <span>mExpense Pro</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Unlock family sync, advanced PDF reports and automated bank feeds.
            </p>
            <button className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Trigger (Sticky Bottom/Top Bar Toggle) */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-md text-slate-700 dark:text-slate-300"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar (Sticky, Left) */}
      <aside className={`hidden md:block sticky top-0 h-screen border-r border-slate-200/40 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop and panel */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 z-50 md:hidden"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              >
                <X size={18} />
              </button>
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
