'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types Definition
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  person: string;
  category: string;
  account: string;
  paymentMode: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  status: 'Cleared' | 'Pending';
  fromAccount?: string; // For transfers
  toAccount?: string;   // For transfers
  toPerson?: string;    // For family transfers
  fromPocket?: 'bank' | 'cash'; // For family transfers pocket mapping
  toPocket?: 'bank' | 'cash';   // For family transfers pocket mapping
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi' | 'credit';
  balance: number;
  startingBalance?: number;
  todayChange: number;
  lastUpdated: string;
}

export interface LoanInstallment {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes: string;
}

export interface Loan {
  id: string;
  person: string;
  amount: number; // Original principal
  type: 'given' | 'taken';
  date: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  installments: LoanInstallment[];
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string; // Emoji
  balance: number;
  bankBalance: number;
  cashBalance: number;
  startingBalance?: number;
  startingBankBalance?: number;
  startingCashBalance?: number;
  totalExpense: number;
  totalContribution: number;
  monthlySummary: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji
  color: string;
  limit: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

interface FinancialContextType {
  transactions: Transaction[];
  accounts: Account[];
  loans: Loan[];
  family: FamilyMember[];
  categories: Category[];
  notifications: Notification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  
  // Modals UI state
  isExpenseOpen: boolean;
  setIsExpenseOpen: (o: boolean) => void;
  isIncomeOpen: boolean;
  setIsIncomeOpen: (o: boolean) => void;
  isTransferOpen: boolean;
  setIsTransferOpen: (o: boolean) => void;
  isLoanOpen: boolean;
  setIsLoanOpen: (o: boolean) => void;
  isFamilyOpen: boolean;
  setIsFamilyOpen: (o: boolean) => void;
  
  // Transaction Editing UI state
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'status'> & { status?: 'Cleared' | 'Pending' }) => void;
  editTransaction: (id: string, tx: Omit<Transaction, 'id' | 'status'> & { status?: 'Cleared' | 'Pending' }) => void;
  deleteTransaction: (id: string) => void;
  
  addLoan: (loan: Omit<Loan, 'id' | 'status' | 'installments'>) => void;
  repayLoan: (loanId: string, installment: Omit<LoanInstallment, 'id'>) => void;
  triggerLoanReminder: (loanId: string) => void;

  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'totalExpense' | 'totalContribution'>) => void;
  editFamilyMember: (id: string, member: Omit<FamilyMember, 'id' | 'totalExpense' | 'totalContribution'>) => void;
  deleteFamilyMember: (id: string) => void;
  deleteLoan: (id: string) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  editCategory: (id: string, cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;

  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  resetData: (startFromZero: boolean) => void;
  importData: (data: any) => Promise<boolean>;
  isLoggedIn: boolean;
  loggedInUser: string;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  currentMonth: string;
  setCurrentMonth: React.Dispatch<React.SetStateAction<string>>;

  // Global utilities
  formatCurrency: (val: number) => string;
  reconcileAllBalances: () => void;
}

const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          sanitized[key] = sanitizeForFirestore(val);
        }
      }
    }
    return sanitized;
  }
  return obj;
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Food & Dining', icon: '🍔', color: 'bg-rose-500', limit: 8000 },
  { id: 'cat-2', name: 'Groceries', icon: '🛒', color: 'bg-emerald-500', limit: 12000 },
  { id: 'cat-3', name: 'Shopping', icon: '🛍️', color: 'bg-purple-500', limit: 15000 },
  { id: 'cat-4', name: 'Bills & Utilities', icon: '⚡', color: 'bg-amber-500', limit: 8000 },
  { id: 'cat-5', name: 'Rent', icon: '🏠', color: 'bg-blue-500', limit: 40000 },
  { id: 'cat-6', name: 'Investments', icon: '📈', color: 'bg-indigo-500', limit: 30000 },
  { id: 'cat-7', name: 'Entertainment', icon: '🎬', color: 'bg-pink-500', limit: 5000 },
  { id: 'cat-8', name: 'Education', icon: '📚', color: 'bg-cyan-500', limit: 10000 },
  { id: 'cat-9', name: 'Travel & Cab', icon: '🚕', color: 'bg-teal-500', limit: 6000 },
  { id: 'cat-10', name: 'Others', icon: '🏷️', color: 'bg-slate-500', limit: 5000 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Cash Wallet',
    type: 'cash',
    balance: 0,
    todayChange: 0,
    lastUpdated: 'Just now'
  },
  {
    id: 'acc-2',
    name: 'Bank Account',
    type: 'bank',
    balance: 0,
    todayChange: 0,
    lastUpdated: 'Just now'
  },
  {
    id: 'acc-3',
    name: 'UPI',
    type: 'upi',
    balance: 0,
    todayChange: 0,
    lastUpdated: 'Just now'
  },
  {
    id: 'acc-4',
    name: 'Credit Card',
    type: 'credit',
    balance: 0,
    todayChange: 0,
    lastUpdated: 'Just now'
  }
];

