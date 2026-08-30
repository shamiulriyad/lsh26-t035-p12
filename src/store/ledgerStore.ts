import { create } from 'zustand';
import { Expense, Pocket, CalculatedRunway, WrittenInsight } from '@/types/ledger';
import { BENCHMARK_CASES } from '@/data/benchmarks';
import { calculateRunway } from '@/lib/calculations';
import { generateDynamicInsights } from '@/lib/insights';
import * as expensesApi from '@/lib/api/expenses';
import { ExpenseInput } from '@/types/database';

/** Map an app Expense (or partial) to the API's input shape. */
function toExpenseInput(e: Partial<Expense>): Partial<ExpenseInput> {
  const input: Partial<ExpenseInput> = {};
  if (e.date !== undefined) input.date = e.date;
  if (e.category !== undefined) input.category = e.category;
  if (e.shop !== undefined) input.shop = e.shop;
  if (e.amount_bdt !== undefined) input.amount_bdt = e.amount_bdt;
  if (e.isRecurring !== undefined) input.isRecurring = e.isRecurring;
  if (e.notes !== undefined) input.notes = e.notes ?? null;
  if (e.receiptConfidence !== undefined) input.receiptConfidence = e.receiptConfidence ?? null;
  return input;
}

interface LedgerState {
  // Core Configuration
  activeCaseId: string;
  today: string;
  months: { last: string; this: string };
  salaryBdt: number;
  dpsAnnualRatePercent: number;
  expenses: Expense[];
  pockets: Pocket[];
  whatIfCuts: Record<string, number>; // 0.00 to 0.50

  // Supabase sync
  remoteEnabled: boolean; // true once a signed-in user is detected
  remoteLoading: boolean;
  syncError: string | null;

  // UI States
  isOCRModalOpen: boolean;
  isAddExpenseModalOpen: boolean;
  isAddPocketModalOpen: boolean;
  isDPSCalculatorModalOpen: boolean;
  selectedPocketForDPS: string | null;
  searchQuery: string;
  selectedCategoryFilter: string;

  // Actions
  enableRemote: () => Promise<void>;
  disableRemote: () => void;
  refreshRemoteExpenses: () => Promise<void>;
  loadBenchmarkCase: (caseId: string) => void;
  setSalary: (salary: number) => void;
  setToday: (todayStr: string) => void;
  setDpsRate: (ratePercent: number) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addPocket: (pocket: Omit<Pocket, 'id'>) => void;
  updatePocket: (id: string, updated: Partial<Pocket>) => void;
  updatePocketContribution: (id: string, contribution: number) => void;
  deletePocket: (id: string) => void;
  setWhatIfCut: (category: string, cutPercent: number) => void;
  resetWhatIfCuts: () => void;
  
