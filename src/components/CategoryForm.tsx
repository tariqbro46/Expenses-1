import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Loader2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';

interface CategoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  language: Language;
}

export default function CategoryForm({ onClose, onSuccess, userId, language }: CategoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase.from('custom_categories').insert([{
        user_id: userId,
        name,
        type,
        icon: 'Tag'
      }]);

      if (supabaseError) throw supabaseError;
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'Failed to save category'}.`);
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
        <div className="flex justify-between items-center px-8 pt-4 pb-4 border-b">
          <h2 className="text-2xl font-bold text-[var(--text-main)]">{t.add_category}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
            >
              {t.income}
            </button>
            <button
              type="button"
              onClick={() => setType('both')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'both' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}
            >
              {t.both}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.category_name}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Education, Rent"
              className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
              required
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
            {loading ? <Loader2 className="animate-spin" /> : <Tag size={20} />}
            {t.save}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
