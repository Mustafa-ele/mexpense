'use client';

import React, { useState, useEffect } from 'react';
import { useFinancials, Transaction } from '@/context/financial-context';
import { X, CircleDollarSign, Calendar, ArrowLeftRight, Users, UserPlus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function QuickActionModals() {
  const {
    isExpenseOpen, setIsExpenseOpen,
    isIncomeOpen, setIsIncomeOpen,
    isTransferOpen, setIsTransferOpen,
    isLoanOpen, setIsLoanOpen,
    isFamilyOpen, setIsFamilyOpen,
    editingTransaction, setEditingTransaction,
    addTransaction,
    editTransaction,
    addLoan,
    addFamilyMember,
    accounts,
    family,
    categories,
    loggedInUser
  } = useFinancials();

  // Common styles
  const overlayClass = "fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  const modalClass = "glass-panel w-full max-w-md bg-white dark:bg-slate-950 p-6 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto";

  // Form States
  // 1. Transaction Form (Expense / Income)
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txPerson, setTxPerson] = useState('Self');
  const [txCategory, setTxCategory] = useState('Food & Dining');
  const [txAccount, setTxAccount] = useState('Bank Account');
  const [txMode, setTxMode] = useState('Net Banking');
  const [txDesc, setTxDesc] = useState('');

  // 2. Transfer Form
  const [trAmount, setTrAmount] = useState('');
  const [trDate, setTrDate] = useState(new Date().toISOString().split('T')[0]);
  const [trSource, setTrSource] = useState('Bank Account');
  const [trDest, setTrDest] = useState('Cash Wallet');
  const [trDesc, setTrDesc] = useState('Inter-account transfer');
  const [transferToPerson, setTransferToPerson] = useState('Self');
  const [transferFromPerson, setTransferFromPerson] = useState('Self');
  const [trFromPocket, setTrFromPocket] = useState<'bank' | 'cash'>('bank');
  const [trToPocket, setTrToPocket] = useState<'bank' | 'cash'>('bank');

  // 3. Loan Form
  const [loanPerson, setLoanPerson] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanType, setLoanType] = useState<'given' | 'taken'>('given');

  // 4. Family Form
  const [famName, setFamName] = useState('');
  const [famAvatar, setFamAvatar] = useState('👩‍💼');
  const [famBankBalance, setFamBankBalance] = useState('');
  const [famCashBalance, setFamCashBalance] = useState('');
  const [famSummary, setFamSummary] = useState('');

  // Pre-fill fields on Edit Mode
  useEffect(() => {
    if (editingTransaction) {
      if (editingTransaction.type === 'expense') {
        setTxAmount(editingTransaction.amount.toString());
        setTxDate(editingTransaction.date);
        setTxPerson(editingTransaction.person);
        setTxCategory(editingTransaction.category);
        setTxAccount(editingTransaction.account);
        setTxMode(editingTransaction.paymentMode);
        setTxDesc(editingTransaction.description);
        setIsExpenseOpen(true);
      } else if (editingTransaction.type === 'income') {
        setTxAmount(editingTransaction.amount.toString());
        setTxDate(editingTransaction.date);
        setTxPerson(editingTransaction.person);
        setTxCategory(editingTransaction.category);
        setTxAccount(editingTransaction.account);
        setTxMode(editingTransaction.paymentMode);
        setTxDesc(editingTransaction.description);
        setIsIncomeOpen(true);
      } else if (editingTransaction.type === 'transfer') {
        setTrAmount(editingTransaction.amount.toString());
        setTrDate(editingTransaction.date);
        setTrSource(editingTransaction.fromAccount || editingTransaction.account);
        setTrDest(editingTransaction.toAccount || 'Cash Wallet');
        setTrDesc(editingTransaction.description);
        setTransferToPerson(editingTransaction.toPerson || 'Self');
        setTransferFromPerson(editingTransaction.person || 'Self');
        setTrFromPocket(editingTransaction.fromPocket || 'bank');
        setTrToPocket(editingTransaction.toPocket || 'bank');
        setIsTransferOpen(true);
      }
    }
  }, [editingTransaction, setIsExpenseOpen, setIsIncomeOpen, setIsTransferOpen]);

  const handleClose = (type: 'expense' | 'income' | 'transfer' | 'loan' | 'family') => {
    if (type === 'expense') setIsExpenseOpen(false);
    else if (type === 'income') setIsIncomeOpen(false);
    else if (type === 'transfer') setIsTransferOpen(false);
    else if (type === 'loan') setIsLoanOpen(false);
    else if (type === 'family') setIsFamilyOpen(false);
    
    setEditingTransaction(null);

    // Reset forms
    setTxAmount('');
    setTxDesc('');
    setTrAmount('');
    setTrFromPocket('bank');
    setTrToPocket('bank');
    setLoanPerson('');
    setLoanAmount('');
    setFamName('');
    setFamAvatar('👩‍💼');
    setFamBankBalance('');
    setFamCashBalance('');
    setFamSummary('');
  };

  // Trigger celebration on success
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleTxSubmit = (type: 'expense' | 'income') => {
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const payload = {
      date: txDate,
      person: txPerson,
      category: txCategory,
      account: txAccount,
      paymentMode: txMode,
      description: txDesc || (type === 'income' ? 'Income credit' : 'Expense debit'),
      amount: Number(txAmount),
      type
    };

    if (editingTransaction) {
      editTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    triggerCelebration();
    handleClose(type);
  };

  const handleTransferSubmit = () => {
    if (!trAmount || isNaN(Number(trAmount)) || Number(trAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    // Check if source and destination are the same person
    if (transferFromPerson !== 'Self' && transferFromPerson === transferToPerson) {
      alert("Sender and Recipient must be different.");
      return;
    }

    // If transferring to Self, source and destination accounts must be different
    if (transferToPerson === 'Self' && trSource === trDest) {
      alert("Source and Destination accounts must be different.");
      return;
    }

    const isInternal = transferFromPerson !== 'Self' && transferToPerson !== 'Self';

    const payload = {
      date: trDate,
      person: transferFromPerson,
      category: 'Transfer',
      account: isInternal ? 'Internal' : trSource,
      paymentMode: isInternal ? (trFromPocket === 'cash' ? 'Cash' : 'Net Banking') : (trSource === 'Cash Wallet' ? 'Cash' : 'Net Banking'),
      description: transferToPerson === 'Self' 
        ? `Transferred from ${transferFromPerson} to ${trDest} (${trSource}). ${trDesc}`
        : isInternal
        ? `Transferred allowance from ${transferFromPerson} (${trFromPocket === 'cash' ? 'Cash' : 'Bank'}) to ${transferToPerson} (${trToPocket === 'cash' ? 'Cash' : 'Bank'}). ${trDesc}`
        : `Transferred from ${transferFromPerson} (${trFromPocket === 'cash' ? 'Cash' : 'Bank'}) to ${transferToPerson} (${trToPocket === 'cash' ? 'Cash' : 'Bank'}) via ${trSource}. ${trDesc}`,
      amount: Number(trAmount),
      type: 'transfer' as const,
      fromAccount: isInternal ? 'Internal' : trSource,
      toAccount: transferToPerson === 'Self' ? trDest : undefined,
      toPerson: transferToPerson !== 'Self' ? transferToPerson : undefined,
      fromPocket: trFromPocket,
      toPocket: trToPocket
    };

    if (editingTransaction) {
      editTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    triggerCelebration();
    handleClose('transfer');
  };

  const handleLoanSubmit = () => {
    if (!loanPerson) {
      alert("Please enter peer name.");
      return;
    }
    if (!loanAmount || isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) {
      alert("Please enter a valid loan amount.");
      return;
    }
    if (!loanDueDate) {
      alert("Please select a due date.");
      return;
    }

    addLoan({
      person: loanPerson,
      amount: Number(loanAmount),
      type: loanType,
      date: loanDate,
      dueDate: loanDueDate
    });

    triggerCelebration();
    handleClose('loan');
  };

  const handleFamilySubmit = () => {
    if (!famName) {
      alert("Please enter member name.");
      return;
    }

    const bankVal = famBankBalance ? Number(famBankBalance) : 0;
    const cashVal = famCashBalance ? Number(famCashBalance) : 0;

    addFamilyMember({
      name: famName,
      avatar: famAvatar,
      bankBalance: bankVal,
      cashBalance: cashVal,
      balance: bankVal + cashVal,
      monthlySummary: famSummary || 'Family account holder'
    });

    triggerCelebration();
    handleClose('family');
  };

  return (
    <>
      <AnimatePresence>
        {/* 1. Add/Edit Expense Modal */}
        {isExpenseOpen && (
          <div className={overlayClass}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={modalClass}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                  <CircleDollarSign size={18} />
                  <span>{editingTransaction ? 'Edit Expense Record' : 'Log Expense Transaction'}</span>
                </div>
                <button onClick={() => handleClose('expense')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Amount</label>
                  <input type="number" placeholder="Enter purchase amount..." value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="w-full glass-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Transaction Date</label>
                    <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-full glass-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Payer Name</label>
                    <select value={txPerson} onChange={(e) => setTxPerson(e.target.value)} className="w-full glass-input bg-transparent">
                      <option value="Self">Self</option>
                      {family.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Category</label>
                    <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="w-full glass-input bg-transparent">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Billing Wallet/Account</label>
                    <select value={txAccount} onChange={(e) => setTxAccount(e.target.value)} className="w-full glass-input bg-transparent">
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Payment Mode</label>
                  <select value={txMode} onChange={(e) => setTxMode(e.target.value)} className="w-full glass-input bg-transparent">
                    {['Cash', 'Net Banking', 'UPI', 'Credit Card'].map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Memo / Description</label>
                  <input type="text" placeholder="e.g. lunch at olive garden" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} className="w-full glass-input" />
                </div>
                <button onClick={() => handleTxSubmit('expense')} className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-all">
                  {editingTransaction ? 'Save Changes' : 'Confirm Debit Entry'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Add/Edit Income Modal */}
        {isIncomeOpen && (
          <div className={overlayClass}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={modalClass}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                  <CircleDollarSign size={18} />
                  <span>{editingTransaction ? 'Edit Income Record' : 'Log Income Credit'}</span>
                </div>
                <button onClick={() => handleClose('income')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Amount</label>
                  <input type="number" placeholder="Enter income amount..." value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="w-full glass-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Date Received</label>
                    <input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-full glass-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Receiver Name</label>
                    <select value={txPerson} onChange={(e) => setTxPerson(e.target.value)} className="w-full glass-input bg-transparent">
                      <option value="Self">Self</option>
                      {family.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Category</label>
                    <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="w-full glass-input bg-transparent">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Destination Wallet/Account</label>
                    <select value={txAccount} onChange={(e) => setTxAccount(e.target.value)} className="w-full glass-input bg-transparent">
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Payment Mode</label>
                  <select value={txMode} onChange={(e) => setTxMode(e.target.value)} className="w-full glass-input bg-transparent">
                    {['Cash', 'Net Banking', 'UPI'].map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Description</label>
                  <input type="text" placeholder="e.g. paycheck or consulting fee" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} className="w-full glass-input" />
                </div>
                <button onClick={() => handleTxSubmit('income')} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all">
                  {editingTransaction ? 'Save Changes' : 'Confirm Credit Entry'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. Transfer Money Modal */}
        {isTransferOpen && (
          <div className={overlayClass}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={modalClass}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                  <ArrowLeftRight size={18} />
                  <span>{editingTransaction ? 'Edit Fund Transfer' : 'Transfer Funds'}</span>
                </div>
                <button onClick={() => handleClose('transfer')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs font-semibold">
                {/* Transfer sender/recipient selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">From (Sender)</label>
                    <select value={transferFromPerson} onChange={(e) => setTransferFromPerson(e.target.value)} className="w-full glass-input bg-transparent">
                      <option value="Self">Self</option>
                      {family.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">To (Recipient)</label>
                    <select value={transferToPerson} onChange={(e) => setTransferToPerson(e.target.value)} className="w-full glass-input bg-transparent">
                      <option value="Self">Self</option>
                      {family.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>

                  {/* Render From Pocket selector if sender is not admin */}
                  {!(transferFromPerson === 'Self' || (loggedInUser && transferFromPerson.toLowerCase() === loggedInUser.toLowerCase())) && (
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">From Sender Pocket</label>
                      <select value={trFromPocket} onChange={(e) => setTrFromPocket(e.target.value as 'bank' | 'cash')} className="w-full glass-input bg-transparent">
                        <option value="bank">Bank Pocket</option>
                        <option value="cash">Cash Pocket</option>
                      </select>
                    </div>
                  )}

                  {/* Render To Pocket selector if recipient is not admin */}
                  {!(transferToPerson === 'Self' || (loggedInUser && transferToPerson.toLowerCase() === loggedInUser.toLowerCase())) && (
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">To Recipient Pocket</label>
                      <select value={trToPocket} onChange={(e) => setTrToPocket(e.target.value as 'bank' | 'cash')} className="w-full glass-input bg-transparent">
                        <option value="bank">Bank Pocket</option>
                        <option value="cash">Cash Pocket</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Amount</label>
                  <input type="number" placeholder="Enter transfer amount..." value={trAmount} onChange={(e) => setTrAmount(e.target.value)} className="w-full glass-input" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(transferFromPerson === 'Self' || (loggedInUser && transferFromPerson.toLowerCase() === loggedInUser.toLowerCase()) || 
                    transferToPerson === 'Self' || (loggedInUser && transferToPerson.toLowerCase() === loggedInUser.toLowerCase())) ? (
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">From Source (Paying Account)</label>
                      <select value={trSource} onChange={(e) => setTrSource(e.target.value)} className="w-full glass-input bg-transparent">
                        {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">Funding Status</label>
                      <div className="w-full py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Internal Pocket Shift</span>
                      </div>
                    </div>
                  )}
                  
                  {transferToPerson === 'Self' && (
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">To Account (Destination)</label>
                      <select value={trDest} onChange={(e) => setTrDest(e.target.value)} className="w-full glass-input bg-transparent">
                        {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Transfer Date</label>
                  <input type="date" value={trDate} onChange={(e) => setTrDate(e.target.value)} className="w-full glass-input" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Description</label>
                  <input type="text" placeholder="e.g. allowance or cash load" value={trDesc} onChange={(e) => setTrDesc(e.target.value)} className="w-full glass-input" />
                </div>

                <button onClick={handleTransferSubmit} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">
                  {editingTransaction ? 'Save Changes' : 'Confirm Fund Transfer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. Add Loan Modal */}
        {isLoanOpen && (
          <div className={overlayClass}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={modalClass}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  <Users size={18} />
                  <span>Log Debt/Lending Entry</span>
                </div>
                <button onClick={() => handleClose('loan')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Loan Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setLoanType('given')} className={`py-2 rounded-lg border text-[11px] font-bold ${loanType === 'given' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-600' : 'border-slate-200 dark:border-white/5'}`}>
                      Given (Lent Out)
                    </button>
                    <button onClick={() => setLoanType('taken')} className={`py-2 rounded-lg border text-[11px] font-bold ${loanType === 'taken' ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500 text-purple-600' : 'border-slate-200 dark:border-white/5'}`}>
                      Taken (Borrowed)
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Contact Person Name</label>
                  <input type="text" placeholder="e.g. Johnathan Miller" value={loanPerson} onChange={(e) => setLoanPerson(e.target.value)} className="w-full glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Principal Amount</label>
                  <input type="number" placeholder="Enter loan value..." value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="w-full glass-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Lent/Borrowed Date</label>
                    <input type="date" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} className="w-full glass-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Settlement Deadline</label>
                    <input type="date" value={loanDueDate} onChange={(e) => setLoanDueDate(e.target.value)} className="w-full glass-input" />
                  </div>
                </div>
                <button onClick={handleLoanSubmit} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">
                  Confirm Loan Ledger
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 5. Add Family Entry Modal */}
        {isFamilyOpen && (
          <div className={overlayClass}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={modalClass}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                  <UserPlus size={18} />
                  <span>Register Household Member</span>
                </div>
                <button onClick={() => handleClose('family')} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Member Name</label>
                  <input type="text" placeholder="e.g. Alice Doe" value={famName} onChange={(e) => setFamName(e.target.value)} className="w-full glass-input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Opening Bank Balance</label>
                    <input type="number" placeholder="e.g. 3000" value={famBankBalance} onChange={(e) => setFamBankBalance(e.target.value)} className="w-full glass-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Opening Cash Balance</label>
                    <input type="number" placeholder="e.g. 2000" value={famCashBalance} onChange={(e) => setFamCashBalance(e.target.value)} className="w-full glass-input" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Select Avatar Emoji</label>
                  <div className="flex gap-3 justify-center bg-slate-100/40 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/30 dark:border-white/5">
                    {['👩‍💼', '👦', '👧', '👨‍💻', '👵', '👴', '👩‍⚕️'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setFamAvatar(emoji)}
                        className={`text-xl p-1 rounded-md transition-transform duration-100 ${famAvatar === emoji ? 'bg-blue-500 scale-125' : 'hover:scale-110'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Summary / Household Role</label>
                  <input type="text" placeholder="e.g. manages monthly utility billing contributions" value={famSummary} onChange={(e) => setFamSummary(e.target.value)} className="w-full glass-input" />
                </div>
                <button onClick={handleFamilySubmit} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1">
                  <Sparkles size={14} />
                  <span>Register Family Member</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
