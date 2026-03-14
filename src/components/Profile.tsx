import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Mail, 
  Lock, 
  Palette, 
  Shield, 
  ChevronRight, 
  Check, 
  Loader2,
  Moon,
  Sun,
  Monitor,
  Circle,
  Languages,
  Coins,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Language, CurrencyCode, currencies, translations } from '../translations';

interface ProfileProps {
  session: any;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
}

export default function Profile({ 
  session, 
  currentTheme, 
  onThemeChange,
  language,
  onLanguageChange,
  currency,
  onCurrencyChange
}: ProfileProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const t = translations[language];

  const themes = [
    { id: 'light', name: t.light, icon: Sun, color: 'bg-white border-slate-200' },
    { id: 'dark', name: t.dark, icon: Moon, color: 'bg-slate-900 border-slate-800' },
  ];

  const langs = [
    { id: 'en', name: 'English' },
    { id: 'bn', name: 'বাংলা' },
    { id: 'hi', name: 'हिन्दी' },
  ];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t.password_mismatch });
      setLoading(false);
      return;
    }

    try {
      // Supabase doesn't have a direct "verify current password" method without re-auth
      // So we try to sign in again with the current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error(t.invalid_current_password);
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setMessage({ type: 'success', text: t.password_updated });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[var(--text-main)]">{t.profile}</h2>
          <p className="text-[var(--text-muted)]">{session.user.email}</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Language Selection */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Languages className="text-indigo-600" size={20} />
            {t.language}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {langs.map((l) => (
              <button
                key={l.id}
                onClick={() => onLanguageChange(l.id as Language)}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  language === l.id 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' 
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-indigo-200'
                }`}
              >
                <span className="text-sm font-bold">{l.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Currency Selection */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <Coins className="text-indigo-600" size={20} />
            {t.currency}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(currencies).map(([code, info]) => (
              <button
                key={code}
                onClick={() => onCurrencyChange(code as CurrencyCode)}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  currency === code 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' 
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-main)] hover:border-indigo-200'
                }`}
              >
                <div className="text-lg font-black mb-1">{info.symbol}</div>
                <div className="text-[10px] font-bold uppercase opacity-60">{code}</div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Theme Selection */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <Palette className="text-indigo-600" size={20} />
          {t.appearance}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                currentTheme === theme.id 
                  ? 'border-indigo-600 ring-2 ring-indigo-100 bg-[var(--accent-soft)]' 
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-indigo-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center border ${theme.color}`}>
                <theme.icon size={20} className={currentTheme === theme.id ? 'text-indigo-600' : 'text-[var(--text-muted)]'} />
              </div>
              <span className={`text-xs font-bold ${currentTheme === theme.id ? 'text-indigo-600' : 'text-[var(--text-main)]'}`}>
                {theme.name}
              </span>
              {currentTheme === theme.id && <Check size={12} className="mt-1 text-indigo-600" />}
            </button>
          ))}
        </div>
      </section>

      {/* Security Settings */}
      <section className="space-y-4 max-w-md">
        <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" size={20} />
          {t.security}
        </h3>
        <div className="glass-card p-6 rounded-[32px] space-y-6">
          <h4 className="font-bold text-[var(--text-main)]">{t.change_password}</h4>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">{t.current_password}</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-main)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">{t.new_password}</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-main)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">{t.confirm_password}</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-main)]"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
              {t.change_password}
            </button>
          </form>
        </div>
      </section>

      <div className="pt-10 border-t border-[var(--border-color)]">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
        >
          {t.sign_out}
        </button>
      </div>
    </motion.div>
  );
}
