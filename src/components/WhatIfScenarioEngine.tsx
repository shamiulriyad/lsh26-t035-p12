'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader, Badge, Button, EmptyState } from '@/components/ui';
import { SlidersHorizontal, RotateCcw, ArrowRight } from 'lucide-react';

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
    projectedSurplus,
    surplusScalingFactor,
    spentToDate,
  } = runway;

  const hasActiveCuts = Object.keys(whatIfCuts).length > 0;

  return (
    <Card>
      <CardBody className="space-y-4">
        <CardHeader
          icon={<SlidersHorizontal className="h-4 w-4" />}
          iconClassName="border-teal-500/20 bg-teal-500/10 text-teal-400"
          title={
            <span className="flex items-center gap-2">
              Liquidity Optimizer
              <Badge tone="teal">Live reactive</Badge>
            </span>
          }
          subtitle="Apply 0–50% category cuts to recover cashflow runway"
          actions={
            hasActiveCuts && (
              <Button size="xs" variant="secondary" onClick={resetWhatIfCuts}>
                <RotateCcw className="h-3 w-3" />
                Reset cuts
              </Button>
            )
          }
        />

        {/* Recovered liquidity banner */}
        <div
          className={cn(
            'rounded-xl border p-4 transition-colors',
            whatIfSavings > 0
              ? 'border-emerald-500/40 bg-emerald-950/25'
              : 'border-slate-800 bg-slate-950/50'
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-slate-400">
                Recovered cashflow liquidity
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-bold text-emerald-400">
                  {formatBDT(whatIfSavings)}
                </span>
                {whatIfSavings > 0 && spentToDate > 0 && (
                  <span className="font-mono text-xs text-emerald-300">
                    -{((whatIfSavings / spentToDate) * 100).toFixed(1)}% of MTD spend
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div>
                <span className="block text-[10px] text-slate-500">Optimized burn</span>
                <span className="font-semibold text-white">{formatBDT(dailyRunRate)}/d</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              <div>
                <span className="block text-[10px] text-slate-500">New surplus</span>
                <span className="font-semibold text-emerald-400">
                  {formatBDT(projectedSurplus)}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              <div>
                <span className="block text-[10px] text-slate-500">Pocket α</span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 font-bold',
                    surplusScalingFactor >= 1
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : surplusScalingFactor > 0
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  )}
                >
                  {(surplusScalingFactor * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-2.5">
          {categories.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal className="h-5 w-5" />}
              title="No categories to optimize"
              description="Log some spending first, then model cuts here."
            />
          ) : (
            categories.map((cat) => {
              const currentCut = whatIfCuts[cat.category] || 0;
              const cutPercent = Math.round(currentCut * 100);
              const recoveredFromCat = cat.total_bdt * currentCut;

              return (
                <div
                  key={cat.category}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 transition hover:border-slate-700"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-xs font-semibold text-slate-200">
                        {cat.category}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-slate-500">
                        base {formatBDT(cat.total_bdt)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      {cutPercent > 0 && (
                        <span className="font-mono text-xs font-semibold text-emerald-400">
                          +{formatBDT(recoveredFromCat)}
                        </span>
                      )}
                      <span
                        className={cn(
                          'rounded px-2 py-0.5 font-mono text-xs font-bold',
                          cutPercent > 0
                            ? 'border border-teal-500/30 bg-teal-500/20 text-teal-300'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {cutPercent}% cut
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-slate-500">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="0.50"
                      step="0.05"
                      value={currentCut}
                      onChange={(e) =>
                        setWhatIfCut(cat.category, parseFloat(e.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-teal-400"
                      aria-label={`${cat.category} spending cut`}
                    />
                    <span className="font-mono text-[10px] text-slate-500">50%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
          <span>Capped at 50% max reduction per category</span>
          <span className="font-mono text-teal-400">Recalculates goal horizons instantly</span>
        </div>
      </CardBody>
    </Card>
  );
};
