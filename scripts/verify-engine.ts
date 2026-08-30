import { BENCHMARK_CASES } from '../src/data/benchmarks';
import { calculateRunway, roundHalfUp, calculateDPSSchedule, isRecurringExpenseMatch } from '../src/lib/calculations';
import { generateDynamicInsights } from '../src/lib/insights';
import { OCR_PRESETS, parseRawReceiptText } from '../src/lib/ocrSimulator';

console.log('=================================================================');
console.log('RUNNING AUTOMATED VERIFICATION SUITE FOR TAKARUNWAY DHAKA ENGINE');
console.log('=================================================================\n');

let allPassed = true;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (detail) console.error('   Detail:', detail);
    allPassed = false;
  }
}

// --------------------------------------------------------------------------
// TEST 1: PUB-01 Benchmark Runway Calculations
// --------------------------------------------------------------------------
const pub1 = BENCHMARK_CASES['PUB-01'];
const runwayPub1 = calculateRunway({
  today: pub1.today, // 2026-04-17
  months: pub1.months, // last: 2026-03, this: 2026-04
  salary_bdt: pub1.salary_bdt, // 50000
  dps_annual_rate_percent: pub1.dps_annual_rate_percent, // 8.0
  expenses: pub1.expenses,
  pockets: pub1.pockets,
  whatIfCuts: {},
});

assert(runwayPub1.daysInMonth === 30, 'PUB-01 Days in Month (April = 30)', { D: runwayPub1.daysInMonth });
assert(runwayPub1.elapsedDays === 17, 'PUB-01 Elapsed Days (April 17 = 17)', { d: runwayPub1.elapsedDays });
assert(runwayPub1.remainingDays === 13, 'PUB-01 Remaining Days (30 - 17 = 13)', { rem: runwayPub1.remainingDays });

// Baseline spend for April:
// E027 (16000) + E028 (364) + E029 (492) + E030 (535.5) + E031 (2599.5) + E032 (679) + E033 (546.5) + E036 (1326) + E041 (735)
// Total = 16000 + 364 + 492 + 535.5 + 2599.5 + 679 + 546.5 + 1326 + 735 = 23277.5? Wait, let's sum:
const expectedSpent = 16000 + 364 + 492 + 535.5 + 2599.5 + 679 + 546.5 + 1326 + 735;
console.log('Expected April spent:', expectedSpent, 'Calculated:', runwayPub1.spentToDate);
assert(runwayPub1.spentToDate === expectedSpent, `PUB-01 Spent to Date equals ${expectedSpent}`, { spent: runwayPub1.spentToDate });

const expectedR = roundHalfUp(expectedSpent / 17, 2);
assert(runwayPub1.dailyRunRate === expectedR, `PUB-01 Daily Run Rate R = ${expectedR}/day`, { R: runwayPub1.dailyRunRate });

const expectedProjectedSpend = roundHalfUp(expectedR * 30, 2);
assert(runwayPub1.projectedSpend === expectedProjectedSpend, `PUB-01 Projected Spend S_projected = ${expectedProjectedSpend}`, { S: runwayPub1.projectedSpend });

const expectedSurplus = Math.max(0, roundHalfUp(50000 - expectedProjectedSpend, 2));
assert(runwayPub1.projectedSurplus === expectedSurplus, `PUB-01 Surplus = ${expectedSurplus}`, { surplus: runwayPub1.projectedSurplus });

// Total Planned Pockets: 20000 + 12000 + 9000 = 41000
const expectedTotalPlanned = 41000;
assert(runwayPub1.totalPlannedPockets === expectedTotalPlanned, `PUB-01 Total Planned Pockets = 41,000`, { planned: runwayPub1.totalPlannedPockets });

const expectedAlpha = Math.min(1, expectedSurplus / expectedTotalPlanned);
assert(Math.abs(runwayPub1.surplusScalingFactor - expectedAlpha) < 0.0001, `PUB-01 Scaling factor alpha = ${expectedAlpha.toFixed(5)}`, { alpha: runwayPub1.surplusScalingFactor });

// Check effective contributions
runwayPub1.pocketCalculations.forEach(p => {
  const expectedEffective = roundHalfUp(p.plannedContribution * runwayPub1.surplusScalingFactor, 2);
  assert(p.effectiveContribution === expectedEffective, `Pocket ${p.pocket.name} effective contribution = ${expectedEffective}`, { effective: p.effectiveContribution });
  const expectedMonths = Math.ceil(p.pocket.target_bdt / expectedEffective);
  assert(p.monthsToComplete === expectedMonths, `Pocket ${p.pocket.name} months to complete = ${expectedMonths}`, { months: p.monthsToComplete });
});

// --------------------------------------------------------------------------
// TEST 2: Auto-Recurring Spend Detector
// --------------------------------------------------------------------------
// E002 (March Rent 16000) vs E027 (April Rent 16000) -> Recurring match!
const rentApril = pub1.expenses.find(e => e.id === 'E027')!;
const rentMarch = pub1.expenses.find(e => e.id === 'E002')!;
assert(isRecurringExpenseMatch(rentApril, rentMarch), 'Auto-Recurring: Landlord Rent matched between March and April');

// E003 (March DESCO 856.5) vs E031 (April DESCO 2599.5) -> shop match, but amount diff > 10%
const descoApril = pub1.expenses.find(e => e.id === 'E031')!;
const descoMarch = pub1.expenses.find(e => e.id === 'E003')!;
assert(!isRecurringExpenseMatch(descoApril, descoMarch), 'Auto-Recurring: DESCO amount >10% variance correctly not auto-matched');

