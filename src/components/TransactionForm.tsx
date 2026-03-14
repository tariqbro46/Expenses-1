import React, { useState, useEffect } from 'react';
import { CATEGORIES, CustomCategory } from '../types';
import { supabase } from '../lib/supabase';
import { X, Plus, Loader2, ArrowUpCircle, ArrowDownCircle, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';

interface TransactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  language: Language;
}

export default function TransactionForm({ onClose, onSuccess, userId, language }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(CATEGORIES.find(c => c.type === 'expense' || c.type === 'both')?.id || 'Other');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCategories, setUserCategories] = useState<CustomCategory[]>([]);
  const t = translations[language];

  useEffect(() => {
    fetchUserCategories();
  }, []);

  const fetchUserCategories = async () => {
    const { data } = await supabase.from('custom_categories').select('*');
    if (data) setUserCategories(data);
  };

  const filteredCategories = [
    ...CATEGORIES.filter(c => c.type === type || c.type === 'both'),
    ...userCategories.filter(c => c.type === type || c.type === 'both').map(c => ({
      id: c.name,
      icon: Tag,
      color: 'bg-amber-100 text-amber-600',
      type: c.type
    }))
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalCategory = category === 'Other' && customCategory ? customCategory : category;

    try {
      const { error: supabaseError } = await supabase.from('transactions').insert([{
        user_id: userId,
        type,
        amount: parseFloat(amount),
        category: finalCategory,
        description,
        note,
        date
      }]);

      if (supabaseError) throw supabaseError;
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'Failed to save transaction'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ios-modal-overlay">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="ios-modal-content"
      >
        <div className="ios-modal-handle" />
        <div className="flex justify-between items-center px-8 pt-4 pb-4 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-[var(--text-main)]">{t.add_transaction}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-y-auto pb-10">
          <div className="flex p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(CATEGORIES.find(c => c.type === 'expense')?.id || 'Other'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(CATEGORIES.find(c => c.type === 'income')?.id || 'Other'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
            >
              {t.income}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.amount}</label>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.category}</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {filteredCategories.map((cat, idx) => (
                <button
                  key={`${cat.id}-${idx}`}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    category === cat.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-indigo-200 text-[var(--text-muted)]'
                  }`}
                >
                  <cat.icon size={20} />
                  <span className="text-[10px] mt-1 font-medium truncate w-full text-center">{cat.id}</span>
                </button>
              ))}
            </div>
            {category === 'Other' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <input 
                  type="text" 
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter Custom Category Name"
                  className="mt-2 bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
                  required
                />
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.date}</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.description}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details..."
              rows={2}
              className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.note}</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Private memo or note..."
              rows={2}
              className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            {t.save}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
