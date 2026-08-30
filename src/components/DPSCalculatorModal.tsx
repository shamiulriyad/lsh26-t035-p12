'use client';

import React, { useState, useEffect } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { calculateDPSSchedule, formatBDT } from '@/lib/calculations';
import {
  Calculator,
  X,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export const DPSCalculatorModal: React.FC = () => {
  const isDPSCalculatorModalOpen = useLedgerStore((state) => state.isDPSCalculatorModalOpen);
  const selectedPocketForDPS = useLedgerStore((state) => state.selectedPocketForDPS);
  const setDPSCalculatorModalOpen = useLedgerStore((state) => state.setDPSCalculatorModalOpen);
  const pockets = useLedgerStore((state) => state.pockets);
  const dpsAnnualRatePercent = useLedgerStore((state) => state.dpsAnnualRatePercent);
  const getRunway = useLedgerStore((state) => state.getRunway);

  const runway = getRunway();
  const selectedPocketCalc = runway.pocketCalculations.find(
    (p) => p.pocket.id === selectedPocketForDPS
  ) || runway.pocketCalculations[0];

  const [depositAmt, setDepositAmt] = useState<number>(
    selectedPocketCalc ? selectedPocketCalc.plannedContribution : 10000
  );
  const [ratePercent, setRatePercent] = useState<number>(
    selectedPocketCalc?.pocket.dpsAnnualRatePercent || dpsAnnualRatePercent || 8.0
  );
  const [tenureMonths, setTenureMonths] = useState<number>(
    selectedPocketCalc?.monthsToComplete ? Math.min(120, selectedPocketCalc.monthsToComplete) : 36
  );
  const [initialBalance, setInitialBalance] = useState<number>(
    selectedPocketCalc?.pocket.current_saved_bdt || 0
  );

  useEffect(() => {
    if (selectedPocketCalc) {
      setDepositAmt(selectedPocketCalc.effectiveContribution > 0 ? selectedPocketCalc.effectiveContribution : selectedPocketCalc.plannedContribution);
      setRatePercent(selectedPocketCalc.pocket.dpsAnnualRatePercent || dpsAnnualRatePercent || 8.0);
      if (selectedPocketCalc.monthsToComplete && selectedPocketCalc.monthsToComplete > 0) {
        setTenureMonths(Math.min(120, selectedPocketCalc.monthsToComplete));
      }
      setInitialBalance(selectedPocketCalc.pocket.current_saved_bdt || 0);
    }
  }, [selectedPocketForDPS, selectedPocketCalc, dpsAnnualRatePercent]);

  if (!isDPSCalculatorModalOpen) return null;

  const result = calculateDPSSchedule(depositAmt, ratePercent, tenureMonths, initialBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setDPSCalculatorModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                DPS Compounding & Wealth Growth Engine
              </h2>
              {selectedPocketCalc && (
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                  Pocket: {selectedPocketCalc.pocket.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Monthly compounded interest with paisa-precise half-up rounding (roundHalfUp(balance × r / 1200, 2))
            </p>
          </div>
        </div>

        {/* Control Sliders & Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          
          {/* Monthly Deposit */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Monthly Deposit (BDT):
            </label>
            <input
              type="number"
              step="500"
              value={depositAmt}
              onChange={(e) => setDepositAmt(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs font-mono font-bold text-white focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Annual Rate (%) */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Annual Rate (r % p.a.):
            </label>
            <input
              type="number"
              step="0.25"
              value={ratePercent}
              onChange={(e) => setRatePercent(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs font-mono font-bold text-indigo-300 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Tenure in Months */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Tenure: <span className="font-mono text-indigo-300">{tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} yrs)</span>
            </label>
            <input
              type="range"
              min="6"
              max="120"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 mt-2"
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Initial Principal (BDT):
            </label>
            <input
              type="number"
              step="1000"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 focus:border-indigo-400 focus:outline-none"
            />
          </div>

        </div>

        {/* High-Level Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Principal Deposited
            </span>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              {formatBDT(result.totalDeposited)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {formatBDT(depositAmt)}/mo × {tenureMonths} months
            </span>
          </div>

          <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Total Compound Interest Earned
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              +{formatBDT(result.totalInterest)}
            </div>
            <span className="text-[11px] text-emerald-300/80 font-mono mt-0.5 block">
              {((result.totalInterest / (result.totalDeposited || 1)) * 100).toFixed(1)}% Return on Principal
            </span>
          </div>

          <div className="rounded-xl border border-indigo-800/60 bg-indigo-950/30 p-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
              Maturity Future Value
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {formatBDT(result.maturityValue)}
            </div>
            <span className="text-[11px] text-indigo-300 font-mono mt-0.5 block">
              Compounded Monthly @ {ratePercent}% p.a.
            </span>
          </div>

        </div>

        {/* Compounding Schedule Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Compounding Timeline & Paisa Schedule
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Formula: balance_m = (balance_(m-1) + deposit) + round(balance × r / 1200, 2)
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="py-2 px-4">Month</th>
                  <th className="py-2 px-4">Monthly Deposit</th>
                  <th className="py-2 px-4">Paisa-Precise Interest</th>
                  <th className="py-2 px-4">Cumulative Interest</th>
                  <th className="py-2 px-4 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {result.schedule.map((item) => (
                  <tr key={item.month} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-4 text-slate-300 font-semibold">
                      Month {item.month}
                    </td>
                    <td className="py-2 px-4 text-slate-400">
                      {formatBDT(item.deposit)}
                    </td>
                    <td className="py-2 px-4 text-emerald-400 font-medium">
                      +{formatBDT(item.interest)}
                    </td>
                    <td className="py-2 px-4 text-indigo-300">
                      +{formatBDT(item.cumulativeInterest)}
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-white">
                      {formatBDT(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setDPSCalculatorModalOpen(false)}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2 text-xs font-bold text-white transition"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
