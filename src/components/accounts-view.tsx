'use client';

import React, { useState } from 'react';
import { useFinancials, Account } from '@/context/financial-context';
import { 
  Wallet, 
  Building, 
  Smartphone, 
  CreditCard as CardIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  TrendingUp, 
  TrendingDown, 
  Clock, 
  PlusCircle, 
  Banknote
} from 'lucide-react';
import { motion } from 'framer-motion';

const ACCOUNT_ICONS: Record<string, any> = {
  'Cash Wallet': Wallet,
  'Bank Account': Building,
  'UPI': Smartphone,
  'Credit Card': CardIcon
};

const ACCOUNT_THEMES: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  'Cash Wallet': {
    bg: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/5',
    border: 'border-amber-250/20 dark:border-amber-500/10',
    accent: '#f59e0b',
    text: 'text-amber-600 dark:text-amber-400'
  },
  'Bank Account': {
    bg: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/5',
    border: 'border-emerald-250/20 dark:border-emerald-500/10',
    accent: '#10b981',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  'UPI': {
    bg: 'from-blue-500/10 to-indigo-500/5 dark:from-blue-500/15 dark:to-indigo-500/5',
    border: 'border-blue-250/20 dark:border-blue-500/10',
    accent: '#3b82f6',
    text: 'text-blue-600 dark:text-blue-400'
  },
  'Credit Card': {
    bg: 'from-rose-500/10 to-pink-500/5 dark:from-rose-500/15 dark:to-pink-500/5',
    border: 'border-rose-250/20 dark:border-rose-500/10',
    accent: '#f43f5e',
    text: 'text-rose-600 dark:text-rose-400'
  }
};

export default function AccountsView() {
  const { accounts, transactions, setIsTransferOpen, setIsExpenseOpen, formatCurrency } = useFinancials();
  const [selectedAccount, setSelectedAccount] = useState<string>('Bank Account');

  const activeAcc = accounts.find(a => a.name === selectedAccount) || accounts[0];

  // Filter transactions for selected account
  const accountLedger = transactions.filter(t => 
    t.account === selectedAccount || 
    (t.type === 'transfer' && (t.fromAccount === selectedAccount || t.toAccount === selectedAccount || t.description.toLowerCase().includes(selectedAccount.toLowerCase())))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">Accounts & Ledgers</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage cash balances, banks, UPI handles, and credit limits.</p>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {accounts.map((acc) => {
          const Icon = ACCOUNT_ICONS[acc.name] || Banknote;
          const theme = ACCOUNT_THEMES[acc.name] || {
            bg: 'from-slate-500/10 to-slate-500/5',
            border: 'border-slate-200/20',
            accent: '#64748b',
            text: 'text-slate-600'
          };

          const isSelected = selectedAccount === acc.name;
          const isNegative = acc.todayChange < 0;

          return (
            <motion.div
              key={acc.id}
              onClick={() => setSelectedAccount(acc.name)}
              whileHover={{ y: -4 }}
              className={`glass-panel p-5 cursor-pointer bg-gradient-to-br transition-all relative overflow-hidden ${theme.bg} ${
                isSelected 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-transparent shadow-xl' 
                  : 'hover:shadow-md'
              }`}
            >
              {/* Card Chip decoration */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/5 blur-xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-white/40 dark:bg-slate-900/40 ${theme.text}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-60">
                  {acc.type}
                </span>
              </div>

              <div className="mt-6 space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{acc.name}</p>
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  {formatCurrency(acc.balance)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-250/20 dark:border-white/5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-1">
                  {isNegative ? (
                    <TrendingDown size={12} className="text-rose-500" />
                  ) : (
                    <TrendingUp size={12} className="text-emerald-500" />
                  )}
                  <span className={isNegative ? 'text-rose-500' : 'text-emerald-500'}>
                    {isNegative ? '' : '+'}{formatCurrency(acc.todayChange)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px]">
                  <Clock size={10} />
                  <span>Updated today</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Account Ledger Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger Details & Quick Config */}
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Account Details</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Settings and actions for {activeAcc.name}</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-100/40 dark:bg-slate-900/20 rounded-xl space-y-3 border border-slate-200/30 dark:border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Cardholder Name:</span>
                <span className="font-bold">John Doe</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Active
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Last Synced:</span>
                <span className="font-medium text-slate-600 dark:text-slate-350">{activeAcc.lastUpdated}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsTransferOpen(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight size={14} />
                <span>Transfer Funds</span>
              </button>
              <button 
                onClick={() => setIsExpenseOpen(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle size={14} />
                <span>Log Direct Transaction</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Transaction History</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct entries related to {activeAcc.name}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/35 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-350">
                {accountLedger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-550">
                      No records found for this account.
                    </td>
                  </tr>
                ) : (
                  accountLedger.map((tx) => {
                    const isDebit = tx.type === 'expense' || (tx.type === 'transfer' && (tx.fromAccount === activeAcc.name || tx.account === activeAcc.name));
                    const isCredit = tx.type === 'income' || (tx.type === 'transfer' && !isDebit);
                    
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-3 px-3 text-slate-400">{tx.date}</td>
                        <td className="py-3 px-3 font-semibold flex items-center gap-1.5">
                          {tx.type === 'transfer' ? (
                            <ArrowLeftRight size={12} className="text-blue-500" />
                          ) : isDebit ? (
                            <ArrowDownLeft size={12} className="text-rose-500" />
                          ) : (
                            <ArrowUpRight size={12} className="text-emerald-500" />
                          )}
                          <span>{tx.description}</span>
                        </td>
                        <td className="py-3 px-3">{tx.category}</td>
                        <td className={`py-3 px-3 font-bold text-sm ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                            tx.type === 'expense' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455' :
                            'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
