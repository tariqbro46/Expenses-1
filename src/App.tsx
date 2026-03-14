import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Charts from './components/Charts';
import TransactionForm from './components/TransactionForm';
import LedgerForm from './components/LedgerForm';
import LedgerEntryForm from './components/LedgerEntryForm';
import StatementView from './components/StatementView';
import Profile from './components/Profile';
import CreatePage from './components/CreatePage';
import { Transaction, Ledger, LedgerEntry, CATEGORIES, CustomCategory } from './types';
import { translations, Language, currencies, CurrencyCode } from './translations';
import { 
  Wallet, 
  Plus, 
  LogOut, 
  Download, 
  Filter, 
  Calendar,
  Trash2,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  HandCoins,
  ChevronRight,
  Phone,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  UserCircle,
  PlusCircle,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'create' | 'profile'>('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState<Language>((localStorage.getItem('language') as Language) || 'en');
  const [currency, setCurrency] = useState<CurrencyCode>((localStorage.getItem('currency') as CurrencyCode) || 'USD');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTxForm, setShowTxForm] = useState(false);
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [activeStatement, setActiveStatement] = useState<'income' | 'expense' | 'pauna' | 'dena' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'ledger' | 'entry' | 'transaction', id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    const [txRes, ledgerRes, entryRes, catRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('ledgers').select('*').order('name'),
      supabase.from('ledger_entries').select('*').order('date', { ascending: false }),
      supabase.from('custom_categories').select('*')
    ]);

    setTransactions(txRes.data || []);
    setLedgers(ledgerRes.data || []);
    setLedgerEntries(entryRes.data || []);
    setCustomCategories(catRes.data || []);
    setLoading(false);
  };

  const handleDeleteLedger = async (id: string) => {
    try {
      // First delete all entries for this ledger
      await supabase.from('ledger_entries').delete().eq('ledger_id', id);
      const { error } = await supabase.from('ledgers').delete().eq('id', id);
      if (error) throw error;
      setSelectedLedgerId(null);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('ledger_entries').delete().eq('id', id);
      if (error) throw error;
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateLedgerBalance = (ledgerId: string) => {
    const entries = ledgerEntries.filter(e => e.ledger_id === ledgerId);
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedEntries.reduce((sum, e) => {
      const amount = Number(e.amount);
      if (e.type === 'give') return sum + amount;
      if (e.type === 'take') return sum - amount;
      if (e.type === 'repay') {
        if (sum > 0) return sum - amount;
        if (sum < 0) return sum + amount;
      }
      return sum;
    }, 0);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  
  const ledgerBalances = ledgers.map(l => ({ ...l, balance: calculateLedgerBalance(l.id) }));
  const totalPauna = ledgerBalances.filter(l => l.balance > 0).reduce((sum, l) => sum + l.balance, 0);
  const totalDena = Math.abs(ledgerBalances.filter(l => l.balance < 0).reduce((sum, l) => sum + l.balance, 0));

  const t = translations[language];
  const curr = currencies[currency];

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="flex items-center gap-2 mb-10 px-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Hisab Khata</h1>
        </div>

        <nav className="flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item w-full ${activeTab === 'dashboard' ? 'active' : 'inactive'}`}
          >
            <LayoutDashboard size={20} />
            <span>{t.dashboard}</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`nav-item w-full ${activeTab === 'ledger' ? 'active' : 'inactive'}`}
          >
            <BookOpen size={20} />
            <span>{t.ledger}</span>
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`nav-item w-full ${activeTab === 'create' ? 'active' : 'inactive'}`}
          >
            <PlusCircle size={20} />
            <span>{t.create}</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`nav-item w-full ${activeTab === 'profile' ? 'active' : 'inactive'}`}
          >
            <UserCircle size={20} />
            <span>{t.profile}</span>
          </button>
        </nav>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="nav-item w-full inactive mt-auto"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm md:hidden bg-[var(--bg-card)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Hisab Khata</h1>
          </div>
          <button onClick={() => setActiveTab('profile')} className="text-[var(--text-muted)]">
            <UserCircle size={24} />
          </button>
        </header>

        <main className="px-4 py-6 md:px-10 md:py-10 max-w-5xl mx-auto w-full space-y-6 pb-32 md:pb-10">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Desktop Header Title */}
              <div className="hidden md:flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-[var(--text-main)]">{t.dashboard}</h2>
                <button 
                  onClick={() => setShowTxForm(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
                >
                  <Plus size={20} /> {t.add_transaction}
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div 
                  onClick={() => setActiveStatement('income')}
                  className="bg-emerald-500 p-4 md:p-6 rounded-3xl text-white shadow-lg shadow-emerald-100 cursor-pointer hover:scale-105 transition-transform"
                >
                  <p className="text-[10px] md:text-xs font-bold uppercase opacity-80 mb-1">{t.income}</p>
                  <h2 className="text-xl md:text-3xl font-bold">{curr.symbol}{totalIncome.toLocaleString()}</h2>
                </div>
                <div 
                  onClick={() => setActiveStatement('expense')}
                  className="bg-rose-500 p-4 md:p-6 rounded-3xl text-white shadow-lg shadow-rose-100 cursor-pointer hover:scale-105 transition-transform"
                >
                  <p className="text-[10px] md:text-xs font-bold uppercase opacity-80 mb-1">{t.expense}</p>
                  <h2 className="text-xl md:text-3xl font-bold">{curr.symbol}{totalExpense.toLocaleString()}</h2>
                </div>
                <div 
                  onClick={() => setActiveStatement('pauna')}
                  className="bg-blue-500 p-4 md:p-6 rounded-3xl text-white shadow-lg shadow-blue-100 cursor-pointer hover:scale-105 transition-transform"
                >
                  <p className="text-[10px] md:text-xs font-bold uppercase opacity-80 mb-1">{t.pauna}</p>
                  <h2 className="text-xl md:text-3xl font-bold">{curr.symbol}{totalPauna.toLocaleString()}</h2>
                </div>
                <div 
                  onClick={() => setActiveStatement('dena')}
                  className="bg-orange-500 p-4 md:p-6 rounded-3xl text-white shadow-lg shadow-orange-100 cursor-pointer hover:scale-105 transition-transform"
                >
                  <p className="text-[10px] md:text-xs font-bold uppercase opacity-80 mb-1">{t.dena}</p>
                  <h2 className="text-xl md:text-3xl font-bold">{curr.symbol}{totalDena.toLocaleString()}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Charts transactions={transactions} />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-lg font-bold text-[var(--text-main)]">{t.recent_transactions}</h2>
                    <button className="text-indigo-600 text-sm font-bold">{t.see_all}</button>
                  </div>

                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((t, idx) => (
                      <div key={`tx-${t.id}-${idx}`} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-indigo-100 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-main)] text-sm">{t.category}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">{format(parseISO(t.date), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{curr.symbol}{Number(t.amount).toLocaleString()}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete({ type: 'transaction', id: t.id });
                            }}
                            className="hidden group-hover:block p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ledger' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-black text-[var(--text-main)]">{t.ledger_account}</h2>
                <button onClick={() => setShowLedgerForm(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100">
                  <Plus size={20} /> {t.add_ledger}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {ledgerBalances.map((l, idx) => (
                  <div 
                    key={`ledger-${l.id}-${idx}`} 
                    onClick={() => setSelectedLedgerId(l.id)}
                    className="glass-card p-6 rounded-3xl flex flex-col hover:border-indigo-100 transition-all cursor-pointer hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center text-[var(--text-muted)]">
                        <Users size={24} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${l.balance > 0 ? 'bg-blue-100 text-blue-700' : l.balance < 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                        {l.balance > 0 ? (language === 'bn' ? 'পাওনা' : 'Receivable') : l.balance < 0 ? (language === 'bn' ? 'দেনা' : 'Payable') : (language === 'bn' ? 'নীল' : 'Nil')}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-main)] mb-1">{l.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-1">{l.phone || 'No phone'}</p>
                    {l.relation && <p className="text-xs text-[var(--text-muted)] mb-1 italic">{l.relation}</p>}
                    {l.address && <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-1">{l.address}</p>}
                    <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Balance</span>
                      <span className={`text-xl font-black ${l.balance > 0 ? 'text-blue-600' : l.balance < 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                        {curr.symbol}{Math.abs(l.balance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'create' && (
            <CreatePage userId={session.user.id} onSuccess={fetchData} language={language} />
          )}

          {activeTab === 'profile' && (
            <Profile 
              session={session} 
              currentTheme={theme} 
              onThemeChange={setTheme} 
              language={language}
              onLanguageChange={(l) => { setLanguage(l); localStorage.setItem('language', l); }}
              currency={currency}
              onCurrencyChange={(c) => { setCurrency(c); localStorage.setItem('currency', c); }}
            />
          )}
        </main>

        {/* FAB (Mobile Only) */}
        {activeTab !== 'profile' && activeTab !== 'create' && (
          <button 
            onClick={() => activeTab === 'dashboard' ? setShowTxForm(true) : setShowLedgerForm(true)}
            className="fab"
          >
            <Plus size={28} />
          </button>
        )}

        {/* Bottom Nav (Mobile Only) */}
        <nav className="mobile-bottom-nav">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-[var(--text-muted)]'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold">{t.dashboard}</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'ledger' ? 'text-indigo-600' : 'text-[var(--text-muted)]'}`}
          >
            <BookOpen size={24} />
            <span className="text-[10px] font-bold">{t.ledger}</span>
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'create' ? 'text-indigo-600' : 'text-[var(--text-muted)]'}`}
          >
            <PlusCircle size={24} />
            <span className="text-[10px] font-bold">{t.create}</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-[var(--text-muted)]'}`}
          >
            <UserCircle size={24} />
            <span className="text-[10px] font-bold">{t.profile}</span>
          </button>
        </nav>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTxForm && (
          <TransactionForm 
            userId={session.user.id} 
            onClose={() => setShowTxForm(false)} 
            onSuccess={fetchData} 
            language={language}
          />
        )}
        {showLedgerForm && (
          <LedgerForm 
            userId={session.user.id} 
            onClose={() => setShowLedgerForm(false)} 
            onSuccess={fetchData} 
            language={language}
          />
        )}
        {editingLedger && (
          <LedgerForm 
            userId={session.user.id} 
            ledger={editingLedger}
            onClose={() => setEditingLedger(null)} 
            onSuccess={fetchData} 
            language={language}
          />
        )}
        {selectedLedgerId && (
          <div className="ios-modal-overlay">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="ios-modal-content h-[92vh]"
            >
              <div className="ios-modal-handle" />
              <div className="p-4 md:p-6 border-b flex justify-between items-center bg-[var(--bg-main)] sm:rounded-t-3xl border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedLedgerId(null)} className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                  </button>
                  <div>
                    <h2 className="font-bold text-lg md:text-xl text-[var(--text-main)]">{ledgers.find(l => l.id === selectedLedgerId)?.name}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{t.transaction_history}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingLedger(ledgers.find(l => l.id === selectedLedgerId) || null)}
                    className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors text-indigo-600"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => setConfirmDelete({ type: 'ledger', id: selectedLedgerId })}
                    className="p-2 hover:bg-[var(--accent-soft)] rounded-full transition-colors text-rose-600"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setShowEntryForm(true)} 
                    className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 text-sm"
                  >
                    {t.add_entry}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                {ledgerEntries.filter(e => e.ledger_id === selectedLedgerId).map((e, idx) => (
                  <div key={`entry-${e.id}-${idx}`} className="bg-[var(--bg-main)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border-color)] group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          {t[e.type as keyof typeof t]}
                        </p>
                        <div className="hidden group-hover:flex items-center gap-2">
                          <button onClick={() => setEditingEntry(e)} className="text-indigo-600 hover:text-indigo-800 p-1">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setConfirmDelete({ type: 'entry', id: e.id })} className="text-rose-600 hover:text-rose-800 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)]">{format(parseISO(e.date), 'MMM d, yyyy')}</p>
                      {e.description && <p className="text-xs text-[var(--text-main)] mt-1 opacity-80">{e.description}</p>}
                      {e.note && <p className="text-[10px] text-indigo-500 mt-1 italic font-medium">Note: {e.note}</p>}
                    </div>
                    <p className={`font-bold text-lg ${e.type === 'give' ? 'text-red-600' : e.type === 'take' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {curr.symbol}{Number(e.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-indigo-600 text-white flex justify-between items-center rounded-t-[32px] sm:rounded-b-3xl">
                <span className="font-bold uppercase tracking-widest text-xs opacity-80">{t.total_balance}</span>
                <span className="text-2xl md:text-3xl font-black">{curr.symbol}{calculateLedgerBalance(selectedLedgerId).toLocaleString()}</span>
              </div>
            </motion.div>
          </div>
        )}
        {showEntryForm && selectedLedgerId && (
          <LedgerEntryForm 
            userId={session.user.id} 
            ledgerId={selectedLedgerId} 
            onClose={() => setShowEntryForm(false)} 
            onSuccess={fetchData} 
            language={language}
          />
        )}
        {editingEntry && selectedLedgerId && (
          <LedgerEntryForm 
            userId={session.user.id} 
            ledgerId={selectedLedgerId} 
            entry={editingEntry}
            onClose={() => setEditingEntry(null)} 
            onSuccess={fetchData} 
            language={language}
          />
        )}
        {activeStatement && (
          <StatementView 
            type={activeStatement}
            transactions={transactions}
            ledgerEntries={ledgerEntries}
            ledgers={ledgers}
            onClose={() => setActiveStatement(null)}
            currencySymbol={curr.symbol}
            language={language}
          />
        )}

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {confirmDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--bg-card)] p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-[var(--border-color)]"
              >
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">{t.confirm_delete}</h3>
                <p className="text-[var(--text-muted)] mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-xl font-bold bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)]"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={() => {
                      if (confirmDelete.type === 'ledger') handleDeleteLedger(confirmDelete.id);
                      else if (confirmDelete.type === 'entry') handleDeleteEntry(confirmDelete.id);
                      else if (confirmDelete.type === 'transaction') handleDeleteTransaction(confirmDelete.id);
                    }}
                    className="flex-1 py-3 rounded-xl font-bold bg-rose-600 text-white"
                  >
                    {t.delete}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