const INITIAL_LOANS: Loan[] = [];

const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Emma (Wife)',
    avatar: '👩‍💼',
    balance: 0,
    bankBalance: 0,
    cashBalance: 0,
    totalExpense: 0,
    totalContribution: 0,
    monthlySummary: 'Active spender, covers grocery expenses'
  },
  {
    id: 'fam-2',
    name: 'Leo (Son)',
    avatar: '👦',
    balance: 0,
    bankBalance: 0,
    cashBalance: 0,
    totalExpense: 0,
    totalContribution: 0,
    monthlySummary: 'Pocket money allocated, mostly minor entertainment spend'
  },
  {
    id: 'fam-3',
    name: 'Mia (Daughter)',
    avatar: '👧',
    balance: 0,
    bankBalance: 0,
    cashBalance: 0,
    totalExpense: 0,
    totalContribution: 0,
    monthlySummary: 'School utility & online learning classes'
  }
];
const INITIAL_NOTIFICATIONS: Notification[] = [];

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [family, setFamily] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [currency, setCurrency] = useState<string>('INR (₹)');
  const [language, setLanguage] = useState<string>('English');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  });

  // Modal UI state
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);

  // Editing transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const isHydrated = useRef(false);
  const lastSyncedData = useRef<string>('');
  const hasAutoReconciled = useRef(false);
  const isPendingWrite = useRef(false);
  const hasReceivedInitialSnapshot = useRef(false);

  // Sync dark mode class on html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Load state from localStorage on Mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('mexpense_dark_mode');
      if (storedTheme) setDarkMode(storedTheme === 'true');

      const storedCurrency = localStorage.getItem('mexpense_currency');
      if (storedCurrency) setCurrency(storedCurrency);

      const storedLanguage = localStorage.getItem('mexpense_language');
      if (storedLanguage) setLanguage(storedLanguage);

      const storedTx = localStorage.getItem('mexpense_transactions');
      if (storedTx) setTransactions(JSON.parse(storedTx));

      const storedAcc = localStorage.getItem('mexpense_accounts');
      if (storedAcc) setAccounts(JSON.parse(storedAcc));

      const storedLoans = localStorage.getItem('mexpense_loans');
      if (storedLoans) setLoans(JSON.parse(storedLoans));

      const storedFamily = localStorage.getItem('mexpense_family');
      if (storedFamily) setFamily(JSON.parse(storedFamily));

      const storedCategories = localStorage.getItem('mexpense_categories');
      if (storedCategories) setCategories(JSON.parse(storedCategories));

      const storedNotif = localStorage.getItem('mexpense_notifications');
      if (storedNotif) setNotifications(JSON.parse(storedNotif));

      const storedLogin = localStorage.getItem('mexpense_logged_in');
      if (storedLogin === 'true') setIsLoggedIn(true);

      const storedUser = localStorage.getItem('mexpense_username');
      if (storedUser) setLoggedInUser(storedUser);
    } catch (e) {
      console.error('Error hydrating localStorage state', e);
    }
    isHydrated.current = true;
  }, []);

  // Firebase snapshot listener synced to logged-in user slug
  useEffect(() => {
    if (!isHydrated.current || !isLoggedIn || !loggedInUser) return;

    const hasFirebase = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your_project_id';
    
    let unsubscribe: () => void = () => {};

    if (hasFirebase) {
      try {
        const userSlug = loggedInUser.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'default_user';
        const userDocRef = doc(db, 'users', userSlug);
        unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists() && !isPendingWrite.current) {
            const data = docSnap.data();
            
            // Track stringified payload to break sync write-back loop
            lastSyncedData.current = JSON.stringify({
              transactions: data.transactions || [],
              accounts: data.accounts || [],
              loans: data.loans || [],
              family: data.family || [],
              categories: data.categories || [],
              notifications: data.notifications || [],
              darkMode: data.darkMode,
              currency: data.currency,
              language: data.language
            });

            if (data.transactions) setTransactions(data.transactions);
            if (data.accounts) setAccounts(data.accounts);
            if (data.loans) setLoans(data.loans);
            if (data.family) setFamily(data.family);
            if (data.categories) setCategories(data.categories);
            if (data.notifications) setNotifications(data.notifications);
            if (data.currency) setCurrency(data.currency);
            if (data.language) setLanguage(data.language);
            if (data.darkMode !== undefined) setDarkMode(data.darkMode);
          }
          hasReceivedInitialSnapshot.current = true; // Unlocks writes since fetch has resolved
        });
      } catch (err) {
        console.error("Firebase connection error during hydration:", err);
      }
    }

    return () => unsubscribe();
  }, [isLoggedIn, loggedInUser]);

  // Sync login status to localStorage
  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_logged_in', String(isLoggedIn));
    localStorage.setItem('mexpense_username', loggedInUser);
  }, [isLoggedIn, loggedInUser]);

  // Sync states to localStorage
  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_currency', currency);
  }, [currency]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_language', language);
  }, [language]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_family', JSON.stringify(family));
  }, [family]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (!isHydrated.current) return;
    localStorage.setItem('mexpense_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync state changes to Firebase Firestore in the background (with debounce)
  useEffect(() => {
    if (!isHydrated.current || !isLoggedIn || !loggedInUser) return;
    
    const hasFirebase = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your_project_id';
    
    if (hasFirebase) {
      if (!hasReceivedInitialSnapshot.current) {
        return;
      }

      const currentStateString = JSON.stringify({
        transactions,
        accounts,
        loans,
        family,
        categories,
        notifications,
        darkMode,
        currency,
        language
      });

      // Avoid redundant write loop back if local state matches the fetched Firestore state
      if (currentStateString === lastSyncedData.current) {
        return;
      }

      isPendingWrite.current = true;

      const timer = setTimeout(async () => {
        try {
          const userSlug = loggedInUser.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'default_user';
          const userDocRef = doc(db, 'users', userSlug);
          
          lastSyncedData.current = currentStateString;

          await setDoc(userDocRef, sanitizeForFirestore({
            transactions,
            accounts,
            loans,
            family,
            categories,
            notifications,
            darkMode,
            currency,
            language
          }), { merge: true });
        } catch (err) {
          console.error("Failed to sync state changes to Firestore:", err);
        } finally {
          isPendingWrite.current = false;
        }
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [transactions, accounts, loans, family, categories, notifications, darkMode, currency, language, isLoggedIn, loggedInUser]);

  // Utility to format numbers using Selected Currency and Indian numbering schema
  const formatCurrency = (val: number) => {
    const symbol = currency.includes('INR') || currency.includes('₹') ? '₹' :
                   currency.includes('EUR') || currency.includes('€') ? '€' :
                   currency.includes('GBP') || currency.includes('£') ? '£' :
                   currency.includes('JPY') || currency.includes('¥') ? '¥' : '$';
    
    const locale = symbol === '₹' ? 'en-IN' : 'en-US';
    const absVal = Math.abs(val);

    const formatted = absVal.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    return `${val < 0 ? '-' : ''}${symbol}${formatted}`;
  };

  // Helper to adjust balances when transaction balance changes are applied
  // multiplier: +1 when adding transaction, -1 when reversing/deleting transaction
  const applyBalanceAdjustment = (
    tx: Omit<Transaction, 'id' | 'status'>,
    multiplier: number,
    accountsList: Account[],
    familyList: FamilyMember[]
  ) => {
    let updatedAccs = [...accountsList];
    let updatedFam = [...familyList];

    const todayStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const isAdmin = (name: string) => {
      return name === 'Self' || (loggedInUser && name.toLowerCase() === loggedInUser.toLowerCase());
    };

    const isTargetMember = (famName: string, personName: string | undefined) => {
      if (!personName) return false;
      if (personName === 'Self') {
        return !!(loggedInUser && famName.toLowerCase() === loggedInUser.toLowerCase());
      }
      return famName.toLowerCase() === personName.toLowerCase();
    };

    if (tx.type === 'income') {
      updatedAccs = updatedAccs.map((acc) => {
        if (acc.name === tx.account) {
          const diff = tx.amount * multiplier;
          return {
            ...acc,
            balance: acc.balance + diff,
            todayChange: acc.todayChange + diff,
            lastUpdated: todayStr
          };
        }
        return acc;
      });

      updatedFam = updatedFam.map((fam) => {
        if (isTargetMember(fam.name, tx.person)) {
          const diff = tx.amount * multiplier;
          const isCash = tx.account === 'Cash Wallet';
          const newBank = isCash ? fam.bankBalance : fam.bankBalance + diff;
          const newCash = isCash ? fam.cashBalance + diff : fam.cashBalance;
          return {
            ...fam,
            totalContribution: fam.totalContribution + diff,
            bankBalance: newBank,
            cashBalance: newCash,
            balance: newBank + newCash
          };
        }
        return fam;
      });
    } else if (tx.type === 'expense') {
      updatedAccs = updatedAccs.map((acc) => {
        if (acc.name === tx.account) {
          const diff = tx.amount * multiplier;
          return {
            ...acc,
            balance: acc.balance - diff,
            todayChange: acc.todayChange - diff,
            lastUpdated: todayStr
          };
        }
        return acc;
      });

      updatedFam = updatedFam.map((fam) => {
        if (isTargetMember(fam.name, tx.person)) {
          const diff = tx.amount * multiplier;
          const isCash = tx.account === 'Cash Wallet';
          const newBank = isCash ? fam.bankBalance : fam.bankBalance - diff;
          const newCash = isCash ? fam.cashBalance - diff : fam.cashBalance;
          return {
            ...fam,
            totalExpense: fam.totalExpense + diff,
            bankBalance: newBank,
            cashBalance: newCash,
            balance: newBank + newCash
          };
        }
        return fam;
      });
    } else if (tx.type === 'transfer') {
      // 1. Debit Source Account (only if Sender is Self/Admin)
      if (isAdmin(tx.person)) {
        const sourceAcc = tx.fromAccount || tx.account;
        updatedAccs = updatedAccs.map((acc) => {
          if (acc.name === sourceAcc) {
            const diff = tx.amount * multiplier;
            return {
              ...acc,
              balance: acc.balance - diff,
              todayChange: acc.todayChange - diff,
              lastUpdated: todayStr
            };
          }
          return acc;
        });
      }

      const isInternal = tx.account === 'Internal' || tx.fromAccount === 'Internal';

      // 2. Debit Sender (if family member)
      updatedFam = updatedFam.map((fam) => {
        const isSender = isTargetMember(fam.name, tx.person);
        const shouldDebit = isSender && (!isAdmin(tx.person) || !isInternal);
        if (shouldDebit) {
          const diff = tx.amount * multiplier;
          const isCashPocket = tx.fromPocket === 'cash' || 
            (!tx.fromPocket && ((tx.fromAccount || tx.account) === 'Cash Wallet' || tx.paymentMode === 'Cash'));
          
          const newBank = isCashPocket ? fam.bankBalance : fam.bankBalance - diff;
          const newCash = isCashPocket ? fam.cashBalance - diff : fam.cashBalance;
          return {
            ...fam,
            bankBalance: newBank,
            cashBalance: newCash,
            balance: newBank + newCash
          };
        }
        return fam;
      });

      // 3. Credit Recipient (if family member)
      if (tx.toPerson) {
        updatedFam = updatedFam.map((fam) => {
          const isRecipient = isTargetMember(fam.name, tx.toPerson);
          const shouldCredit = isRecipient && (!isAdmin(tx.toPerson) || !isInternal);
          if (shouldCredit) {
            const diff = tx.amount * multiplier;
            const isCashPocket = tx.toPocket === 'cash' || 
              (!tx.toPocket && (tx.toAccount === 'Cash Wallet' || tx.paymentMode === 'Cash'));
            
            const newBank = isCashPocket ? fam.bankBalance : fam.bankBalance + diff;
            const newCash = isCashPocket ? fam.cashBalance + diff : fam.cashBalance;
            return {
              ...fam,
              bankBalance: newBank,
              cashBalance: newCash,
              balance: newBank + newCash
            };
          }
          return fam;
        });
      }

      // 4. Credit Destination Account (if transferring to Self/Account or any Cash pocket)
      const isToCash = tx.toPocket === 'cash' || (!tx.toPocket && tx.toAccount === 'Cash Wallet');
      if (isToCash) {
        updatedAccs = updatedAccs.map((acc) => {
          if (acc.name === 'Cash Wallet') {
            const diff = tx.amount * multiplier;
            return {
              ...acc,
              balance: acc.balance + diff,
              todayChange: acc.todayChange + diff,
              lastUpdated: todayStr
            };
          }
          return acc;
        });
      } else if (tx.toAccount) {
        updatedAccs = updatedAccs.map((acc) => {
          if (acc.name === tx.toAccount) {
            const diff = tx.amount * multiplier;
            return {
              ...acc,
              balance: acc.balance + diff,
              todayChange: acc.todayChange + diff,
              lastUpdated: todayStr
            };
          }
          return acc;
        });
      }
    }

    return { updatedAccs, updatedFam };
  };

  // Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'status'> & { status?: 'Cleared' | 'Pending' }) => {
    const newTxId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...tx,
      id: newTxId,
      status: tx.status || 'Cleared'
    };

    setTransactions((prev) => [newTx, ...prev]);

    const { updatedAccs, updatedFam } = applyBalanceAdjustment(tx, 1, accounts, family);
    setAccounts(updatedAccs);
    setFamily(updatedFam);

    // Notifications
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: tx.type === 'income' ? 'Income Logged' : tx.type === 'expense' ? 'Expense Logged' : 'Transfer Logged',
      message: `${tx.type === 'income' ? 'Income' : tx.type === 'expense' ? 'Expense' : 'Transfer'} of ${formatCurrency(tx.amount)} logged successfully under "${tx.description}".`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const editTransaction = (id: string, updatedFields: Omit<Transaction, 'id' | 'status'> & { status?: 'Cleared' | 'Pending' }) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) return;

    // 1. Reverse balance changes of old transaction
    let { updatedAccs, updatedFam } = applyBalanceAdjustment(oldTx, -1, accounts, family);
    
    // 2. Apply balance changes of new updated transaction details
    const adjusted = applyBalanceAdjustment(updatedFields, 1, updatedAccs, updatedFam);
    setAccounts(adjusted.updatedAccs);
    setFamily(adjusted.updatedFam);

    // 3. Update transactions array
    setTransactions((prev) => 
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );

    // Notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Transaction Updated',
      message: `Transaction details for "${updatedFields.description}" updated. Current amount: ${formatCurrency(updatedFields.amount)}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Reverse balances
    const { updatedAccs, updatedFam } = applyBalanceAdjustment(tx, -1, accounts, family);
    setAccounts(updatedAccs);
    setFamily(updatedFam);

    // Remove from array
    setTransactions((prev) => prev.filter(t => t.id !== id));

    // Notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Transaction Deleted',
      message: `Transaction entry for "${tx.description}" (${formatCurrency(tx.amount)}) was removed from ledger database.`,
      time: 'Just now',
      read: false,
      type: 'alert'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'status' | 'installments'>) => {
    const newLoan: Loan = {
      ...loan,
      id: `loan-${Date.now()}`,
      status: 'Pending',
      installments: []
    };
    setLoans((prev) => [newLoan, ...prev]);

    // Record initial transaction outflow/inflow
    addTransaction({
      date: loan.date,
      person: loan.person,
      category: loan.type === 'given' ? 'Loan Given' : 'Loan Taken',
      account: 'Bank Account',
      paymentMode: 'Net Banking',
      description: loan.type === 'given' ? `Principal lent to ${loan.person}` : `Principal borrowed from ${loan.person}`,
      amount: loan.amount,
      type: loan.type === 'given' ? 'expense' : 'income'
    });
  };

  const repayLoan = (loanId: string, installment: Omit<LoanInstallment, 'id'>) => {
    const instId = `inst-${Date.now()}`;
    const newInst: LoanInstallment = {
      ...installment,
      id: instId
    };

    let loanPerson = '';
    let loanType: 'given' | 'taken' = 'given';
    let isFullySettled = false;

    setLoans((prevLoans) => {
      return prevLoans.map((loan) => {
        if (loan.id === loanId) {
          loanPerson = loan.person;
          loanType = loan.type;
          
          const updatedInsts = [...loan.installments, newInst];
          const totalPaid = updatedInsts.reduce((sum, inst) => sum + inst.amount, 0);
          const remaining = loan.amount - totalPaid;
          const status = remaining <= 0 ? 'Completed' : 'Pending';
          isFullySettled = remaining <= 0;

          return {
            ...loan,
            installments: updatedInsts,
            status
          };
        }
        return loan;
      });
    });

    // Record payment details in ledger
    addTransaction({
      date: installment.date,
      person: loanPerson,
      category: loanType === 'given' ? 'Loan Repaid (Recd)' : 'Loan Paid Back',
      account: installment.method,
      paymentMode: 'Net Banking',
      description: loanType === 'given' 
        ? `Installment collected from ${loanPerson}: ${installment.notes || 'Repayment'}` 
        : `Installment paid to ${loanPerson}: ${installment.notes || 'Repayment'}`,
      amount: installment.amount,
      type: loanType === 'given' ? 'income' : 'expense'
    });

    // Success notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: isFullySettled ? 'Loan Settle Done' : 'Installment Recorded',
      message: isFullySettled 
        ? `Debt contract with ${loanPerson} has been fully settled.` 
        : `Logged repayment installment of ${formatCurrency(installment.amount)} from ${loanPerson}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const triggerLoanReminder = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const totalPaid = loan.installments.reduce((sum, inst) => sum + inst.amount, 0);
    const remaining = loan.amount - totalPaid;

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Reminder Dispatched',
      message: `SMS & WhatsApp alert sent to ${loan.person} for outstanding loan dues of ${formatCurrency(remaining)}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'totalExpense' | 'totalContribution'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `fam-${Date.now()}`,
      startingBalance: member.bankBalance + member.cashBalance,
      startingBankBalance: member.bankBalance,
      startingCashBalance: member.cashBalance,
      totalExpense: 0,
      totalContribution: 0
    };
    setFamily((prev) => [...prev, newMember]);
  };

  const editFamilyMember = (id: string, updatedFields: Omit<FamilyMember, 'id' | 'totalExpense' | 'totalContribution'>) => {
    setFamily((prev) => 
      prev.map((fam) => (fam.id === id ? { 
        ...fam, 
        ...updatedFields, 
        startingBalance: updatedFields.bankBalance + updatedFields.cashBalance,
        startingBankBalance: updatedFields.bankBalance,
        startingCashBalance: updatedFields.cashBalance
      } : fam))
    );

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Family Member Updated',
      message: `Profile settings for "${updatedFields.name}" modified. Opening balance set to ${formatCurrency(updatedFields.bankBalance + updatedFields.cashBalance)}.`,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const deleteFamilyMember = (id: string) => {
    const mem = family.find(f => f.id === id);
    if (!mem) return;

    setFamily((prev) => prev.filter(f => f.id !== id));

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Family Member Removed',
      message: `Family member "${mem.name}" deleted from records.`,
      time: 'Just now',
      read: false,
      type: 'alert'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const deleteLoan = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    setLoans((prev) => prev.filter(l => l.id !== id));

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Loan Record Deleted',
      message: `Loan contract associated with "${loan.person}" (${formatCurrency(loan.amount)}) removed.`,
      time: 'Just now',
      read: false,
      type: 'alert'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Dynamic Categories Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    setCategories((prev) => [...prev, newCat]);

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Category Added',
      message: `New category "${cat.name}" created with monthly budget limit of ${formatCurrency(cat.limit)}.`,
      time: 'Just now',
      read: false,
      type: 'success'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const editCategory = (id: string, updatedFields: Omit<Category, 'id'>) => {
    setCategories((prev) => 
      prev.map((cat) => (cat.id === id ? { ...cat, ...updatedFields } : cat))
    );

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Category Updated',
      message: `Category "${updatedFields.name}" settings modified.`,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    setCategories((prev) => prev.filter(c => c.id !== id));

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Category Deleted',
      message: `Category "${cat.name}" removed from budget records.`,
      time: 'Just now',
      read: false,
      type: 'alert'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetData = async (startFromZero: boolean) => {
    if (startFromZero) {
      setTransactions([]);
      setLoans([]);
      setAccounts(prev => prev.map(a => ({ ...a, balance: 0, todayChange: 0 })));
      setFamily(prev => prev.map(f => ({ ...f, balance: 0, totalExpense: 0, totalContribution: 0 })));
      
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: 'Ledgers Reset to Zero',
        message: 'All accounts, transactions, loans, and family balances have been reset to zero.',
        time: 'Just now',
        read: false,
        type: 'alert'
      };
      setNotifications([newNotif]);

      // Force instant sync to Firestore to wipe it completely
      const hasFirebase = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your_project_id';
      if (hasFirebase && loggedInUser) {
        try {
          const userSlug = loggedInUser.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'default_user';
          const userDocRef = doc(db, 'users', userSlug);
          
          const wipedData = {
            transactions: [],
            accounts: INITIAL_ACCOUNTS.map(a => ({ ...a, balance: 0, todayChange: 0 })),
            loans: [],
            family: INITIAL_FAMILY.map(f => ({ ...f, balance: 0, totalExpense: 0, totalContribution: 0 })),
            categories: categories,
            notifications: [newNotif],
            darkMode: darkMode,
            currency: currency,
            language: language
          };
          
          lastSyncedData.current = JSON.stringify(wipedData);
          await setDoc(userDocRef, sanitizeForFirestore(wipedData), { merge: true });
        } catch (err) {
          console.error("Failed to force clear Firestore:", err);
        }
      }
    } else {
      // Restore initial default mock data
      setTransactions(INITIAL_TRANSACTIONS);
      setAccounts(INITIAL_ACCOUNTS);
      setLoans(INITIAL_LOANS);
      setFamily(INITIAL_FAMILY);
      setCategories(INITIAL_CATEGORIES);
      setNotifications([]);
    }
  };

  const reconcileAllBalances = () => {
    let tempAccs: Account[] = accounts.map(a => ({
      ...a,
      balance: a.startingBalance !== undefined ? a.startingBalance : 0,
      todayChange: 0
    }));

    let tempFam: FamilyMember[] = family.map(f => {
      const startingBal = f.startingBalance !== undefined 
        ? f.startingBalance 
        : (f.balance - (f.totalContribution || 0) + (f.totalExpense || 0));

      const startingBank = f.startingBankBalance !== undefined 
        ? f.startingBankBalance 
        : startingBal;

      const startingCash = f.startingCashBalance !== undefined 
        ? f.startingCashBalance 
        : 0;

      return {
        ...f,
        bankBalance: startingBank,
        cashBalance: startingCash,
        balance: startingBank + startingCash,
        startingBalance: startingBank + startingCash,
        startingBankBalance: startingBank,
        startingCashBalance: startingCash,
        totalExpense: 0,
        totalContribution: 0
      };
    });

    const sortedTxs = [...transactions].reverse();

    sortedTxs.forEach((tx) => {
      const { updatedAccs, updatedFam } = applyBalanceAdjustment(tx, 1, tempAccs, tempFam);
      tempAccs = updatedAccs;
      tempFam = updatedFam;
    });

    setAccounts(tempAccs);
    setFamily(tempFam);

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Ledgers Reconciled',
      message: 'All physical account balances and family allowances have been recalculated successfully from the transaction history.',
      time: 'Just now',
      read: false,
      type: 'success'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Auto-reconcile balances on initial database hydration (Self-healing mismatch check)
  useEffect(() => {
    if (!isHydrated.current || transactions.length === 0 || hasAutoReconciled.current) return;
    
    // Calculate expected balances
    let tempAccs = INITIAL_ACCOUNTS.map(a => ({ ...a, balance: 0, todayChange: 0 }));
    let tempFam = INITIAL_FAMILY.map(f => ({ ...f, balance: 0, totalExpense: 0, totalContribution: 0 }));
    const sortedTxs = [...transactions].reverse();
    sortedTxs.forEach((tx) => {
      const { updatedAccs, updatedFam } = applyBalanceAdjustment(tx, 1, tempAccs, tempFam);
      tempAccs = updatedAccs;
      tempFam = updatedFam;
    });

    const expectedBank = tempAccs.find(a => a.name === 'Bank Account')?.balance || 0;
    const actualBank = accounts.find(a => a.name === 'Bank Account')?.balance || 0;

    if (expectedBank !== actualBank) {
      hasAutoReconciled.current = true;
      setAccounts(tempAccs);
      setFamily(tempFam);
    } else {
      hasAutoReconciled.current = true;
    }
  }, [transactions, accounts]);

  const login = (username: string, password?: string): boolean => {
    if (password && password !== 'password123') {
      return false;
    }
    setLoggedInUser(username);
    setIsLoggedIn(true);
    hasAutoReconciled.current = false;
    hasReceivedInitialSnapshot.current = false;
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setLoggedInUser('');
    hasAutoReconciled.current = false;
    hasReceivedInitialSnapshot.current = false;
    localStorage.removeItem('mexpense_logged_in');
    localStorage.removeItem('mexpense_username');
  };

  const importData = async (data: any): Promise<boolean> => {
    try {
      if (data.mexpense_transactions) setTransactions(JSON.parse(data.mexpense_transactions));
      if (data.mexpense_accounts) setAccounts(JSON.parse(data.mexpense_accounts));
      if (data.mexpense_loans) setLoans(JSON.parse(data.mexpense_loans));
      if (data.mexpense_family) setFamily(JSON.parse(data.mexpense_family));
      if (data.mexpense_categories) setCategories(JSON.parse(data.mexpense_categories));
      if (data.mexpense_notifications) setNotifications(JSON.parse(data.mexpense_notifications));
      if (data.mexpense_currency) setCurrency(data.mexpense_currency);
      if (data.mexpense_language) setLanguage(data.mexpense_language);
      if (data.mexpense_dark_mode !== undefined) setDarkMode(data.mexpense_dark_mode === 'true' || data.mexpense_dark_mode === true);

      Object.entries(data).forEach(([key, val]) => {
        if (val) localStorage.setItem(key, String(val));
      });

      const hasFirebase = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your_project_id';
      if (hasFirebase && loggedInUser) {
        const userSlug = loggedInUser.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'default_user';
        const userDocRef = doc(db, 'users', userSlug);
        
        const payload = {
          transactions: data.mexpense_transactions ? JSON.parse(data.mexpense_transactions) : [],
          accounts: data.mexpense_accounts ? JSON.parse(data.mexpense_accounts) : INITIAL_ACCOUNTS,
          loans: data.mexpense_loans ? JSON.parse(data.mexpense_loans) : [],
          family: data.mexpense_family ? JSON.parse(data.mexpense_family) : INITIAL_FAMILY,
          categories: data.mexpense_categories ? JSON.parse(data.mexpense_categories) : INITIAL_CATEGORIES,
          notifications: data.mexpense_notifications ? JSON.parse(data.mexpense_notifications) : [],
          darkMode: data.mexpense_dark_mode === 'true' || data.mexpense_dark_mode === true,
          currency: data.mexpense_currency || currency,
          language: data.mexpense_language || language
        };

        hasAutoReconciled.current = false;
        hasReceivedInitialSnapshot.current = true;
        lastSyncedData.current = JSON.stringify(payload);
        await setDoc(userDocRef, sanitizeForFirestore(payload), { merge: true });
      }

      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: 'State Restored',
        message: 'Your account ledgers and preferences have been successfully restored from the backup file.',
        time: 'Just now',
        read: false,
        type: 'success'
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return true;
    } catch (err) {
      console.error("Failed to restore backup:", err);
      return false;
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        accounts,
        loans,
        family,
        categories,
        notifications,
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        isExpenseOpen,
        setIsExpenseOpen,
        isIncomeOpen,
        setIsIncomeOpen,
        isTransferOpen,
        setIsTransferOpen,
        isLoanOpen,
        setIsLoanOpen,
        isFamilyOpen,
        setIsFamilyOpen,
        editingTransaction,
        setEditingTransaction,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addLoan,
        repayLoan,
        triggerLoanReminder,
        addFamilyMember,
        editFamilyMember,
        deleteFamilyMember,
        deleteLoan,
        addCategory,
        editCategory,
        deleteCategory,
        markNotificationRead,
        clearNotifications,
        resetData,
        isLoggedIn,
        loggedInUser,
        login,
        logout,
        importData,
        currentMonth,
        setCurrentMonth,
        formatCurrency,
        reconcileAllBalances
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancials = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancials must be used within a FinancialProvider');
  }
  return context;
};
