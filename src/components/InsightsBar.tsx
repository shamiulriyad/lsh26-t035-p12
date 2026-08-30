'use client';

import React from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type TypeStyle = {
  tone: React.ComponentProps<typeof Card>['tone'];
  accent: string;
  badge: string;
  icon: React.ReactNode;
};

function getTypeStyles(type: string): TypeStyle {
  switch (type) {
    case 'critical':
      return {
        tone: 'rose',
        accent: 'bg-rose-500',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />,
      };
    case 'warning':
      return {
        tone: 'amber',
        accent: 'bg-amber-500',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />,
      };
    case 'positive':
      return {
        tone: 'emerald',
        accent: 'bg-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />,
      };
    default:
      return {
        tone: 'default',
        accent: 'bg-sky-500',
        badge: 'bg-slate-800 text-slate-300 border-slate-700',
        icon: <Info className="h-4 w-4 shrink-0 text-sky-400" />,
      };
  }
}

export const InsightsBar: React.FC = () => {
  const getInsights = useLedgerStore((state) => state.getInsights);
  const insights = getInsights();

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-4">
      {insights.map((insight) => {
        const s = getTypeStyles(insight.type);
        return (
          <Card
            key={insight.id}
            tone={s.tone}
            interactive
            className="relative flex flex-col justify-between overflow-hidden p-4 pl-5"
          >
            <span className={cn('absolute inset-y-0 left-0 w-1', s.accent)} />
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-100">
                  <span className="mt-0.5">{s.icon}</span>
                  <span className="line-clamp-2">{insight.title}</span>
                </div>
                {insight.badge && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-center font-mono text-[10px] font-medium leading-tight',
                      s.badge
                    )}
                  >
                    {insight.badge}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-300">{insight.narrative}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono text-[11px]">
              <span className="text-slate-500">Primary metric</span>
              <span className="font-bold tracking-wide text-white">{insight.metric}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
