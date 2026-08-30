'use client';

import React from 'react';
import { Wallet, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav';
import { SidebarProfile } from './SidebarProfile';

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeId: string;
  onNavigate: (id: string) => void;
  variant?: 'desktop' | 'drawer';
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapsed,
  activeId,
  onNavigate,
  variant = 'desktop',
}) => {
  const isDrawer = variant === 'drawer';
  const showLabels = isDrawer || !collapsed;

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-800 bg-slate-950',
        isDrawer ? 'w-[17rem]' : collapsed ? 'w-[4.25rem]' : 'w-64',
        !isDrawer && 'transition-[width] duration-200 ease-out-expo'
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-slate-800',
          showLabels ? 'gap-3 px-4' : 'justify-center px-2'
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
          <Wallet className="h-5 w-5" />
        </span>
        {showLabels && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-bold tracking-tight text-white">
                TakaRunway
              </span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                Pro
              </span>
            </div>
            <p className="truncate text-[11px] text-slate-500">Cashflow Runway Manager</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {showLabels && (
          <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Workspace
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={collapsed && !isDrawer ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex w-full items-center rounded-lg text-sm font-medium transition-colors',
                showLabels ? 'gap-3 px-3 py-2' : 'justify-center px-2 py-2.5',
                active
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              )}
            >
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-400 transition-opacity',
                  active ? 'opacity-100' : 'opacity-0'
                )}
              />
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {showLabels && (
                <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                  <span className="truncate">{item.label}</span>
                  <span className="truncate text-[10px] font-normal text-slate-600">
                    {item.hint}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!isDrawer && (
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              'flex w-full items-center rounded-lg text-xs font-medium text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-200',
              showLabels ? 'gap-2 px-3 py-2' : 'justify-center px-2 py-2.5'
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Profile */}
      <SidebarProfile showLabels={showLabels} />
    </aside>
  );
};
