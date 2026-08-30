'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { X, Target, PiggyBank, Percent, Banknote } from 'lucide-react';

export const AddPocketModal: React.FC = () => {
  const isAddPocketModalOpen = useLedgerStore((state) => state.isAddPocketModalOpen);
  const setAddPocketModalOpen = useLedgerStore((state) => state.setAddPocketModalOpen);
  const addPocket = useLedgerStore((state) => state.addPocket);
  const dpsAnnualRatePercent = useLedgerStore((state) => state.dpsAnnualRatePercent);

  const [name, setName] = useState('');
  const [item, setItem] = useState('');
  const [targetBdt, setTargetBdt] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [currentSaved, setCurrentSaved] = useState('0');
  const [isDps, setIsDps] = useState(true);
  const [customDpsRate, setCustomDpsRate] = useState(dpsAnnualRatePercent.toString());

  if (!isAddPocketModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetBdt);
    const parsedMonthly = parseFloat(monthlyContribution);
    const parsedSaved = parseFloat(currentSaved) || 0;
    const parsedRate = parseFloat(customDpsRate) || dpsAnnualRatePercent;

    if (isNaN(parsedTarget) || parsedTarget <= 0 || isNaN(parsedMonthly) || parsedMonthly <= 0) {
      alert('Please enter valid target and monthly contribution amounts.');
      return;
    }

    addPocket({
      name: name.trim() || 'New Goal',
      item: item.trim() || 'Target Item',
      target_bdt: parsedTarget,
      monthly_contribution_bdt: parsedMonthly,
      current_saved_bdt: parsedSaved,
      isDps,
      dpsAnnualRatePercent: parsedRate,
    });

    setName('');
    setItem('');
    setTargetBdt('');
    setMonthlyContribution('');
    setCurrentSaved('0');
    setAddPocketModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        
        <button
          onClick={() => setAddPocketModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Create New Goal Pocket</h2>
            <p className="text-xs text-slate-400">Model savings horizon & DPS future value compounding</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Pocket / Goal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wedding, Laptop, Emergency Fund, Umrah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Description / Specific Item
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MacBook Pro M3, Sena Malancha Hall Booking"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Target Amount (BDT)
              </label>
              <input
                type="number"
                step="1000"
                required
                placeholder="e.g. 150000"
                value={targetBdt}
                onChange={(e) => setTargetBdt(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Planned Monthly (C<sub>i</sub>)
              </label>
              <input
                type="number"
                step="500"
                required
                placeholder="e.g. 10000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Already Saved (BDT)
              </label>
              <input
                type="number"
                step="500"
                placeholder="0"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-300 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                DPS Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.25"
                value={customDpsRate}
                onChange={(e) => setCustomDpsRate(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-indigo-300 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDpsToggle"
              checked={isDps}
              onChange={(e) => setIsDps(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isDpsToggle" className="text-xs text-slate-300 cursor-pointer">
              Enable DPS Monthly Compounding Simulation for this pocket
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAddPocketModalOpen(false)}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              Create Pocket
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
