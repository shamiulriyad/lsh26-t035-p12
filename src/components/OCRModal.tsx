'use client';

import React, { useState } from 'react';
import { useLedgerStore } from '@/store/ledgerStore';
import { OCR_PRESETS, OCRPreset, parseRawReceiptText } from '@/lib/ocrSimulator';
import { OCRParsedResult } from '@/types/ledger';
import { formatBDT } from '@/lib/calculations';
import {
  ScanLine,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Sparkles,
  Smartphone,
  Receipt,
  Eye,
  Check,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const OCRModal: React.FC = () => {
  const isOCRModalOpen = useLedgerStore((state) => state.isOCRModalOpen);
  const setOCRModalOpen = useLedgerStore((state) => state.setOCRModalOpen);
  const addExpense = useLedgerStore((state) => state.addExpense);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(OCR_PRESETS[0].id);
  const [parsedData, setParsedData] = useState<OCRParsedResult>(OCR_PRESETS[0].result);
  const [rawTextInput, setRawTextInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom_text' | 'upload'>('presets');

  // Editable Form State
  const [formShop, setFormShop] = useState(OCR_PRESETS[0].result.shop_name);
  const [formDate, setFormDate] = useState(OCR_PRESETS[0].result.date);
  const [formCategory, setFormCategory] = useState(OCR_PRESETS[0].result.category);
  const [formAmount, setFormAmount] = useState<string>(
    OCR_PRESETS[0].result.amount_bdt !== null ? OCR_PRESETS[0].result.amount_bdt.toString() : ''
  );
  const [formNotes, setFormNotes] = useState(OCR_PRESETS[0].result.notes || '');

  if (!isOCRModalOpen) return null;

  const handleSelectPreset = (preset: OCRPreset) => {
    setSelectedPresetId(preset.id);
    setParsedData(preset.result);
    setFormShop(preset.result.shop_name);
    setFormDate(preset.result.date);
    setFormCategory(preset.result.category);
    // STRICT ZERO HALLUCINATION: If guarded (<0.85), amount is blank!
    setFormAmount(preset.result.amount_bdt !== null ? preset.result.amount_bdt.toString() : '');
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

    setOCRModalOpen(false);
  };

  const getConfidenceBadge = (score: number) => {
    const pct = Math.round(score * 100);
    if (score >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          {pct}% (High)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40 animate-pulse">
        <AlertTriangle className="h-3 w-3 text-amber-400" />
        {pct}% (Low - Unsafe)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setOCRModalOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Multimodal OCR Ingestion & Verification Engine
            </h2>
            <p className="text-xs text-slate-400">
              Extracts data from paper chits, thermal receipts, and bKash/Nagad screenshots with Zero-Hallucination Guardrails.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Benchmark Dhaka Receipts (Presets)</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_text')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'custom_text'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Raw Chit Text Simulator</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'presets' && (
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Sample Receipt / Chit Archetype:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {OCR_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const isAmber = preset.result.isGuarded;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left rounded-xl border p-3 transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 shadow-md shadow-emerald-500/10'
                        : isAmber
                        ? 'border-amber-800/40 bg-amber-950/10 hover:border-amber-700/60'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.typeDescription}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span
                        className={`font-mono font-semibold ${
                          isAmber ? 'text-amber-400' : 'text-emerald-400'
                        }`}
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
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Paste or Type Raw Chit / SMS Text:
            </label>
            <textarea
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder="e.g.: Unimart Gulshan-2 Date: 2026-04-11 Total: BDT 546.50 OR Mama cha stall tea chit ৳?25 smudged"
              rows={3}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleParseCustomText}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Simulate OCR Parsing</span>
              </button>
            </div>
          </div>
        )}

        {/* STRICT ZERO-HALLUCINATION GUARDRAIL BANNER */}
        {parsedData.isGuarded ? (
          <div className="mb-6 rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 shadow-lg shadow-amber-900/20">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-300">
                    STRICT ZERO-HALLUCINATION GUARDRAIL ACTIVE
                  </h4>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                    Amount Confidence: {(parsedData.confidence.amount * 100).toFixed(0)}% (&lt; 85%)
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
                  Because the extracted amount is ambiguous or confidence score is below the <strong>0.85 safety threshold</strong>, the amount has been safely set to <code>null</code>. The field is highlighted below and <strong>requires manual human entry</strong> before saving to the ledger.
                </p>
                <div className="mt-2 text-[11px] font-mono text-amber-400/80">
                  Raw unparsed text snippet: "{parsedData.raw_amount_string}"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                OCR Verification Passed (Overall Confidence: {(parsedData.confidence.overall * 100).toFixed(0)}%)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              All critical fields passed 85% safety threshold
            </span>
          </div>
        )}

        {/* Human-in-the-Loop Editable Verification Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Human-in-the-Loop Verification & Edit Form
            </h3>
            <span className="text-[11px] text-slate-400">
              Inspect and adjust values before committing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Shop Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Shop / Merchant:</label>
                {getConfidenceBadge(parsedData.confidence.shop)}
              </div>
              <input
                type="text"
                value={formShop}
                onChange={(e) => setFormShop(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Date (YYYY-MM-DD):</label>
                {getConfidenceBadge(parsedData.confidence.date)}
              </div>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Category:</label>
                {getConfidenceBadge(parsedData.confidence.category)}
              </div>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="Rent">Rent</option>
                <option value="Food">Food</option>
                <option value="Groceries">Groceries</option>
                <option value="Utilities">Utilities</option>
                <option value="Mobile">Mobile</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Commute">Commute</option>
                <option value="Health">Health</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Amount (Guarded Field) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Amount (BDT):
                </label>
                {getConfidenceBadge(parsedData.confidence.amount)}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder={parsedData.isGuarded ? 'Needs Manual Entry (৳)' : '0.00'}
                  className={`w-full rounded-lg bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none transition ${
                    parsedData.isGuarded && !formAmount
                      ? 'border-2 border-amber-400 bg-amber-950/20 text-amber-300 placeholder-amber-400/70 shadow-lg shadow-amber-500/10'
                      : 'border border-slate-700 focus:border-emerald-400'
                  }`}
                />
              </div>
            </div>

          </div>

          {/* Notes / Annotation */}
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Audit Notes & Extraction Telemetry:
            </label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. TrxID, invoice slip notes, or manual verification remark"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 focus:border-slate-600 focus:outline-none"
            />
          </div>

          {/* Action Confirmation Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Preview Amount:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formAmount ? formatBDT(parseFloat(formAmount)) : '৳-- (Manual Entry Required)'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOCRModalOpen(false)}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveToLedger}
                disabled={!formAmount || parseFloat(formAmount) <= 0}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <Check className="h-4 w-4" />
                <span>Verify & Commit to Ledger</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
