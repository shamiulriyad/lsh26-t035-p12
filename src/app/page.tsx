'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { InsightsBar } from '@/components/InsightsBar';
import { KPIGrid } from '@/components/KPIGrid';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { WhatIfScenarioEngine } from '@/components/WhatIfScenarioEngine';
import { GoalPocketsModeler } from '@/components/GoalPocketsModeler';
import { LedgerTable } from '@/components/LedgerTable';
import { OCRModal } from '@/components/OCRModal';
import { DPSCalculatorModal } from '@/components/DPSCalculatorModal';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { AddPocketModal } from '@/components/AddPocketModal';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowUpRight,
  Calculator,
  Compass,
  FileCheck,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. Top Navbar */}
      <Navbar />

      {/* Main Content Dashboard */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 2. Programmatic Written Insights Bar */}
        <section aria-label="Dynamic Programmatic Insights">
          <InsightsBar />
        </section>

        {/* 3. High-Level Financial KPI Grid */}
        <section aria-label="Financial KPI Runway Grid">
          <KPIGrid />
        </section>

        {/* 4. Middle Section: Category Breakdown + Top Spends (Left 2-Col) and What-If Sliders (Right 1-Col) */}
        <section aria-label="Spending Analytics and What-If Optimization" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <CategoryBreakdown />
          </div>
          <div className="lg:col-span-4">
            <WhatIfScenarioEngine />
          </div>
        </section>

        {/* 5. Savings & DPS Modeler */}
        <section aria-label="Goal Pockets and DPS Compounding Engine">
          <GoalPocketsModeler />
        </section>

        {/* 6. Transaction Ledger Table */}
        <section aria-label="Transaction Ledger Table">
          <LedgerTable />
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">TakaRunway</span>
            <span>• Salaried Financial Architecture for Dhaka Professionals</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Zero-Hallucination Guardrail Active</span>
            <span>•</span>
            <span>Paisa-Precise DPS Compounding</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OCRModal />
      <DPSCalculatorModal />
      <AddExpenseModal />
      <AddPocketModal />

    </div>
  );
}
