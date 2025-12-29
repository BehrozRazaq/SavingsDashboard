import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Github, Zap, BarChart3 } from 'lucide-react';

// Import components
import FireCalculator from './components/FireCalculator';
import RunwayCalculator from './components/RunwayCalculator';
import CompoundChart from './components/CompoundChart';
import InflationAdjuster from './components/InflationAdjuster';
import SubscriptionSlayer from './components/SubscriptionSlayer';
import PointsLost from './components/PointsLost';
import FikaVisualizer from './components/FikaVisualizer';

// Import custom hook
import useFinancialData from './hooks/useFinancialData';

/**
 * FluxFinance - Personal Finance Dashboard
 * A cyberpunk-styled financial utility suite
 */
function App() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-animated">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-lg shadow-violet-500/30">
              <Zap className="text-white" size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              FluxFinance
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your personal finance command center. Track, calculate, and visualize your path to financial freedom.
          </p>
          
          {/* Status Badges */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Sparkles size={12} />
              v1.0.0
            </span>
          </div>
        </motion.header>

        {/* Dashboard Grid */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Freedom Engine (FIRE Calculator) */}
          <motion.div variants={itemVariants}>
            <FireCalculator />
          </motion.div>

          {/* Runway Simulator */}
          <motion.div variants={itemVariants}>
            <RunwayCalculator />
          </motion.div>

          {/* Inflation Adjuster */}
          <motion.div variants={itemVariants}>
            <InflationAdjuster />
          </motion.div>

          {/* Compound Visualizer - Full Width */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
            <CompoundChart />
          </motion.div>
        </motion.main>

        {/* Smart Analytics Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-pink-500/30">
              <BarChart3 className="text-pink-400" size={20} />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Smart Analytics
            </h2>
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
              Swedish Banking
            </span>
          </div>

          {/* Analytics Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Subscription Slayer */}
            <motion.div variants={itemVariants}>
              <SubscriptionSlayer 
                subscriptions={subscriptions} 
                totalCost={totalSubscriptionCost} 
              />
            </motion.div>

            {/* Points Lost */}
            <motion.div variants={itemVariants}>
              <PointsLost 
                lostPoints={lostPoints} 
                missedTransactions={missedTravelTransactions} 
              />
            </motion.div>

            {/* Fika Visualizer */}
            <motion.div variants={itemVariants}>
              <FikaVisualizer 
                totalFikaSpend={totalFikaSpend} 
                bunEquivalent={bunEquivalent}
                fikaCount={fikaCount}
              />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-slate-500 text-sm">
              Built with React, Tailwind & Recharts
            </p>
            <span className="text-slate-700">|</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-violet-400 transition-colors text-sm"
            >
              <Github size={14} />
              Source
            </a>
          </div>
          <p className="mt-4 text-slate-600 text-xs">
            © {new Date().getFullYear()} FluxFinance. For educational purposes only.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
