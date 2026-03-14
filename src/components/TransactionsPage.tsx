import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Trash2, 
  Calendar,
  ChevronDown,
  Download,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';
import { translations, Language } from '../translations';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import Voucher from './Voucher';

interface TransactionsPageProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  language: Language;
  currencySymbol: string;
}

export default function TransactionsPage({ transactions, onDelete, language, currencySymbol }: TransactionsPageProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const t = translations[language];

  const filteredTransactions = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return transactions.filter(tx => {
      const matchesSearch = tx.category.toLowerCase().includes(search.toLowerCase()) || 
                           (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()));
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const txDate = parseISO(tx.date);
      const matchesDate = isWithinInterval(txDate, { start, end });

      return matchesSearch && matchesType && matchesDate;
    });
  }, [transactions, search, typeFilter, startDate, endDate]);

  const totalIncome = filteredTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalExpense = filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)]">{t.transaction_history}</h2>
          <p className="text-[var(--text-muted)]">Manage and view all your records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100">
            +{currencySymbol}{totalIncome.toLocaleString()}
          </div>
          <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold border border-rose-100">
            -{currencySymbol}{totalExpense.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-[32px] space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text"
              placeholder="Search by category or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] border-[var(--border-color)] rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-[var(--bg-main)] border-[var(--border-color)] rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="income">{t.income}</option>
              <option value="expense">{t.expense}</option>
            </select>
            <div className="flex items-center gap-2 bg-[var(--bg-main)] border-[var(--border-color)] rounded-2xl px-4 py-3">
              <Calendar size={18} className="text-[var(--text-muted)]" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-28"
              />
              <span className="opacity-30">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
            <FileText size={64} strokeWidth={1} className="mb-4 opacity-10" />
            <p className="font-bold">{t.no_records}</p>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => (
            <motion.div 
              key={`tx-page-${tx.id}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setSelectedTx(tx)}
              className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-indigo-100 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {tx.type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text-main)]">{tx.category}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    <span>{format(parseISO(tx.date), 'MMM d, yyyy')}</span>
                    {tx.description && (
                      <>
                        <span className="opacity-30">•</span>
                        <span className="truncate max-w-[150px]">{tx.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-black text-lg ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{currencySymbol}{Number(tx.amount).toLocaleString()}
                  </p>
                  {tx.note && <p className="text-[10px] text-indigo-500 italic font-medium">Has Note</p>}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tx.id);
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Voucher Modal */}
      <AnimatePresence>
        {selectedTx && (
          <Voucher 
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
            language={language}
            currencySymbol={currencySymbol}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
