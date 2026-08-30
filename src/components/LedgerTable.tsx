'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { Expense } from '@/types/ledger';
import { formatBDT } from '@/lib/calculations';
import {
  ListFilter,
  Search,
  Repeat,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const LedgerTable: React.FC = () => {
  const expenses = useLedgerStore((state) => state.expenses);
  const deleteExpense = useLedgerStore((state) => state.deleteExpense);
  const months = useLedgerStore((state) => state.months);
  const setAddExpenseModalOpen = useLedgerStore((state) => state.setAddExpenseModalOpen);
  const setOCRModalOpen = useLedgerStore((state) => state.setOCRModalOpen);
  const selectedCategoryFilter = useLedgerStore((state) => state.selectedCategoryFilter);
  const setSelectedCategoryFilter = useLedgerStore((state) => state.setSelectedCategoryFilter);
  const searchQuery = useLedgerStore((state) => state.searchQuery);
  const setSearchQuery = useLedgerStore((state) => state.setSearchQuery);

  const [activeMonthFilter, setActiveMonthFilter] = useState<'this' | 'last' | 'all'>('this');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Available Categories
  const categories = ['ALL', 'Rent', 'Food', 'Groceries', 'Utilities', 'Mobile', 'Entertainment', 'Commute', 'Health', 'Shopping', 'Other'];

  // Filter & Sort Logic
  const filteredExpenses = expenses
    .filter((e) => {
      // Month filter
      if (activeMonthFilter === 'this' && !e.date.startsWith(months.this)) return false;
      if (activeMonthFilter === 'last' && !e.date.startsWith(months.last)) return false;

      // Category filter
      if (selectedCategoryFilter !== 'ALL' && e.category !== selectedCategoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shopMatch = e.shop.toLowerCase().includes(q);
        const catMatch = e.category.toLowerCase().includes(q);
        const notesMatch = e.notes ? e.notes.toLowerCase().includes(q) : false;
        return shopMatch || catMatch || notesMatch;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortAsc
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      } else {
        return sortAsc
          ? a.amount_bdt - b.amount_bdt
          : b.amount_bdt - a.amount_bdt;
      }
    });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount_bdt, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-lg shadow-black/20">
      
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ListFilter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Ledger Transactions & Audit Trail
            </h3>
            <p className="text-xs text-slate-400">
              Showing {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} (Total: {formatBDT(totalFilteredAmount)})
            </p>
          </div>
        </div>

        {/* Month Tabs */}
        <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveMonthFilter('this')}
            className={`px-3 py-1 rounded-md transition ${
              activeMonthFilter === 'this'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            This Month ({months.this})
          </button>
          <button
            onClick={() => setActiveMonthFilter('last')}
            className={`px-3 py-1 rounded-md transition ${
              activeMonthFilter === 'last'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last Month ({months.last})
          </button>
          <button
            onClick={() => setActiveMonthFilter('all')}
            className={`px-3 py-1 rounded-md transition ${
              activeMonthFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs
          </button>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchant, shop, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition text-[11px] font-medium border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
              <tr>
                <th
                  onClick={() => {
                    if (sortField === 'date') setSortAsc(!sortAsc);
                    else { setSortField('date'); setSortAsc(false); }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Merchant / Shop</th>
                <th className="py-3 px-4">Category</th>
                <th
                  onClick={() => {
                    if (sortField === 'amount') setSortAsc(!sortAsc);
                    else { setSortField('amount'); setSortAsc(false); }
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount (BDT)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Telemetry & Tags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-800/30 transition group font-sans"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                      {expense.date}
                    </td>

                    {/* Shop */}
                    <td className="py-3 px-4 text-white font-medium text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{expense.shop}</span>
                        {expense.isRecurring && (
                          <span
                            title="Auto-recurring spend detected across last & this month (within +/- 10%)"
                            className="inline-flex items-center gap-0.5 rounded bg-sky-500/10 px-1.5 py-0.2 text-[9px] font-mono text-sky-300 border border-sky-500/20"
                          >
                            <Repeat className="h-2.5 w-2.5" />
                            Recurring
                          </span>
                        )}
                      </div>
                      {expense.notes && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 font-normal mt-0.5">
                          {expense.notes}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                        {expense.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-xs whitespace-nowrap">
                      {formatBDT(expense.amount_bdt)}
                    </td>

                    {/* Telemetry / OCR Confidence */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {expense.receiptConfidence ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          OCR {(expense.receiptConfidence.overall * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Manual Entry
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        title="Delete expense"
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
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

    </div>
  );
};
