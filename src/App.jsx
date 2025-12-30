import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Wallet, Clock, AlertCircle } from 'lucide-react';

// Import layout components
import { DashboardLayout } from './components/layout';

// Import components
import FireCalculator from './components/FireCalculator';
import RunwayCalculator from './components/RunwayCalculator';
import CompoundChart from './components/CompoundChart';
import InflationAdjuster from './components/InflationAdjuster';
import SubscriptionSlayer from './components/SubscriptionSlayer';
import PointsLost from './components/PointsLost';
import FikaVisualizer from './components/FikaVisualizer';
import ConnectionStatus from './components/ConnectionStatus';

// Import custom hooks
import useFinancialData from './hooks/useFinancialData';
import useFilters from './hooks/useFilters';

// Import utilities
import { calculateMetrics } from './utils/metricsCalculator';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Toast notification for errors/messages
 */
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
      type === 'error' ? 'bg-red-500/90' : type === 'success' ? 'bg-emerald-500/90' : 'bg-primary-500/90'
    } text-white max-w-sm`}>
      <AlertCircle size={20} />
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">×</button>
    </div>
  );
};

/**
 * MetricCard - KPI card for dashboard overview
 */
const MetricCard = ({ title, value, change, changeType, icon: Icon }) => (
  <div className="bg-navy-900 rounded-lg border border-slate-700/50 p-6 shadow-card hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-emerald-400' : changeType === 'negative' ? 'text-red-400' : 'text-slate-400'}`}>
            {change}
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-2 rounded-md bg-slate-800/80">
          <Icon size={20} className="text-slate-400" />
        </div>
      )}
    </div>
  </div>
);

/**
 * FluxFinance - Professional Finance Dashboard
 * Enterprise-grade financial utility suite
 */
