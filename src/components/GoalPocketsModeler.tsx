'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader, Badge, Button, ProgressBar, EmptyState } from '@/components/ui';
import {
  Target,
  PiggyBank,
  Clock,
  AlertTriangle,
  Calculator,
  Plus,
  Trash2,
} from 'lucide-react';

export const GoalPocketsModeler: React.FC = () => {
  const updatePocketContribution = useLedgerStore((state) => state.updatePocketContribution);
  const deletePocket = useLedgerStore((state) => state.deletePocket);
  const setAddPocketModalOpen = useLedgerStore((state) => state.setAddPocketModalOpen);
  const setDPSCalculatorModalOpen = useLedgerStore((state) => state.setDPSCalculatorModalOpen);
  const getRunway = useLedgerStore((state) => state.getRunway);

  const runway = getRunway();
  const { pocketCalculations, surplusScalingFactor, projectedSurplus } = runway;

  return (
    <Card>
      <CardBody className="space-y-5">
        <CardHeader
          icon={<Target className="h-4 w-4" />}
          title={
            <span className="flex items-center gap-2">
              Goal Pockets & DPS Engine
              <Badge tone="emerald">Runway grounded</Badge>
            </span>
          }
          subtitle="Completion horizons constrained by projected monthly surplus (scaling factor α)"
          actions={
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs sm:flex">
                <span className="text-slate-500">Surplus pool</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBDT(projectedSurplus)}
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-500">α</span>
                <span
                  className={cn(
                    'font-mono font-bold',
                    surplusScalingFactor >= 1
                      ? 'text-emerald-400'
                      : surplusScalingFactor > 0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  )}
                >
                  {(surplusScalingFactor * 100).toFixed(1)}%
                </span>
              </div>
              <Button size="sm" onClick={() => setAddPocketModalOpen(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New pocket</span>
              </Button>
            </div>
          }
        />

        {pocketCalculations.length === 0 ? (
          <EmptyState
            icon={<PiggyBank className="h-5 w-5" />}
            title="No goal pockets active"
            description="Create a pocket to model wedding, gadget, vehicle, or retirement targets."
            action={
              <Button size="sm" onClick={() => setAddPocketModalOpen(true)}>
                <Plus className="h-4 w-4" />
                New pocket
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pocketCalculations.map((pCalc) => {
              const {
                pocket,
                plannedContribution,
                effectiveContribution,
                monthsToComplete,
                projectedDate,
                isStalled,
                dpsMaturityValue,
                dpsTotalInterest,
              } = pCalc;

              const progressPct =
                pocket.target_bdt > 0
                  ? Math.min(100, ((pocket.current_saved_bdt || 0) / pocket.target_bdt) * 100)
                  : 0;
              const isFullyFunded = surplusScalingFactor >= 1.0;

              return (
                <div
                  key={pocket.id}
                  className={cn(
                    'flex flex-col rounded-xl border p-4 shadow-card',
                    isStalled
                      ? 'border-rose-800/60 bg-rose-950/15'
                      : !isFullyFunded
                      ? 'border-amber-800/50 bg-amber-950/10'
                      : 'border-slate-800 bg-slate-950/60'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-bold tracking-tight text-white">
                          {pocket.name}
                        </h4>
                        {pocket.isDps && (
                          <Badge tone="indigo">
                            DPS {pocket.dpsAnnualRatePercent || 8}%
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{pocket.item}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deletePocket(pocket.id)}
                      title="Delete pocket"
                      aria-label={`Delete ${pocket.name} pocket`}
                      className="rounded p-1 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Target
                      </span>
                      <span className="font-mono text-lg font-bold text-emerald-400">
                        {formatBDT(pocket.target_bdt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-semibold uppercase text-slate-500">
                        Saved
                      </span>
                      <span className="font-mono text-xs text-slate-300">
                        {formatBDT(pocket.current_saved_bdt || 0)} ({progressPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={progressPct} className="mt-2" />

                  <div className="mt-4 border-t border-slate-800/80 pt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">
                        Planned contribution (C<sub>i</sub>)
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
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-400"
                      aria-label={`${pocket.name} monthly contribution`}
                    />
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 font-mono text-xs">
                      <span className="text-slate-500">
                        Effective (C<sub>i</sub> × α)
                      </span>
                      <span
                        className={cn(
                          'font-bold',
                          effectiveContribution > 0 ? 'text-emerald-400' : 'text-rose-400'
                        )}
                      >
                        {formatBDT(effectiveContribution)}/mo
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      Target horizon
                    </div>
                    {isStalled ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Stalled — zero runway surplus
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold tracking-wide text-white">{projectedDate}</span>
                        <span className="font-mono font-medium text-emerald-400">
                          {monthsToComplete} mo
                          {monthsToComplete && monthsToComplete > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="font-mono text-[11px]">
                      <span className="block text-[10px] text-slate-500">DPS maturity</span>
                      <span className="font-bold text-indigo-300">
                        {formatBDT(dpsMaturityValue)}
                      </span>
                      <span className="ml-1 text-[10px] text-emerald-400">
                        +{formatBDT(dpsTotalInterest)}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant="secondary"
                      className="border-indigo-500/30 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30"
                      onClick={() => setDPSCalculatorModalOpen(true, pocket.id)}
                    >
                      <Calculator className="h-3 w-3" />
                      DPS schedule
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
