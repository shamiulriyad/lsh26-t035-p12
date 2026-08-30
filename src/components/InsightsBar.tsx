'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Flame,
  ArrowUpRight,
  Info,
} from 'lucide-react';

export const InsightsBar: React.FC = () => {
  const getInsights = useLedgerStore((state) => state.getInsights);
  const insights = getInsights();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-rose-950/40 border-rose-800/60 text-rose-300',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />,
          accentBar: 'bg-rose-500',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/30 border-amber-800/50 text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
          accentBar: 'bg-amber-500',
        };
      case 'positive':
        return {
          bg: 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
          accentBar: 'bg-emerald-500',
        };
      default:
        return {
          bg: 'bg-slate-900/80 border-slate-800 text-slate-300',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Info className="h-4 w-4 text-sky-400 shrink-0" />,
          accentBar: 'bg-sky-500',
        };
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-300">
            Programmatic Run-Rate & Cashflow Insights
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Recomputing Live across Ledger & Scenario Sliders
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {insights.map((insight) => {
          const styles = getTypeStyles(insight.type);
          return (
            <div
              key={insight.id}
              className={`relative overflow-hidden rounded-xl border p-4 transition-all hover:border-slate-700 ${styles.bg} shadow-lg shadow-black/20 flex flex-col justify-between`}
            >
              {/* Left Accent Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accentBar}`} />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-slate-200">
                    {styles.icon}
                    <span className="line-clamp-1">{insight.title}</span>
                  </div>
                  {insight.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${styles.badge}`}
                    >
                      {insight.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-slate-300 font-normal">
                  {insight.narrative}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Primary Metric:</span>
                <span className="font-bold text-white tracking-wide">
                  {insight.metric}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
