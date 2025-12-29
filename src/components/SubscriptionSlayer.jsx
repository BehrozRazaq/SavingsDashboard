import React from 'react';
import { motion } from 'framer-motion';
import { Repeat, AlertCircle } from 'lucide-react';
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
 * SubscriptionSlayer Component
 * Lists detected recurring subscriptions with total monthly cost
 * 
 * @param {Object} props
 * @param {Array} props.subscriptions - Array of subscription objects with merchant, amount, occurrences
 * @param {number} props.totalCost - Total monthly subscription cost
 */
const SubscriptionSlayer = ({ subscriptions = [], totalCost = 0 }) => {
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Card title="Subscription Slayer" icon={Repeat} accentColor="pink">
      <div className="space-y-4">
        {/* Total Monthly Cost Header */}
        <div className="p-4 rounded-lg bg-slate-900/50 border border-pink-500/20">
          <p className="text-xs text-slate-500 mb-1">Total Monthly Cost</p>
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent font-mono"
          >
            {formatSEK(totalCost)}
          </motion.p>
        </div>

        {/* Subscription List */}
        {subscriptions.length > 0 ? (
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2 max-h-48 overflow-y-auto"
          >
            {subscriptions.map((sub) => (
              <motion.li
                key={sub.merchant}
                variants={itemVariants}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-700/50 hover:border-pink-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-pink-400" />
                  <span className="text-sm text-slate-300 truncate max-w-[150px]">
                    {sub.merchant}
                  </span>
                </div>
                <span className="text-sm font-mono text-pink-400">
                  {formatSEK(sub.amount)}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-900/30 text-slate-500">
            <AlertCircle size={16} />
            <span className="text-sm">No recurring subscriptions detected</span>
          </div>
        )}

        {/* Detected Count */}
        <p className="text-xs text-slate-500 text-center">
          {subscriptions.length} recurring payment{subscriptions.length !== 1 ? 's' : ''} detected
        </p>
      </div>
    </Card>
  );
};

export default SubscriptionSlayer;
