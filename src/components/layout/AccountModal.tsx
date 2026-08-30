'use client';

import React, { useState } from 'react';
import { UserCog, LogOut, LogIn, CloudOff, Cloud, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Modal, Field, Input, Select, Button, Badge } from '@/components/ui';
import { useLedgerStore } from '@/store/ledgerStore';
import { BENCHMARK_CASES } from '@/data/benchmarks';
import { formatBDT } from '@/lib/calculations';
import { useAuth } from './AuthProvider';
import { userFromEmail } from './userDisplay';

export const AccountModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { configured, email, signingOut, remoteLoading, syncError, refresh, signOut } = useAuth();
  const user = userFromEmail(email);

  const {
    activeCaseId,
    salaryBdt,
    today,
    dpsAnnualRatePercent,
    loadBenchmarkCase,
    setSalary,
    setToday,
    setDpsRate,
  } = useLedgerStore();

  const [salaryInput, setSalaryInput] = useState(String(salaryBdt));
  const [rateInput, setRateInput] = useState(String(dpsAnnualRatePercent));

  // Keep local inputs in sync when the store changes (e.g. benchmark switch).
  React.useEffect(() => setSalaryInput(String(salaryBdt)), [salaryBdt]);
  React.useEffect(() => setRateInput(String(dpsAnnualRatePercent)), [dpsAnnualRatePercent]);

  const commitSalary = () => {
    const n = parseFloat(salaryInput);
    if (!isNaN(n) && n >= 0) setSalary(n);
    else setSalaryInput(String(salaryBdt));
  };
  const commitRate = () => {
    const n = parseFloat(rateInput);
    if (!isNaN(n) && n >= 0) setDpsRate(n);
    else setRateInput(String(dpsAnnualRatePercent));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={<UserCog className="h-5 w-5" />}
      title="Account & Preferences"
      description="Identity, remote sync status, and the working assumptions behind every projection."
    >
      <div className="space-y-6">
        {/* Identity */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-sm font-bold text-slate-950">
              {user.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.handle}</p>
            </div>
            {!configured ? (
              <Badge tone="slate">
                <CloudOff className="h-3 w-3" /> Local demo
              </Badge>
            ) : syncError ? (
              <Badge tone="rose">Sync error</Badge>
            ) : email ? (
              <Badge tone="emerald">
                <Cloud className="h-3 w-3" /> Synced
              </Badge>
            ) : (
              <Badge tone="amber">Signed out</Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {configured && email && (
              <>
                <Button size="xs" variant="secondary" onClick={refresh}>
                  <RefreshCw className={remoteLoading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                  Reload from Supabase
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={signingOut}
                  onClick={async () => {
                    await signOut();
                    onClose();
                  }}
                >
                  {signingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </Button>
              </>
            )}
            {configured && !email && (
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-[11px] font-semibold text-slate-100 transition hover:bg-slate-700"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
          </div>
          {syncError && (
            <p className="mt-2 text-[11px] text-rose-300">{syncError}</p>
          )}
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Model assumptions
          </p>

          <Field label="Benchmark scenario" htmlFor="acc-benchmark">
            <Select
              id="acc-benchmark"
              value={activeCaseId}
              onChange={(e) => loadBenchmarkCase(e.target.value)}
            >
              {Object.values(BENCHMARK_CASES).map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field
              label="Monthly salary"
              htmlFor="acc-salary"
              hint={formatBDT(salaryBdt)}
            >
              <Input
                id="acc-salary"
                type="number"
                inputMode="decimal"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                onBlur={commitSalary}
                onKeyDown={(e) => e.key === 'Enter' && commitSalary()}
              />
            </Field>

            <Field label="Today (YYYY-MM-DD)" htmlFor="acc-today">
              <Input
                id="acc-today"
                type="date"
                value={today}
                onChange={(e) => setToday(e.target.value)}
              />
            </Field>

            <Field label="DPS rate (% p.a.)" htmlFor="acc-rate">
              <Input
                id="acc-rate"
                type="number"
                step="0.25"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                onBlur={commitRate}
                onKeyDown={(e) => e.key === 'Enter' && commitRate()}
              />
            </Field>
          </div>
        </section>
      </div>
    </Modal>
  );
};
