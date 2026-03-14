import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Loader2, HandCoins } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';
import { LedgerEntry } from '../types';

interface LedgerEntryFormProps {
  ledgerId: string;
  entry?: LedgerEntry | null;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  language: Language;
}

export default function LedgerEntryForm({ ledgerId, entry, onClose, onSuccess, userId, language }: LedgerEntryFormProps) {
  const [amount, setAmount] = useState(entry ? entry.amount.toString() : '');
  const [type, setType] = useState<'give' | 'take' | 'repay'>(entry ? entry.type : 'give');
  const [description, setDescription] = useState(entry ? entry.description : '');
  const [note, setNote] = useState(entry ? entry.note || '' : '');
  const [date, setDate] = useState(entry ? entry.date : new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (entry) {
        const { error: supabaseError } = await supabase
          .from('ledger_entries')
          .update({
            type,
            amount: parseFloat(amount),
            description,
            note,
            date
          })
          .eq('id', entry.id);
        if (supabaseError) throw supabaseError;
      } else {
        const { error: supabaseError } = await supabase.from('ledger_entries').insert([{
          user_id: userId,
          ledger_id: ledgerId,
          type,
          amount: parseFloat(amount),
          description,
          note,
          date
        }]);
        if (supabaseError) throw supabaseError;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'Failed to save entry'}.`);
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
          <h2 className="text-2xl font-bold text-[var(--text-main)]">
            {entry ? t.edit_entry : t.add_entry}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setType('give')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'give' ? 'bg-red-500 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
            >
              {t.give}
            </button>
            <button
              type="button"
              onClick={() => setType('take')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'take' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
            >
              {t.take}
            </button>
            <button
              type="button"
              onClick={() => setType('repay')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'repay' ? 'bg-indigo-500 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
            >
              {t.repay}
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
              placeholder="Details about this transaction..."
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
            {loading ? <Loader2 className="animate-spin" /> : <HandCoins size={20} />}
            {t.save}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
