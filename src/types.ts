import { 
  Utensils, 
  ShoppingBag, 
  Car, 
  Home, 
  Zap, 
  HeartPulse, 
  Film, 
  MoreHorizontal,
  TrendingUp,
  Wallet,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  HandCoins
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'Salary', icon: ArrowUpCircle, color: 'bg-emerald-100 text-emerald-600', type: 'income' },
  { id: 'Business', icon: TrendingUp, color: 'bg-teal-100 text-teal-600', type: 'income' },
  { id: 'Food', icon: Utensils, color: 'bg-orange-100 text-orange-600', type: 'expense' },
  { id: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600', type: 'expense' },
  { id: 'Transport', icon: Car, color: 'bg-blue-100 text-blue-600', type: 'expense' },
  { id: 'Housing', icon: Home, color: 'bg-purple-100 text-purple-600', type: 'expense' },
  { id: 'Bills', icon: Zap, color: 'bg-yellow-100 text-yellow-600', type: 'expense' },
  { id: 'Health', icon: HeartPulse, color: 'bg-red-100 text-red-600', type: 'expense' },
  { id: 'Entertainment', icon: Film, color: 'bg-indigo-100 text-indigo-600', type: 'expense' },
  { id: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600', type: 'both' },
];

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface Ledger {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  address?: string;
  balance?: number;
}

export interface LedgerEntry {
  id: string;
  ledger_id: string;
  type: 'give' | 'take' | 'repay';
  amount: number;
  description: string;
  note?: string;
  date: string;
}

export interface CustomCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
}
