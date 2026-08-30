import { BenchmarkCase } from '@/types/ledger';

export const BENCHMARK_CASES: Record<string, BenchmarkCase> = {
  'PUB-01': {
    case_id: 'PUB-01',
    name: 'PUB-01 (Official Benchmark)',
    description: 'Salaried professional in Dhaka earning ৳50,000/mo balancing wedding, laptop, and bike goals with rent, dining, utilities, and grocery expenses.',
    today: '2026-04-17',
    months: { last: '2026-03', this: '2026-04' },
    salary_bdt: 50000,
    dps_annual_rate_percent: 8.0,
    expenses: [
      { id: 'E001', date: '2026-03-02', category: 'Groceries', shop: 'Meena Bazar', amount_bdt: 2475 },
      { id: 'E002', date: '2026-03-04', category: 'Rent', shop: 'Landlord', amount_bdt: 16000 },
      { id: 'E003', date: '2026-03-04', category: 'Utilities', shop: 'DESCO', amount_bdt: 856.5 },
      { id: 'E027', date: '2026-04-03', category: 'Rent', shop: 'Landlord', amount_bdt: 16000 },
      { id: 'E028', date: '2026-04-04', category: 'Food', shop: 'Sultans Dine', amount_bdt: 364 },
      { id: 'E029', date: '2026-04-06', category: 'Food', shop: 'Panda Garden', amount_bdt: 492 },
      { id: 'E030', date: '2026-04-07', category: 'Mobile', shop: 'GP recharge', amount_bdt: 535.5 },
      { id: 'E031', date: '2026-04-07', category: 'Utilities', shop: 'DESCO', amount_bdt: 2599.5 },
      { id: 'E032', date: '2026-04-08', category: 'Mobile', shop: 'bKash', amount_bdt: 679 },
      { id: 'E033', date: '2026-04-11', category: 'Groceries', shop: 'Unimart', amount_bdt: 546.5 },
      { id: 'E036', date: '2026-04-13', category: 'Entertainment', shop: 'Star Cineplex', amount_bdt: 1326 },
      { id: 'E041', date: '2026-04-17', category: 'Food', shop: 'Madchef', amount_bdt: 735 }
    ],
    pockets: [
      { id: 'SP-1', name: 'Wedding', item: 'Reception hall booking', target_bdt: 300000, monthly_contribution_bdt: 20000, current_saved_bdt: 40000, isDps: true },
      { id: 'SP-2', name: 'Laptop', item: 'MacBook Air M4', target_bdt: 145000, monthly_contribution_bdt: 12000, current_saved_bdt: 24000, isDps: true },
      { id: 'SP-3', name: 'Bike', item: 'Honda Livo', target_bdt: 150000, monthly_contribution_bdt: 9000, current_saved_bdt: 18000, isDps: true }
    ]
  },
  'PUB-02': {
    case_id: 'PUB-02',
    name: 'PUB-02 (Dhaka Tech Lead)',
    description: 'Senior Software Engineer in Dhanmondi earning ৳185,000/mo optimizing high-yield DPS, international travel, and family emergency reserve.',
    today: '2026-04-20',
    months: { last: '2026-03', this: '2026-04' },
    salary_bdt: 185000,
    dps_annual_rate_percent: 9.5,
    expenses: [
      { id: 'E101', date: '2026-03-01', category: 'Rent', shop: 'Apartment Owner', amount_bdt: 38000 },
      { id: 'E102', date: '2026-03-03', category: 'Groceries', shop: 'Chaldal Online', amount_bdt: 7800 },
      { id: 'E103', date: '2026-03-05', category: 'Utilities', shop: 'DESCO Prepaid', amount_bdt: 3400 },
      { id: 'E104', date: '2026-03-10', category: 'Food', shop: 'Izumi Gulshan', amount_bdt: 6500 },
      { id: 'E105', date: '2026-03-15', category: 'Commute', shop: 'Pathao Car', amount_bdt: 4200 },
      { id: 'E106', date: '2026-03-22', category: 'Mobile', shop: 'Banglalink Postpaid', amount_bdt: 1200 },
      { id: 'E201', date: '2026-04-01', category: 'Rent', shop: 'Apartment Owner', amount_bdt: 38000 },
      { id: 'E202', date: '2026-04-03', category: 'Groceries', shop: 'Chaldal Online', amount_bdt: 8200 },
      { id: 'E203', date: '2026-04-06', category: 'Utilities', shop: 'DESCO Prepaid', amount_bdt: 3600 },
      { id: 'E204', date: '2026-04-09', category: 'Food', shop: 'Chef Table Courtside', amount_bdt: 4800 },
      { id: 'E205', date: '2026-04-12', category: 'Commute', shop: 'Uber Premium', amount_bdt: 3900 },
      { id: 'E206', date: '2026-04-16', category: 'Entertainment', shop: 'Star Cineplex Premium', amount_bdt: 2400 },
      { id: 'E207', date: '2026-04-19', category: 'Mobile', shop: 'Banglalink Postpaid', amount_bdt: 1250 }
    ],
    pockets: [
      { id: 'SP-10', name: 'Emergency Fund', item: '6-Month Runway Reserve', target_bdt: 600000, monthly_contribution_bdt: 45000, current_saved_bdt: 180000, isDps: true },
      { id: 'SP-11', name: 'Japan Travel', item: 'Tokyo Autumn Trip 2027', target_bdt: 350000, monthly_contribution_bdt: 25000, current_saved_bdt: 75000, isDps: true },
      { id: 'SP-12', name: 'Parent Healthcare', item: 'Square Hospital Health Card', target_bdt: 200000, monthly_contribution_bdt: 15000, current_saved_bdt: 60000, isDps: false }
    ]
  },
  'PUB-03': {
    case_id: 'PUB-03',
    name: 'PUB-03 (Deficit Runway Stress Case)',
    description: 'Entry-level professional in Mirpur earning ৳32,000/mo experiencing mid-month burn deficit where planned pockets stall (α = 0) until What-If cuts are applied.',
    today: '2026-04-18',
    months: { last: '2026-03', this: '2026-04' },
    salary_bdt: 32000,
    dps_annual_rate_percent: 7.5,
    expenses: [
      { id: 'E301', date: '2026-03-02', category: 'Rent', shop: 'Mirpur Mess Sublet', amount_bdt: 11000 },
      { id: 'E302', date: '2026-03-05', category: 'Food', shop: 'Local Hotel & Dining', amount_bdt: 6200 },
      { id: 'E303', date: '2026-03-12', category: 'Commute', shop: 'Dhaka Metro Rail & Bus', amount_bdt: 1800 },
      { id: 'E304', date: '2026-03-20', category: 'Mobile', shop: 'Airtel Recharge', amount_bdt: 650 },
      { id: 'E310', date: '2026-04-02', category: 'Rent', shop: 'Mirpur Mess Sublet', amount_bdt: 11000 },
      { id: 'E311', date: '2026-04-05', category: 'Food', shop: 'Buffet Feast with Friends', amount_bdt: 3400 },
      { id: 'E312', date: '2026-04-08', category: 'Shopping', shop: 'Bashundhara City Clothes', amount_bdt: 4800 },
      { id: 'E313', date: '2026-04-11', category: 'Food', shop: 'Local Hotel & Dining', amount_bdt: 2900 },
      { id: 'E314', date: '2026-04-14', category: 'Commute', shop: 'Dhaka Metro Rail & Bus', amount_bdt: 1200 },
      { id: 'E315', date: '2026-04-18', category: 'Entertainment', shop: 'Sony Square Cineplex', amount_bdt: 1100 }
    ],
    pockets: [
      { id: 'SP-20', name: 'Master\'s Degree', item: 'IBA EMBA Admission Fee', target_bdt: 180000, monthly_contribution_bdt: 8000, current_saved_bdt: 16000, isDps: true },
      { id: 'SP-21', name: 'Used Motorcycle', item: 'Runner Bullet 100', target_bdt: 80000, monthly_contribution_bdt: 4000, current_saved_bdt: 12000, isDps: false }
    ]
  }
};
