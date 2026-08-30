'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string; icon: any }> = {
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

  const { categories, top3Expenses, spentToDate, momTotalSpentLast, momTotalDeltaBdt, momTotalDeltaPercent } = runway;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      
      {/* Category Breakdown (7 Columns) */}
      <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Category Spending & MoM Variance
              </h3>
              <p className="text-xs text-slate-400">
                Share of MTD spend vs previous cycle
              </p>
            </div>
          </div>

          {/* MoM Overall Pill */}
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-mono border ${
              momTotalDeltaBdt > 0
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : momTotalDeltaBdt < 0
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {momTotalDeltaBdt > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>
              {momTotalDeltaPercent >= 0 ? '+' : ''}{momTotalDeltaPercent}% MoM
            </span>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No categories recorded for this month.
            </div>
          ) : (
            categories.map((cat) => {
              const meta = CATEGORY_COLORS[cat.category] || {
                bg: 'bg-slate-800',
                text: 'text-slate-300',
                bar: 'bg-slate-500',
                icon: Tag,
              };
              const Icon = meta.icon;
              const isSelected = selectedCategoryFilter === cat.category;

              return (
                <div
                  key={cat.category}
                  onClick={() => setSelectedCategoryFilter(isSelected ? 'ALL' : cat.category)}
                  className={`group relative rounded-lg border p-2.5 transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-950/20 shadow-sm'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md ${meta.bg} ${meta.text}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white transition">
                        {cat.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({cat.transaction_count} txn{cat.transaction_count > 1 ? 's' : ''})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* MoM delta */}
                      <span
                        className={`text-[10px] font-mono flex items-center ${
                          cat.mom_change_bdt > 0
                            ? 'text-rose-400'
                            : cat.mom_change_bdt < 0
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {cat.mom_change_percent >= 0 ? '+' : ''}{cat.mom_change_percent}%
                      </span>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-white">
                          {formatBDT(cat.total_bdt)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                          ({cat.percentage_of_spend}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                      style={{ width: `${Math.min(100, cat.percentage_of_spend)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Top 3 Spends (5 Columns) */}
      <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Top 3 Largest Spends
                </h3>
                <p className="text-xs text-slate-400">
                  Highest individual cash outflows
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Ranked MTD</span>
          </div>

          {/* Top 3 List */}
          <div className="space-y-2.5">
            {top3Expenses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No expenses logged this month yet.
              </div>
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
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-mono font-bold ${rankColor}`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white">
                            {expense.shop}
                          </span>
                          {expense.isRecurring && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-sky-500/10 px-1.5 py-0.2 text-[9px] font-medium text-sky-300 border border-sky-500/20">
                              <Repeat className="h-2.5 w-2.5" />
                              Auto-Recurring
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="rounded bg-slate-800 px-1.5 py-0.2 text-slate-300">
                            {expense.category}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {expense.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        {formatBDT(expense.amount_bdt)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
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
        </div>

        {/* Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Top 3 Concentration:</span>
          <span className="font-mono text-slate-200 font-medium">
            {spentToDate > 0
              ? `${(
                  (top3Expenses.reduce((s, e) => s + e.amount_bdt, 0) / spentToDate) *
                  100
                ).toFixed(1)}% of Month Spend`
              : '0%'}
          </span>
        </div>
      </div>

    </div>
  );
};
