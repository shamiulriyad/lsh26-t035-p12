'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const WhatIfScenarioEngine: React.FC = () => {
  const whatIfCuts = useLedgerStore((state) => state.whatIfCuts);
  const setWhatIfCut = useLedgerStore((state) => state.setWhatIfCut);
  const resetWhatIfCuts = useLedgerStore((state) => state.resetWhatIfCuts);
  const getRunway = useLedgerStore((state) => state.getRunway);

  const runway = getRunway();
  const {
    categories,
    whatIfSavings,
    dailyRunRate,
    projectedSpend,
    projectedSurplus,
    surplusScalingFactor,
    spentToDate,
  } = runway;

  const hasActiveCuts = Object.keys(whatIfCuts).length > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg shadow-black/20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                "What-If" Scenario & Liquidity Optimizer
              </h3>
              <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/20">
                Live Reactive
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Apply 0% to 50% category cuts to recover cashflow runway
            </p>
          </div>
        </div>

        {hasActiveCuts && (
          <button
            onClick={resetWhatIfCuts}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Cuts</span>
          </button>
        )}
      </div>

      {/* Recovered Liquidity Live Banner */}
      <div
        className={`mb-4 rounded-xl border p-3.5 transition-all ${
          whatIfSavings > 0
            ? 'bg-gradient-to-r from-teal-950/40 via-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-md shadow-emerald-500/10'
            : 'bg-slate-950/50 border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 font-medium">
              Recovered Cashflow Liquidity:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatBDT(whatIfSavings)}
              </span>
              {whatIfSavings > 0 && spentToDate > 0 && (
                <span className="text-xs font-mono text-emerald-300">
                  (-{((whatIfSavings / spentToDate) * 100).toFixed(1)}% of MTD spend)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Optimized Burn:</span>
              <span className="text-white font-semibold">{formatBDT(dailyRunRate)}/d</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
            <div>
              <span className="text-slate-400 block text-[10px]">New Surplus:</span>
              <span className="text-emerald-400 font-semibold">{formatBDT(projectedSurplus)}</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
            <div>
              <span className="text-slate-400 block text-[10px]">Pocket Factor α:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded ${
                  surplusScalingFactor >= 1
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : surplusScalingFactor > 0
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {(surplusScalingFactor * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cut Sliders */}
      <div className="space-y-3.5">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500">
            No active categories to optimize.
          </div>
        ) : (
          categories.map((cat) => {
            const currentCut = whatIfCuts[cat.category] || 0;
            const cutPercent = Math.round(currentCut * 100);
            const recoveredFromCat = cat.total_bdt * currentCut;

            return (
              <div
                key={cat.category}
                className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {cat.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Base: {formatBDT(cat.total_bdt)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {cutPercent > 0 && (
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        +{formatBDT(recoveredFromCat)} saved
                      </span>
                    )}
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        cutPercent > 0
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cutPercent}% Cut
                    </span>
                  </div>
                </div>

                {/* Range Slider (0 to 50% in 5% steps) */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="0.50"
                    step="0.05"
                    value={currentCut}
                    onChange={(e) => setWhatIfCut(cat.category, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">50%</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Capped at 50% max realistic reduction per category</span>
        <span className="font-mono text-teal-400">Instantly Recalculates Goal Horizons</span>
      </div>
    </div>
  );
};
