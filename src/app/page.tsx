'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
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
import { SectionHeading } from '@/components/ui';
import {
  LayoutDashboard,
  Sparkles,
  PieChart,
  SlidersHorizontal,
  Target,
  ListChecks,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-12">
        {/* Overview — Runway KPIs */}
        <section id="overview" aria-label="Financial KPI Runway Grid" className="scroll-anchor space-y-4">
          <SectionHeading
            icon={<LayoutDashboard className="h-4 w-4" />}
            eyebrow="Overview"
            title="Cashflow Runway"
            description="Live run-rate position for the current salary cycle. Every figure recomputes as the ledger and scenario sliders change."
          />
          <KPIGrid />
        </section>

        {/* Insights */}
        <section id="insights" aria-label="Programmatic Insights" className="scroll-anchor space-y-4">
          <SectionHeading
            icon={<Sparkles className="h-4 w-4" />}
            eyebrow="Signals"
            title="Programmatic Insights"
            description="Deterministic narratives generated from the run-rate model — no guesswork, recomputed on every change."
          />
          <InsightsBar />
        </section>

        {/* Analytics */}
        <section id="analytics" aria-label="Spending Analytics" className="scroll-anchor space-y-4">
          <SectionHeading
            icon={<PieChart className="h-4 w-4" />}
            eyebrow="Analytics"
            title="Spending Breakdown"
            description="Category share, month-over-month variance, and the largest individual outflows this cycle."
          />
          <CategoryBreakdown />
        </section>

        {/* Scenarios */}
        <section id="scenarios" aria-label="What-If Optimization" className="scroll-anchor space-y-4">
          <SectionHeading
            icon={<SlidersHorizontal className="h-4 w-4" />}
            eyebrow="Optimize"
            title="What-If Scenarios"
            description="Model 0–50% category cuts and watch recovered liquidity, burn rate, and goal horizons update instantly."
          />
          <WhatIfScenarioEngine />
        </section>

        {/* Goals */}
        <section id="goals" aria-label="Goal Pockets and DPS Engine" className="scroll-anchor space-y-4">
          <SectionHeading
            icon={<Target className="h-4 w-4" />}
            eyebrow="Plan"
            title="Goal Pockets & DPS"
            description="Savings targets constrained by projected surplus, with monthly-compounded DPS maturity projections."
          />
          <GoalPocketsModeler />
        </section>

        {/* Ledger */}
        <section id="ledger" aria-label="Transaction Ledger" className="scroll-anchor space-y-4">
          <SectionHeading
            icon={<ListChecks className="h-4 w-4" />}
            eyebrow="Records"
            title="Transaction Ledger"
            description="The full audit trail. Filter by month, category, or search across merchants and notes."
          />
          <LedgerTable />
        </section>

        <footer className="border-t border-slate-800/80 pt-6 pb-2">
          <div className="flex flex-col items-center justify-between gap-2 text-[11px] text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">TakaRunway</span>
              <span>· Salaried financial architecture for Dhaka professionals</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-slate-600">
              <span>Zero-hallucination guardrail active</span>
              <span>·</span>
              <span>Paisa-precise DPS compounding</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <OCRModal />
      <DPSCalculatorModal />
      <AddExpenseModal />
      <AddPocketModal />
    </AppShell>
  );
}
