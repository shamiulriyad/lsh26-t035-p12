export interface ReceiptConfidence {
  shop: number;
  date: number;
  amount: number;
  category: number;
  overall: number;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string;
  shop: string;
  amount_bdt: number;
  isRecurring?: boolean;
  receiptConfidence?: ReceiptConfidence;
  notes?: string;
}

export interface Pocket {
  id: string;
  name: string;
  item: string;
  target_bdt: number;
  monthly_contribution_bdt: number;
  current_saved_bdt?: number;
  dpsAnnualRatePercent?: number;
  isDps?: boolean;
}

export interface MonthsConfig {
  last: string; // YYYY-MM
  this: string; // YYYY-MM
}

export interface BenchmarkCase {
  case_id: string;
  name: string;
  description: string;
  today: string; // YYYY-MM-DD
  months: MonthsConfig;
  salary_bdt: number;
  dps_annual_rate_percent: number;
  expenses: Expense[];
  pockets: Pocket[];
}

export interface CategorySummary {
  category: string;
  total_bdt: number;
  percentage_of_spend: number;
  percentage_of_salary: number;
  transaction_count: number;
  last_month_total_bdt: number;
  mom_change_bdt: number;
  mom_change_percent: number; // positive = increased spend, negative = reduced spend
}

export interface DPSScheduleItem {
  month: number;
  deposit: number;
  interest: number;
  balance: number;
  cumulativeDeposit: number;
  cumulativeInterest: number;
}

export interface PocketCalculation {
  pocket: Pocket;
  plannedContribution: number;
  effectiveContribution: number;
  monthsToComplete: number | null; // null if stalled (Infinity)
  projectedDate: string; // e.g. "April 2028" or "Stalled - Insufficient Runway"
  isStalled: boolean;
  dpsMaturityValue: number;
  dpsTotalInterest: number;
  dpsTotalDeposited: number;
  schedule: DPSScheduleItem[];
}

export interface CalculatedRunway {
  daysInMonth: number; // D
  elapsedDays: number; // d
  remainingDays: number; // D - d
  spentToDate: number; // Total spent in months.this
  whatIfSavings: number; // Liquidity recovered from what-if category cuts
  adjustedSpentToDate: number; // spentToDate - whatIfSavings
  dailyRunRate: number; // R = adjustedSpentToDate / d
  projectedSpend: number; // S_projected = R * D
  projectedSurplus: number; // Surplus = Salary - S_projected (min 0 for pocket funding)
  actualSurplus: number; // Raw salary - S_projected (can be negative for deficit alert)
  isDeficit: boolean;
  totalPlannedPockets: number; // sum(C_i)
  surplusScalingFactor: number; // alpha = min(1, Surplus / TotalPlanned)
  pocketCalculations: PocketCalculation[];
  momTotalSpentLast: number;
  momTotalDeltaBdt: number;
  momTotalDeltaPercent: number;
  top3Expenses: Expense[];
  categories: CategorySummary[];
  recurringExpenses: Expense[];
}

export interface WrittenInsight {
  id: string;
  title: string;
  type: 'critical' | 'warning' | 'positive' | 'neutral' | 'runway';
  metric: string;
  narrative: string;
  category?: string;
  impactBdt?: number;
  badge?: string;
}

export interface OCRParsedResult {
  shop_name: string;
  date: string;
  amount_bdt: number | null; // null if amount_confidence < 0.85 (Zero hallucination guardrail)
  raw_amount_string: string;
  category: string;
  confidence: ReceiptConfidence;
  isGuarded: boolean; // True if amount < 0.85
  receipt_type: 'chit' | 'bkash' | 'nagad' | 'pos_slip' | 'utility' | 'handwritten';
  image_url?: string;
  notes?: string;
}
