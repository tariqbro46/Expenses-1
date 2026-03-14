import React from 'react';
import { motion } from 'motion/react';
import { X, Download, Share2, Wallet, Calendar, Tag, FileText, StickyNote } from 'lucide-react';
import { Transaction } from '../types';
import { translations, Language } from '../translations';
import { format, parseISO } from 'date-fns';

interface VoucherProps {
  transaction: Transaction;
  onClose: () => void;
  language: Language;
  currencySymbol: string;
}

export default function Voucher({ transaction, onClose, language, currencySymbol }: VoucherProps) {
  const t = translations[language];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ios-modal-overlay print:bg-white print:p-0">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--bg-card)] w-full max-w-lg mx-auto sm:rounded-[40px] shadow-2xl overflow-hidden border border-[var(--border-color)] print:border-none print:shadow-none print:rounded-none"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-indigo-600 text-white no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <h2 className="text-xl font-bold">Voucher</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Voucher Content */}
        <div className="p-8 space-y-8 bg-white text-slate-900 min-h-[500px] relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <h1 className="text-8xl font-black rotate-[-45deg]">PAID</h1>
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-3xl font-black text-indigo-600">Hisab Khata</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Receipt</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">Voucher No.</p>
              <p className="font-mono font-bold">#{transaction.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar size={10} /> {t.date}
              </p>
              <p className="font-bold">{format(parseISO(transaction.date), 'MMMM d, yyyy')}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 justify-end">
                <Tag size={10} /> {t.category}
              </p>
              <p className="font-bold">{transaction.category}</p>
            </div>
          </div>

          <div className="py-8 border-y-2 border-dashed border-slate-100 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FileText size={10} /> {t.description}
                </p>
                <p className="text-lg font-medium">{transaction.description || 'No description provided'}</p>
              </div>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${transaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {t[transaction.type as keyof typeof t]}
              </div>
            </div>

            {transaction.note && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                  <StickyNote size={10} /> {t.note}
                </p>
                <p className="text-sm italic text-slate-600">{transaction.note}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="space-y-4">
              <div className="w-32 h-12 border-b border-slate-200 flex items-end justify-center pb-1">
                <p className="text-[10px] text-slate-300 font-bold uppercase">Signature</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t.amount}</p>
              <p className={`text-4xl font-black ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currencySymbol}{Number(transaction.amount).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-8 text-center relative z-10">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Thank you for using Hisab Khata</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-[var(--border-color)] flex gap-3 no-print">
          <button 
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Download size={20} /> {t.download_pdf}
          </button>
          <button className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
