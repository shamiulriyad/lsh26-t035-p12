import { Expense, Pocket, CalculatedRunway, CategorySummary, DPSScheduleItem, PocketCalculation } from '@/types/ledger';

/**
 * Robust Half-Up Rounding to nearest paisa (2 decimal places)
 */
export function roundHalfUp(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor + 0.5) / factor;
}

/**
 * Extract number of days in the month for a given ISO date (YYYY-MM-DD or YYYY-MM)
 */
export function getDaysInMonth(dateStr: string): number {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-indexed (1 = Jan, 4 = Apr)
  // Day 0 of next month is the last day of the current month
  return new Date(year, month, 0).getDate();
}

/**
 * Extract the day of the month (1-31) for a given ISO date
 */
export function getDayOfMonth(dateStr: string): number {
  const parts = dateStr.split('-');
  return parseInt(parts[2], 10) || 1;
}

/**
 * Calculate target completion date string from base date and months to add
 */
export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  if (monthsToAdd <= 0 || !isFinite(monthsToAdd)) return 'Stalled - Insufficient Runway';
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1; // 0-indexed
  
  const targetDate = new Date(year, monthIndex + monthsToAdd, 1);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
}

/**
 * Check if two expenses meet the auto-recurring criteria:
 * Exact shop name match and similar amount (+/- 10%)
 */
export function isRecurringExpenseMatch(thisExpense: Expense, lastExpense: Expense): boolean {
  if (!thisExpense.shop || !lastExpense.shop) return false;
  const shopMatch = thisExpense.shop.trim().toLowerCase() === lastExpense.shop.trim().toLowerCase();
  if (!shopMatch) return false;
  
  const lastAmt = lastExpense.amount_bdt;
  if (lastAmt <= 0) return false;
  const diff = Math.abs(thisExpense.amount_bdt - lastAmt);
  const maxDiff = lastAmt * 0.10; // +/- 10%
  return diff <= maxDiff + 0.001;
}

/**
 * Run DPS Compounding Calculation
 * Monthly compounded interest using declared annual rate r
 * For month m = 1 to N:
 *   balance = balance + deposit
 *   interest = roundHalfUp(balance * (r / (12 * 100)), 2)
 *   balance = balance + interest
 */
export function calculateDPSSchedule(
  deposit: number,
  annualRatePercent: number,
  months: number,
  initialBalance: number = 0
): { schedule: DPSScheduleItem[]; maturityValue: number; totalInterest: number; totalDeposited: number } {
  const schedule: DPSScheduleItem[] = [];
  let currentBalance = initialBalance;
  let cumulativeDeposit = initialBalance;
  let cumulativeInterest = 0;
  
  const safeMonths = Math.min(Math.max(1, Math.ceil(months)), 600); // capped at 50 years for safety
  const monthlyRateFactor = annualRatePercent / (12 * 100);

  for (let m = 1; m <= safeMonths; m++) {
    currentBalance += deposit;
    cumulativeDeposit += deposit;
    
    // Half-up rounding to nearest paisa
    const monthlyInterest = roundHalfUp(currentBalance * monthlyRateFactor, 2);
    currentBalance = roundHalfUp(currentBalance + monthlyInterest, 2);
    cumulativeInterest = roundHalfUp(cumulativeInterest + monthlyInterest, 2);

    if (m <= 60 || m === safeMonths || m % 6 === 0) {
      schedule.push({
        month: m,
        deposit,
        interest: monthlyInterest,
        balance: currentBalance,
        cumulativeDeposit: roundHalfUp(cumulativeDeposit, 2),
        cumulativeInterest: roundHalfUp(cumulativeInterest, 2),
      });
    }
  }

  return {
    schedule,
    maturityValue: currentBalance,
    totalInterest: cumulativeInterest,
    totalDeposited: cumulativeDeposit,
  };
}

/**
 * Master Financial & Runway Calculation Engine
 */
