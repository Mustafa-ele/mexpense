'use client';

import React, { useState } from 'react';
import { useFinancials, Loan } from '@/context/financial-context';
import { 
  Handshake, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Wallet,
  Coins,
  ChevronDown,
  ChevronUp,
  History,
  X,
  Sparkles,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoansView() {
  const { 
    loans, 
    repayLoan, 
    deleteLoan, 
    triggerLoanReminder, 
    setIsLoanOpen, 
    setEditingLoan,
    accounts, 
    family,
    formatCurrency 
  } = useFinancials();
  const [filter, setFilter] = useState<'all' | 'given' | 'taken' | 'pending'>('all');

  // Expanded loan details state
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

  // Repayment Modal state
  const [activeRepayLoan, setActiveRepayLoan] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().split('T')[0]);
  const [repayAccount, setRepayAccount] = useState('Bank Account');
  const [repayNotes, setRepayNotes] = useState('');
  const [repayFamilyMember, setRepayFamilyMember] = useState('Self');

  // Calculations
  const calculateLoanStats = (loan: Loan) => {
    const paid = loan.installments.reduce((sum, inst) => sum + inst.amount, 0);
    const remaining = Math.max(0, loan.amount - paid);
    const progress = Math.min(100, (paid / loan.amount) * 100);
    return { paid, remaining, progress };
  };

  const totalGiven = loans
    .filter(l => l.type === 'given')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalTaken = loans
    .filter(l => l.type === 'taken')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCollection = loans
    .filter(l => l.type === 'given' && l.status === 'Pending')
    .reduce((acc, curr) => {
      const { remaining } = calculateLoanStats(curr);
      return acc + remaining;
    }, 0);

  const pendingPayment = loans
    .filter(l => l.type === 'taken' && l.status === 'Pending')
    .reduce((acc, curr) => {
      const { remaining } = calculateLoanStats(curr);
      return acc + remaining;
    }, 0);

  const filteredLoans = loans.filter(l => {
    if (filter === 'given') return l.type === 'given';
    if (filter === 'taken') return l.type === 'taken';
    if (filter === 'pending') return l.status === 'Pending';
    return true;
  });

  const handleOpenRepayModal = (loan: Loan) => {
    const { remaining } = calculateLoanStats(loan);
    setActiveRepayLoan(loan);
    setRepayAmount(remaining.toString());
    setRepayNotes('');
    setRepayDate(new Date().toISOString().split('T')[0]);
    setRepayFamilyMember('Self');
  };

  const handleRepaySubmit = () => {
    if (!activeRepayLoan) return;
    if (!repayAmount || isNaN(Number(repayAmount)) || Number(repayAmount) <= 0) {
      alert("Please enter a valid installment amount.");
      return;
    }

    const { remaining } = calculateLoanStats(activeRepayLoan);
    if (Number(repayAmount) > remaining) {
      alert(`Installment amount cannot exceed outstanding balance of ${formatCurrency(remaining)}.`);
      return;
    }

    repayLoan(activeRepayLoan.id, {
      amount: Number(repayAmount),
      date: repayDate,
      method: repayAccount,
      notes: repayNotes,
      familyMember: repayFamilyMember
    });

    // Close Modal
    setActiveRepayLoan(null);
    setRepayFamilyMember('Self');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Loan & Debt Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track funds lent to peers, installment records, collections schedule, and outstanding balances.</p>
        </div>
        <button 
          onClick={() => setIsLoanOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
        >
          <Plus size={14} />
          <span>Add Loan Record</span>
        </button>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Loan Given', amount: totalGiven, sub: 'Lent to friends & family', color: 'text-blue-600 dark:text-blue-400', icon: ArrowUpRight, bg: 'from-blue-500/5 to-transparent' },
          { title: 'Total Loan Taken', amount: totalTaken, sub: 'Borrowed from peers', color: 'text-purple-600 dark:text-purple-400', icon: ArrowDownLeft, bg: 'from-purple-500/5 to-transparent' },
          { title: 'Pending Collection', amount: pendingCollection, sub: 'Outstanding assets', color: 'text-emerald-600 dark:text-emerald-400', icon: Coins, bg: 'from-emerald-500/5 to-transparent' },
          { title: 'Pending Payment', amount: pendingPayment, sub: 'Outstanding liabilities', color: 'text-rose-600 dark:text-rose-455', icon: Wallet, bg: 'from-rose-500/5 to-transparent' }
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className={`glass-panel p-5 bg-gradient-to-tr ${c.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{c.title}</span>
                <div className={`p-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-900/40 ${c.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{formatCurrency(c.amount)}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table & Actions */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Loan Ledger</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Detailed list of debts, due dates, installment counts, and progress tracking</p>
          </div>

          <div className="flex rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 p-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {['all', 'given', 'taken', 'pending'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                  filter === t 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'hover:text-blue-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/35 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4">Person</th>
                <th className="py-3 px-4">Original</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/20 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-300">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 dark:text-slate-550">
                    No loan records found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const { paid, remaining, progress } = calculateLoanStats(loan);
                  const isOverdue = new Date(loan.dueDate) < new Date('2026-06-30') && loan.status === 'Pending';
                  const isExpanded = expandedLoanId === loan.id;

                  return (
                    <React.Fragment key={loan.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-3.5 px-4 text-center">
                          {loan.installments.length > 0 && (
                            <button 
                              onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold">{loan.person}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-500">{formatCurrency(loan.amount)}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-450">{formatCurrency(paid)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{formatCurrency(remaining)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {isOverdue && <Clock size={12} className="animate-pulse" />}
                            {new Date(loan.dueDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                            {isOverdue && <span className="text-[9px] uppercase font-extrabold px-1 py-0.2 bg-rose-50 dark:bg-rose-950/20 rounded">Overdue</span>}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            loan.type === 'given' 
                              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' 
                              : 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400'
                          }`}>
                            {loan.type === 'given' ? 'Lent' : 'Borrowed'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 min-w-[100px]">
                          <div className="space-y-1">
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[9px] text-slate-450 font-bold">{progress.toFixed(0)}% paid</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            loan.status === 'Completed' 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-1.5 items-center">
                            {loan.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => triggerLoanReminder(loan.id)}
                                  title="Send Settle Reminder"
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
                                >
                                  <BellRing size={13} />
                                </button>
                                <button
                                  onClick={() => handleOpenRepayModal(loan)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                                >
                                  <CheckCircle2 size={11} />
                                  <span>Installment</span>
                                </button>
                              </>
                            )}
                            {loan.status === 'Completed' && (
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 mr-1.5">Fully Settled</span>
                            )}
                            <button
                              onClick={() => {
                                setEditingLoan(loan);
                                setIsLoanOpen(true);
                              }}
                              title="Edit Loan Record"
                              className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 transition-all"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                const confirm = window.confirm(`Are you sure you want to delete this loan record for "${loan.person}"?`);
                                if (confirm) {
                                  deleteLoan(loan.id);
                                }
                              }}
                              title="Delete Loan Record"
                              className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Collapsible history section */}
                      <AnimatePresence>
                        {isExpanded && loan.installments.length > 0 && (
                          <tr>
                            <td colSpan={10} className="bg-slate-50/40 dark:bg-slate-900/20 py-4 px-6 border-b border-slate-250/20">
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                              >
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                  <History size={12} />
                                  <span>Installment Payment Logs</span>
                                </div>
                                <div className="overflow-x-auto w-full">
                                  <table className="w-full text-left border-collapse text-[11px] font-medium text-slate-600 dark:text-slate-350">
                                    <thead>
                                      <tr className="border-b border-slate-200/20 dark:border-white/5 text-[9px] text-slate-400 uppercase font-bold">
                                        <th className="py-1 px-2">Date</th>
                                        <th className="py-1 px-2">Paid Value</th>
                                        <th className="py-1 px-2">Account</th>
                                        <th className="py-1 px-2">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/10 dark:divide-white/5">
                                      {loan.installments.map((inst) => (
                                        <tr key={inst.id}>
                                          <td className="py-2 px-2 text-slate-450">{inst.date}</td>
                                          <td className="py-2 px-2 font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(inst.amount)}
                                          </td>
                                          <td className="py-2 px-2">{inst.method}</td>
                                          <td className="py-2 px-2 italic text-slate-500">{inst.notes || 'N/A'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Installment Repayment Dialog Overlay Modal */}
      <AnimatePresence>
        {activeRepayLoan && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="glass-panel w-full max-w-md bg-white dark:bg-slate-950 p-6 space-y-6 relative"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>Log Installment Repayment</span>
                </div>
                <button onClick={() => setActiveRepayLoan(null)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Installment Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="Enter payment amount..." 
                    value={repayAmount} 
                    onChange={(e) => setRepayAmount(e.target.value)} 
                    className="w-full glass-input"
                  />
                  <div className="flex justify-between text-[9px] text-slate-450 pt-1">
                    <span>Lending Partner: <span className="font-extrabold text-slate-600 dark:text-slate-350">{activeRepayLoan.person}</span></span>
                    <span>Remaining Balance: <span className="font-extrabold text-slate-600 dark:text-slate-350">{formatCurrency(calculateLoanStats(activeRepayLoan).remaining)}</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Payment Date</label>
                    <input 
                      type="date" 
                      value={repayDate} 
                      onChange={(e) => setRepayDate(e.target.value)} 
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Method/Account</label>
                    <select 
                      value={repayAccount} 
                      onChange={(e) => setRepayAccount(e.target.value)} 
                      className="w-full glass-input bg-transparent"
                    >
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Family Member Beneficiary (Paid By/To)</label>
                  <select 
                    value={repayFamilyMember} 
                    onChange={(e) => setRepayFamilyMember(e.target.value)} 
                    className="w-full glass-input bg-transparent"
                  >
                    <option value="Self">Self (General Household)</option>
                    {family.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Payment Memo / Notes</label>
                  <input 
                    type="text" 
                    placeholder="e.g. cash installment payment" 
                    value={repayNotes} 
                    onChange={(e) => setRepayNotes(e.target.value)} 
                    className="w-full glass-input"
                  />
                </div>

                <button 
                  onClick={handleRepaySubmit}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles size={14} />
                  <span>Register Installment Payment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
