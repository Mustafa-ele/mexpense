'use client';

import React, { useState } from 'react';
import { useFinancials, Category } from '@/context/financial-context';
import { Tag, Sparkles, AlertTriangle, PenSquare, Trash2, Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLOR_OPTIONS = [
  { name: 'Red', class: 'bg-rose-500 text-rose-500' },
  { name: 'Green', class: 'bg-emerald-500 text-emerald-500' },
  { name: 'Purple', class: 'bg-purple-500 text-purple-500' },
  { name: 'Yellow', class: 'bg-amber-500 text-amber-500' },
  { name: 'Blue', class: 'bg-blue-500 text-blue-500' },
  { name: 'Indigo', class: 'bg-indigo-500 text-indigo-500' },
  { name: 'Pink', class: 'bg-pink-500 text-pink-500' },
  { name: 'Cyan', class: 'bg-cyan-500 text-cyan-500' },
  { name: 'Teal', class: 'bg-teal-500 text-teal-500' },
  { name: 'Gray', class: 'bg-slate-500 text-slate-500' },
];

const EMOJI_OPTIONS = ['🍔', '🛒', '🛍️', '⚡', '🏠', '📈', '🎬', '📚', '🚕', '🏥', '⛽', '🎁', '🤝', '💼', '🏷️'];

export default function CategoriesView() {
  const { transactions, categories, addCategory, editCategory, deleteCategory, formatCurrency } = useFinancials();

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🏷️');
  const [catColor, setCatColor] = useState('bg-slate-500');
  const [catLimit, setCatLimit] = useState('');

  // Calculate actual spending per category for June 2026
  const juneExpenses = transactions.filter(t => t.date.startsWith('2026-06') && t.type === 'expense');

  const categorySpent: Record<string, number> = {};
  categories.forEach(cat => {
    categorySpent[cat.name] = juneExpenses.filter(t => t.category === cat.name).reduce((sum, curr) => sum + curr.amount, 0);
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setCatName('');
    setCatIcon('🏷️');
    setCatColor('bg-slate-500');
    setCatLimit('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setModalMode('edit');
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatColor(cat.color);
    setCatLimit(cat.limit.toString());
    setIsModalOpen(true);
  };

  const handleFormSubmit = () => {
    if (!catName.trim()) {
      alert("Please enter a category name.");
      return;
    }
    if (!catLimit || isNaN(Number(catLimit)) || Number(catLimit) <= 0) {
      alert("Please enter a valid monthly budget limit.");
      return;
    }

    const payload = {
      name: catName.trim(),
      icon: catIcon,
      color: catColor,
      limit: Number(catLimit)
    };

    if (modalMode === 'add') {
      addCategory(payload);
    } else if (modalMode === 'edit' && editingId) {
      editCategory(editingId, payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (cat: Category) => {
    const confirm = window.confirm(`Are you sure you want to delete the category "${cat.name}"?`);
    if (confirm) {
      deleteCategory(cat.id);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white font-sans">Category Budgets</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set monthly limits on spend categories and track real-time budgets.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
        >
          <Plus size={14} />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Alert Banner for Near limit budgets */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const spent = categorySpent[cat.name] || 0;
          const ratio = (spent / cat.limit) * 100;
          if (ratio >= 80 && ratio < 100) {
            return (
              <div key={cat.id} className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-xs font-semibold text-amber-700 dark:text-amber-400">
                <AlertTriangle size={16} className="shrink-0 animate-bounce" />
                <span>Budget Alert: category "{cat.name}" has reached {ratio.toFixed(0)}% of its limit ({formatCurrency(spent)} spent of {formatCurrency(cat.limit)}).</span>
              </div>
            );
          }
          if (ratio >= 100) {
            return (
              <div key={cat.id} className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-455">
                <AlertTriangle size={16} className="shrink-0 animate-pulse" />
                <span>Over-Budget Alert: category "{cat.name}" has exceeded its limit ({formatCurrency(spent)} spent of {formatCurrency(cat.limit)}).</span>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const spent = categorySpent[cat.name] || 0;
          const ratio = (spent / cat.limit) * 100;
          const progressColor = ratio >= 100 ? 'bg-rose-500' : ratio >= 80 ? 'bg-amber-500' : cat.color;

          return (
            <div key={cat.id} className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{cat.name}</span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    title="Edit Category"
                  >
                    <PenSquare size={13} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Progress and Caps */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Spent: {formatCurrency(spent)}</span>
                  <span>Limit: {formatCurrency(cat.limit)}</span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(ratio, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full ${progressColor}`} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                <span>{ratio.toFixed(0)}% Utilized</span>
                <span className={ratio >= 100 ? 'text-rose-500' : 'text-slate-400'}>
                  {ratio >= 100 ? 'Budget Limit Exceeded' : `${formatCurrency(cat.limit - spent)} remaining`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Dialog Overlay */}
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
                  <Tag size={18} />
                  <span>{modalMode === 'add' ? 'Add Custom Category' : 'Edit Category Settings'}</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Petrol, Medical, Office" 
                    value={catName} 
                    onChange={(e) => setCatName(e.target.value)} 
                    className="w-full glass-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Monthly Budget Limit ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={catLimit} 
                    onChange={(e) => setCatLimit(e.target.value)} 
                    className="w-full glass-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Select Icon Emoji</label>
                  <div className="flex flex-wrap gap-2.5 bg-slate-100/40 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/30 dark:border-white/5 justify-center max-h-32 overflow-y-auto">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setCatIcon(emoji)}
                        className={`text-xl p-1.5 rounded-lg transition-all ${catIcon === emoji ? 'bg-blue-500/25 border-2 border-blue-500 scale-110' : 'hover:scale-105'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-450">Select Color Theme</label>
                  <div className="flex flex-wrap gap-2 bg-slate-100/40 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200/30 dark:border-white/5 justify-center">
                    {COLOR_OPTIONS.map(col => (
                      <button
                        key={col.name}
                        onClick={() => setCatColor(col.class.split(' ')[0])}
                        className={`w-6 h-6 rounded-full border transition-all ${col.class.split(' ')[0]} ${catColor === col.class.split(' ')[0] ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-transparent'}`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleFormSubmit}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles size={14} />
                  <span>{modalMode === 'add' ? 'Create Category' : 'Save Changes'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
