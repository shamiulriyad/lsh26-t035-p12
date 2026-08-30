import { CalculatedRunway, WrittenInsight } from '@/types/ledger';
import { formatBDT } from './calculations';

/**
 * Generate 3+ dynamic, data-grounded programmatic written insights
 * Citing concrete numbers, categories, merchants, and run rates.
 */
export function generateDynamicInsights(
  runway: CalculatedRunway,
  salaryBdt: number,
  today: string
): WrittenInsight[] {
  const insights: WrittenInsight[] = [];
  const {
    elapsedDays,
    daysInMonth,
    remainingDays,
    dailyRunRate,
    projectedSpend,
    actualSurplus,
    projectedSurplus,
    isDeficit,
    spentToDate,
    whatIfSavings,
    surplusScalingFactor,
    totalPlannedPockets,
    pocketCalculations,
    categories,
    top3Expenses,
    momTotalDeltaBdt,
    momTotalDeltaPercent,
    recurringExpenses,
  } = runway;

  const topCategory = categories[0];
  const topExpense = top3Expenses[0];

  // --------------------------------------------------------------------------
  // Insight 1: Run-Rate & Runway Burn Velocity
  // --------------------------------------------------------------------------
  const salaryUsagePct = salaryBdt > 0 ? ((projectedSpend / salaryBdt) * 100).toFixed(1) : '0';
  const spendPct = salaryBdt > 0 ? ((spentToDate / salaryBdt) * 100).toFixed(1) : '0';

  let runwayNarrative = '';
  if (isDeficit) {
    runwayNarrative = `At a daily burn rate of ${formatBDT(dailyRunRate)}/day over ${elapsedDays} elapsed days (${daysInMonth} days total in ${today.slice(0, 7)}), projected month-end spend reaches ${formatBDT(projectedSpend)} (${salaryUsagePct}% of salary). This creates an alarming cashflow deficit of ${formatBDT(Math.abs(actualSurplus))}, requiring immediate category cuts.`;
  } else {
    runwayNarrative = `At your current daily burn rate of ${formatBDT(dailyRunRate)}/day over ${elapsedDays} elapsed days (${remainingDays} days remaining), projected month-end spend is ${formatBDT(projectedSpend)} (${salaryUsagePct}% of your ${formatBDT(salaryBdt)} salary). This leaves an estimated runway surplus of ${formatBDT(projectedSurplus)} (${(100 - parseFloat(salaryUsagePct)).toFixed(1)}% buffer).`;
  }

  if (whatIfSavings > 0) {
    runwayNarrative += ` Applied What-If scenario cuts have unlocked ${formatBDT(whatIfSavings)} in recovered liquidity.`;
  }

  insights.push({
    id: 'insight-runway-burn',
    title: isDeficit ? 'Deficit Warning: Burn Rate Exceeds Salary' : 'Runway Velocity & Month-End Projection',
    type: isDeficit ? 'critical' : projectedSurplus < salaryBdt * 0.1 ? 'warning' : 'positive',
    metric: `${formatBDT(dailyRunRate)}/day`,
    narrative: runwayNarrative,
    impactBdt: projectedSurplus,
    badge: isDeficit ? 'Deficit Alert' : `${salaryUsagePct}% of Salary Projected`,
  });

  // --------------------------------------------------------------------------
  // Insight 2: Merchant & Category Concentration
  // --------------------------------------------------------------------------
  if (topCategory && topCategory.total_bdt > 0) {
    const categorySharePct = topCategory.percentage_of_spend;
    let merchantDetail = '';
    
    if (topExpense && topExpense.category === topCategory.category) {
      merchantDetail = `led primarily by ${topExpense.shop} (${formatBDT(topExpense.amount_bdt)} on ${topExpense.date})`;
    } else if (topExpense) {
      merchantDetail = `with single largest spend at ${topExpense.shop} (${formatBDT(topExpense.amount_bdt)} under ${topExpense.category})`;
    }

    const foodCategory = categories.find(c => c.category.toLowerCase().includes('food') || c.category.toLowerCase().includes('grocer'));
    let foodDetail = '';
    if (foodCategory && foodCategory.category !== topCategory.category) {
      foodDetail = ` Meanwhile, ${foodCategory.category} accounts for ${formatBDT(foodCategory.total_bdt)} (${foodCategory.percentage_of_spend}% of total spend across ${foodCategory.transaction_count} transaction${foodCategory.transaction_count > 1 ? 's' : ''}).`;
    }

    insights.push({
      id: 'insight-category-concentration',
      title: `${topCategory.category} Concentration & Outflow Driver`,
      type: categorySharePct > 50 ? 'warning' : 'neutral',
      metric: `${categorySharePct}% of MTD Spend`,
      narrative: `${topCategory.category} represents your largest expenditure at ${formatBDT(topCategory.total_bdt)} (${categorySharePct}% of ${formatBDT(spentToDate)} spent to date across ${topCategory.transaction_count} transaction${topCategory.transaction_count > 1 ? 's' : ''}), ${merchantDetail}.${foodDetail}`,
      category: topCategory.category,
      impactBdt: topCategory.total_bdt,
      badge: `${topCategory.category} (${categorySharePct}%)`,
    });
  } else {
    insights.push({
      id: 'insight-category-concentration',
      title: 'Expense Distribution',
      type: 'neutral',
      metric: 'No Spends',
      narrative: 'No expenses recorded yet for this billing cycle. Add expenses or scan receipts to generate merchant distribution insights.',
    });
  }

  // --------------------------------------------------------------------------
  // Insight 3: Goal Pockets Runway Grounding & Surplus Scaling (alpha)
  // --------------------------------------------------------------------------
  const alphaPercent = (surplusScalingFactor * 100).toFixed(1);
  let pocketNarrative = '';
  let pocketType: WrittenInsight['type'] = 'positive';

  if (totalPlannedPockets === 0) {
    pocketNarrative = 'No goal pockets active. Create pockets (e.g. Wedding, Laptop, Emergency Reserve) to activate automated runway-grounded savings allocation.';
    pocketType = 'neutral';
  } else if (surplusScalingFactor >= 1.0) {
    const fastestPocket = [...pocketCalculations].sort((a, b) => (a.monthsToComplete || 999) - (b.monthsToComplete || 999))[0];
    pocketNarrative = `Your projected surplus of ${formatBDT(projectedSurplus)} fully covers all ${formatBDT(totalPlannedPockets)}/mo in planned savings (α = 1.000). All ${pocketCalculations.length} goal pockets are operating at 100% velocity. Fastest target '${fastestPocket.pocket.name}' (${formatBDT(fastestPocket.pocket.target_bdt)}) will be completed by ${fastestPocket.projectedDate}.`;
    pocketType = 'positive';
  } else if (surplusScalingFactor > 0) {
    const stalledPockets = pocketCalculations.filter(p => p.isStalled);
    const slowestPocket = [...pocketCalculations].sort((a, b) => (b.monthsToComplete || 0) - (a.monthsToComplete || 0))[0];
    pocketNarrative = `Available runway surplus (${formatBDT(projectedSurplus)}) covers only ${alphaPercent}% of your planned ${formatBDT(totalPlannedPockets)}/mo pocket targets (α = ${surplusScalingFactor.toFixed(3)}). Monthly effective contributions are scaled down proportionally, extending '${slowestPocket.pocket.name}' to ${slowestPocket.projectedDate} (${slowestPocket.monthsToComplete} months).`;
    pocketType = 'warning';
  } else {
    pocketNarrative = `Cashflow runway surplus is depleted (৳0.00 available vs ${formatBDT(totalPlannedPockets)}/mo planned). Under the dynamic runway constraint (α = 0.00), all ${pocketCalculations.length} goal pockets are STALLED. Use the What-If reduction sliders to recover liquidity and restart savings velocity.`;
    pocketType = 'critical';
  }

  insights.push({
    id: 'insight-pockets-feasibility',
    title: surplusScalingFactor >= 1.0 ? 'Goal Pockets 100% Funded' : surplusScalingFactor > 0 ? 'Goal Pockets Scaled by Surplus Constraint' : 'Goal Pockets Stalled (Zero Surplus)',
    type: pocketType,
    metric: `α = ${(surplusScalingFactor).toFixed(3)} (${alphaPercent}%)`,
    narrative: pocketNarrative,
    impactBdt: totalPlannedPockets * surplusScalingFactor,
    badge: `Scaling Factor α: ${surplusScalingFactor.toFixed(3)}`,
  });

  // --------------------------------------------------------------------------
  // Insight 4: Month-over-Month & Auto-Recurring Detection
  // --------------------------------------------------------------------------
  const recurringTotal = recurringExpenses.reduce((sum, e) => sum + e.amount_bdt, 0);
  const recurringCount = recurringExpenses.length;
  let momTrend = '';
  
  if (momTotalDeltaBdt > 0) {
    momTrend = `Month-to-date spend is up by +${formatBDT(momTotalDeltaBdt)} (+${momTotalDeltaPercent}%) compared to last month.`;
  } else if (momTotalDeltaBdt < 0) {
    momTrend = `Month-to-date spend is down by ${formatBDT(Math.abs(momTotalDeltaBdt))} (${momTotalDeltaPercent}%) compared to last month.`;
  } else {
    momTrend = `Month-to-date spend is matching last month's pace.`;
  }

  const recurringDetail = recurringCount > 0
    ? ` Detected ${recurringCount} auto-recurring expense${recurringCount > 1 ? 's' : ''} (${formatBDT(recurringTotal)}), including ${recurringExpenses.map(r => `${r.shop} (${formatBDT(r.amount_bdt)})`).slice(0, 2).join(', ')}.`
    : ' No recurring identical merchant spends detected between months.';

  insights.push({
    id: 'insight-mom-recurring',
    title: 'MoM Velocity & Recurring Commitments',
    type: momTotalDeltaBdt > salaryBdt * 0.15 ? 'warning' : 'neutral',
    metric: `${momTotalDeltaPercent >= 0 ? '+' : ''}${momTotalDeltaPercent}% MoM`,
    narrative: `${momTrend}${recurringDetail}`,
    impactBdt: recurringTotal,
    badge: `${recurringCount} Recurring Items`,
  });

  return insights;
}
