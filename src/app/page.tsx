'use client';

import React from 'react';
import { useFinancials } from '@/context/financial-context';
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import DashboardView from '@/components/dashboard-view';
import TransactionsView from '@/components/transactions-view';
import CategoriesView from '@/components/categories-view';
import AccountsView from '@/components/accounts-view';
import FamilyView from '@/components/family-view';
import LoansView from '@/components/loans-view';
import ReportsView from '@/components/reports-view';
import NotificationsView from '@/components/notifications-view';
import SettingsView from '@/components/settings-view';
import QuickActionModals from '@/components/quick-action-modals';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { activeTab } = useFinancials();

  // Map tabs to views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Transactions':
        return <TransactionsView />;
      case 'Categories':
        return <CategoriesView />;
      case 'Accounts':
        return <AccountsView />;
      case 'Family':
        return <FamilyView />;
      case 'Loans':
        return <LoansView />;
      case 'Reports':
        return <ReportsView />;
      case 'Notifications':
        return <NotificationsView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-800 dark:text-slate-200">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Topbar Header */}
        <Topbar />

        {/* Dynamic Page Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Reusable Modals */}
      <QuickActionModals />
    </div>
  );
}