function App() {
  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Bank connection state (will be updated from API)
  const [bankConnections, setBankConnections] = useState([
    { id: 'nordea', name: 'Nordea', status: 'disconnected' },
    { id: 'norwegian', name: 'Bank Norwegian', status: 'disconnected' }
  ]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // Get financial data from custom hook
  const {
    mergedTransactions,
    isConnected,
    isLoading: isLoadingData,
    error: dataError,
    usingMockData,
    refreshData,
    checkConnectionStatus
  } = useFinancialData();

  // Initialize filters with merged transactions
  const {
    filteredTransactions,
    searchQuery,
    dateRange,
    setSearchQuery,
    setDateRange,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
  } = useFilters(mergedTransactions);

  // Calculate metrics from filtered transactions
  const {
    subscriptions,
    totalSubscriptionCost,
    lostPoints,
    missedTravelTransactions,
    totalFikaSpend,
    fikaCount,
    bunEquivalent,
  } = useMemo(
    () => calculateMetrics(filteredTransactions),
    [filteredTransactions]
  );

  /**
   * Check for URL params from OAuth callback
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected === 'true') {
      setToast({ message: 'Bank connected successfully!', type: 'success' });
      // Refresh connection status
      fetchConnectionStatus();
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setToast({ message: `Connection failed: ${error}`, type: 'error' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /**
   * Fetch connection status from API
   */
  const fetchConnectionStatus = useCallback(async () => {
    try {
      setIsLoadingConnections(true);
      const response = await fetch(`${API_URL}/api/tink/status`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.connected && data.banks) {
        // Map API response to our bank connection format
        setBankConnections(prevBanks => prevBanks.map(bank => {
          const connectedBank = data.banks.find(b => 
            b.provider?.toLowerCase().includes(bank.id)
          );
          if (connectedBank) {
            return {
              ...bank,
              status: connectedBank.state || 'connected',
              needsReauth: connectedBank.needsReauth,
              lastUpdated: connectedBank.statusUpdated
            };
          }
          return bank;
        }));
        setLastSynced(data.lastSynced);
      }
    } catch (err) {
      console.error('Failed to fetch connection status:', err);
    } finally {
      setIsLoadingConnections(false);
    }
  }, []); // No dependencies needed - uses functional state update

  // Poll connection status every 30 seconds when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchConnectionStatus();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [isConnected, fetchConnectionStatus]);

  // Calculate connection status
  const connectionStatus = {
    connected: bankConnections.filter(b => b.status === 'connected').length,
    total: bankConnections.length
  };

  /**
   * Handle data refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshData(),
      fetchConnectionStatus()
    ]);
    setIsRefreshing(false);
  }, [refreshData, fetchConnectionStatus]);

  /**
   * Handle bank connection via Tink API
   */
  const handleConnectBank = useCallback(async () => {
    try {
      setIsLoadingConnections(true);
      const response = await fetch(`${API_URL}/api/tink/connect`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get Tink Link URL:', data.error);
        setToast({ message: 'Unable to connect to bank. Please try again later.', type: 'error' });
      }
    } catch (error) {
      console.error('Bank connection error:', error);
      setToast({ message: 'Unable to connect to bank service. Please check your internet connection.', type: 'error' });
    } finally {
      setIsLoadingConnections(false);
    }
  }, []);

  /**
   * Handle bank re-authentication
   */
  const handleReauth = useCallback(async (bank) => {
    console.log('Re-authenticating bank:', bank.name);
    await handleConnectBank();
  }, [handleConnectBank]);

  /**
   * Handle bank disconnection
   */
  const handleDisconnect = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/tink/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setBankConnections(prev => prev.map(bank => ({
          ...bank,
          status: 'disconnected'
        })));
        setToast({ message: 'Bank disconnected successfully', type: 'success' });
        // Refresh data to use mock data
        checkConnectionStatus();
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setToast({ message: 'Failed to disconnect bank', type: 'error' });
    }
  }, [checkConnectionStatus]);

  /**
   * Handle navigation
   */
  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onNavigate={handleNavigate}
      connectionStatus={connectionStatus}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing || isLoadingData}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
    >
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Data Source Indicator */}
      {usingMockData && (
        <div className="mb-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Using demo data. Connect your bank to see real transactions.</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your financial metrics and tools</p>
      </div>

      {/* KPI Cards Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Monthly Subscriptions"
            value={formatCurrency(totalSubscriptionCost)}
            change={`${subscriptions.length} active`}
            icon={Wallet}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Missed CashPoints"
            value={lostPoints.toLocaleString()}
            change={`${missedTravelTransactions.length} transactions`}
            changeType="negative"
            icon={TrendingUp}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Fika Spend"
            value={formatCurrency(totalFikaSpend)}
            change={`≈ ${bunEquivalent} kanelbullar`}
            icon={Clock}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Banks Connected"
            value={`${connectionStatus.connected}/${connectionStatus.total}`}
            change={connectionStatus.connected > 0 ? 'Synced' : 'Not connected'}
            changeType={connectionStatus.connected > 0 ? 'positive' : undefined}
            icon={BarChart3}
          />
        </motion.div>
      </motion.div>

      {/* Main Calculator Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <FireCalculator />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RunwayCalculator />
        </motion.div>
        <motion.div variants={itemVariants}>
          <InflationAdjuster />
        </motion.div>
      </motion.div>

      {/* Compound Chart - Full Width */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={itemVariants}>
          <CompoundChart />
        </motion.div>
      </motion.div>

      {/* Smart Analytics Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-md bg-slate-800/80">
            <BarChart3 className="text-slate-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Smart Analytics</h2>
            <p className="text-sm text-slate-400">Swedish banking insights</p>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* ConnectionStatus - Always visible */}
          <motion.div variants={itemVariants}>
            <ConnectionStatus
              banks={bankConnections}
              isLoading={isLoadingConnections}
              onConnect={handleConnectBank}
              onReauth={handleReauth}
              onDisconnect={handleDisconnect}
              lastSynced={lastSynced}
            />
          </motion.div>

          {/* SubscriptionSlayer - Show when there are transactions to analyze */}
          {filteredTransactions.length > 0 ? (
            <motion.div variants={itemVariants}>
              <SubscriptionSlayer 
                subscriptions={subscriptions} 
                totalCost={totalSubscriptionCost} 
              />
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <div className="bg-navy-900 rounded-lg border border-slate-700/50 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-md bg-slate-800/80">
                    <AlertCircle className="text-slate-400" size={20} />
                  </div>
                  <h3 className="text-slate-100 font-medium">Subscriptions</h3>
                </div>
                <p className="text-sm text-slate-400">
                  {mergedTransactions.length === 0 
                    ? 'Connect your bank to detect recurring subscriptions'
                    : 'No transactions match your filters'}
                </p>
              </div>
            </motion.div>
          )}

          {/* PointsLost - Show when there are transactions to analyze */}
          {filteredTransactions.length > 0 ? (
            <motion.div variants={itemVariants}>
              <PointsLost 
                lostPoints={lostPoints} 
                missedTransactions={missedTravelTransactions} 
              />
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <div className="bg-navy-900 rounded-lg border border-slate-700/50 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-md bg-slate-800/80">
                    <AlertCircle className="text-slate-400" size={20} />
                  </div>
                  <h3 className="text-slate-100 font-medium">Points Optimizer</h3>
                </div>
                <p className="text-sm text-slate-400">
                  {mergedTransactions.length === 0
                    ? 'Connect your bank to optimize your travel rewards'
                    : 'No transactions match your filters'}
                </p>
              </div>
            </motion.div>
          )}

          {/* FikaVisualizer - Show when there are transactions to analyze */}
          {filteredTransactions.length > 0 ? (
            <motion.div variants={itemVariants}>
              <FikaVisualizer 
                totalFikaSpend={totalFikaSpend} 
                bunEquivalent={bunEquivalent}
                fikaCount={fikaCount}
              />
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <div className="bg-navy-900 rounded-lg border border-slate-700/50 p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-md bg-slate-800/80">
                    <AlertCircle className="text-slate-400" size={20} />
                  </div>
                  <h3 className="text-slate-100 font-medium">Fika Index</h3>
                </div>
                <p className="text-sm text-slate-400">
                  {mergedTransactions.length === 0
                    ? 'Connect your bank to track your fika spending'
                    : 'No transactions match your filters'}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} FluxFinance. For educational purposes only.</p>
          <p>Built with React, Tailwind & Recharts</p>
        </div>
      </footer>
    </DashboardLayout>
  );
}

export default App;
