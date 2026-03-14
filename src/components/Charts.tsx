import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { Transaction } from '../types';
import { format, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface ChartsProps {
  transactions: Transaction[];
}

export default function Charts({ transactions }: ChartsProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  // Pie Chart Data
  const categoryTotals = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
        ],
        borderWidth: 0,
      },
    ],
  };

  // Line Chart Data (Last 30 days)
  const last30Days = eachDayOfInterval({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const dailyTotals = last30Days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const total = expenses
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return total;
  });

  const lineData = {
    labels: last30Days.map(day => format(day, 'MMM d')),
    datasets: [
      {
        fill: true,
        label: 'Daily Spending',
        data: dailyTotals,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="h-[300px] flex items-center justify-center">
          {expenses.length > 0 ? (
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          ) : (
            <p className="text-slate-400">No data to display</p>
          )}
        </div>
      </div>
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
        <div className="h-[300px]">
          {expenses.length > 0 ? (
            <Line 
              data={lineData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true }
                }
              }} 
            />
          ) : (
            <p className="text-slate-400 flex items-center justify-center h-full">No data to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
