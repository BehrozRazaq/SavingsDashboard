import { useState, useMemo, useCallback } from 'react';

/**
 * useFilters - Centralized filter state management hook
 * 
 * Manages all filter states and provides filtered transaction data
 * Supports:
 * - Search by merchant/description
 * - Date range filtering
 * - Category filtering (future)
 * - Amount range filtering (future)
 */
const useFilters = (transactions = []) => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('ALL'); // '1M', '3M', '6M', '1Y', 'ALL'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);

  /**
   * Calculate date range boundaries
   */
  const dateRangeBoundary = useMemo(() => {
    const now = new Date();
    const boundary = new Date(now);
    
    switch (dateRange) {
      case '1M':
        boundary.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        boundary.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        boundary.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        boundary.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return null; // No filtering
    }
    
    return boundary;
  }, [dateRange]);

  /**
   * Filter transactions based on all active filters
   */
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter (case-insensitive, searches merchant and description)
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const merchant = (t.merchant || '').toLowerCase();
        const description = (t.description || '').toLowerCase();
        return merchant.includes(query) || description.includes(query);
      });
    }

    // Date range filter
    if (dateRangeBoundary) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRangeBoundary;
      });
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Amount range filter
    if (minAmount !== null && minAmount !== '') {
      filtered = filtered.filter(t => Math.abs(t.amount) >= parseFloat(minAmount));
    }
    if (maxAmount !== null && maxAmount !== '') {
      filtered = filtered.filter(t => Math.abs(t.amount) <= parseFloat(maxAmount));
    }

    return filtered;
  }, [transactions, searchQuery, dateRangeBoundary, categoryFilter, minAmount, maxAmount]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      dateRange !== 'ALL' ||
      categoryFilter !== 'all' ||
      minAmount !== null ||
      maxAmount !== null
    );
  }, [searchQuery, dateRange, categoryFilter, minAmount, maxAmount]);

  /**
   * Count of active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (dateRange !== 'ALL') count++;
    if (categoryFilter !== 'all') count++;
    if (minAmount !== null) count++;
    if (maxAmount !== null) count++;
    return count;
  }, [searchQuery, dateRange, categoryFilter, minAmount, maxAmount]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDateRange('ALL');
    setCategoryFilter('all');
    setMinAmount(null);
    setMaxAmount(null);
  }, []);

  /**
   * Reset to default filters (3M view)
   */
  const resetToDefaults = useCallback(() => {
    setSearchQuery('');
    setDateRange('3M');
    setCategoryFilter('all');
    setMinAmount(null);
    setMaxAmount(null);
  }, []);

  return {
    // Filtered data
    filteredTransactions,
    
    // Filter state
    searchQuery,
    dateRange,
    categoryFilter,
    minAmount,
    maxAmount,
    
    // Filter setters
    setSearchQuery,
    setDateRange,
    setCategoryFilter,
    setMinAmount,
    setMaxAmount,
    
    // Helper values
    hasActiveFilters,
    activeFilterCount,
    dateRangeBoundary,
    
    // Actions
    clearFilters,
    resetToDefaults,
  };
};

export default useFilters;
