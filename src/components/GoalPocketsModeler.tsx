'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT, formatBDTLarge } from '@/lib/calculations';
import {
  Target,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const GoalPocketsModeler: React.FC = () => {
  const pockets = useLedgerStore((state) => state.pockets);
  const updatePocketContribution = useLedgerStore((state) => state.updatePocketContribution);
  const deletePocket = useLedgerStore((state) => state.deletePocket);
  const setAddPocketModalOpen = useLedgerStore((state) => state.setAddPocketModalOpen);
  const setDPSCalculatorModalOpen = useLedgerStore((state) => state.setDPSCalculatorModalOpen);
  const getRunway = useLedgerStore((state) => state.getRunway);

  const runway = getRunway();
  const {
    pocketCalculations,
    totalPlannedPockets,
    surplusScalingFactor,
    projectedSurplus,
  } = runway;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-lg shadow-black/20">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Goal Pockets & DPS Compounding Engine
              </h3>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Runway Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Completion horizons dynamically constrained by projected monthly surplus (Scaling Factor α)
            </p>
          </div>
        </div>

        {/* Global Scaling Factor Badge & Add Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-xs">
            <span className="text-slate-400">Runway Surplus Pool:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatBDT(projectedSurplus)}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Scaling α:</span>
            <span
              className={`font-mono font-bold ${
                surplusScalingFactor >= 1
                  ? 'text-emerald-400'
                  : surplusScalingFactor > 0
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {(surplusScalingFactor * 100).toFixed(1)}%
            </span>
          </div>

          <button
            onClick={() => setAddPocketModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Pocket</span>
          </button>
        </div>
      </div>

      {/* Goal Pockets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pocketCalculations.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-slate-800 text-slate-400">
            <PiggyBank className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium">No goal pockets active.</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a pocket to model wedding, gadget, vehicle, or retirement targets.
            </p>
          </div>
        ) : (
          pocketCalculations.map((pCalc) => {
            const { pocket, plannedContribution, effectiveContribution, monthsToComplete, projectedDate, isStalled, dpsMaturityValue, dpsTotalInterest, dpsTotalDeposited } = pCalc;

            const progressPct = pocket.target_bdt > 0
              ? Math.min(100, (((pocket.current_saved_bdt || 0)) / pocket.target_bdt) * 100)
              : 0;

            const isFullyFunded = surplusScalingFactor >= 1.0;

            return (
              <div
                key={pocket.id}
                className={`relative rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                  isStalled
                    ? 'border-rose-800/60 bg-rose-950/15'
                    : !isFullyFunded
                    ? 'border-amber-800/50 bg-amber-950/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                } shadow-lg shadow-black/20`}
              >
                {/* Pocket Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {pocket.name}
                        </h4>
                        {pocket.isDps && (
                          <span className="rounded bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                            DPS {pocket.dpsAnnualRatePercent || 8}% p.a.
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {pocket.item}
                      </p>
                    </div>

                    <button
                      onClick={() => deletePocket(pocket.id)}
                      title="Delete Pocket"
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Target & Current Progress */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Target Goal
                      </span>
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {formatBDT(pocket.target_bdt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Saved So Far
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        {formatBDT(pocket.current_saved_bdt || 0)} ({progressPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Live Contribution Slider (Bonus Feature 1) */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">
                        Planned Contribution (C<sub>i</sub>):
                      </span>
                      <span className="font-mono font-bold text-white">
                        {formatBDT(plannedContribution)}/mo
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={plannedContribution}
                      onChange={(e) =>
                        updatePocketContribution(pocket.id, parseFloat(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />

                    {/* Effective Allocation under Surplus Scaling Constraint */}
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-xs font-mono">
                      <span className="text-slate-400">Effective (C<sub>i</sub> × α):</span>
                      <span
                        className={`font-bold ${
                          effectiveContribution > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatBDT(effectiveContribution)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Target Completion Horizon */}
                  <div className="mt-3.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-300">Target Horizon:</span>
                    </div>

                    {isStalled ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Goal Stalled (Zero Runway Surplus)</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-white tracking-wide">
                          {projectedDate}
                        </span>
                        <span className="font-mono text-emerald-400 font-medium">
                          {monthsToComplete} mo{monthsToComplete && monthsToComplete > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* DPS Compounding Teaser & Deep-Dive Button */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] font-mono">
                    <span className="text-slate-400 block text-[10px]">
                      Maturity w/ DPS Compounding:
                    </span>
                    <span className="font-bold text-indigo-300">
                      {formatBDT(dpsMaturityValue)}
                    </span>
                    <span className="text-[10px] text-emerald-400 ml-1">
                      (+{formatBDT(dpsTotalInterest)} int)
                    </span>
                  </div>

                  <button
                    onClick={() => setDPSCalculatorModalOpen(true, pocket.id)}
                    className="flex items-center gap-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium text-indigo-300 transition"
                  >
                    <Calculator className="h-3 w-3" />
                    <span>DPS Schedule</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
