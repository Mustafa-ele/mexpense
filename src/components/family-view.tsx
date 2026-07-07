'use client';

import React, { useState, useEffect } from 'react';
import { useFinancials, FamilyMember } from '@/context/financial-context';
import { 
  UserPlus, 
  PiggyBank, 
  TrendingUp, 
  Receipt,
  Edit2,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_OPTIONS = ['👩‍💼', '👦', '👧', '👨‍💻', '👵', '👴', '👩', '👨', '👶', '👩‍⚕️', '👨‍⚕️', '👸', '🤵'];

export default function FamilyView() {
  const { 
    family, 
    transactions, 
    addTransaction, 
    formatCurrency, 
    addFamilyMember, 
    editFamilyMember, 
    deleteFamilyMember 
  } = useFinancials();

  const [selectedMember, setSelectedMember] = useState<string>('');

  // Auto-select first member when family list is loaded
  useEffect(() => {
    if (family.length > 0 && (!selectedMember || !family.some(f => f.name === selectedMember))) {
      setSelectedMember(family[0].name);
    }
  }, [family, selectedMember]);

  // Local Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [famName, setFamName] = useState('');
  const [famAvatar, setFamAvatar] = useState('👩‍💼');
  const [famBankBalance, setFamBankBalance] = useState('');
  const [famCashBalance, setFamCashBalance] = useState('');
  const [famSummary, setFamSummary] = useState('');

  const activeMember = family.find(f => f.name === selectedMember) || family[0];

  // Filter transactions for this member
  const memberTransactions = transactions.filter(t => {
    if (!selectedMember) return false;
    const matchesPerson = t.person === selectedMember || 
      (selectedMember.toLowerCase() === 'murtaza' && t.person === 'Self');
    const matchesToPerson = t.type === 'transfer' && t.toPerson === selectedMember;
    return matchesPerson || matchesToPerson;
  });

  // Distribute Pocket Money simulation
  const handleDistributePocketMoney = (name: string, amount: number) => {
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      person: 'Self',
      category: 'Pocket Money',
      account: 'Bank Account',
      paymentMode: 'Net Banking',
      description: `Distributed pocket money to ${name}`,
      amount: amount,
      type: 'transfer',
      fromAccount: 'Bank Account',
      toPerson: name
    });
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setFamName('');
    setFamAvatar('👩‍💼');
    setFamBankBalance('');
    setFamCashBalance('');
    setFamSummary('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: FamilyMember) => {
    setModalMode('edit');
    setEditingId(member.id);
    setFamName(member.name);
    setFamAvatar(member.avatar);
    setFamBankBalance((member.bankBalance || 0).toString());
    setFamCashBalance((member.cashBalance || 0).toString());
    setFamSummary(member.monthlySummary);
    setIsModalOpen(true);
  };

  const handleDelete = (member: FamilyMember) => {
    const confirm = window.confirm(`Are you sure you want to delete family member "${member.name}"? All allowance records for them will be removed from totals.`);
    if (confirm) {
      deleteFamilyMember(member.id);
      // Auto-fallback selection
      const remaining = family.filter(f => f.id !== member.id);
      if (remaining.length > 0) {
        setSelectedMember(remaining[0].name);
      }
    }
  };

  const handleFormSubmit = () => {
    if (!famName.trim()) {
      alert("Please enter a name.");
      return;
    }

    const bankVal = famBankBalance ? Number(famBankBalance) : 0;
    const cashVal = famCashBalance ? Number(famCashBalance) : 0;

    const payload = {
      name: famName.trim(),
      avatar: famAvatar,
      bankBalance: bankVal,
      cashBalance: cashVal,
      balance: bankVal + cashVal,
      monthlySummary: famSummary || 'Family member profile'
    };

    if (modalMode === 'add') {
      addFamilyMember(payload);
    } else if (modalMode === 'edit' && editingId) {
      editFamilyMember(editingId, payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">Family Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Allocate allowance budgets, view expense summaries, and contributions of household members.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
        >
          <UserPlus size={14} />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Family Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {family.map((member) => {
          const isSelected = selectedMember === member.name;

          return (
            <motion.div
              key={member.id}
              onClick={() => setSelectedMember(member.name)}
              whileHover={{ y: -4 }}
              className={`glass-panel p-6 cursor-pointer bg-gradient-to-br transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-transparent shadow-xl' 
                  : 'hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 flex items-center justify-center text-2xl shadow-sm">
                      {member.avatar}
                    </div>
                    {/* Action buttons inside card */}
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(member);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        title="Edit family member details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        title="Delete family member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Allowance Balance</span>
                    <span className="text-base font-bold text-slate-800 dark:text-white font-sans">
                      {formatCurrency(member.balance)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{member.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">{member.monthlySummary}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/35 dark:border-white/5 grid grid-cols-2 gap-y-3 gap-x-2 text-[10px] font-semibold text-slate-500">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Bank Pocket</span>
                  <span className="text-blue-600 dark:text-blue-450 font-bold text-xs font-sans">
                    {formatCurrency(member.bankBalance || 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Cash Pocket</span>
                  <span className="text-amber-600 dark:text-amber-500 font-bold text-xs font-sans">
                    {formatCurrency(member.cashBalance || 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Total Expense</span>
                  <span className="text-slate-800 dark:text-slate-250 font-bold text-xs font-sans">
                    {formatCurrency(member.totalExpense)}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Contribution</span>
                  <span className="text-emerald-600 dark:text-emerald-450 font-bold text-xs font-sans">
                    {formatCurrency(member.totalContribution)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Member Transactions & Allowances */}
      {activeMember && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Member Actions */}
          <div className="glass-panel p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Member Controls</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Settings and fast allowance updates for {activeMember.name}</p>
            </div>

            <div className="space-y-4">
              {/* Allowance Quick buttons */}
              <div className="p-4 bg-slate-100/40 dark:bg-slate-900/20 rounded-xl space-y-4 border border-slate-200/30 dark:border-white/5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <PiggyBank size={12} className="text-blue-500" />
                  <span>Allocate Pocket Money</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 2000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleDistributePocketMoney(activeMember.name, amt)}
                      className="py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                    >
                      +{formatCurrency(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="space-y-3 px-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Family Role:</span>
                  <span className="font-semibold">Member</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Activity Level:</span>
                  <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-0.5">
                    <TrendingUp size={12} /> High
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Main Account Used:</span>
                  <span className="font-semibold">UPI / Cash</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Transactions */}
          <div className="glass-panel p-6 lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Household Purchases Log</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct card and cash transactions made by {activeMember.name}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/35 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Account</th>
                    <th className="py-2.5 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/20 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-350">
                  {memberTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-550">
                        No transactions registered for this member this month.
                      </td>
                    </tr>
                  ) : (
                    memberTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-3 px-3 text-slate-400">{tx.date}</td>
                        <td className="py-3 px-3 font-semibold flex items-center gap-1.5">
                          <Receipt size={12} className="text-slate-450" />
                          <span>{tx.description}</span>
                        </td>
                        <td className="py-3 px-3">{tx.category}</td>
                        <td className="py-3 px-3 font-medium">{tx.account}</td>
                        <td className={`py-3 px-3 font-bold text-sm font-sans ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-455'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Family Member local Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="glass-panel w-full max-w-md bg-white dark:bg-slate-950 p-6 space-y-6 relative"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                  <UserPlus size={18} />
                  <span>{modalMode === 'add' ? 'Add Family Member' : 'Edit Family Member Profile'}</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Member Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Emma Doe" 
                    value={famName} 
                    onChange={(e) => setFamName(e.target.value)} 
                    className="w-full glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Opening Bank Balance</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 3000" 
                      value={famBankBalance} 
                      onChange={(e) => setFamBankBalance(e.target.value)} 
                      className="w-full glass-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-450">Opening Cash Balance</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 2000" 
                      value={famCashBalance} 
                      onChange={(e) => setFamCashBalance(e.target.value)} 
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Select Avatar Emoji</label>
                  <div className="flex flex-wrap gap-2.5 bg-slate-100/40 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/30 dark:border-white/5 justify-center max-h-32 overflow-y-auto">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setFamAvatar(emoji)}
                        className={`text-xl p-1.5 rounded-lg transition-all ${famAvatar === emoji ? 'bg-blue-500/25 border-2 border-blue-500 scale-110' : 'hover:scale-105'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Summary / Household Role</label>
                  <input 
                    type="text" 
                    placeholder="e.g. active spender, covers grocery expenses" 
                    value={famSummary} 
                    onChange={(e) => setFamSummary(e.target.value)} 
                    className="w-full glass-input"
                  />
                </div>

                <button 
                  onClick={handleFormSubmit}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles size={14} />
                  <span>{modalMode === 'add' ? 'Register Family Member' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
