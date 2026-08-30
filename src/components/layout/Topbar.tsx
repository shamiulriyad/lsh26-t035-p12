'use client';

import React, { useEffect, useState } from 'react';
import {
  Menu,
  ScanLine,
  PlusCircle,
  RotateCcw,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useLedgerStore } from '@/store/ledgerStore';
import { BENCHMARK_CASES } from '@/data/benchmarks';
import { formatBDT } from '@/lib/calculations';
import { Button, Select } from '@/components/ui';
import { NAV_ITEMS } from './nav';
import { ProfileMenu } from './ProfileMenu';

type TopbarProps = {
  activeId: string;
  onOpenMobileNav: () => void;
  onOpenAccount: () => void;
};

export const Topbar: React.FC<TopbarProps> = ({
  activeId,
  onOpenMobileNav,
  onOpenAccount,
}) => {
  const {
    activeCaseId,
    salaryBdt,
    today,
    loadBenchmarkCase,
    setSalary,
    setOCRModalOpen,
    setAddExpenseModalOpen,
    resetToDefaults,
  } = useLedgerStore();

  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(salaryBdt));
  useEffect(() => setSalaryInput(String(salaryBdt)), [salaryBdt]);

  const commitSalary = () => {
    const n = parseFloat(salaryInput);
    if (!isNaN(n) && n >= 0) setSalary(n);
    else setSalaryInput(String(salaryBdt));
    setEditingSalary(false);
  };

  const active = NAV_ITEMS.find((n) => n.id === activeId) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950/85 px-3 backdrop-blur-md sm:px-5">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb / page context */}
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="hidden text-xs font-medium text-slate-500 sm:block">TakaRunway</span>
        <ChevronRight className="hidden h-3.5 w-3.5 text-slate-700 sm:block" />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-white">{active.label}</h1>
          <p className="truncate text-[11px] text-slate-500">{active.hint}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Benchmark selector — md+ */}
        <div className="hidden md:block">
          <Select
            aria-label="Benchmark scenario"
            value={activeCaseId}
            onChange={(e) => loadBenchmarkCase(e.target.value)}
            className="h-8 w-[150px] text-[11px] lg:w-[190px]"
          >
            {Object.values(BENCHMARK_CASES).map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Salary quick-edit — lg+ */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-xs lg:flex">
          <span className="font-medium text-slate-500">Salary</span>
          {editingSalary ? (
            <input
              type="number"
              autoFocus
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              onBlur={commitSalary}
              onKeyDown={(e) => e.key === 'Enter' && commitSalary()}
              className="w-20 rounded border border-emerald-500/50 bg-slate-950 px-1 py-0.5 text-right font-mono font-semibold text-emerald-400 outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setSalaryInput(String(salaryBdt));
                setEditingSalary(true);
              }}
              className="font-mono font-bold text-emerald-400 hover:underline"
              title="Click to edit monthly salary"
            >
              {formatBDT(salaryBdt)}
            </button>
          )}
        </div>

        {/* Date chip — xl+ */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 text-xs text-slate-300 xl:flex">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span className="font-mono">{today}</span>
        </div>

        <div className="mx-1 hidden h-6 w-px bg-slate-800 sm:block" />

        <Button size="sm" onClick={() => setOCRModalOpen(true)}>
          <ScanLine className="h-4 w-4" />
          <span className="hidden sm:inline">Scan Receipt</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setAddExpenseModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          <span className="hidden md:inline">Add Expense</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          iconOnly
          onClick={resetToDefaults}
          title="Reset to benchmark defaults"
          aria-label="Reset to benchmark defaults"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div className="mx-1 hidden h-6 w-px bg-slate-800 sm:block" />

        <ProfileMenu onOpenAccount={onOpenAccount} />
      </div>
    </header>
  );
};
