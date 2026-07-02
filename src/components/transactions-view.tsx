'use client';

import React, { useState } from 'react';
import { useFinancials, Transaction } from '@/context/financial-context';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Download, FileText, Edit2, Trash2 } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Salary': '#10b981',
  'Freeland Income': '#34d399',
  'Rent': '#f43f5e',
  'Shopping': '#8b5cf6',
  'Bills & Utilities': '#f59e0b',
  'Investments': '#3b82f6',
  'Food & Dining': '#e11d48',
  'Entertainment': '#a78bfa',
  'Education': '#ec4899',
  'Travel & Cab': '#06b6d4',
  'Groceries': '#14b8a6',
  'Others': '#64748b'
};

export default function TransactionsView() {
  const { 
    transactions, 
    setIsExpenseOpen, 
    deleteTransaction, 
    setEditingTransaction, 
    formatCurrency,
    currentMonth
  } = useFinancials();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to get YYYY-MM prefix from "Month YYYY" string
  const getMonthPrefix = (monthStr: string) => {
    try {
      const parts = monthStr.split(' ');
      if (parts.length === 2) {
        const monthName = parts[0];
        const year = parts[1];
        const date = new Date(Date.parse(`${monthName} 1, ${year}`));
        if (!isNaN(date.getTime())) {
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          return `${year}-${mm}`;
        }
      }
    } catch (e) {}
    return new Date().toISOString().slice(0, 7);
  };

  // Filter
  const filtered = transactions.filter(t => {
    const matchesMonth = t.date.startsWith(getMonthPrefix(currentMonth));
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesMonth && matchesSearch && matchesType && matchesCategory;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Paginate
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // List unique categories for filter
  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Transaction Spreadsheet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit complete ledgers, search invoices, and filter payment channels.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              alert("Exporting current transaction history...");
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Main filter bar */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-2 w-full md:w-80">
            <Search size={14} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search description, recipient, wallet..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border-none text-xs outline-none w-full text-slate-800 dark:text-slate-250"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Type filters */}
            <div className="flex rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 p-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {['all', 'income', 'expense', 'transfer'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t as any); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                    typeFilter === t 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'hover:text-blue-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="glass-panel p-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/35 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-250 transition-colors">
                    Date <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4">Person</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-250 transition-colors">
                    Amount <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/20 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 dark:text-slate-550">
                    No transactions match your search query.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-3 px-4 text-slate-400 font-semibold">{tx.date}</td>
                    <td className="py-3 px-4 font-bold">{tx.person}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#64748b' }} />
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-xs text-blue-600 dark:text-blue-400">
                      {tx.type === 'transfer' ? (
                        <span className="flex items-center gap-1 font-bold">
                          {tx.fromAccount || tx.account}
                          <span className="text-slate-400 font-normal">➔</span>
                          {tx.toPerson || tx.toAccount}
                        </span>
                      ) : (
                        tx.account
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{tx.paymentMode}</td>
                    <td className="py-3 px-4 italic text-slate-450">{tx.description}</td>
                    <td className="py-3 px-4 font-bold text-sm">
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                        tx.type === 'expense' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455' :
                        'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        tx.status === 'Cleared' 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-blue-500 transition-all"
                          title="Edit Transaction"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this transaction record?")) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-rose-500 transition-all"
                          title="Delete Transaction"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/35 dark:border-white/5 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="text-slate-800 dark:text-white">{startIndex + 1}</span> to <span className="text-slate-800 dark:text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-slate-800 dark:text-white">{totalItems}</span> transactions
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
