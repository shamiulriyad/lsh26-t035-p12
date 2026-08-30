'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader, ProgressBar, EmptyState } from '@/components/ui';
import {
  PieChart,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Home,
  Utensils,
  Zap,
  Smartphone,
  Film,
  Car,
  HeartPulse,
  Tag,
  Repeat,
  Calendar,
} from 'lucide-react';

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; bar: string; icon: React.ElementType }
> = {
  Rent: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500', icon: Home },
  Food: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500', icon: Utensils },
  Groceries: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500', icon: ShoppingBag },
  Utilities: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', bar: 'bg-cyan-500', icon: Zap },
  Mobile: { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-500', icon: Smartphone },
  Entertainment: { bg: 'bg-pink-500/10', text: 'text-pink-400', bar: 'bg-pink-500', icon: Film },
  Commute: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500', icon: Car },
  Health: { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500', icon: HeartPulse },
  Shopping: { bg: 'bg-orange-500/10', text: 'text-orange-400', bar: 'bg-orange-500', icon: Tag },
};

export const CategoryBreakdown: React.FC = () => {
  const getRunway = useLedgerStore((state) => state.getRunway);
  const setSelectedCategoryFilter = useLedgerStore((state) => state.setSelectedCategoryFilter);
  const selectedCategoryFilter = useLedgerStore((state) => state.selectedCategoryFilter);
  const runway = getRunway();

  const {
    categories,
    top3Expenses,
    spentToDate,
    momTotalDeltaBdt,
    momTotalDeltaPercent,
  } = runway;

  const top3Total = top3Expenses.reduce((s, e) => s + e.amount_bdt, 0);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Category breakdown */}
      <Card className="xl:col-span-7">
        <CardBody className="space-y-4">
          <CardHeader
            icon={<PieChart className="h-4 w-4" />}
            iconClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
            title="Category Spending & MoM Variance"
            subtitle="Share of month-to-date spend vs the previous cycle"
            actions={
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs',
                  momTotalDeltaBdt > 0
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                    : momTotalDeltaBdt < 0
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                )}
              >
                {momTotalDeltaBdt > 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                )}
                {momTotalDeltaPercent >= 0 ? '+' : ''}
                {momTotalDeltaPercent}% MoM
              </span>
            }
          />

          <div className="space-y-2.5">
            {categories.length === 0 ? (
              <EmptyState
                icon={<PieChart className="h-5 w-5" />}
                title="No categories yet"
                description="Add expenses this month to see the category breakdown."
              />
            ) : (
              categories.map((cat) => {
                const meta =
                  CATEGORY_COLORS[cat.category] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    bar: 'bg-slate-500',
                    icon: Tag,
                  };
                const Icon = meta.icon;
                const isSelected = selectedCategoryFilter === cat.category;

                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryFilter(isSelected ? 'ALL' : cat.category)
                    }
                    className={cn(
                      'group w-full rounded-lg border p-2.5 text-left transition',
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-950/20'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/30'
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                            meta.bg,
                            meta.text
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="truncate text-xs font-medium text-slate-200 group-hover:text-white">
                          {cat.category}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-500">
                          {cat.transaction_count} txn{cat.transaction_count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={cn(
                            'font-mono text-[10px]',
                            cat.mom_change_bdt > 0
                              ? 'text-rose-400'
                              : cat.mom_change_bdt < 0
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          )}
                        >
                          {cat.mom_change_percent >= 0 ? '+' : ''}
                          {cat.mom_change_percent}%
                        </span>
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-white">
                            {formatBDT(cat.total_bdt)}
                          </span>
                          <span className="ml-1.5 font-mono text-[10px] text-slate-500">
                            {cat.percentage_of_spend}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <ProgressBar
                      value={cat.percentage_of_spend}
                      barClassName={meta.bar}
                    />
                  </button>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      {/* Top 3 spends */}
      <Card className="flex flex-col xl:col-span-5">
        <CardBody className="flex flex-1 flex-col space-y-4">
          <CardHeader
            icon={<Award className="h-4 w-4" />}
            iconClassName="border-amber-500/20 bg-amber-500/10 text-amber-400"
            title="Top 3 Largest Spends"
            subtitle="Highest individual cash outflows this month"
          />

          <div className="flex-1 space-y-2.5">
            {top3Expenses.length === 0 ? (
              <EmptyState
                icon={<Award className="h-5 w-5" />}
                title="Nothing logged yet"
                description="Your biggest transactions will surface here."
              />
            ) : (
              top3Expenses.map((expense, idx) => {
                const rankColor =
                  idx === 0
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : idx === 1
                    ? 'border-slate-400/40 bg-slate-400/10 text-slate-200'
                    : 'border-orange-500/30 bg-orange-500/10 text-orange-300';

                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 transition hover:border-slate-700"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold',
                          rankColor
                        )}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold text-white">
                            {expense.shop}
                          </span>
                          {expense.isRecurring && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-sky-500/20 bg-sky-500/10 px-1.5 py-px text-[9px] font-medium text-sky-300">
                              <Repeat className="h-2.5 w-2.5" />
                              Recurring
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="rounded bg-slate-800 px-1.5 py-px text-slate-300">
                            {expense.category}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {expense.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm font-bold text-emerald-400">
                        {formatBDT(expense.amount_bdt)}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {spentToDate > 0
                          ? `${((expense.amount_bdt / spentToDate) * 100).toFixed(1)}% of total`
                          : '0%'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
            <span>Top 3 concentration</span>
            <span className="font-mono font-medium text-slate-200">
              {spentToDate > 0
                ? `${((top3Total / spentToDate) * 100).toFixed(1)}% of month spend`
                : '0%'}
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
