import { fuzzyMatchMerchant } from './bankNormalizer';

/**
 * Calculate subscription metrics from transactions
 */
export const calculateSubscriptions = (transactions) => {
  // Group transactions by merchant with fuzzy matching
  const merchantGroups = {};
  
  transactions.forEach(t => {
    if (t.amount < 0) { // Only consider expenses
      // Find existing group that fuzzy matches this merchant
      let foundGroup = null;
      for (const groupName of Object.keys(merchantGroups)) {
        if (fuzzyMatchMerchant(t.merchant, groupName)) {
          foundGroup = groupName;
          break;
        }
      }
      
      const groupName = foundGroup || t.merchant;
      if (!merchantGroups[groupName]) {
        merchantGroups[groupName] = [];
      }
      merchantGroups[groupName].push({
        amount: Math.abs(t.amount),
        date: t.date,
        merchant: t.merchant // Keep original name for reference
      });
    }
  });

  const detectedSubscriptions = [];
  
  Object.entries(merchantGroups).forEach(([merchant, transactions]) => {
    // Need at least 2 occurrences to be considered recurring
    if (transactions.length >= 2) {
      const amounts = transactions.map(t => t.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Skip if average amount is zero to avoid division by zero
      if (avgAmount === 0) return;
      
      // Check if all amounts are within +/- 2 SEK tolerance (fuzzy amount matching)
      const isRecurring = amounts.every(amount => {
        const difference = Math.abs(amount - avgAmount);
        return difference <= 2; // 2 SEK tolerance
      });
      
      // Check if transactions are roughly monthly (25-35 days apart)
      let isMonthly = false;
      if (transactions.length >= 2) {
        const sortedDates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
        const daysBetween = [];
        
        for (let i = 1; i < sortedDates.length; i++) {
          const diff = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
          daysBetween.push(diff);
        }
        
        // Consider monthly if average gap is between 25-35 days
        if (daysBetween.length > 0) {
          const avgDays = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;
          isMonthly = avgDays >= 25 && avgDays <= 35;
        }
      }
      
      if (isRecurring && isMonthly) {
        detectedSubscriptions.push({
          merchant,
          amount: Math.round(avgAmount),
          occurrences: transactions.length,
          // Include all matched merchant names for transparency
          matchedNames: [...new Set(transactions.map(t => t.merchant))]
        });
      }
    }
  });
  
  return detectedSubscriptions;
};

/**
 * Calculate total subscription cost
 */
export const calculateTotalSubscriptionCost = (subscriptions) => {
  return subscriptions.reduce((total, sub) => total + sub.amount, 0);
};

/**
 * Calculate lost points from travel transactions on wrong card
 */
export const calculateLostPoints = (transactions) => {
  const travelOnNordea = transactions.filter(
    t => t.source === 'nordea' && t.category === 'Travel' && t.amount < 0
  );
  
  const totalTravelSpend = travelOnNordea.reduce(
    (sum, t) => sum + Math.abs(t.amount), 0
  );
  
  // 1 CashPoint per 10 SEK
  return Math.floor(totalTravelSpend / 10);
};

/**
 * Get missed travel transactions (Travel on Nordea instead of Norwegian)
 */
export const getMissedTravelTransactions = (transactions) => {
  return transactions.filter(
    t => t.source === 'nordea' && t.category === 'Travel' && t.amount < 0
  );
};

/**
 * Calculate total fika spend (purchases under 60 SEK)
 */
export const calculateFikaSpend = (transactions) => {
  const fikaTransactions = transactions.filter(
    t => t.amount < 0 && Math.abs(t.amount) < 60
  );
  
  return fikaTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount), 0
  );
};

/**
 * Get fika transaction count
 */
export const getFikaCount = (transactions) => {
  return transactions.filter(
    t => t.amount < 0 && Math.abs(t.amount) < 60
  ).length;
};

/**
 * Calculate bun equivalent (25 SEK per bun)
 */
export const calculateBunEquivalent = (totalFikaSpend) => {
  return Math.floor(totalFikaSpend / 25);
};

/**
 * Calculate all metrics from filtered transactions
 */
export const calculateMetrics = (transactions) => {
  const subscriptions = calculateSubscriptions(transactions);
  const totalSubscriptionCost = calculateTotalSubscriptionCost(subscriptions);
  const lostPoints = calculateLostPoints(transactions);
  const missedTravelTransactions = getMissedTravelTransactions(transactions);
  const totalFikaSpend = calculateFikaSpend(transactions);
  const fikaCount = getFikaCount(transactions);
  const bunEquivalent = calculateBunEquivalent(totalFikaSpend);

  return {
    subscriptions,
    totalSubscriptionCost,
    lostPoints,
    missedTravelTransactions,
    totalFikaSpend,
    fikaCount,
    bunEquivalent,
  };
};
