'use client';

import React from 'react';
import { useFinancials } from '@/context/financial-context';
import { Bell, CheckCheck, Trash2, Calendar, AlertTriangle, BadgeAlert, CheckCircle, Info } from 'lucide-react';

export default function NotificationsView() {
  const { notifications, markNotificationRead, clearNotifications } = useFinancials();

  const handleMarkAllRead = () => {
    notifications.forEach(n => markNotificationRead(n.id));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Inbox & Notifications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit log of system actions, budget limits, peer reminders, and wage deposits.</p>
        </div>
        <div className="flex gap-2">
          {notifications.filter(n => !n.read).length > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
            >
              <CheckCheck size={14} />
              <span>Mark all as read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={clearNotifications}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs font-semibold transition-all"
            >
              <Trash2 size={14} />
              <span>Clear inbox</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications Ledger List */}
      <div className="glass-panel p-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto">
              <Bell size={20} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Your notifications inbox is completely empty.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/20 dark:divide-white/5">
            {notifications.map((notif) => {
              const Icon = notif.type === 'success' ? CheckCircle : 
                            notif.type === 'alert' ? BadgeAlert : Info;
              const iconColor = notif.type === 'success' ? 'text-emerald-500 bg-emerald-500/5' : 
                               notif.type === 'alert' ? 'text-rose-500 bg-rose-500/5' : 'text-blue-500 bg-blue-500/5';

              return (
                <div 
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`py-4 flex items-start gap-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer rounded-xl px-2 ${
                    !notif.read ? 'bg-blue-50/10 dark:bg-blue-950/5' : ''
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center gap-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-tight">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
