import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Cookie } from 'lucide-react';
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
 * FikaVisualizer Component
 * Displays total "fika" spend (small purchases < 60 SEK)
 * Converts to "bun equivalent" (Swedish kanelbulle costs ~25 SEK)
 * 
 * @param {Object} props
 * @param {number} props.totalFikaSpend - Total spend on fika items
 * @param {number} props.bunEquivalent - Number of buns that could be purchased
 * @param {number} props.fikaCount - Number of fika transactions
 */
const FikaVisualizer = ({ totalFikaSpend = 0, bunEquivalent = 0, fikaCount = 0 }) => {
  // Generate bun icons (max 20 for visual display)
  const displayBuns = Math.min(bunEquivalent, 20);
  const hasMoreBuns = bunEquivalent > 20;

  return (
    <Card title="Fika Index" icon={Coffee} accentColor="violet">
      <div className="space-y-4">
        {/* Total Fika Spend */}
        <div className="p-4 rounded-lg bg-slate-900/50 border border-violet-500/20">
          <p className="text-xs text-slate-500 mb-1">Total Fika Spend</p>
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent font-mono"
          >
            {formatSEK(totalFikaSpend)}
          </motion.p>
        </div>

        {/* Bun Equivalent Visualization */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-500 mb-3">Kanelbulle Equivalent</p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <Cookie className="text-amber-400" size={24} />
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-mono">
              {bunEquivalent}
            </span>
            <span className="text-slate-400 text-sm">buns</span>
          </motion.div>
        </div>

        {/* Visual Bun Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20"
        >
          <div className="flex flex-wrap justify-center gap-1">
            {[...Array(displayBuns)].map((_, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.4 + (index * 0.05),
                  type: 'spring',
                  stiffness: 200
                }}
                className="text-lg"
                role="img"
                aria-label="cinnamon bun"
              >
                🥐
              </motion.span>
            ))}
            {hasMoreBuns && (
              <span className="text-xs text-slate-500 ml-2 self-center">
                +{bunEquivalent - 20} more
              </span>
            )}
          </div>
        </motion.div>

        {/* Fun Fact */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <p className="text-xs text-slate-400 text-center">
            ☕ <span className="text-violet-400">{fikaCount} fika moments</span> this period
            <br />
            <span className="text-slate-500">Average: {fikaCount > 0 ? formatSEK(Math.round(totalFikaSpend / fikaCount)) : '0 kr'} per fika</span>
          </p>
        </div>

        {/* Fika Philosophy */}
        <p className="text-xs text-slate-600 text-center italic">
          "Fika is a Swedish concept about taking a break with coffee and something sweet"
        </p>
      </div>
    </Card>
  );
};

export default FikaVisualizer;
