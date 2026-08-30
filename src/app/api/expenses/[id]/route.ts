import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  ExpenseInput,
  ExpenseRow,
  expenseInputToRow,
  rowToExpense,
} from '@/types/database';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

function validatePartial(body: Partial<ExpenseInput>): string | null {
  if (body.date !== undefined && (typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)))
    return 'date must be a YYYY-MM-DD string';
  if (body.category !== undefined && (typeof body.category !== 'string' || !body.category.trim()))
    return 'category must be a non-empty string';
  if (body.shop !== undefined && (typeof body.shop !== 'string' || !body.shop.trim()))
    return 'shop must be a non-empty string';
  if (
    body.amount_bdt !== undefined &&
    (typeof body.amount_bdt !== 'number' || !isFinite(body.amount_bdt) || body.amount_bdt < 0)
  )
    return 'amount_bdt must be a non-negative number';
  return null;
}

// PATCH /api/expenses/:id  -> update fields on one of the user's expenses
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Partial<ExpenseInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const problem = validatePartial(body);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const patch = expenseInputToRow(body);
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });

  const { data, error } = await supabase
    .from('expenses')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ expense: rowToExpense(data as ExpenseRow) });
}

// DELETE /api/expenses/:id  -> remove one of the user's expenses
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error, count } = await supabase
    .from('expenses')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
