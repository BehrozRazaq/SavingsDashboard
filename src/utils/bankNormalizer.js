/**
 * Bank Normalizer Utility
 * 
 * Provides bank-specific parsing logic for Swedish banks:
 * - Nordea: OCR and BG/PG patterns for Swedish bills
 * - Bank Norwegian: Travel category detection for bonus points
 * - Currency conversion to SEK
 */

// Base currency for all amounts
export const BASE_CURRENCY = 'SEK';

// Default exchange rates (fallback when API is unavailable)
// In production, fetch live rates from ECB API or similar
// Last updated: 2024-01 (approximate rates)
const DEFAULT_EXCHANGE_RATES = {
  SEK: 1,
  NOK: 0.98,  // Norwegian Krone to SEK
  EUR: 11.5,  // Euro to SEK
  USD: 10.8,  // US Dollar to SEK
  DKK: 1.54,  // Danish Krone to SEK
  GBP: 13.5,  // British Pound to SEK
};

// Cache for live exchange rates
let cachedRates = null;
let cacheExpiry = null;

/**
 * Fetch live exchange rates from API
 * Falls back to default rates if API is unavailable
 */
async function fetchExchangeRates() {
  // Check cache validity (1 hour)
  if (cachedRates && cacheExpiry && Date.now() < cacheExpiry) {
    return cachedRates;
  }

  try {
    // In production, use ECB API or similar:
    // const response = await fetch('https://api.exchangerate.host/latest?base=SEK');
    // const data = await response.json();
    // cachedRates = data.rates;
    // cacheExpiry = Date.now() + 3600000; // 1 hour
    
    // For now, return default rates
    return DEFAULT_EXCHANGE_RATES;
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using defaults:', error.message);
    return DEFAULT_EXCHANGE_RATES;
  }
}

/**
 * Convert amount to SEK
 * @param {number} amount - The amount to convert
 * @param {string} currency - The source currency code
 * @param {Object} rates - Optional exchange rates object
 * @returns {number} Amount in SEK
 */
