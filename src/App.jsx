import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Wallet, Clock } from 'lucide-react';

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

// Import custom hook
import useFinancialData from './hooks/useFinancialData';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  // Bank connection state
  const [bankConnections, setBankConnections] = useState([
    { id: 'nordea', name: 'Nordea', status: 'disconnected' },
    { id: 'norwegian', name: 'Bank Norwegian', status: 'disconnected' }
  ]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  // Get financial data from custom hook
  const {
    subscriptions,
    totalSubscriptionCost,
    lostPoints,
    missedTravelTransactions,
    totalFikaSpend,
    fikaCount,
    bunEquivalent
  } = useFinancialData();

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
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  /**
   * Handle bank connection via Tink API
   */
  const handleConnectBank = useCallback(async () => {
    try {
      setIsLoadingConnections(true);
      const response = await fetch(`${API_URL}/api/tink/connect`);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get Tink Link URL:', data.error);
        alert('Unable to connect to bank. Please try again later.');
      }
    } catch (error) {
      console.error('Bank connection error:', error);
      alert('Unable to connect to bank service. Please check your internet connection.');
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
      isRefreshing={isRefreshing}
    >
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
          <motion.div variants={itemVariants}>
            <ConnectionStatus
              banks={bankConnections}
              isLoading={isLoadingConnections}
              onConnect={handleConnectBank}
              onReauth={handleReauth}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SubscriptionSlayer 
              subscriptions={subscriptions} 
              totalCost={totalSubscriptionCost} 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <PointsLost 
              lostPoints={lostPoints} 
              missedTransactions={missedTravelTransactions} 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FikaVisualizer 
              totalFikaSpend={totalFikaSpend} 
              bunEquivalent={bunEquivalent}
              fikaCount={fikaCount}
            />
          </motion.div>
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
