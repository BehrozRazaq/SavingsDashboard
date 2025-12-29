import React from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertTriangle, TrendingDown } from 'lucide-react';
import Card from './Card';

/**
 * Format currency as SEK using Swedish locale
 * @param {number} value - Amount to format
 * @returns {string} Formatted currency string (e.g., "1 250 kr")
 */
const formatSEK = (value) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('SEK', 'kr');
};

/**
 * PointsLost Component
 * Warning card showing missed CashPoints from using wrong card for Travel
 * 
 * Norwegian card offers 1 CashPoint per 10 SEK on Travel category
 * 
 * @param {Object} props
 * @param {number} props.lostPoints - Total CashPoints missed
 * @param {Array} props.missedTransactions - Transactions made on wrong card
 */
const PointsLost = ({ lostPoints = 0, missedTransactions = [] }) => {
  // Calculate total travel spend on wrong card
  const totalMissedSpend = missedTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount), 0
  );

  const hasLostPoints = lostPoints > 0;

  return (
    <Card title="Points Optimizer" icon={Plane} accentColor="cyan">
      <div className="space-y-4">
        {/* Main Warning */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-4 rounded-lg border ${
            hasLostPoints 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            {hasLostPoints ? (
              <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
            ) : (
              <Plane className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
            )}
            <div>
              <p className={`text-sm font-medium ${hasLostPoints ? 'text-amber-400' : 'text-emerald-400'}`}>
                {hasLostPoints ? 'Missed Opportunity' : 'Great Job!'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {hasLostPoints 
                  ? 'You used Nordea for travel purchases instead of Norwegian'
                  : 'You\'re maximizing your travel rewards!'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Points Lost Display */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-500 mb-2">CashPoints Missed</p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2"
          >
            <span className={`text-4xl font-bold font-mono ${
              hasLostPoints 
                ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
                : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
            } bg-clip-text text-transparent`}>
              {lostPoints.toLocaleString('sv-SE')}
            </span>
            <TrendingDown className={`${hasLostPoints ? 'text-amber-400' : 'text-emerald-400'}`} size={24} />
          </motion.div>
        </div>

        {/* Details */}
        {hasLostPoints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            {/* Spend on wrong card */}
            <div className="p-3 rounded-lg bg-slate-900/50 flex justify-between items-center">
              <span className="text-xs text-slate-500">Travel on Nordea</span>
              <span className="text-sm font-mono text-cyan-400">{formatSEK(totalMissedSpend)}</span>
            </div>

            {/* Tip */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
              <p className="text-xs text-slate-400">
                💡 <span className="text-cyan-400">Pro Tip:</span> Use Bank Norwegian for all travel purchases to earn 1 CashPoint per 10 SEK!
              </p>
            </div>
          </motion.div>
        )}

        {/* Transaction Count */}
        <p className="text-xs text-slate-500 text-center">
          {missedTransactions.length} travel transaction{missedTransactions.length !== 1 ? 's' : ''} on wrong card
        </p>
      </div>
    </Card>
  );
};

export default PointsLost;
