import { Expense, ReceiptConfidence } from './ledger';

/** Shape of a row in the `public.expenses` table. */
export interface ExpenseRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  category: string;
  shop: string;
  amount_bdt: number | string; // numeric comes back as string from PostgREST
  is_recurring: boolean;
  notes: string | null;
  receipt_confidence: ReceiptConfidence | null;
  created_at: string;
  updated_at: string;
}

/** Fields the client is allowed to send when creating / updating an expense. */
export interface ExpenseInput {
  date: string;
  category: string;
  shop: string;
  amount_bdt: number;
  isRecurring?: boolean;
  notes?: string | null;
  receiptConfidence?: ReceiptConfidence | null;
}

/** DB row -> app `Expense` used by the store and calculations. */
export function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    shop: row.shop,
    amount_bdt: typeof row.amount_bdt === 'string' ? parseFloat(row.amount_bdt) : row.amount_bdt,
    isRecurring: row.is_recurring,
    notes: row.notes ?? undefined,
    receiptConfidence: row.receipt_confidence ?? undefined,
  };
}

/** App-facing input -> DB column names. Only defined keys are included. */
export function expenseInputToRow(input: Partial<ExpenseInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.date !== undefined) row.date = input.date;
  if (input.category !== undefined) row.category = input.category;
  if (input.shop !== undefined) row.shop = input.shop;
  if (input.amount_bdt !== undefined) row.amount_bdt = input.amount_bdt;
  if (input.isRecurring !== undefined) row.is_recurring = input.isRecurring;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.receiptConfidence !== undefined) row.receipt_confidence = input.receiptConfidence;
  return row;
}
