import { useMemo, useState, useEffect, useCallback } from 'react';
import nordeaTransactions from '../data/nordeaTransactions.json';
import norwegianTransactions from '../data/norwegianTransactions.json';
import { fuzzyMatchMerchant } from '../utils/bankNormalizer';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * useFinancialData - Custom hook for Swedish banking analytics
 * 
 * Provides:
 * - Merged transaction data from Nordea and Bank Norwegian (live or mock)
 * - Subscription detection (recurring monthly amounts with fuzzy matching)
 * - Point maximizer logic (lost CashPoints for Travel on wrong card)
 * - Fika Index (total spend on small purchases < 60 SEK)
 */
const useFinancialData = () => {
  // State for live data
  const [liveTransactions, setLiveTransactions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  /**
   * Fetch transactions from API
   */
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/tink/transactions`, {
        credentials: 'include' // Include cookies for session
      });

      const data = await response.json();

      if (response.ok && data.connected) {
        setLiveTransactions(data.transactions);
        setIsConnected(true);
        setLastFetched(new Date().toISOString());
        return data.transactions;
      } else {
        // Not connected or error - will use mock data
        setIsConnected(false);
        setLiveTransactions(null);
        if (data.error) {
          setError(data.message || data.error);
        }
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Unable to fetch live data');
      setIsConnected(false);
      setLiveTransactions(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check connection status
   */
  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/tink/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        // If connected, fetch transactions
        await fetchTransactions();
      } else {
        setIsConnected(false);
        setLiveTransactions(null);
      }
      
      return data;
    } catch (err) {
      console.error('Failed to check connection status:', err);
      setIsConnected(false);
      return { connected: false };
    }
  }, [fetchTransactions]);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  // Check connection status on mount only
  useEffect(() => {
    checkConnectionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Auto-refresh every 5 minutes when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchTransactions();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isConnected, fetchTransactions]);

  // Use live data if available, otherwise mock data
  // Add source tag to each transaction and merge datasets
  const mergedTransactions = useMemo(() => {
    if (liveTransactions && liveTransactions.length > 0) {
      // Live data already has source from API
      return liveTransactions.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
    }

    // Fallback to mock data
    const nordea = nordeaTransactions.map(t => ({
      ...t,
      source: 'nordea'
    }));
    
    const norwegian = norwegianTransactions.map(t => ({
      ...t,
      source: 'norwegian'
    }));
    
    return [...nordea, ...norwegian].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [liveTransactions]);

  /**
   * Subscription Detection Logic with Fuzzy Matching
   * Groups similar merchant names (e.g., "Netflix" and "NETFLIX.COM")
   * Identifies recurring amounts with +/- 2 SEK tolerance that appear monthly
   */
  const subscriptions = useMemo(() => {
    // Group transactions by merchant with fuzzy matching
    const merchantGroups = {};
    
    mergedTransactions.forEach(t => {
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
  }, [mergedTransactions]);

  // Total monthly subscription cost
  const totalSubscriptionCost = useMemo(() => {
    return subscriptions.reduce((total, sub) => total + sub.amount, 0);
  }, [subscriptions]);

  /**
   * Point Maximizer Logic
   * Calculates lost points when Travel category spent on Nordea instead of Norwegian
   * Norwegian offers 1 CashPoint per 10 SEK on Travel
   */
  const lostPoints = useMemo(() => {
    const travelOnNordea = mergedTransactions.filter(
      t => t.source === 'nordea' && t.category === 'Travel' && t.amount < 0
    );
    
    const totalTravelSpend = travelOnNordea.reduce(
      (sum, t) => sum + Math.abs(t.amount), 0
    );
    
    // 1 CashPoint per 10 SEK
    return Math.floor(totalTravelSpend / 10);
  }, [mergedTransactions]);

  // Travel transactions made on wrong card (Nordea instead of Norwegian)
  const missedTravelTransactions = useMemo(() => {
    return mergedTransactions.filter(
      t => t.source === 'nordea' && t.category === 'Travel' && t.amount < 0
    );
  }, [mergedTransactions]);

  /**
   * Fika Index Logic
   * Sums all transactions under 60 SEK (typical fika purchase)
   * Returns total fika spend
   */
  const totalFikaSpend = useMemo(() => {
    const fikaTransactions = mergedTransactions.filter(
      t => t.amount < 0 && Math.abs(t.amount) < 60
    );
    
    return fikaTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount), 0
    );
  }, [mergedTransactions]);

  // Number of fika purchases
  const fikaCount = useMemo(() => {
    return mergedTransactions.filter(
      t => t.amount < 0 && Math.abs(t.amount) < 60
    ).length;
  }, [mergedTransactions]);

  // Bun equivalent (cost of a typical Swedish bun is 25 SEK)
  const bunEquivalent = useMemo(() => {
    return Math.floor(totalFikaSpend / 25);
  }, [totalFikaSpend]);

  return {
    // Raw data
    mergedTransactions,
    
    // Subscription data
    subscriptions,
    totalSubscriptionCost,
    
    // Points data
    lostPoints,
    missedTravelTransactions,
    
    // Fika data
    totalFikaSpend,
    fikaCount,
    bunEquivalent,

    // Connection state
    isConnected,
    isLoading,
    error,
    lastFetched,
    usingMockData: !liveTransactions,

    // Actions
    refreshData,
    checkConnectionStatus
  };
};

export default useFinancialData;
