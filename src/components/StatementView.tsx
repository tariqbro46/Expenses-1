import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, ArrowUpCircle, ArrowDownCircle, Users, ChevronRight, Filter } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Transaction, LedgerEntry, Ledger } from '../types';
import { translations, Language } from '../translations';

interface StatementViewProps {
  type: 'income' | 'expense' | 'pauna' | 'dena';
  transactions: Transaction[];
  ledgerEntries: LedgerEntry[];
  ledgers: Ledger[];
  onClose: () => void;
  currencySymbol: string;
  language: Language;
}

export default function StatementView({ type, transactions, ledgerEntries, ledgers, onClose, currencySymbol, language }: StatementViewProps) {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const t = translations[language];

  const filteredData = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (type === 'income' || type === 'expense') {
      return transactions
        .filter(t => t.type === type)
        .filter(t => {
          const date = parseISO(t.date);
          return isWithinInterval(date, { start, end });
        });
    } else {
      // Pauna (Receivables) or Dena (Payables)
      return ledgerEntries.filter(e => {
        const date = parseISO(e.date);
        const withinRange = isWithinInterval(date, { start, end });
        if (!withinRange) return false;

        if (type === 'pauna') {
          // Show entries that relate to money we are owed
          return e.type === 'give' || (e.type === 'repay'); 
        } else {
          // Show entries that relate to money we owe
          return e.type === 'take' || (e.type === 'repay');
        }
      });
    }
  }, [type, transactions, ledgerEntries, startDate, endDate]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredData]);

  const getTitle = () => {
    switch (type) {
      case 'income': return `${t.income} ${t.history}`;
      case 'expense': return `${t.expense} ${t.history}`;
      case 'pauna': return t.pauna;
      case 'dena': return t.dena;
    }
  };

  return (
    <div className="ios-modal-overlay print:static print:block print:bg-white print:p-0 print-container-parent">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything except our specific print container */
          body * { visibility: hidden; }
          .print-container-parent, .print-container-parent * { visibility: visible !important; }
          
          .print-container-parent {
            position: static !important;
            display: block !important;
            visibility: visible !important;
            background: white !important;
          }
          
          /* Reset layout for print */
          .print-container { 
            position: absolute !important; 
            left: 0 !important;
            top: 0 !important;
            display: block !important; 
            width: 100% !important; 
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            transform: none !important;
          }
          
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          
          .print-header { 
            display: flex !important; 
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 30px !important; 
            border-bottom: 2px solid #000 !important; 
            padding-bottom: 20px !important; 
            visibility: visible !important;
          }
          
          .print-table { 
            display: table !important; 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 20px !important; 
            visibility: visible !important;
          }
          
          .print-table th, .print-table td { 
            border: 1px solid #000 !important; 
            padding: 10px !important; 
            text-align: left !important; 
            color: #000 !important;
            visibility: visible !important;
          }
          
          .print-table th { 
            background-color: #f1f5f9 !important; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-footer { 
            display: block !important;
            margin-top: 30px !important; 
            border-top: 2px solid #000 !important; 
            padding-top: 20px !important; 
            text-align: right !important; 
            visibility: visible !important;
          }

          /* Force black text for print */
          * { color: #000 !important; }
          .text-indigo-600 { color: #4f46e5 !important; }
        }
      `}} />
      <style>{`
        .print-only { display: none; }
      `}</style>
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="ios-modal-content h-full sm:h-[92vh] print:overflow-visible"
      >
        <div className="ios-modal-handle no-print" />
        {/* Print Only Header */}
        <div className="print-only print-header">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-indigo-600">Hisab Khata</h1>
            <p className="text-slate-500 font-bold">Financial Statement</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{getTitle()}</p>
            <p className="text-xs text-slate-400">{t.period}: {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <div className="p-4 md:p-6 border-b flex justify-between items-center bg-[var(--bg-main)] sm:rounded-t-3xl no-print border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors">
              <X size={24} />
            </button>
            <div>
              <h2 className="font-bold text-lg md:text-xl">{getTitle()}</h2>
              <p className="text-xs text-[var(--text-muted)]">Detailed Report</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
            <Calendar size={16} className="text-[var(--text-muted)]" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="border-none bg-transparent p-0 text-xs font-bold focus:ring-0 w-28"
            />
            <span className="text-[var(--text-muted)] opacity-30">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="border-none bg-transparent p-0 text-xs font-bold focus:ring-0 w-28"
            />
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="sm:hidden p-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex gap-2 overflow-x-auto no-print">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">From</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm font-bold bg-[var(--bg-main)] border-[var(--border-color)] rounded-lg p-2"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">To</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm font-bold bg-[var(--bg-main)] border-[var(--border-color)] rounded-lg p-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 print:overflow-visible">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 no-print">
              <Filter size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-medium">{t.no_records}</p>
            </div>
          ) : (
            <>
              {/* Screen Only View */}
              <div className="no-print space-y-3">
                {filteredData.map((item: any, idx) => {
                  const isTransaction = 'category' in item;
                  const ledger = !isTransaction ? ledgers.find(l => l.id === item.ledger_id) : null;

                  return (
                    <div key={`statement-item-${item.id}-${idx}`} className="bg-[var(--bg-card)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border-color)] shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isTransaction 
                            ? (item.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600')
                            : (item.type === 'give' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600')
                        }`}>
                          {isTransaction ? (
                            item.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />
                          ) : (
                            <Users size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {isTransaction ? item.category : ledger?.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {format(parseISO(item.date), 'MMM d, yyyy')} • {isTransaction ? item.description : item.description || t.ledger_account}
                          </p>
                          {item.note && <p className="text-[10px] text-indigo-500 mt-1 italic font-medium">Note: {item.note}</p>}
                        </div>
                      </div>
                      <p className={`font-bold text-lg ${
                        isTransaction 
                          ? (item.type === 'income' ? 'text-emerald-600' : 'text-rose-600')
                          : (item.type === 'give' ? 'text-blue-600' : 'text-orange-600')
                      }`}>
                        {currencySymbol}{Number(item.amount).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Print Only Table */}
              <table className="print-only print-table">
                <thead>
                  <tr>
                    <th>{t.date}</th>
                    <th>{t.category}/{t.name}</th>
                    <th>{t.description}</th>
                    <th className="text-right">{t.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item: any, idx) => {
                    const isTransaction = 'category' in item;
                    const ledger = !isTransaction ? ledgers.find(l => l.id === item.ledger_id) : null;
                    return (
                      <tr key={`print-item-${item.id}-${idx}`}>
                        <td>{format(parseISO(item.date), 'MMM d, yyyy')}</td>
                        <td className="font-bold">{isTransaction ? item.category : ledger?.name}</td>
                        <td>
                          {isTransaction ? item.description : item.description || '-'}
                          {item.note && <div className="text-[10px] italic text-slate-500">Note: {item.note}</div>}
                        </td>
                        <td className="text-right font-bold">{currencySymbol}{Number(item.amount).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="p-6 bg-slate-900 text-white flex justify-between items-center sm:rounded-b-3xl no-print">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{t.total_for_period}</p>
            <p className="text-2xl md:text-3xl font-black">{currencySymbol}{totalAmount.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            {t.download_pdf}
          </button>
        </div>

        {/* Print Only Footer */}
        <div className="print-only print-footer">
          <div className="flex justify-between items-end">
            <div className="text-left text-xs text-slate-400">
              <p>Generated on {format(new Date(), 'MMM d, yyyy HH:mm')}</p>
              <p>Hisab Khata - Your Financial Assistant</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{t.total_for_period}</p>
              <p className="text-4xl font-black text-slate-900">{currencySymbol}{totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
