import { OCRParsedResult, ReceiptConfidence } from '@/types/ledger';

export interface OCRPreset {
  id: string;
  name: string;
  typeDescription: string;
  badge: string;
  result: OCRParsedResult;
}

export const OCR_PRESETS: OCRPreset[] = [
  {
    id: 'ocr-bkash-rent',
    name: 'bKash App - Landlord House Rent',
    typeDescription: 'Digital MFS confirmation screenshot with clear transaction ID and recipient name.',
    badge: 'High Confidence (98%)',
    result: {
      shop_name: 'Landlord',
      date: '2026-04-03',
      amount_bdt: 16000.00,
      raw_amount_string: '৳16,000.00',
      category: 'Rent',
      confidence: {
        shop: 0.98,
        date: 0.99,
        amount: 0.99,
        category: 0.95,
        overall: 0.98,
      },
      isGuarded: false,
      receipt_type: 'bkash',
      notes: 'TrxID: 9J3K81LA9 | BDT 16,000 sent to Landlord Rent Account',
    },
  },
  {
    id: 'ocr-unimart-groceries',
    name: 'Unimart Gulshan - Superstore POS Slip',
    typeDescription: 'Clean thermal receipt with printed item breakdown and clear total.',
    badge: 'High Confidence (94%)',
    result: {
      shop_name: 'Unimart',
      date: '2026-04-11',
      amount_bdt: 546.50,
      raw_amount_string: '৳546.50',
      category: 'Groceries',
      confidence: {
        shop: 0.95,
        date: 0.96,
        amount: 0.92,
        category: 0.94,
        overall: 0.94,
      },
      isGuarded: false,
      receipt_type: 'pos_slip',
      notes: 'Unimart Gulshan-2 Branch | POS Terminal #04 | 4 items',
    },
  },
  {
    id: 'ocr-desco-utility',
    name: 'DESCO - Electricity Bill Payment SMS/Voucher',
    typeDescription: 'Utility token recharge slip with meter number and recharge amount.',
    badge: 'High Confidence (97%)',
    result: {
      shop_name: 'DESCO',
      date: '2026-04-07',
      amount_bdt: 2599.50,
      raw_amount_string: '৳2,599.50',
      category: 'Utilities',
      confidence: {
        shop: 0.97,
        date: 0.98,
        amount: 0.96,
        category: 0.98,
        overall: 0.97,
      },
      isGuarded: false,
      receipt_type: 'utility',
      notes: 'Prepaid Token Generated | Meter: 041198273 | Energy: 2599.50',
    },
  },
  {
    id: 'ocr-sultans-dine',
    name: "Sultan's Dine - Kacchi Dining POS Slip",
    typeDescription: 'Restaurant printout from Dhanmondi branch.',
    badge: 'High Confidence (95%)',
    result: {
      shop_name: 'Sultans Dine',
      date: '2026-04-04',
      amount_bdt: 364.00,
      raw_amount_string: '৳364.00',
      category: 'Food',
      confidence: {
        shop: 0.96,
        date: 0.97,
        amount: 0.93,
        category: 0.96,
        overall: 0.95,
      },
      isGuarded: false,
      receipt_type: 'pos_slip',
      notes: "Sultan's Dine Dhanmondi | Order #184 | Half Kacchi + Borhani",
    },
  },
  {
    id: 'ocr-blurry-tong-chit',
    name: 'Roadside Tong - Handwritten Smudged Paper Chit',
    typeDescription: 'Creased handwritten memo with tea stain obscuring the total amount digits.',
    badge: 'Amber Guardrail Triggered (<85%)',
    result: {
      shop_name: 'Mama Cha Stall',
      date: '2026-04-16',
      amount_bdt: null, // STRICT GUARDRAIL: amount < 0.85 -> null
      raw_amount_string: '৳??5.0? (smudged ink: ~125 or ~175?)',
      category: 'Food',
      confidence: {
        shop: 0.88,
        date: 0.89,
        amount: 0.58, // < 0.85!
        category: 0.86,
        overall: 0.75,
      },
      isGuarded: true,
      receipt_type: 'handwritten',
      notes: 'Amber Guardrail: Amount confidence 58% (< 85%). Amount forced to null for manual verification.',
    },
  },
  {
    id: 'ocr-faded-cash-memo',
    name: 'Local Pharmacy - Faded Carbon Copy Cash Memo',
    typeDescription: 'Carbon duplicate with fold line across total figure.',
    badge: 'Amber Guardrail Triggered (<85%)',
    result: {
      shop_name: 'Lazz Pharma Dhanmondi',
      date: '2026-04-14',
      amount_bdt: null, // STRICT GUARDRAIL: amount < 0.85 -> null
      raw_amount_string: '৳?80.00 (fold tear across first digit)',
      category: 'Health',
      confidence: {
        shop: 0.89,
        date: 0.91,
        amount: 0.64, // < 0.85!
        category: 0.90,
        overall: 0.78,
      },
      isGuarded: true,
      receipt_type: 'handwritten',
      notes: 'Amber Guardrail: Amount confidence 64% (< 85%). Amount forced to null for manual verification.',
    },
  },
  {
    id: 'ocr-nagad-shwapno',
    name: 'Nagad MFS - Shwapno Superstore Merchant QR',
    typeDescription: 'Digital wallet payment confirmation.',
    badge: 'High Confidence (97%)',
    result: {
      shop_name: 'Shwapno Superstore',
      date: '2026-04-15',
      amount_bdt: 1850.00,
      raw_amount_string: '৳1,850.00',
      category: 'Groceries',
      confidence: {
        shop: 0.97,
        date: 0.99,
        amount: 0.98,
        category: 0.95,
        overall: 0.97,
      },
      isGuarded: false,
      receipt_type: 'nagad',
      notes: 'Nagad Txn: NAG882199 | Paid to Shwapno Outlet 019',
    },
  },
];