export function convertToSEK(amount, currency = 'SEK', rates = DEFAULT_EXCHANGE_RATES) {
  const rate = rates[currency.toUpperCase()] || 1;
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Swedish OCR Reference patterns
 * OCR (Optisk läsning) is used for Swedish bill payments
 */
const OCR_PATTERNS = [
  /OCR[:\s]*(\d{5,25})/i,
  /Referens[:\s]*(\d{5,25})/i,
  /Ref[:\s]*(\d{5,25})/i,
];

/**
 * Swedish BG/PG patterns
 * BG = Bankgiro, PG = Plusgiro - Swedish payment systems
 */
const BGPG_PATTERNS = [
  /BG[:\s-]*(\d{3,4}[-\s]?\d{4})/i,      // Bankgiro: 123-4567 or 1234567
  /PG[:\s-]*(\d{2,6}[-\s]?\d{1,4})/i,    // Plusgiro: 12345-6 or 123456-7
  /Bankgiro[:\s]*(\d{7,8})/i,
  /Plusgiro[:\s]*(\d{6,7})/i,
];

/**
 * Known Swedish billers and their categories
 */
const SWEDISH_BILLERS = {
  // Utilities
  'VATTENFALL': { category: 'Utilities', type: 'Electricity' },
  'FORTUM': { category: 'Utilities', type: 'Electricity' },
  'E.ON': { category: 'Utilities', type: 'Electricity' },
  'STOCKHOLM EXERGI': { category: 'Utilities', type: 'Heating' },
  
  // Housing
  'HYRESBOSTÄDER': { category: 'Housing', type: 'Rent' },
  'RIKSBYGGEN': { category: 'Housing', type: 'Rent' },
  'SVENSKA BOSTÄDER': { category: 'Housing', type: 'Rent' },
  'HEIMSTADEN': { category: 'Housing', type: 'Rent' },
  
  // Insurance
  'FOLKSAM': { category: 'Insurance', type: 'Insurance' },
  'TRYGG-HANSA': { category: 'Insurance', type: 'Insurance' },
  'IF SKADEFÖRSÄKRING': { category: 'Insurance', type: 'Insurance' },
  'LÄNSFÖRSÄKRINGAR': { category: 'Insurance', type: 'Insurance' },
  
  // Telecom
  'TELIA': { category: 'Subscriptions', type: 'Phone' },
  'TELENOR': { category: 'Subscriptions', type: 'Phone' },
  'TRE': { category: 'Subscriptions', type: 'Phone' },
  'COMVIQ': { category: 'Subscriptions', type: 'Phone' },
  'TELE2': { category: 'Subscriptions', type: 'Phone' },
  
  // Streaming
  'NETFLIX': { category: 'Subscriptions', type: 'Streaming' },
  'SPOTIFY': { category: 'Subscriptions', type: 'Streaming' },
  'HBO': { category: 'Subscriptions', type: 'Streaming' },
  'DISNEY': { category: 'Subscriptions', type: 'Streaming' },
  'VIAPLAY': { category: 'Subscriptions', type: 'Streaming' },
};

/**
 * Travel-related merchants for Norwegian bonus logic
 */
const TRAVEL_MERCHANTS = [
  'NORWEGIAN AIR',
  'SAS SCANDINAVIAN',
  'FINNAIR',
  'WIDEROE',
  'RYANAIR',
  'LUFTHANSA',
  'BOOKING.COM',
  'HOTELS.COM',
  'AIRBNB',
  'EXPEDIA',
  'SJ BILJETTER',
  'VY',
  'ARLANDA EXPRESS',
  'SCANDIC',
  'RADISSON',
  'NORDIC CHOICE',
  'STRAWBERRY',
  'WASA EXPRESS',
];

/**
 * Nordea-specific transaction normalizer
 * Parses OCR and BG/PG patterns to identify Swedish bills
 */
export function normalizeNordeaTransaction(transaction) {
  const description = (transaction.description || transaction.merchant || '').toUpperCase();
  const result = {
    ...transaction,
    source: 'nordea',
    normalized: true,
    billInfo: null,
    detectedBiller: null,
  };

  // Check for OCR reference
  for (const pattern of OCR_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      result.billInfo = {
        type: 'OCR',
        reference: match[1],
      };
      break;
    }
  }

  // Check for BG/PG reference
  for (const pattern of BGPG_PATTERNS) {
    const match = description.match(pattern);
    if (match) {
      result.billInfo = {
        ...result.billInfo,
        paymentSystem: description.includes('BG') ? 'Bankgiro' : 'Plusgiro',
        accountNumber: match[1].replace(/[-\s]/g, ''),
      };
      break;
    }
  }

  // Try to identify known Swedish billers
  for (const [biller, info] of Object.entries(SWEDISH_BILLERS)) {
    if (description.includes(biller)) {
      result.detectedBiller = {
        name: biller,
        ...info,
      };
      // Override category if we detected a known biller
      result.category = info.category;
      break;
    }
  }

  // Convert amount to SEK if needed
  if (transaction.currency && transaction.currency !== BASE_CURRENCY) {
    result.originalAmount = transaction.amount;
    result.originalCurrency = transaction.currency;
    result.amount = convertToSEK(transaction.amount, transaction.currency);
    result.currency = BASE_CURRENCY;
  }

  return result;
}

/**
 * Bank Norwegian-specific transaction normalizer
 * Identifies travel purchases for CashPoints bonus logic
 */
export function normalizeNorwegianTransaction(transaction) {
  const description = (transaction.description || transaction.merchant || '').toUpperCase();
  const result = {
    ...transaction,
    source: 'norwegian',
    normalized: true,
    isTravelPurchase: false,
    potentialCashPoints: 0,
  };

  // Check if category is already marked as travel
  if (transaction.category?.toUpperCase() === 'TRAVEL') {
    result.isTravelPurchase = true;
  }

  // Check for travel-related merchants
  for (const merchant of TRAVEL_MERCHANTS) {
    if (description.includes(merchant)) {
      result.isTravelPurchase = true;
      result.detectedMerchant = merchant;
      result.category = 'Travel';
      break;
    }
  }

  // Convert amount to SEK if needed
  if (transaction.currency && transaction.currency !== BASE_CURRENCY) {
    result.originalAmount = transaction.amount;
    result.originalCurrency = transaction.currency;
    result.amount = convertToSEK(transaction.amount, transaction.currency);
    result.currency = BASE_CURRENCY;
  }

  // Calculate potential CashPoints for travel purchases
  // Norwegian offers 1 CashPoint per 10 SEK on travel
  if (result.isTravelPurchase && result.amount < 0) {
    result.potentialCashPoints = Math.floor(Math.abs(result.amount) / 10);
  }

  return result;
}

