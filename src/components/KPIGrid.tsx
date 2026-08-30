'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import {
  Banknote,
  TrendingDown,
  Activity,
  CalendarCheck,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Flame,
} from 'lucide-react';

export const KPIGrid: React.FC = () => {
  const { salaryBdt } = useLedgerStore();
  const getRunway = useLedgerStore((state) => state.getRunway);
  const runway = getRunway();

  const {
    daysInMonth,
    elapsedDays,
    remainingDays,
    spentToDate,
    whatIfSavings,
    adjustedSpentToDate,
    dailyRunRate,
    projectedSpend,
    actualSurplus,
    projectedSurplus,
    isDeficit,
    surplusScalingFactor,
    totalPlannedPockets,
  } = runway;

  const spentPercentage = salaryBdt > 0 ? (spentToDate / salaryBdt) * 100 : 0;
  const projectedSpendPercentage = salaryBdt > 0 ? (projectedSpend / salaryBdt) * 100 : 0;
  const dayProgressPercentage = (elapsedDays / daysInMonth) * 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      
      {/* 1. Net Monthly Salary */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg shadow-black/20 flex flex-col justify-between group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monthly Salary
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Banknote className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {formatBDT(salaryBdt)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Planned Goals:</span>
            <span className="font-mono text-slate-300 font-medium">
              {formatBDT(totalPlannedPockets)}/mo
            </span>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalPlannedPockets / (salaryBdt || 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Spent to Date & Elapsed Days */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg shadow-black/20 flex flex-col justify-between group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Spent to Date
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {formatBDT(spentToDate)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Progress ({elapsedDays}/{daysInMonth}d):</span>
            <span className="font-mono text-sky-400 font-medium">
              {spentPercentage.toFixed(1)}% of Salary
            </span>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-sky-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, spentPercentage)}%` }}
          />
        </div>
      </div>

      {/* 3. Daily Run Rate (R) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg shadow-black/20 flex flex-col justify-between group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Daily Burn Rate (R)
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {formatBDT(dailyRunRate)}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{remainingDays} Days Left:</span>
            <span className="font-mono text-amber-400 font-medium">
              {whatIfSavings > 0 ? `-${formatBDT(whatIfSavings)} saved` : 'Unhedged'}
            </span>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, dayProgressPercentage)}%` }}
          />
        </div>
      </div>

      {/* 4. Projected Month-End Spend (S_projected) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg shadow-black/20 flex flex-col justify-between group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Projected Spend
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-white font-mono">
            {formatBDT(projectedSpend)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>R × {daysInMonth} Days:</span>
            <span
              className={`font-mono font-medium ${
                projectedSpendPercentage > 100 ? 'text-rose-400' : 'text-indigo-300'
              }`}
            >
              {projectedSpendPercentage.toFixed(1)}% of Salary
            </span>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              projectedSpendPercentage > 100 ? 'bg-rose-500' : 'bg-indigo-400'
            }`}
            style={{ width: `${Math.min(100, projectedSpendPercentage)}%` }}
          />
        </div>
      </div>

      {/* 5. Projected Runway Position & Scaling Factor (alpha) */}
      <div
        className={`relative overflow-hidden rounded-xl border p-4 shadow-lg shadow-black/20 flex flex-col justify-between group transition ${
          isDeficit
            ? 'border-rose-800/80 bg-rose-950/30'
            : 'border-emerald-800/60 bg-emerald-950/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Runway Position
          </span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isDeficit
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isDeficit ? (
              <AlertOctagon className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl font-bold tracking-tight font-mono ${
              isDeficit ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatBDT(actualSurplus)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pocket Scaling (α):</span>
            <span
              className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                surplusScalingFactor >= 1
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : surplusScalingFactor > 0
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {(surplusScalingFactor * 100).toFixed(1)}% ({surplusScalingFactor.toFixed(3)})
            </span>
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDeficit ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, surplusScalingFactor * 100))}%` }}
          />
        </div>
      </div>

    </div>
  );
};