  // Modals & UI Controls
  setOCRModalOpen: (open: boolean) => void;
  setAddExpenseModalOpen: (open: boolean) => void;
  setAddPocketModalOpen: (open: boolean) => void;
  setDPSCalculatorModalOpen: (open: boolean, pocketId?: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryFilter: (category: string) => void;
  resetToDefaults: () => void;

  // Computed Selectors
  getRunway: () => CalculatedRunway;
  getInsights: () => WrittenInsight[];
}

const defaultCase = BENCHMARK_CASES['PUB-01'];

export const useLedgerStore = create<LedgerState>((set, get) => ({
  activeCaseId: defaultCase.case_id,
  today: defaultCase.today,
  months: defaultCase.months,
  salaryBdt: defaultCase.salary_bdt,
  dpsAnnualRatePercent: defaultCase.dps_annual_rate_percent,
  expenses: JSON.parse(JSON.stringify(defaultCase.expenses)),
  pockets: JSON.parse(JSON.stringify(defaultCase.pockets)),
  whatIfCuts: {},

  remoteEnabled: false,
  remoteLoading: false,
  syncError: null,

  isOCRModalOpen: false,
  isAddExpenseModalOpen: false,
  isAddPocketModalOpen: false,
  isDPSCalculatorModalOpen: false,
  selectedPocketForDPS: null,
  searchQuery: '',
  selectedCategoryFilter: 'ALL',

  enableRemote: async () => {
    set({ remoteEnabled: true });
    await get().refreshRemoteExpenses();
  },

  disableRemote: () => {
    set({ remoteEnabled: false, syncError: null });
  },

  refreshRemoteExpenses: async () => {
    if (!get().remoteEnabled) return;
    set({ remoteLoading: true, syncError: null });
    try {
      const expenses = await expensesApi.listExpenses();
      set({ expenses, remoteLoading: false });
    } catch (err) {
      set({
        remoteLoading: false,
        syncError: err instanceof Error ? err.message : 'Failed to load expenses',
      });
    }
  },

  loadBenchmarkCase: (caseId: string) => {
    const selected = BENCHMARK_CASES[caseId];
    if (!selected) return;
    set({
      activeCaseId: selected.case_id,
      today: selected.today,
      months: selected.months,
      salaryBdt: selected.salary_bdt,
      dpsAnnualRatePercent: selected.dps_annual_rate_percent,
      expenses: JSON.parse(JSON.stringify(selected.expenses)),
      pockets: JSON.parse(JSON.stringify(selected.pockets)),
      whatIfCuts: {},
      selectedCategoryFilter: 'ALL',
      searchQuery: '',
    });
  },

  setSalary: (salary: number) => {
    set({ salaryBdt: Math.max(0, salary) });
  },

  setToday: (todayStr: string) => {
    set({ today: todayStr });
  },

  setDpsRate: (ratePercent: number) => {
    set({ dpsAnnualRatePercent: Math.max(0, ratePercent) });
  },

  addExpense: (expenseData) => {
    const tempId = `tmp-${Date.now().toString(36)}`;
    const optimistic: Expense = { ...expenseData, id: tempId };
    set(state => ({ expenses: [optimistic, ...state.expenses], syncError: null }));

    if (!get().remoteEnabled) return;

    expensesApi
      .createExpense(toExpenseInput(expenseData) as ExpenseInput)
      .then(saved => {
        set(state => ({
          expenses: state.expenses.map(e => (e.id === tempId ? saved : e)),
        }));
      })
      .catch(err => {
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== tempId),
          syncError: err instanceof Error ? err.message : 'Failed to save expense',
        }));
      });
  },

  updateExpense: (id, updated) => {
    const prev = get().expenses.find(e => e.id === id);
    set(state => ({
      expenses: state.expenses.map(e => (e.id === id ? { ...e, ...updated } : e)),
      syncError: null,
    }));

    if (!get().remoteEnabled || id.startsWith('tmp-')) return;

    expensesApi
      .updateExpense(id, toExpenseInput(updated))
      .then(saved => {
        set(state => ({
          expenses: state.expenses.map(e => (e.id === id ? saved : e)),
        }));
      })
      .catch(err => {
        set(state => ({
          expenses: prev
            ? state.expenses.map(e => (e.id === id ? prev : e))
            : state.expenses,
          syncError: err instanceof Error ? err.message : 'Failed to update expense',
        }));
      });
  },

  deleteExpense: (id) => {
    const prev = get().expenses;
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id),
      syncError: null,
    }));

    if (!get().remoteEnabled || id.startsWith('tmp-')) return;

    expensesApi.deleteExpense(id).catch(err => {
      set({
        expenses: prev,
        syncError: err instanceof Error ? err.message : 'Failed to delete expense',
      });
    });
  },

  addPocket: (pocketData) => {
    const newId = `SP-${Date.now().toString().slice(-3)}`;
    const newPocket: Pocket = {
      ...pocketData,
      id: newId,
    };
    set(state => ({
      pockets: [...state.pockets, newPocket],
    }));
  },

  updatePocket: (id, updated) => {
    set(state => ({
      pockets: state.pockets.map(p => p.id === id ? { ...p, ...updated } : p),
    }));
  },

  updatePocketContribution: (id, contribution) => {
    set(state => ({
      pockets: state.pockets.map(p =>
        p.id === id ? { ...p, monthly_contribution_bdt: Math.max(0, contribution) } : p
      ),
    }));
  },

  deletePocket: (id) => {
    set(state => ({
      pockets: state.pockets.filter(p => p.id !== id),
    }));
  },

  setWhatIfCut: (category, cutPercent) => {
    set(state => {
      const sanitized = Math.min(0.50, Math.max(0, cutPercent));
      const nextCuts = { ...state.whatIfCuts };
      if (sanitized === 0) {
        delete nextCuts[category];
      } else {
        nextCuts[category] = sanitized;
      }
      return { whatIfCuts: nextCuts };
    });
  },

  resetWhatIfCuts: () => {
    set({ whatIfCuts: {} });
  },

  setOCRModalOpen: (open) => {
    set({ isOCRModalOpen: open });
  },

  setAddExpenseModalOpen: (open) => {
    set({ isAddExpenseModalOpen: open });
  },

  setAddPocketModalOpen: (open) => {
    set({ isAddPocketModalOpen: open });
  },

  setDPSCalculatorModalOpen: (open, pocketId) => {
    set({
      isDPSCalculatorModalOpen: open,
      selectedPocketForDPS: pocketId || null,
    });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSelectedCategoryFilter: (category) => {
    set({ selectedCategoryFilter: category });
  },

  resetToDefaults: () => {
    const pub1 = BENCHMARK_CASES['PUB-01'];
    set({
      activeCaseId: pub1.case_id,
      today: pub1.today,
      months: pub1.months,
      salaryBdt: pub1.salary_bdt,
      dpsAnnualRatePercent: pub1.dps_annual_rate_percent,
      expenses: JSON.parse(JSON.stringify(pub1.expenses)),
      pockets: JSON.parse(JSON.stringify(pub1.pockets)),
      whatIfCuts: {},
      searchQuery: '',
      selectedCategoryFilter: 'ALL',
    });
  },

  getRunway: () => {
    const state = get();
    return calculateRunway({
      today: state.today,
      months: state.months,
      salary_bdt: state.salaryBdt,
      dps_annual_rate_percent: state.dpsAnnualRatePercent,
      expenses: state.expenses,
      pockets: state.pockets,
      whatIfCuts: state.whatIfCuts,
    });
  },

  getInsights: () => {
    const state = get();
    const runway = state.getRunway();
    return generateDynamicInsights(runway, state.salaryBdt, state.today);
  },
}));
