'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { AuthProvider } from './AuthProvider';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AccountModal } from './AccountModal';
import { NAV_ITEMS } from './nav';

const COLLAPSE_KEY = 'takarunway.sidebar.collapsed';
const SECTION_IDS = NAV_ITEMS.map((n) => n.id);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const activeId = useScrollSpy(SECTION_IDS);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const navigate = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
            activeId={activeId}
            onNavigate={navigate}
          />
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-overlay-in"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 animate-drawer-in shadow-popover">
              <Sidebar
                variant="drawer"
                collapsed={false}
                onToggleCollapsed={toggleCollapsed}
                activeId={activeId}
                onNavigate={navigate}
              />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            activeId={activeId}
            onOpenMobileNav={() => setMobileOpen(true)}
            onOpenAccount={() => setAccountOpen(true)}
          />
          <main id="app-scroll" className="flex-1 overflow-y-auto">
            <div
              className={cn(
                'mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </AuthProvider>
  );
};
