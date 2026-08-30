import {
  LayoutDashboard,
  Sparkles,
  PieChart,
  SlidersHorizontal,
  Target,
  ListChecks,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
};

/**
 * Sidebar navigation. Each entry maps to a `<section id>` on the dashboard
 * canvas; the sidebar scroll-spies the active one. No routes are involved so
 * every existing feature stays reachable on a single page.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', hint: 'Runway KPIs', icon: LayoutDashboard },
  { id: 'insights', label: 'Insights', hint: 'Programmatic signals', icon: Sparkles },
  { id: 'analytics', label: 'Analytics', hint: 'Category & top spends', icon: PieChart },
  { id: 'scenarios', label: 'Scenarios', hint: 'What-if optimizer', icon: SlidersHorizontal },
  { id: 'goals', label: 'Goals', hint: 'Pockets & DPS', icon: Target },
  { id: 'ledger', label: 'Ledger', hint: 'Transactions', icon: ListChecks },
];
