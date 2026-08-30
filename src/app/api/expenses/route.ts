import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  ExpenseInput,
  ExpenseRow,
  expenseInputToRow,
  rowToExpense,
} from '@/types/database';

export const dynamic = 'force-dynamic';

function validate(body: Partial<ExpenseInput>, partial = false): string | null {
  const required = !partial;
  if (required || body.date !== undefined) {
    if (typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date))
      return 'date must be a YYYY-MM-DD string';
  }
  if (required || body.category !== undefined) {
    if (typeof body.category !== 'string' || !body.category.trim())
      return 'category is required';
  }
  if (required || body.shop !== undefined) {
    if (typeof body.shop !== 'string' || !body.shop.trim())
      return 'shop is required';
  }
  if (required || body.amount_bdt !== undefined) {
    if (typeof body.amount_bdt !== 'number' || !isFinite(body.amount_bdt) || body.amount_bdt < 0)
      return 'amount_bdt must be a non-negative number';
  }
  return null;
}

// GET /api/expenses  -> list the signed-in user's expenses (newest first)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    expenses: (data as ExpenseRow[]).map(rowToExpense),
  });
}

// POST /api/expenses  -> create one expense for the signed-in user
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Partial<ExpenseInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const problem = validate(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expenseInputToRow(body), user_id: user.id })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ expense: rowToExpense(data as ExpenseRow) }, { status: 201 });
}
