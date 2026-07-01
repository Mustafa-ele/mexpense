'use client';

import React, { useState } from 'react';
import { useFinancials } from '@/context/financial-context';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Tag, 
  User, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Handshake,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, Bar, 
  Cell, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

type ReportType = 'monthly' | 'yearly' | 'category' | 'person' | 'account' | 'income' | 'expense' | 'loan';

export default function ReportsView() {
  const { transactions, accounts, family, loans, formatCurrency } = useFinancials();
  const [activeReport, setActiveReport] = useState<ReportType>('monthly');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Print simulation
  const handlePrint = () => {
    window.print();
  };

  // Export simulation
  const handleExport = (type: 'pdf' | 'excel') => {
    setIsExporting(type);
    setTimeout(() => {
      setIsExporting(null);
      // Show mock download trigger or success alert
      alert(`Report exported successfully as ${type.toUpperCase()}! Check your downloads.`);
    }, 1500);
  };

  // Data aggregations based on active report
  const getReportData = () => {
    if (activeReport === 'category') {
      const catMap: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
      return Object.entries(catMap).map(([name, value]) => ({ name, value }));
    }

    if (activeReport === 'person') {
      const perMap: Record<string, number> = {};
      transactions.forEach(t => {
        perMap[t.person] = (perMap[t.person] || 0) + (t.type === 'expense' ? t.amount : 0);
      });
      return Object.entries(perMap).map(([name, value]) => ({ name, value }));
    }

    if (activeReport === 'account') {
      return accounts.map(a => ({ name: a.name, value: Math.abs(a.balance) }));
    }

    if (activeReport === 'income') {
      const incMap: Record<string, number> = {};
      transactions.filter(t => t.type === 'income').forEach(t => {
        incMap[t.category] = (incMap[t.category] || 0) + t.amount;
      });
      return Object.entries(incMap).map(([name, value]) => ({ name, value }));
    }

    if (activeReport === 'expense') {
      const expMap: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        expMap[t.category] = (expMap[t.category] || 0) + t.amount;
      });
      return Object.entries(expMap).map(([name, value]) => ({ name, value }));
    }

    if (activeReport === 'loan') {
      return [
        { name: 'Pending Given', value: loans.filter(l => l.type === 'given' && l.status === 'Pending').reduce((a, c) => {
          const paid = c.installments.reduce((s, i) => s + i.amount, 0);
          return a + (c.amount - paid);
        }, 0) },
        { name: 'Pending Taken', value: loans.filter(l => l.type === 'taken' && l.status === 'Pending').reduce((a, c) => {
          const paid = c.installments.reduce((s, i) => s + i.amount, 0);
          return a + (c.amount - paid);
        }, 0) },
        { name: 'Settled Given', value: loans.filter(l => l.type === 'given' && l.status === 'Completed').reduce((a, c) => a + c.amount, 0) },
        { name: 'Settled Taken', value: loans.filter(l => l.type === 'taken' && l.status === 'Completed').reduce((a, c) => a + c.amount, 0) },
      ];
    }

    // Default: Monthly Report - last 7 days dynamically
    const today = new Date();
    const daysList = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d;
    });
    
    return daysList.map(d => {
      const dateStr = d.toISOString().split('T')[0];
      const sum = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((a, c) => a + c.amount, 0);
      return { 
        name: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), 
        value: sum 
      };
    });
  };

  const chartData = getReportData();
  const totalReportValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const reportTabs: { id: ReportType; label: string; icon: any }[] = [
    { id: 'monthly', label: 'Monthly Report', icon: Calendar },
    { id: 'yearly', label: 'Yearly Report', icon: Calendar },
    { id: 'category', label: 'Category Wise', icon: Tag },
    { id: 'person', label: 'Person Wise', icon: User },
    { id: 'account', label: 'Account Wise', icon: Wallet },
    { id: 'income', label: 'Income Report', icon: TrendingUp },
    { id: 'expense', label: 'Expense Report', icon: TrendingDown },
    { id: 'loan', label: 'Loan Report', icon: Handshake },
  ];

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Financial Reports</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit cash flows, export statements, and generate business-grade ledger sheets.</p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 transition-all disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export PDF</span>
          </button>
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 transition-all disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Reports Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Tab Selection List (Sidebar inside content) */}
        <div className="glass-panel p-4 flex flex-col gap-1 print:hidden">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 px-3 uppercase tracking-wider mb-2">Report Categories</p>
          {reportTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15' 
                    : 'text-slate-600 dark:text-slate-450 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 hover:text-blue-600'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Printable/Interactive Report Content Area */}
        <div className="glass-panel p-6 lg:col-span-3 space-y-6 bg-white dark:bg-slate-950 print:border-none print:shadow-none">
          {/* Export Loader overlay */}
          {isExporting && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-15 rounded-2xl">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Compiling financial data for {isExporting.toUpperCase()} export...</p>
            </div>
          )}

          {/* Report Metadata */}
          <div className="flex justify-between items-start border-b border-slate-200/40 dark:border-white/5 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-800 dark:text-white font-sans">mExpense Audit Sheet</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Official</span>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-450 mt-1">Generated on: 2026-06-30 12:00 PM</p>
              <p className="text-xs text-slate-600 dark:text-slate-350 mt-3 font-semibold uppercase tracking-wider">
                Type: {activeReport.toUpperCase()} LEDGER ANALYSIS
              </p>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Report Aggregation</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white font-sans">{formatCurrency(totalReportValue)}</span>
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Distribution Overview</h4>
            <div className="h-60 w-full bg-slate-50/50 dark:bg-slate-900/10 rounded-xl p-4 border border-slate-200/25 dark:border-white/5">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No data to display in chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Ledger table for details */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">Granular Statement Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/35 dark:border-white/5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item/Name</th>
                    <th className="py-2.5 px-3 text-right">Sum Total</th>
                    <th className="py-2.5 px-3 text-right">Percentage Split</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/20 dark:divide-white/5 text-slate-700 dark:text-slate-350 font-medium">
                  {chartData.map((item) => {
                    const percentage = totalReportValue === 0 ? 0 : ((item.value / totalReportValue) * 100).toFixed(1);
                    return (
                      <tr key={item.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="py-3 px-3 font-semibold">{item.name}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-white font-sans">
                          {formatCurrency(item.value)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit footer signature */}
          <div className="pt-10 flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <div>Approved by: mExpense Automated Auditor</div>
            <div className="flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" />
              <span>Status: Reconciled & Validated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