export function calculateRunway(params: {
  today: string;
  months: { last: string; this: string };
  salary_bdt: number;
  dps_annual_rate_percent: number;
  expenses: Expense[];
  pockets: Pocket[];
  whatIfCuts: Record<string, number>; // Category cuts from 0.00 to 0.50
}): CalculatedRunway {
  const { today, months, salary_bdt, dps_annual_rate_percent, expenses, pockets, whatIfCuts } = params;

  // 1. Time Variables
  const D = getDaysInMonth(today);
  const d = Math.min(getDayOfMonth(today), D);
  const remainingDays = Math.max(0, D - d);

  // 2. Separate Expenses by Month
  const thisMonthExpenses = expenses.filter(e => e.date.startsWith(months.this));
  const lastMonthExpenses = expenses.filter(e => e.date.startsWith(months.last));

  // 3. Mark Recurring Expenses
  const recurringDetectedList: Expense[] = [];
  const processedThisExpenses = thisMonthExpenses.map(item => {
    const hasRecurringMatch = lastMonthExpenses.some(lastItem => isRecurringExpenseMatch(item, lastItem));
    const isRecurring = item.isRecurring || hasRecurringMatch;
    if (isRecurring) {
      recurringDetectedList.push({ ...item, isRecurring: true });
    }
    return { ...item, isRecurring };
  });

  // 4. Baseline Spend & What-If Category Reductions
  let spentToDate = 0;
  const categorySpendMap: Record<string, { total: number; count: number }> = {};

  processedThisExpenses.forEach(e => {
    spentToDate += e.amount_bdt;
    if (!categorySpendMap[e.category]) {
      categorySpendMap[e.category] = { total: 0, count: 0 };
    }
    categorySpendMap[e.category].total += e.amount_bdt;
    categorySpendMap[e.category].count += 1;
  });

  // Last Month Category Spends for MoM
  const lastMonthCategorySpendMap: Record<string, number> = {};
  let momTotalSpentLast = 0;
  lastMonthExpenses.forEach(e => {
    momTotalSpentLast += e.amount_bdt;
    lastMonthCategorySpendMap[e.category] = (lastMonthCategorySpendMap[e.category] || 0) + e.amount_bdt;
  });

  // Compute What-If recovered liquidity
  let whatIfSavings = 0;
  Object.entries(whatIfCuts).forEach(([category, cutPercent]) => {
    const catSpend = categorySpendMap[category]?.total || 0;
    if (catSpend > 0 && cutPercent > 0) {
      whatIfSavings += catSpend * Math.min(0.50, Math.max(0, cutPercent));
    }
  });
  whatIfSavings = roundHalfUp(whatIfSavings, 2);

  // Adjusted Spend
  const adjustedSpentToDate = Math.max(0, roundHalfUp(spentToDate - whatIfSavings, 2));

  // 5. Daily Run-Rate & Month-End Projection
  const dailyRunRate = d > 0 ? roundHalfUp(adjustedSpentToDate / d, 2) : 0;
  const projectedSpend = roundHalfUp(dailyRunRate * D, 2);
  const actualSurplus = roundHalfUp(salary_bdt - projectedSpend, 2);
  const projectedSurplus = Math.max(0, actualSurplus);
  const isDeficit = actualSurplus < 0;

  // 6. Category Summaries & MoM Deltas
  const allCategories = Array.from(new Set([
    ...Object.keys(categorySpendMap),
    ...Object.keys(lastMonthCategorySpendMap)
  ]));

  const categories: CategorySummary[] = allCategories.map(cat => {
    const total_bdt = roundHalfUp(categorySpendMap[cat]?.total || 0, 2);
    const count = categorySpendMap[cat]?.count || 0;
    const lastTotal = roundHalfUp(lastMonthCategorySpendMap[cat] || 0, 2);
    const momChangeBdt = roundHalfUp(total_bdt - lastTotal, 2);
    const momChangePercent = lastTotal > 0
      ? roundHalfUp(((total_bdt - lastTotal) / lastTotal) * 100, 1)
      : total_bdt > 0 ? 100 : 0;
    
    return {
      category: cat,
      total_bdt,
      percentage_of_spend: spentToDate > 0 ? roundHalfUp((total_bdt / spentToDate) * 100, 1) : 0,
      percentage_of_salary: salary_bdt > 0 ? roundHalfUp((total_bdt / salary_bdt) * 100, 1) : 0,
      transaction_count: count,
      last_month_total_bdt: lastTotal,
      mom_change_bdt: momChangeBdt,
      mom_change_percent: momChangePercent,
    };
  }).sort((a, b) => b.total_bdt - a.total_bdt);

  // 7. Top 3 Largest Expenses this month
  const top3Expenses = [...processedThisExpenses]
    .sort((a, b) => b.amount_bdt - a.amount_bdt)
    .slice(0, 3);

  // 8. Overall MoM Deltas
  const momTotalDeltaBdt = roundHalfUp(spentToDate - momTotalSpentLast, 2);
  const momTotalDeltaPercent = momTotalSpentLast > 0
    ? roundHalfUp((momTotalDeltaBdt / momTotalSpentLast) * 100, 1)
    : spentToDate > 0 ? 100 : 0;

  // 9. Goal Pockets & Dynamic Scaling Factor (alpha)
  const totalPlannedPockets = pockets.reduce((sum, p) => sum + p.monthly_contribution_bdt, 0);
  
  const surplusScalingFactor = totalPlannedPockets > 0
    ? Math.min(1, Math.max(0, projectedSurplus / totalPlannedPockets))
    : 0;

  const pocketCalculations: PocketCalculation[] = pockets.map(pocket => {
    const plannedContribution = pocket.monthly_contribution_bdt;
    const effectiveContribution = roundHalfUp(plannedContribution * surplusScalingFactor, 2);
    const isStalled = effectiveContribution <= 0;
    
    const monthsToComplete = !isStalled
      ? Math.ceil(pocket.target_bdt / effectiveContribution)
      : null;
    
    const projectedDate = monthsToComplete !== null
      ? addMonthsToDate(today, monthsToComplete)
      : 'Goal Stalled (Zero Runway Surplus)';

    // DPS calculation (use effective contribution or planned contribution with tenure)
    const effectiveDpsRate = pocket.dpsAnnualRatePercent || dps_annual_rate_percent;
    const dpsMonths = monthsToComplete && monthsToComplete > 0 && monthsToComplete <= 240
      ? monthsToComplete
      : 36; // 3 years default for simulation

    const dpsResult = calculateDPSSchedule(
      effectiveContribution > 0 ? effectiveContribution : plannedContribution,
      effectiveDpsRate,
      dpsMonths,
      pocket.current_saved_bdt || 0
    );

    return {
      pocket,
      plannedContribution,
      effectiveContribution,
      monthsToComplete,
      projectedDate,
      isStalled,
      dpsMaturityValue: dpsResult.maturityValue,
      dpsTotalInterest: dpsResult.totalInterest,
      dpsTotalDeposited: dpsResult.totalDeposited,
      schedule: dpsResult.schedule,
    };
  });

  return {
    daysInMonth: D,
    elapsedDays: d,
    remainingDays,
    spentToDate: roundHalfUp(spentToDate, 2),
    whatIfSavings,
    adjustedSpentToDate,
    dailyRunRate,
    projectedSpend,
    projectedSurplus,
    actualSurplus,
    isDeficit,
    totalPlannedPockets,
    surplusScalingFactor,
    pocketCalculations,
    momTotalSpentLast: roundHalfUp(momTotalSpentLast, 2),
    momTotalDeltaBdt,
    momTotalDeltaPercent,
    top3Expenses,
    categories,
    recurringExpenses: recurringDetectedList,
  };
}

/**
 * Currency Formatter for Bangladeshi Taka (৳ / BDT)
 */
export function formatBDT(amount: number | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '৳0.00';
  const prefix = showSymbol ? '৳' : '';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with standard thousands separator
  const formatted = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${prefix}${formatted}`;
}

/**
 * Format BDT in Lakhs / Crore for large pocket milestones
 */
export function formatBDTLarge(amount: number): string {
  if (amount >= 10000000) {
    return `৳${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `৳${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatBDT(amount);
}