/**
 * Intelligent Simulated Parser for user-supplied raw text or OCR scan
 * Applies strict Zero-Hallucination Guardrail:
 * If amount_confidence < 0.85 or amount is ambiguous, returns amount_bdt: null.
 */
export function parseRawReceiptText(rawText: string, userCategoryHint?: string): OCRParsedResult {
  const text = rawText.trim();
  const lowerText = text.toLowerCase();

  // 1. Date Detection (YYYY-MM-DD or DD/MM/YYYY)
  let detectedDate = new Date().toISOString().slice(0, 10);
  let dateConf = 0.90;
  const isoMatch = text.match(/\b(202[0-9]-[0-1][0-9]-[0-3][0-9])\b/);
  if (isoMatch) {
    detectedDate = isoMatch[1];
    dateConf = 0.98;
  } else {
    const dmyMatch = text.match(/\b([0-3]?[0-9])[\/\-\.]([0-1]?[0-9])[\/\-\.](202[0-9])\b/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      detectedDate = `${year}-${month}-${day}`;
      dateConf = 0.94;
    }
  }

  // 2. Shop Detection
  let detectedShop = 'Dhaka Merchant';
  let shopConf = 0.70;
  if (lowerText.includes('landlord') || lowerText.includes('rent') || lowerText.includes('bari')) {
    detectedShop = 'Landlord';
    shopConf = 0.98;
  } else if (lowerText.includes('desco') || lowerText.includes('dpdc') || lowerText.includes('electric')) {
    detectedShop = 'DESCO';
    shopConf = 0.97;
  } else if (lowerText.includes('unimart')) {
    detectedShop = 'Unimart';
    shopConf = 0.96;
  } else if (lowerText.includes('meena') || lowerText.includes('meena bazar')) {
    detectedShop = 'Meena Bazar';
    shopConf = 0.96;
  } else if (lowerText.includes('shwapno')) {
    detectedShop = 'Shwapno Superstore';
    shopConf = 0.96;
  } else if (lowerText.includes('sultan') || lowerText.includes('sultans dine')) {
    detectedShop = 'Sultans Dine';
    shopConf = 0.96;
  } else if (lowerText.includes('madchef')) {
    detectedShop = 'Madchef';
    shopConf = 0.95;
  } else if (lowerText.includes('star cineplex') || lowerText.includes('cineplex')) {
    detectedShop = 'Star Cineplex';
    shopConf = 0.97;
  } else if (lowerText.includes('gp') || lowerText.includes('grameenphone')) {
    detectedShop = 'GP recharge';
    shopConf = 0.96;
  } else if (lowerText.includes('bkash')) {
    detectedShop = 'bKash';
    shopConf = 0.94;
  } else if (lowerText.includes('pathao')) {
    detectedShop = 'Pathao';
    shopConf = 0.95;
  } else if (lowerText.includes('uber')) {
    detectedShop = 'Uber';
    shopConf = 0.95;
  } else {
    // Extract first significant line
    const firstLine = text.split('\n')[0]?.trim();
    if (firstLine && firstLine.length < 35 && !firstLine.match(/^\d+$/)) {
      detectedShop = firstLine;
      shopConf = 0.82;
    }
  }

  // 3. Category Detection
  let detectedCategory = userCategoryHint || 'Other';
  let catConf = 0.80;
  if (lowerText.includes('rent') || lowerText.includes('landlord') || lowerText.includes('basha')) {
    detectedCategory = 'Rent';
    catConf = 0.98;
  } else if (lowerText.includes('food') || lowerText.includes('kacchi') || lowerText.includes('dine') || lowerText.includes('restaurant') || lowerText.includes('burger') || lowerText.includes('madchef')) {
    detectedCategory = 'Food';
    catConf = 0.96;
  } else if (lowerText.includes('grocer') || lowerText.includes('unimart') || lowerText.includes('bazar') || lowerText.includes('shwapno') || lowerText.includes('chaldal')) {
    detectedCategory = 'Groceries';
    catConf = 0.96;
  } else if (lowerText.includes('desco') || lowerText.includes('wasa') || lowerText.includes('titas') || lowerText.includes('utility') || lowerText.includes('electric')) {
    detectedCategory = 'Utilities';
    catConf = 0.97;
  } else if (lowerText.includes('gp') || lowerText.includes('recharge') || lowerText.includes('mobile') || lowerText.includes('banglalink') || lowerText.includes('airtel')) {
    detectedCategory = 'Mobile';
    catConf = 0.95;
  } else if (lowerText.includes('cineplex') || lowerText.includes('movie') || lowerText.includes('game') || lowerText.includes('entertainment')) {
    detectedCategory = 'Entertainment';
    catConf = 0.95;
  } else if (lowerText.includes('uber') || lowerText.includes('pathao') || lowerText.includes('metro') || lowerText.includes('commute') || lowerText.includes('fuel')) {
    detectedCategory = 'Commute';
    catConf = 0.95;
  }

  // 4. Amount Extraction with Zero-Hallucination Guardrail
  // Look for currency symbols (৳, Tk, BDT, $, Tk.) followed by number
  let detectedAmount: number | null = null;
  let amountConf = 0.60;
  let rawAmountStr = 'Not identified';

  // Check for ambiguous / low confidence keywords
  const isAmbiguousText = lowerText.includes('?') ||
    lowerText.includes('smudged') ||
    lowerText.includes('blur') ||
    lowerText.includes('faded') ||
    lowerText.includes('torn') ||
    lowerText.includes('unclear');

  const amountPatterns = [
    /(?:total|amount|taka|bdt|tk|৳)\s*[:=]?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,
    /([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(?:tk|bdt|taka|৳)/i,
    /৳\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,
  ];

  let matchedAmountStr: string | null = null;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      matchedAmountStr = match[1].replace(/,/g, '');
      break;
    }
  }

  if (matchedAmountStr && !isAmbiguousText) {
    const parsed = parseFloat(matchedAmountStr);
    if (!isNaN(parsed) && parsed > 0) {
      detectedAmount = parsed;
      amountConf = 0.94;
      rawAmountStr = `৳${parsed.toFixed(2)}`;
    }
  } else if (matchedAmountStr && isAmbiguousText) {
    // Ambiguous
    amountConf = 0.62; // below 0.85
    rawAmountStr = `৳${matchedAmountStr} (Ambiguous / low clarity)`;
  } else {
    // Try bare number
    const bareNumber = text.match(/\b([0-9]+(?:\.[0-9]{1,2})?)\b/);
    if (bareNumber && !isAmbiguousText) {
      const parsed = parseFloat(bareNumber[1]);
      if (parsed > 0) {
        // Less certain since no currency keyword
        amountConf = 0.72; // below 0.85 guardrail!
        rawAmountStr = `৳${parsed.toFixed(2)} (no currency tag)`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // STRICT ZERO-HALLUCINATION GUARDRAIL:
  // If amount_confidence < 0.85, set amount = null and flag isGuarded = true
  // --------------------------------------------------------------------------
  const isGuarded = amountConf < 0.85 || detectedAmount === null;
  if (isGuarded) {
    detectedAmount = null;
  }

  const overallConf = (shopConf + dateConf + amountConf + catConf) / 4;

  const confidence: ReceiptConfidence = {
    shop: parseFloat(shopConf.toFixed(2)),
    date: parseFloat(dateConf.toFixed(2)),
    amount: parseFloat(amountConf.toFixed(2)),
    category: parseFloat(catConf.toFixed(2)),
    overall: parseFloat(overallConf.toFixed(2)),
  };

  return {
    shop_name: detectedShop,
    date: detectedDate,
    amount_bdt: detectedAmount,
    raw_amount_string: rawAmountStr,
    category: detectedCategory,
    confidence,
    isGuarded,
    receipt_type: 'chit',
    notes: isGuarded
      ? `Amber Guardrail: Amount confidence ${(amountConf * 100).toFixed(0)}% is below 85% safety threshold. Manual entry required.`
      : 'Passed 85% OCR safety guardrail.',
  };
}