// --------------------------------------------------------------------------
// TEST 3: What-If Scenario Category Cuts
// --------------------------------------------------------------------------
// Apply 20% cut to Rent and 10% to Food
const runwayWithCuts = calculateRunway({
  today: pub1.today,
  months: pub1.months,
  salary_bdt: pub1.salary_bdt,
  dps_annual_rate_percent: pub1.dps_annual_rate_percent,
  expenses: pub1.expenses,
  pockets: pub1.pockets,
  whatIfCuts: { Rent: 0.20, Food: 0.10 },
});

const rentSpend = 16000;
const foodSpend = 364 + 492 + 735;
const expectedWhatIfSavings = roundHalfUp(rentSpend * 0.20 + foodSpend * 0.10, 2);
assert(runwayWithCuts.whatIfSavings === expectedWhatIfSavings, `What-If Savings = ${expectedWhatIfSavings} BDT recovered`, { savings: runwayWithCuts.whatIfSavings });
assert(runwayWithCuts.adjustedSpentToDate === roundHalfUp(expectedSpent - expectedWhatIfSavings, 2), 'Adjusted Spend reduced by What-If savings');
assert(runwayWithCuts.projectedSurplus > runwayPub1.projectedSurplus, 'Projected Surplus expanded after category cuts');
assert(runwayWithCuts.surplusScalingFactor > runwayPub1.surplusScalingFactor, 'Scaling Factor alpha increased after category cuts');

// --------------------------------------------------------------------------
// TEST 4: DPS Paisa-Precise Half-Up Compounding Engine
// --------------------------------------------------------------------------
// Deposit 10,000 @ 8% p.a. for 12 months
const dps12 = calculateDPSSchedule(10000, 8.0, 12, 0);
console.log('DPS 12 Months Maturity:', dps12.maturityValue, 'Total Interest:', dps12.totalInterest, 'Total Deposited:', dps12.totalDeposited);
assert(dps12.totalDeposited === 120000, 'DPS Total Deposited = 120,000 for 10k x 12');
assert(dps12.totalInterest > 0, 'DPS Interest earned > 0');
assert(dps12.maturityValue === roundHalfUp(120000 + dps12.totalInterest, 2), 'DPS Maturity Value equals Deposited + Total Interest');

// Verify Month 1 half-up calculation:
// deposit 10,000
// monthly rate = 8 / 1200 = 0.006666666666666667
// interest = roundHalfUp(10000 * (8 / 1200), 2) = roundHalfUp(66.66666666666667, 2) = 66.67
const m1 = dps12.schedule.find(s => s.month === 1);
assert(m1?.interest === 66.67, 'DPS Month 1 interest half-up = 66.67 paisa', { m1Interest: m1?.interest });
assert(m1?.balance === 10066.67, 'DPS Month 1 balance = 10,066.67', { m1Balance: m1?.balance });

// --------------------------------------------------------------------------
// TEST 5: Multimodal OCR Zero-Hallucination Guardrail
// --------------------------------------------------------------------------
// High confidence preset (bKash Rent):
const bkashPreset = OCR_PRESETS.find(p => p.id === 'ocr-bkash-rent')!;
assert(bkashPreset.result.confidence.amount >= 0.85, 'bKash Preset amount confidence >= 0.85');
assert(bkashPreset.result.amount_bdt === 16000, 'bKash Preset amount populated (16,000)');
assert(!bkashPreset.result.isGuarded, 'bKash Preset guardrail NOT triggered');

// Low confidence preset (Blurry Tea Chit):
const blurryPreset = OCR_PRESETS.find(p => p.id === 'ocr-blurry-tong-chit')!;
assert(blurryPreset.result.confidence.amount < 0.85, 'Blurry Tong Chit amount confidence < 0.85');
assert(blurryPreset.result.amount_bdt === null, 'STRICT GUARDRAIL: Blurry Chit amount forced to null');
assert(blurryPreset.result.isGuarded === true, 'STRICT GUARDRAIL: isGuarded flag set to true');

// Custom text parser guardrail test:
const ambiguousText = 'Tong tea and toast memo ৳?45.00 unclear ink stain';
const parsedAmbiguous = parseRawReceiptText(ambiguousText);
assert(parsedAmbiguous.isGuarded === true, 'Custom Ambiguous Text triggers isGuarded');
assert(parsedAmbiguous.amount_bdt === null, 'Custom Ambiguous Text amount set to null');

// --------------------------------------------------------------------------
// TEST 6: Programmatic Written Insights Reactivity
// --------------------------------------------------------------------------
const insightsPub1 = generateDynamicInsights(runwayPub1, pub1.salary_bdt, pub1.today);
assert(insightsPub1.length >= 3, `Generated ${insightsPub1.length} dynamic written insights (>= 3 required)`);
assert(insightsPub1.some(i => i.narrative.includes('16,000') || i.narrative.includes('Landlord')), 'Insight cites concrete numbers and merchant (Landlord / 16,000)');
assert(insightsPub1.some(i => i.narrative.includes(runwayPub1.dailyRunRate.toString()) || i.narrative.includes('burn rate')), 'Insight cites concrete daily run-rate number');

console.log('\n=================================================================');
if (allPassed) {
  console.log('🎉 ALL ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('❌ SOME TESTS FAILED. PLEASE INSPECT LOGS ABOVE.');
  process.exit(1);
}
console.log('=================================================================\n');
