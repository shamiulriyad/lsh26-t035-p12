'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { BENCHMARK_CASES } from '@/data/benchmarks';
import { formatBDT } from '@/lib/calculations';
import {
  Wallet,
  ScanLine,
  PlusCircle,
  Sparkles,
  RotateCcw,
  Percent,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeCaseId,
    salaryBdt,
    today,
    dpsAnnualRatePercent,
    loadBenchmarkCase,
    setSalary,
    setToday,
    setDpsRate,
    setOCRModalOpen,
    setAddExpenseModalOpen,
    resetToDefaults,
  } = useLedgerStore();

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(salaryBdt.toString());

  const handleSalarySave = () => {
    const parsed = parseFloat(salaryInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setSalary(parsed);
    } else {
      setSalaryInput(salaryBdt.toString());
    }
    setIsEditingSalary(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  TakaRunway
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Dhaka Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personal Ledger & Cashflow Runway Manager
              </p>
            </div>
          </div>

          {/* Benchmark Case Selector & Salary */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Case Selector Dropdown */}
            <div className="relative">
              <select
                aria-label="Select Benchmark Scenario"
                value={activeCaseId}
                onChange={(e) => {
                  loadBenchmarkCase(e.target.value);
                  setSalaryInput(BENCHMARK_CASES[e.target.value]?.salary_bdt.toString() || salaryBdt.toString());
                }}
                className="appearance-none rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 hover:border-slate-600 focus:border-emerald-400 focus:outline-none transition cursor-pointer"
              >
                {Object.values(BENCHMARK_CASES).map((bCase) => (
                  <option key={bCase.case_id} value={bCase.case_id} className="bg-slate-900 text-white">
                    {bCase.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 pointer-events-none text-slate-400" />
            </div>

            {/* Editable Salary Input */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700/80 px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium mr-1.5">Salary:</span>
              {isEditingSalary ? (
                <input
                  type="number"
                  aria-label="Monthly Salary (BDT)"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  onBlur={handleSalarySave}
                  onKeyDown={(e) => e.key === 'Enter' && handleSalarySave()}
                  autoFocus
                  className="w-20 bg-slate-950 text-emerald-400 font-semibold px-1 py-0.5 rounded border border-emerald-500/50 outline-none text-right"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSalaryInput(salaryBdt.toString());
                    setIsEditingSalary(true);
                  }}
                  title="Click to edit salary"
                  className="text-emerald-400 font-bold hover:underline"
                >
                  {formatBDT(salaryBdt)}
                </button>
              )}
            </div>

            {/* Date Tag */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{today}</span>
            </div>

            {/* Global DPS Rate */}
            <div className="hidden xl:flex items-center gap-1 rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs text-slate-300">
              <Percent className="h-3.5 w-3.5 text-indigo-400" />
              <span>DPS: <strong className="text-indigo-300">{dpsAnnualRatePercent}% p.a.</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Scan Receipt / Chit Button */}
            <button
              onClick={() => setOCRModalOpen(true)}
              className="relative group flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition"
            >
              <ScanLine className="h-4 w-4" />
              <span className="hidden sm:inline">Scan Receipt / Chit</span>
              <span className="sm:hidden">Scan</span>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            {/* Add Expense Button */}
            <button
              onClick={() => setAddExpenseModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-200 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-slate-300" />
              <span className="hidden md:inline">Add Expense</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={resetToDefaults}
              title="Reset to benchmark defaults"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