/**
 * Normalize any transaction based on its source
 */
export function normalizeTransaction(transaction, source) {
  const sourceNormalizer = source?.toLowerCase();
  
  if (sourceNormalizer === 'nordea') {
    return normalizeNordeaTransaction(transaction);
  }
  
  if (sourceNormalizer === 'norwegian') {
    return normalizeNorwegianTransaction(transaction);
  }
  
  // Default normalization for unknown sources
  return {
    ...transaction,
    normalized: true,
    amount: convertToSEK(transaction.amount, transaction.currency),
    currency: BASE_CURRENCY,
  };
}

/**
 * Batch normalize transactions
 */
export function normalizeTransactions(transactions) {
  return transactions.map(t => normalizeTransaction(t, t.source));
}

/**
 * Fuzzy merchant name matching
 * Used for grouping similar merchant names (e.g., "Netflix" and "NETFLIX.COM")
 */
export function fuzzyMatchMerchant(name1, name2, threshold = 0.8) {
  const clean1 = cleanMerchantName(name1);
  const clean2 = cleanMerchantName(name2);
  
  // Exact match after cleaning
  if (clean1 === clean2) return true;
  
  // One contains the other
  if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
  
  // Calculate similarity score
  const similarity = calculateSimilarity(clean1, clean2);
  return similarity >= threshold;
}

/**
 * Clean merchant name for comparison
 */
function cleanMerchantName(name) {
  return (name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\sÅÄÖ]/g, '')  // Remove special characters (keep Swedish chars)
    .replace(/\s+/g, ' ')          // Normalize whitespace
    // Remove international company suffixes
    .replace(/\b(AB|AS|INC|LLC|LTD|GMBH|BV|NV|SA|AG|OY|OYJ)\b/g, '')
    // Remove Swedish legal entity suffixes
    .replace(/\b(AKTIEBOLAG|HANDELSBOLAG|KOMMANDITBOLAG|EKONOMISK FORENING|ENSKILD FIRMA)\b/g, '')
    // Remove web-related terms
    .replace(/\b(WWW|HTTP|HTTPS|COM|SE|NO|NET|ORG|EU)\b/g, '')
    .trim();
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Group transactions by similar merchant names using fuzzy matching
 * Allows for +/- tolerance in amounts
 */
export function groupByFuzzyMerchant(transactions, amountTolerance = 2) {
  const groups = [];
  const used = new Set();
  
  transactions.forEach((t, index) => {
    if (used.has(index)) return;
    
    const group = {
      merchant: t.merchant,
      transactions: [t],
      indices: [index],
    };
    
    transactions.forEach((other, otherIndex) => {
      if (index === otherIndex || used.has(otherIndex)) return;
      
      // Check fuzzy merchant match
      if (fuzzyMatchMerchant(t.merchant, other.merchant)) {
        // Check amount tolerance (within +/- tolerance SEK)
        const amountDiff = Math.abs(Math.abs(t.amount) - Math.abs(other.amount));
        if (amountDiff <= amountTolerance) {
          group.transactions.push(other);
          group.indices.push(otherIndex);
          used.add(otherIndex);
        }
      }
    });
    
    if (group.transactions.length > 0) {
      groups.push(group);
      group.indices.forEach(i => used.add(i));
    }
  });
  
  return groups;
}

export default {
  BASE_CURRENCY,
  convertToSEK,
  normalizeNordeaTransaction,
  normalizeNorwegianTransaction,
  normalizeTransaction,
  normalizeTransactions,
  fuzzyMatchMerchant,
  groupByFuzzyMerchant,
};
