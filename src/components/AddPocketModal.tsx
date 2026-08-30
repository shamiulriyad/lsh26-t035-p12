'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { Target } from 'lucide-react';
import { Modal, Field, Input, Button } from '@/components/ui';

export const AddPocketModal: React.FC = () => {
  const isAddPocketModalOpen = useLedgerStore((state) => state.isAddPocketModalOpen);
  const setAddPocketModalOpen = useLedgerStore((state) => state.setAddPocketModalOpen);
  const addPocket = useLedgerStore((state) => state.addPocket);
  const dpsAnnualRatePercent = useLedgerStore((state) => state.dpsAnnualRatePercent);

  const [name, setName] = useState('');
  const [item, setItem] = useState('');
  const [targetBdt, setTargetBdt] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [currentSaved, setCurrentSaved] = useState('0');
  const [isDps, setIsDps] = useState(true);
  const [customDpsRate, setCustomDpsRate] = useState(dpsAnnualRatePercent.toString());

  const close = () => setAddPocketModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetBdt);
    const parsedMonthly = parseFloat(monthlyContribution);
    const parsedSaved = parseFloat(currentSaved) || 0;
    const parsedRate = parseFloat(customDpsRate) || dpsAnnualRatePercent;

    if (isNaN(parsedTarget) || parsedTarget <= 0 || isNaN(parsedMonthly) || parsedMonthly <= 0) {
      alert('Please enter valid target and monthly contribution amounts.');
      return;
    }

    addPocket({
      name: name.trim() || 'New Goal',
      item: item.trim() || 'Target Item',
      target_bdt: parsedTarget,
      monthly_contribution_bdt: parsedMonthly,
      current_saved_bdt: parsedSaved,
      isDps,
      dpsAnnualRatePercent: parsedRate,
    });

    setName('');
    setItem('');
    setTargetBdt('');
    setMonthlyContribution('');
    setCurrentSaved('0');
    close();
  };

  return (
    <Modal
      open={isAddPocketModalOpen}
      onClose={close}
      size="md"
      icon={<Target className="h-5 w-5" />}
      title="Create Goal Pocket"
      description="Model a savings horizon and DPS future-value compounding."
      footer={
        <>
          <Button variant="ghost" size="md" onClick={close}>
            Cancel
          </Button>
          <Button size="md" type="submit" form="add-pocket-form">
            Create pocket
          </Button>
        </>
      }
    >
      <form id="add-pocket-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Pocket / goal name" htmlFor="ap-name">
          <Input
            id="ap-name"
            type="text"
            required
            placeholder="e.g. Wedding, Laptop, Emergency Fund, Umrah"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Description / specific item" htmlFor="ap-item">
          <Input
            id="ap-item"
            type="text"
            required
            placeholder="e.g. MacBook Pro M3, Sena Malancha Hall booking"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Target amount (BDT)" htmlFor="ap-target">
            <Input
              id="ap-target"
              type="number"
              step="1000"
              required
              placeholder="150000"
              value={targetBdt}
              onChange={(e) => setTargetBdt(e.target.value)}
              className="font-mono font-bold"
            />
          </Field>

          <Field label={<>Planned monthly (C<sub>i</sub>)</>} htmlFor="ap-monthly">
            <Input
              id="ap-monthly"
              type="number"
              step="500"
              required
              placeholder="10000"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="font-mono font-bold text-emerald-400"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Already saved (BDT)" htmlFor="ap-saved">
            <Input
              id="ap-saved"
              type="number"
              step="500"
              placeholder="0"
              value={currentSaved}
              onChange={(e) => setCurrentSaved(e.target.value)}
              className="font-mono"
            />
          </Field>

          <Field label="DPS rate (% p.a.)" htmlFor="ap-rate">
            <Input
              id="ap-rate"
              type="number"
              step="0.25"
              value={customDpsRate}
              onChange={(e) => setCustomDpsRate(e.target.value)}
              className="font-mono text-indigo-300"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5">
          <input
            type="checkbox"
            checked={isDps}
            onChange={(e) => setIsDps(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
          />
          <span className="text-xs text-slate-300">
            Enable DPS monthly-compounding simulation for this pocket
          </span>
        </label>
      </form>
    </Modal>
  );
};
