'use client';

import React, { useState, useEffect } from 'react';
import { useFinancials, Transaction } from '@/context/financial-context';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Building2, 
  Landmark, 
  CircleDollarSign, 
  PiggyBank, 
  Users2, 
  Handshake, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  LineChart, Line, 
  AreaChart, Area, 
  PieChart, Pie, Cell, 
  ResponsiveContainer, 
  Tooltip, XAxis, YAxis, 
  CartesianGrid 
} from 'recharts';
import { motion } from 'framer-motion';

// Mock mini sparklines values
const SPARKLINES_DATA: Record<string, number[]> = {
  total: [50, 60, 55, 70, 65, 80, 85, 75, 90],
  cash: [30, 40, 35, 38, 42, 35, 45, 40, 38],
  bank: [60, 70, 65, 80, 75, 90, 95, 90, 105],
  income: [10, 15, 30, 20, 45, 40, 50, 65, 85],
  expense: [40, 50, 45, 60, 55, 70, 65, 75, 60],
  savings: [20, 25, 30, 28, 40, 35, 45, 50, 55],
  family: [40, 42, 45, 41, 48, 50, 52, 49, 53],
  loans: [70, 65, 60, 55, 50, 45, 40, 30, 25],
};

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

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

// Component to draw mini SVGs for Sparklines
function Sparkline({ data, color = '#2563eb' }: { data: number[]; color?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const width = 100;
  const height = 30;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function DashboardView() {
  const { 
    transactions, 
    accounts, 
    loans, 
    family,
    categories,
    setIsExpenseOpen,
    setIsIncomeOpen,
    setIsTransferOpen,
    setIsLoanOpen,
    setIsFamilyOpen,
    deleteTransaction,
    setEditingTransaction,
    formatCurrency,
    loggedInUser
  } = useFinancials();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;

  // 1. Calculate Summary Cards totals
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const cashBalance = accounts.find(a => a.type === 'cash')?.balance || 0;
  
  // Bank + UPI
  const bankBalance = accounts.filter(a => a.type === 'bank' || a.type === 'upi').reduce((acc, curr) => acc + curr.balance, 0);
  
  // Calculate Income & Expenses for Current Month (Dynamic)
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g., "2026-07"
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const savings = monthlyIncome - monthlyExpense;

  const familyBalance = family.reduce((acc, curr) => acc + curr.balance, 0);
  const activeLoansCount = loans.filter(l => l.status === 'Pending').length;

  const summaryCards = [
    { title: 'Total Balance', amount: totalBalance, growth: '+4.2%', icon: CircleDollarSign, color: '#3b82f6', data: SPARKLINES_DATA.total },
    { title: 'Cash Balance', amount: cashBalance, growth: '-2.1%', icon: Wallet, color: '#f59e0b', data: SPARKLINES_DATA.cash },
    { title: 'Bank Balance', amount: bankBalance, growth: '+5.4%', icon: Landmark, color: '#10b981', data: SPARKLINES_DATA.bank },
    { title: 'Monthly Income', amount: monthlyIncome, growth: '+12.3%', icon: TrendingUp, color: '#10b981', data: SPARKLINES_DATA.income },
    { title: 'Monthly Expense', amount: monthlyExpense, growth: '-8.5%', icon: TrendingDown, color: '#ef4444', data: SPARKLINES_DATA.expense },
    { title: 'Savings', amount: savings, growth: '+15.2%', icon: PiggyBank, color: '#10b981', data: SPARKLINES_DATA.savings },
    { title: 'Family Balance', amount: familyBalance, growth: '+0.8%', icon: Users2, color: '#8b5cf6', data: SPARKLINES_DATA.family },
    { title: 'Active Loans', amount: activeLoansCount, growth: '-1', icon: Handshake, color: '#ec4899', isNumeric: true, data: SPARKLINES_DATA.loans },
  ];

  // 2. Charts Data Processing
  // Line Chart: Income vs Expense by Date (Dynamic last 7 days)
  const dateWiseMap: Record<string, { date: string; income: number; expense: number }> = {};
  
  const last7DaysList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (6 - i));
    return d;
  });

  const last7Days = last7DaysList.map(d => d.toISOString().split('T')[0]);
  
  last7Days.forEach(d => {
    const dateObj = new Date(d);
    const dayLabel = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    dateWiseMap[d] = { date: dayLabel, income: 0, expense: 0 };
  });

  transactions.forEach(t => {
    if (dateWiseMap[t.date]) {
      if (t.type === 'income') dateWiseMap[t.date].income += t.amount;
      else if (t.type === 'expense') dateWiseMap[t.date].expense += t.amount;
    }
  });

  const lineChartData = Object.values(dateWiseMap);

  // Donut Chart: Expense by Category
  const categoryMap: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const donutChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#64748b'
  }));

  // Daily Spending Area Chart: Last 10 transactions (Dynamic Months)
  const areaChartData = transactions
    .filter(t => t.type === 'expense')
    .slice(0, 10)
    .reverse()
    .map(t => {
      const dateObj = new Date(t.date);
      const dayLabel = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return {
        name: dayLabel,
        amount: t.amount
      };
    });

  // Account Distribution Pie Chart
  const pieChartData = accounts.map((acc, index) => ({
    name: acc.name,
    value: Math.abs(acc.balance), // Absolute value for distribution
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  // 3. Recent Transactions processing (Search, Sort, Filter, Paginate)
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.account.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Sort
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Pagination
  const totalItems = sortedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600/10 via-emerald-500/5 to-transparent p-6 rounded-2xl border border-blue-500/10 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Welcome back, {loggedInUser}!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Here is a summary of your personal and family financial metrics for this month.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-500/10 hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            <span>New Expense</span>
          </button>
          <button 
            onClick={() => setIsIncomeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            <span>New Income</span>
          </button>
        </div>
      </div>

      {/* 8 Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          const isNegative = card.growth.startsWith('-');
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300">
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    card.isNumeric ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
                    isNegative 
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455' 
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455'
                  }`}>
                    {card.isNumeric ? `Pending: ${card.growth}` : card.growth}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                  <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                    {card.isNumeric ? card.amount : formatCurrency(card.amount)}
                  </p>
                </div>
                <div className="opacity-80 pb-1">
                  <Sparkline data={card.data} color={card.color} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Monthly Income vs Expense</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Comparing income and expense flows over the last 7 days</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Expense
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-panel p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Expense by Category</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Breakdown of current monthly expenses</p>
          </div>
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Spent']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-550">Total Spent</span>
              <span className="text-lg font-extrabold text-slate-800 dark:text-white">{formatCurrency(monthlyExpense)}</span>
            </div>
          </div>
          {/* Custom legends */}
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 justify-center max-h-20 overflow-y-auto pr-1">
            {donutChartData.slice(0, 5).map((item) => (
              <span key={item.name} className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending Trend (Area Chart) */}
        <div className="glass-panel p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Spending Trend</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Recent expense magnitude over dates</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Balance Distribution (Pie Chart) */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Account Balance Distribution</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Total assets split across different cards & wallets</p>
            </div>
            <div className="flex flex-wrap gap-3 max-w-sm justify-end text-[10px] font-semibold">
              {pieChartData.map((item) => (
                <span key={item.name} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  {item.name} ({formatCurrency(item.value)})
                </span>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="h-full w-2/3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Balance']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Component */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Comprehensive list of cashflows, budgets, and card entries</p>
          </div>
          
          {/* Table Utilities */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 rounded-xl px-3 py-1.5 w-60">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search description..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-xs outline-none w-full text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 p-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {(['all', 'income', 'expense', 'transfer'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setTypeFilter(type); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                    typeFilter === type 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'hover:text-blue-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/35 dark:border-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-200/20 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-300">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 dark:text-slate-550">
                    No transactions found matches your criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{tx.person}</td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#64748b' }} />
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-xs text-blue-600 dark:text-blue-400">
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
                    <td className="py-3.5 px-4">{tx.paymentMode}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 italic font-medium">{tx.description}</td>
                    <td className="py-3.5 px-4 font-bold text-sm">
                      {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                        tx.type === 'expense' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' :
                        'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        tx.status === 'Cleared' 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="p-1 rounded hover:bg-slate-100/50 dark:hover:bg-slate-900 text-blue-500 transition-all"
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
                          className="p-1 rounded hover:bg-slate-100/50 dark:hover:bg-slate-900 text-rose-500 transition-all"
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

        {/* Table Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/35 dark:border-white/5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              Showing <span className="text-slate-800 dark:text-white">{startIndex + 1}</span> to <span className="text-slate-800 dark:text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-slate-800 dark:text-white">{totalItems}</span> transactions
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons Quick Actions */}
      <div className="fixed bottom-6 right-6 z-30 group flex flex-col-reverse items-end gap-3.5">
        <button 
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-pointer group-hover:scale-105 active:scale-95 transition-all duration-200"
          title="Quick Actions"
        >
          <Plus size={24} className="group-hover:rotate-45 transition-transform duration-300" strokeWidth={2.5} />
        </button>

        {/* Hover drawer options for Quick Actions */}
        <div className="hidden group-hover:flex flex-col gap-2 items-end transition-all duration-300 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-bottom">
          <button 
            onClick={() => setIsFamilyOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-250/50 dark:border-white/10 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span>+ Add Family Entry</span>
          </button>
          <button 
            onClick={() => setIsLoanOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-250/50 dark:border-white/10 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span>+ Add Loan Entry</span>
          </button>
          <button 
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-250/50 dark:border-white/10 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span>+ Transfer Money</span>
          </button>
          <button 
            onClick={() => setIsIncomeOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <span>+ Add Income</span>
          </button>
          <button 
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
}
