'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { OCR_PRESETS, OCRPreset, parseRawReceiptText } from '@/lib/ocrSimulator';
import { OCRParsedResult } from '@/types/ledger';
import { formatBDT } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Modal, Field, Input, Textarea, Select, Button } from '@/components/ui';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Receipt,
  Check,
  ShieldAlert,
} from 'lucide-react';

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

export const OCRModal: React.FC = () => {
  const isOCRModalOpen = useLedgerStore((state) => state.isOCRModalOpen);
  const setOCRModalOpen = useLedgerStore((state) => state.setOCRModalOpen);
  const addExpense = useLedgerStore((state) => state.addExpense);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(OCR_PRESETS[0].id);
  const [parsedData, setParsedData] = useState<OCRParsedResult>(OCR_PRESETS[0].result);
  const [rawTextInput, setRawTextInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom_text'>('presets');

  const [formShop, setFormShop] = useState(OCR_PRESETS[0].result.shop_name);
  const [formDate, setFormDate] = useState(OCR_PRESETS[0].result.date);
  const [formCategory, setFormCategory] = useState(OCR_PRESETS[0].result.category);
  const [formAmount, setFormAmount] = useState<string>(
    OCR_PRESETS[0].result.amount_bdt !== null
      ? OCR_PRESETS[0].result.amount_bdt.toString()
      : ''
  );
  const [formNotes, setFormNotes] = useState(OCR_PRESETS[0].result.notes || '');

  const close = () => setOCRModalOpen(false);

  const handleSelectPreset = (preset: OCRPreset) => {
    setSelectedPresetId(preset.id);
    setParsedData(preset.result);
    setFormShop(preset.result.shop_name);
    setFormDate(preset.result.date);
    setFormCategory(preset.result.category);
    setFormAmount(
      preset.result.amount_bdt !== null ? preset.result.amount_bdt.toString() : ''
    );
    setFormNotes(preset.result.notes || '');
  };

  const handleParseCustomText = () => {
    if (!rawTextInput.trim()) return;
    const result = parseRawReceiptText(rawTextInput);
    setParsedData(result);
    setFormShop(result.shop_name);
    setFormDate(result.date);
    setFormCategory(result.category);
    setFormAmount(result.amount_bdt !== null ? result.amount_bdt.toString() : '');
    setFormNotes(result.notes || '');
  };

  const handleSaveToLedger = () => {
    const parsedAmt = parseFloat(formAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      alert('Please enter a valid amount in BDT before saving to ledger.');
      return;
    }
    addExpense({
      date: formDate,
      shop: formShop.trim() || 'Dhaka Merchant',
      category: formCategory,
      amount_bdt: parsedAmt,
      receiptConfidence: parsedData.confidence,
      notes: formNotes,
    });
    close();
  };

  const confidenceBadge = (score: number) => {
    const pct = Math.round(score * 100);
    if (score >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {pct}% high
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
        <AlertTriangle className="h-3 w-3" />
        {pct}% low
      </span>
    );
  };

  const tabButton = (
    id: 'presets' | 'custom_text',
    label: string,
    icon: React.ReactNode
  ) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={cn(
        'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition',
        activeTab === id
          ? 'border-emerald-400 text-emerald-400'
          : 'border-transparent text-slate-400 hover:text-slate-200'
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Modal
      open={isOCRModalOpen}
      onClose={close}
      size="xl"
      icon={<ScanLine className="h-5 w-5" />}
      title="Multimodal OCR Ingestion & Verification"
      description="Extract data from paper chits, thermal receipts, and bKash / Nagad screenshots with zero-hallucination guardrails."
      footer={
        <>
          <div className="mr-auto flex items-center gap-2 text-xs text-slate-400">
            <span>Preview amount</span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {formAmount ? formatBDT(parseFloat(formAmount)) : '৳— (manual entry required)'}
            </span>
          </div>
          <Button variant="ghost" size="md" onClick={close}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleSaveToLedger}
            disabled={!formAmount || parseFloat(formAmount) <= 0}
          >
            <Check className="h-4 w-4" />
            Verify & commit
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {tabButton('presets', 'Benchmark receipts', <Receipt className="h-4 w-4" />)}
          {tabButton('custom_text', 'Raw chit text', <FileText className="h-4 w-4" />)}
        </div>

        {activeTab === 'presets' && (
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-300">
              Select a sample receipt / chit archetype
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {OCR_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const isAmber = preset.result.isGuarded;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      'flex flex-col justify-between rounded-xl border p-3 text-left transition',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : isAmber
                        ? 'border-amber-800/40 bg-amber-950/10 hover:border-amber-700/60'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    )}
                  >
                    <div>
                      <span className="line-clamp-1 text-xs font-bold text-white">
                        {preset.name}
                      </span>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                        {preset.typeDescription}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px]">
                      <span
                        className={cn(
                          'font-mono font-semibold',
                          isAmber ? 'text-amber-400' : 'text-emerald-400'
                        )}
                      >
                        {preset.badge}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'custom_text' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <Field
              label="Paste or type raw chit / SMS text"
              htmlFor="ocr-raw"
              className="space-y-2"
            >
              <Textarea
                id="ocr-raw"
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="e.g. Unimart Gulshan-2 Date: 2026-04-11 Total: BDT 546.50  —  or  —  Mama cha stall tea chit ৳?25 smudged"
                rows={3}
              />
            </Field>
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={handleParseCustomText}>
                <Sparkles className="h-3.5 w-3.5" />
                Simulate OCR parsing
              </Button>
            </div>
          </div>
        )}

        {/* Guardrail banner */}
        {parsedData.isGuarded ? (
          <div className="rounded-xl border border-amber-500/50 bg-amber-950/30 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-300">
                    Zero-hallucination guardrail active
                  </h4>
                  <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                    Amount confidence {(parsedData.confidence.amount * 100).toFixed(0)}% (&lt; 85%)
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-amber-200/90">
                  The extracted amount is ambiguous or below the{' '}
                  <strong>0.85 safety threshold</strong>, so it was set to{' '}
                  <code>null</code>. The amount field below{' '}
                  <strong>requires manual entry</strong> before saving.
                </p>
                <div className="mt-2 font-mono text-[11px] text-amber-400/80">
                  Raw snippet: &quot;{parsedData.raw_amount_string}&quot;
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                OCR verification passed · overall{' '}
                {(parsedData.confidence.overall * 100).toFixed(0)}%
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              All critical fields cleared the 85% threshold
            </span>
          </div>
        )}

        {/* Verification form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Human-in-the-loop verification
            </h3>
            <span className="text-[11px] text-slate-400">
              Inspect and adjust values before committing
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Shop / merchant"
              htmlFor="ocr-shop"
              labelRight={confidenceBadge(parsedData.confidence.shop)}
            >
              <Input
                id="ocr-shop"
                type="text"
                value={formShop}
                onChange={(e) => setFormShop(e.target.value)}
              />
            </Field>

            <Field
              label="Date"
              htmlFor="ocr-date"
              labelRight={confidenceBadge(parsedData.confidence.date)}
            >
              <Input
                id="ocr-date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </Field>

            <Field
              label="Category"
              htmlFor="ocr-category"
              labelRight={confidenceBadge(parsedData.confidence.category)}
            >
              <Select
                id="ocr-category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Amount (BDT)"
              htmlFor="ocr-amount"
              labelRight={confidenceBadge(parsedData.confidence.amount)}
            >
              <Input
                id="ocr-amount"
                type="number"
                step="0.5"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder={parsedData.isGuarded ? 'Needs manual entry ৳' : '0.00'}
                className={cn(
                  'font-mono font-bold',
                  parsedData.isGuarded && !formAmount &&
                    'border-2 border-amber-400 bg-amber-950/20 text-amber-300 placeholder-amber-400/70'
                )}
              />
            </Field>
          </div>

          <Field label="Audit notes & extraction telemetry" htmlFor="ocr-notes" className="mt-4">
            <Input
              id="ocr-notes"
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. TrxID, invoice slip notes, or manual verification remark"
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
};
