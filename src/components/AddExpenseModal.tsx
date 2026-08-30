'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { X, PlusCircle, Calendar, Tag, Store, Banknote } from 'lucide-react';

export const AddExpenseModal: React.FC = () => {
  const isAddExpenseModalOpen = useLedgerStore((state) => state.isAddExpenseModalOpen);
  const setAddExpenseModalOpen = useLedgerStore((state) => state.setAddExpenseModalOpen);
  const addExpense = useLedgerStore((state) => state.addExpense);
  const today = useLedgerStore((state) => state.today);

  const [date, setDate] = useState(today);
  const [shop, setShop] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!isAddExpenseModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    addExpense({
      date,
      shop: shop.trim() || 'Dhaka Merchant',
      category,
      amount_bdt: parsedAmount,
      notes: notes.trim() || undefined,
    });

    setShop('');
    setAmount('');
    setNotes('');
    setAddExpenseModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        
        <button
          onClick={() => setAddExpenseModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Add New Ledger Expense</h2>
            <p className="text-xs text-slate-400">Record a manual cash or card transaction in Dhaka BDT</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Shop / Merchant Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unimart, Sultans Dine, DESCO, Landlord"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="Rent">Rent</option>
                <option value="Food">Food</option>
                <option value="Groceries">Groceries</option>
                <option value="Utilities">Utilities</option>
                <option value="Mobile">Mobile</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Commute">Commute</option>
                <option value="Health">Health</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Amount (BDT ৳)
              </label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch with team, bKash TrxID, monthly grocery haul"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAddExpenseModalOpen(false)}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              Save Expense
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
