import { Expense } from '@/types/ledger';
import { ExpenseInput } from '@/types/database';

/** Thin fetch wrappers around the /api/expenses route handlers. */

async function parse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error || `Request failed (${res.status})`);
  }
  return json as T;
}

export async function listExpenses(): Promise<Expense[]> {
  const res = await fetch('/api/expenses', { cache: 'no-store' });
  const { expenses } = await parse<{ expenses: Expense[] }>(res);
  return expenses;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const res = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const { expense } = await parse<{ expense: Expense }>(res);
  return expense;
}

export async function updateExpense(
  id: string,
  patch: Partial<ExpenseInput>
): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  const { expense } = await parse<{ expense: Expense }>(res);
  return expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
  await parse<{ ok: true }>(res);
}
