'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, ProgressBar } from '@/components/ui';
import {
  Banknote,
  TrendingDown,
  Activity,
  ShieldCheck,
  AlertOctagon,
  Flame,
} from 'lucide-react';

type KpiCardProps = {
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  value: React.ReactNode;
  footLeft: React.ReactNode;
  footRight: React.ReactNode;
  footRightClass?: string;
  progress: number;
  barClass: string;
  tone?: React.ComponentProps<typeof Card>['tone'];
};

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  icon,
  iconClass,
  value,
  footLeft,
  footRight,
  footRightClass,
  progress,
  barClass,
  tone = 'default',
}) => (
  <Card tone={tone} interactive className="flex flex-col justify-between p-4">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg border',
          iconClass
        )}
      >
        {icon}
      </span>
    </div>
    <div className="mt-3">
      <div className="font-mono text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{footLeft}</span>
        <span className={cn('font-mono font-medium', footRightClass)}>{footRight}</span>
      </div>
    </div>
    <ProgressBar value={progress} barClassName={barClass} className="mt-3" />
  </Card>
);

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
    dailyRunRate,
    projectedSpend,
    actualSurplus,
    isDeficit,
    surplusScalingFactor,
    totalPlannedPockets,
  } = runway;

  const spentPercentage = salaryBdt > 0 ? (spentToDate / salaryBdt) * 100 : 0;
  const projectedSpendPercentage = salaryBdt > 0 ? (projectedSpend / salaryBdt) * 100 : 0;
  const dayProgressPercentage = (elapsedDays / daysInMonth) * 100;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        label="Monthly Salary"
        icon={<Banknote className="h-4 w-4" />}
        iconClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
        value={formatBDT(salaryBdt)}
        footLeft="Planned goals"
        footRight={`${formatBDT(totalPlannedPockets)}/mo`}
        footRightClass="text-slate-300"
        progress={(totalPlannedPockets / (salaryBdt || 1)) * 100}
        barClass="bg-emerald-400"
      />

      <KpiCard
        label="Spent to Date"
        icon={<TrendingDown className="h-4 w-4" />}
        iconClass="border-sky-500/20 bg-sky-500/10 text-sky-400"
        value={formatBDT(spentToDate)}
        footLeft={`Progress ${elapsedDays}/${daysInMonth}d`}
        footRight={`${spentPercentage.toFixed(1)}% of salary`}
        footRightClass="text-sky-400"
        progress={spentPercentage}
        barClass="bg-sky-400"
      />

      <KpiCard
        label="Daily Burn Rate (R)"
        icon={<Flame className="h-4 w-4" />}
        iconClass="border-amber-500/20 bg-amber-500/10 text-amber-400"
        value={
          <>
            {formatBDT(dailyRunRate)}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </>
        }
        footLeft={`${remainingDays} days left`}
        footRight={whatIfSavings > 0 ? `-${formatBDT(whatIfSavings)} saved` : 'Unhedged'}
        footRightClass="text-amber-400"
        progress={dayProgressPercentage}
        barClass="bg-amber-400"
      />

      <KpiCard
        label="Projected Spend"
        icon={<Activity className="h-4 w-4" />}
        iconClass="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
        value={formatBDT(projectedSpend)}
        footLeft={`R × ${daysInMonth} days`}
        footRight={`${projectedSpendPercentage.toFixed(1)}% of salary`}
        footRightClass={projectedSpendPercentage > 100 ? 'text-rose-400' : 'text-indigo-300'}
        progress={projectedSpendPercentage}
        barClass={projectedSpendPercentage > 100 ? 'bg-rose-500' : 'bg-indigo-400'}
      />

      <KpiCard
        tone={isDeficit ? 'rose' : 'emerald'}
        label="Runway Position"
        icon={
          isDeficit ? <AlertOctagon className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />
        }
        iconClass={
          isDeficit
            ? 'border-rose-500/30 bg-rose-500/20 text-rose-400'
            : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
        }
        value={
          <span className={isDeficit ? 'text-rose-400' : 'text-emerald-400'}>
            {formatBDT(actualSurplus)}
          </span>
        }
        footLeft="Pocket scaling (α)"
        footRight={`${(surplusScalingFactor * 100).toFixed(1)}%`}
        footRightClass={
          surplusScalingFactor >= 1
            ? 'text-emerald-300'
            : surplusScalingFactor > 0
            ? 'text-amber-300'
            : 'text-rose-300'
        }
        progress={Math.max(0, surplusScalingFactor * 100)}
        barClass={isDeficit ? 'bg-rose-500' : 'bg-emerald-400'}
      />
    </div>
  );
};
