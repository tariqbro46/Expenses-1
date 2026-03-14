import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Users, Wallet, ArrowRight, Tag } from 'lucide-react';
import TransactionForm from './TransactionForm';
import LedgerForm from './LedgerForm';
import CategoryForm from './CategoryForm';
import { translations, Language } from '../translations';

interface CreatePageProps {
  userId: string;
  onSuccess: () => void;
  language: Language;
}

export default function CreatePage({ userId, onSuccess, language }: CreatePageProps) {
  const [showTxForm, setShowTxForm] = useState(false);
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const t = translations[language];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[var(--text-main)]">{t.create}</h2>
        <p className="text-[var(--text-muted)]">{t.create_new}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setShowTxForm(true)}
          className="glass-card p-8 rounded-[32px] flex flex-col items-start text-left group hover:border-indigo-500 transition-all"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Wallet size={32} />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">{t.transaction}</h3>
          <p className="text-[var(--text-muted)] mb-6">{t.add_transaction}</p>
          <div className="mt-auto flex items-center gap-2 text-indigo-600 font-bold">
            {t.add_now} <ArrowRight size={18} />
          </div>
        </button>

        <button 
          onClick={() => setShowLedgerForm(true)}
          className="glass-card p-8 rounded-[32px] flex flex-col items-start text-left group hover:border-indigo-500 transition-all"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">{t.ledger}</h3>
          <p className="text-[var(--text-muted)] mb-6">{t.add_ledger}</p>
          <div className="mt-auto flex items-center gap-2 text-emerald-600 font-bold">
            {t.create_now} <ArrowRight size={18} />
          </div>
        </button>

        <button 
          onClick={() => setShowCategoryForm(true)}
          className="glass-card p-8 rounded-[32px] flex flex-col items-start text-left group hover:border-indigo-500 transition-all"
        >
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Tag size={32} />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">{t.category}</h3>
          <p className="text-[var(--text-muted)] mb-6">{t.add_category}</p>
          <div className="mt-auto flex items-center gap-2 text-amber-600 font-bold">
            {t.add_now} <ArrowRight size={18} />
          </div>
        </button>
      </div>

      {showTxForm && (
        <TransactionForm 
          userId={userId} 
          onClose={() => setShowTxForm(false)} 
          onSuccess={onSuccess} 
          language={language}
        />
      )}
      {showLedgerForm && (
        <LedgerForm 
          userId={userId} 
          onClose={() => setShowLedgerForm(false)} 
          onSuccess={onSuccess} 
          language={language}
        />
      )}
      {showCategoryForm && (
        <CategoryForm 
          userId={userId} 
          onClose={() => setShowCategoryForm(false)} 
          onSuccess={onSuccess} 
          language={language}
        />
      )}
    </motion.div>
  );
}
