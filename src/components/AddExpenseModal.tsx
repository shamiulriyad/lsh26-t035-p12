'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { PlusCircle } from 'lucide-react';
import { Modal, Field, Input, Select, Button } from '@/components/ui';

const CATEGORIES = [
  'Rent',
  'Food',
  'Groceries',
  'Utilities',
  'Mobile',
  'Entertainment',
  'Commute',
  'Health',
  'Shopping',
  'Other',
];

export const AddExpenseModal: React.FC = () => {
  const isAddExpenseModalOpen = useLedgerStore((state) => state.isAddExpenseModalOpen);
  const setAddExpenseModalOpen = useLedgerStore((state) => state.setAddExpenseModalOpen);
  const addExpense = useLedgerStore((state) => state.addExpense);
  const today = useLedgerStore((state) => state.today);

  const [date, setDate] = useState(today);
  const [shop, setShop] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const close = () => setAddExpenseModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    addExpense({
      date,
      shop: shop.trim() || 'Dhaka Merchant',
      category,
      amount_bdt: parsedAmount,
      notes: notes.trim() || undefined,
    });

    setShop('');
    setAmount('');
    setNotes('');
    close();
  };

  return (
    <Modal
      open={isAddExpenseModalOpen}
      onClose={close}
      size="md"
      icon={<PlusCircle className="h-5 w-5" />}
      title="Add Ledger Expense"
      description="Record a manual cash or card transaction in Dhaka BDT."
      footer={
        <>
          <Button variant="ghost" size="md" onClick={close}>
            Cancel
          </Button>
          <Button size="md" type="submit" form="add-expense-form">
            Save expense
          </Button>
        </>
      }
    >
      <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Date" htmlFor="ae-date">
          <Input
            id="ae-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Shop / merchant name" htmlFor="ae-shop">
          <Input
            id="ae-shop"
            type="text"
            required
            placeholder="e.g. Unimart, Sultans Dine, DESCO, Landlord"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" htmlFor="ae-category">
            <Select
              id="ae-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Amount (BDT ৳)" htmlFor="ae-amount">
            <Input
              id="ae-amount"
              type="number"
              step="0.5"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono font-bold"
            />
          </Field>
        </div>

        <Field label="Notes (optional)" htmlFor="ae-notes">
          <Input
            id="ae-notes"
            type="text"
            placeholder="e.g. Lunch with team, bKash TrxID, monthly grocery haul"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
};
