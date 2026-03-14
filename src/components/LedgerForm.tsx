import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Loader2, UserPlus, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { Ledger } from '../types';
import { translations, Language } from '../translations';

interface LedgerFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  ledger?: Ledger;
  language: Language;
}

export default function LedgerForm({ onClose, onSuccess, userId, ledger, language }: LedgerFormProps) {
  const [name, setName] = useState(ledger?.name || '');
  const [phone, setPhone] = useState(ledger?.phone || '');
  const [relation, setRelation] = useState(ledger?.relation || '');
  const [address, setAddress] = useState(ledger?.address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (ledger) {
        const { error: supabaseError } = await supabase
          .from('ledgers')
          .update({
            name,
            phone,
            relation,
            address
          })
          .eq('id', ledger.id);
        if (supabaseError) throw supabaseError;
      } else {
        const { error: supabaseError } = await supabase.from('ledgers').insert([{
          user_id: userId,
          name,
          phone,
          relation,
          address
        }]);
        if (supabaseError) throw supabaseError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'Failed to save ledger'}.`);
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
            {ledger ? t.edit_ledger : t.add_ledger}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.name}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahim Uddin"
              className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.phone}</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.relation}</label>
              <input 
                type="text" 
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Friend, Client"
                className="bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">{t.address}</label>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full Address"
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-color)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-[var(--bg-card)] text-[var(--text-main)]"
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
            {loading ? <Loader2 className="animate-spin" /> : (ledger ? <Save size={20} /> : <UserPlus size={20} />)}
            {ledger ? t.update_ledger : t.add_ledger}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
