'use client';

import React, { useState, useEffect } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { calculateDPSSchedule, formatBDT } from '@/lib/calculations';
import { Calculator } from 'lucide-react';
import { Modal, Field, Input, Button, Badge } from '@/components/ui';

export const DPSCalculatorModal: React.FC = () => {
  const isDPSCalculatorModalOpen = useLedgerStore((state) => state.isDPSCalculatorModalOpen);
  const selectedPocketForDPS = useLedgerStore((state) => state.selectedPocketForDPS);
  const setDPSCalculatorModalOpen = useLedgerStore((state) => state.setDPSCalculatorModalOpen);
  const dpsAnnualRatePercent = useLedgerStore((state) => state.dpsAnnualRatePercent);
  const getRunway = useLedgerStore((state) => state.getRunway);

  const runway = getRunway();
  const selectedPocketCalc =
    runway.pocketCalculations.find((p) => p.pocket.id === selectedPocketForDPS) ||
    runway.pocketCalculations[0];

  const [depositAmt, setDepositAmt] = useState<number>(
    selectedPocketCalc ? selectedPocketCalc.plannedContribution : 10000
  );
  const [ratePercent, setRatePercent] = useState<number>(
    selectedPocketCalc?.pocket.dpsAnnualRatePercent || dpsAnnualRatePercent || 8.0
  );
  const [tenureMonths, setTenureMonths] = useState<number>(
    selectedPocketCalc?.monthsToComplete
      ? Math.min(120, selectedPocketCalc.monthsToComplete)
      : 36
  );
  const [initialBalance, setInitialBalance] = useState<number>(
    selectedPocketCalc?.pocket.current_saved_bdt || 0
  );

  useEffect(() => {
    if (selectedPocketCalc) {
      setDepositAmt(
        selectedPocketCalc.effectiveContribution > 0
          ? selectedPocketCalc.effectiveContribution
          : selectedPocketCalc.plannedContribution
      );
      setRatePercent(
        selectedPocketCalc.pocket.dpsAnnualRatePercent || dpsAnnualRatePercent || 8.0
      );
      if (selectedPocketCalc.monthsToComplete && selectedPocketCalc.monthsToComplete > 0) {
        setTenureMonths(Math.min(120, selectedPocketCalc.monthsToComplete));
      }
      setInitialBalance(selectedPocketCalc.pocket.current_saved_bdt || 0);
    }
  }, [selectedPocketForDPS, selectedPocketCalc, dpsAnnualRatePercent]);

  if (!isDPSCalculatorModalOpen) return null;

  const result = calculateDPSSchedule(depositAmt, ratePercent, tenureMonths, initialBalance);
  const close = () => setDPSCalculatorModalOpen(false);

  return (
    <Modal
      open={isDPSCalculatorModalOpen}
      onClose={close}
      size="xl"
      icon={<Calculator className="h-5 w-5" />}
      iconClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
      title="DPS Compounding & Wealth Growth Engine"
      titleBadge={
        selectedPocketCalc && (
          <Badge tone="indigo">Pocket: {selectedPocketCalc.pocket.name}</Badge>
        )
      }
      description="Monthly-compounded interest with paisa-precise half-up rounding — roundHalfUp(balance × r / 1200, 2)."
      footer={
        <Button size="md" variant="secondary" onClick={close}>
          Close calculator
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Controls */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Monthly deposit (BDT)" htmlFor="dps-deposit">
            <Input
              id="dps-deposit"
              type="number"
              step="500"
              value={depositAmt}
              onChange={(e) => setDepositAmt(Math.max(0, parseFloat(e.target.value) || 0))}
              className="font-mono font-bold"
            />
          </Field>
          <Field label="Annual rate (r % p.a.)" htmlFor="dps-rate">
            <Input
              id="dps-rate"
              type="number"
              step="0.25"
              value={ratePercent}
              onChange={(e) => setRatePercent(Math.max(0, parseFloat(e.target.value) || 0))}
              className="font-mono font-bold text-indigo-300"
            />
          </Field>
          <Field
            label={
              <>
                Tenure:{' '}
                <span className="font-mono text-indigo-300">
                  {tenureMonths} mo ({(tenureMonths / 12).toFixed(1)} yr)
                </span>
              </>
            }
            htmlFor="dps-tenure"
          >
            <input
              id="dps-tenure"
              type="range"
              min="6"
              max="120"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(parseInt(e.target.value, 10))}
              className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-400"
            />
          </Field>
          <Field label="Initial principal (BDT)" htmlFor="dps-initial">
            <Input
              id="dps-initial"
              type="number"
              step="1000"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Math.max(0, parseFloat(e.target.value) || 0))}
              className="font-mono font-bold"
            />
          </Field>
        </div>

        {/* Result cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total principal deposited
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-slate-200">
              {formatBDT(result.totalDeposited)}
            </div>
            <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
              {formatBDT(depositAmt)}/mo × {tenureMonths} months
            </span>
          </div>
          <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Total compound interest
            </span>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
              +{formatBDT(result.totalInterest)}
            </div>
            <span className="mt-0.5 block font-mono text-[11px] text-emerald-300/80">
              {((result.totalInterest / (result.totalDeposited || 1)) * 100).toFixed(1)}% return on
              principal
            </span>
          </div>
          <div className="rounded-xl border border-indigo-800/60 bg-indigo-950/30 p-4">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
              Maturity future value
            </span>
            <div className="mt-1 font-mono text-2xl font-bold text-white">
              {formatBDT(result.maturityValue)}
            </div>
            <span className="mt-0.5 block font-mono text-[11px] text-indigo-300">
              Compounded monthly @ {ratePercent}% p.a.
            </span>
          </div>
        </div>

        {/* Schedule */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Compounding timeline & paisa schedule
            </h3>
            <span className="font-mono text-[10px] text-slate-500">
              balance_m = (balance_(m-1) + deposit) + round(balance × r / 1200, 2)
            </span>
          </div>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-slate-800 bg-slate-900 font-mono text-[11px] text-slate-400">
                <tr>
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Deposit</th>
                  <th className="px-4 py-2">Interest</th>
                  <th className="px-4 py-2">Cumulative interest</th>
                  <th className="px-4 py-2 text-right">Ending balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {result.schedule.map((row) => (
                  <tr key={row.month} className="transition hover:bg-slate-800/40">
                    <td className="px-4 py-2 font-semibold text-slate-300">Month {row.month}</td>
                    <td className="px-4 py-2 text-slate-400">{formatBDT(row.deposit)}</td>
                    <td className="px-4 py-2 font-medium text-emerald-400">
                      +{formatBDT(row.interest)}
                    </td>
                    <td className="px-4 py-2 text-indigo-300">
                      +{formatBDT(row.cumulativeInterest)}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-white">
                      {formatBDT(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};
