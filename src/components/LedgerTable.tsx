'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { formatBDT } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader, Input, EmptyState } from '@/components/ui';
import {
  ListFilter,
  Search,
  Repeat,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Rent',
  'Food',
  'Groceries',
  'Utilities',
  'Mobile',
  'Entertainment',
  'Commute',
  'Health',
  'Shopping',
  'Other',
];

export const LedgerTable: React.FC = () => {
  const expenses = useLedgerStore((state) => state.expenses);
  const deleteExpense = useLedgerStore((state) => state.deleteExpense);
  const months = useLedgerStore((state) => state.months);
  const selectedCategoryFilter = useLedgerStore((state) => state.selectedCategoryFilter);
  const setSelectedCategoryFilter = useLedgerStore((state) => state.setSelectedCategoryFilter);
  const searchQuery = useLedgerStore((state) => state.searchQuery);
  const setSearchQuery = useLedgerStore((state) => state.setSearchQuery);

  const [activeMonthFilter, setActiveMonthFilter] = useState<'this' | 'last' | 'all'>('this');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredExpenses = expenses
    .filter((e) => {
      if (activeMonthFilter === 'this' && !e.date.startsWith(months.this)) return false;
      if (activeMonthFilter === 'last' && !e.date.startsWith(months.last)) return false;
      if (selectedCategoryFilter !== 'ALL' && e.category !== selectedCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.shop.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.notes ? e.notes.toLowerCase().includes(q) : false)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
      }
      return sortAsc ? a.amount_bdt - b.amount_bdt : b.amount_bdt - a.amount_bdt;
    });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount_bdt, 0);

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) setSortAsc((v) => !v);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const monthTabs: { key: 'this' | 'last' | 'all'; label: string }[] = [
    { key: 'this', label: `This month · ${months.this}` },
    { key: 'last', label: `Last month · ${months.last}` },
    { key: 'all', label: 'All logs' },
  ];

  return (
    <Card>
      <CardBody className="space-y-4">
        <CardHeader
          icon={<ListFilter className="h-4 w-4" />}
          title="Ledger Transactions & Audit Trail"
          subtitle={
            <>
              {filteredExpenses.length} transaction
              {filteredExpenses.length !== 1 ? 's' : ''} ·{' '}
              <span className="font-mono text-slate-300">{formatBDT(totalFilteredAmount)}</span>
            </>
          }
          actions={
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-semibold">
              {monthTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveMonthFilter(t.key)}
                  className={cn(
                    'rounded-md px-2.5 py-1 transition',
                    activeMonthFilter === t.key
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">
                    {t.key === 'all' ? 'All' : t.key === 'this' ? 'This' : 'Last'}
                  </span>
                </button>
              ))}
            </div>
          }
        />

        {/* Search + category pills */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Search merchant, category, or notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={cn(
                    'shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium transition',
                    isSelected
                      ? 'border-emerald-500/40 bg-emerald-500/20 font-bold text-emerald-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50 md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 font-mono text-[11px] text-slate-400">
                <tr>
                  <th
                    className="cursor-pointer px-4 py-3 transition hover:text-white"
                    onClick={() => toggleSort('date')}
                  >
                    <span className="flex items-center gap-1">
                      Date <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3">Merchant / Shop</th>
                  <th className="px-4 py-3">Category</th>
                  <th
                    className="cursor-pointer px-4 py-3 text-right transition hover:text-white"
                    onClick={() => toggleSort('amount')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      Amount (BDT) <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3">Telemetry</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10">
                      <EmptyState
                        title="No matching transactions"
                        description="Adjust the month, category, or search filters."
                        className="border-0 bg-transparent py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="group transition hover:bg-slate-800/30">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-300">
                        {expense.date}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-white">{expense.shop}</span>
                          {expense.isRecurring && (
                            <span
                              title="Auto-recurring spend detected across last & this month (±10%)"
                              className="inline-flex items-center gap-0.5 rounded border border-sky-500/20 bg-sky-500/10 px-1.5 py-px font-mono text-[9px] text-sky-300"
                            >
                              <Repeat className="h-2.5 w-2.5" />
                              Recurring
                            </span>
                          )}
                        </div>
                        {expense.notes && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">
                            {expense.notes}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs font-bold text-emerald-400">
                        {formatBDT(expense.amount_bdt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {expense.receiptConfidence ? (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            OCR {(expense.receiptConfidence.overall * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-500">Manual entry</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteExpense(expense.id)}
                          title="Delete expense"
                          aria-label={`Delete expense at ${expense.shop}`}
                          className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="space-y-2.5 md:hidden">
          {filteredExpenses.length === 0 ? (
            <EmptyState
              title="No matching transactions"
              description="Adjust the month, category, or search filters."
            />
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-white">
                        {expense.shop}
                      </span>
                      {expense.isRecurring && (
                        <Repeat className="h-3 w-3 shrink-0 text-sky-400" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="rounded bg-slate-800 px-1.5 py-px text-slate-300">
                        {expense.category}
                      </span>
                      <span className="font-mono">{expense.date}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {formatBDT(expense.amount_bdt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExpense(expense.id)}
                      aria-label={`Delete expense at ${expense.shop}`}
                      className="rounded p-1 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {expense.notes && (
                  <p className="mt-2 line-clamp-2 text-[11px] text-slate-500">{expense.notes}</p>
                )}
                {expense.receiptConfidence && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    OCR {(expense.receiptConfidence.overall * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};
