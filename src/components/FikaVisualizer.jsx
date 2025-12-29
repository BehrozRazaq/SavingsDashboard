import React from 'react';
import { Coffee, Cookie } from 'lucide-react';
import Card from './Card';

/**
 * Format currency as SEK using Swedish locale
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
 */
const FikaVisualizer = ({ totalFikaSpend = 0, bunEquivalent = 0, fikaCount = 0 }) => {
  // Generate bun icons (max 20 for visual display)
  const displayBuns = Math.min(bunEquivalent, 10);
  const hasMoreBuns = bunEquivalent > 10;

  return (
    <Card title="Fika Index" icon={Coffee}>
      <div className="space-y-4">
        {/* Total Fika Spend */}
        <div className="p-4 rounded-md bg-slate-800/50">
          <p className="text-xs text-slate-500 mb-1">Total Fika Spend</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {formatSEK(totalFikaSpend)}
          </p>
        </div>

        {/* Bun Equivalent Visualization */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-500 mb-3">Kanelbulle Equivalent</p>
          <div className="flex items-center justify-center gap-2">
            <Cookie className="text-amber-400" size={20} />
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {bunEquivalent}
            </span>
            <span className="text-slate-400 text-sm">buns</span>
          </div>
        </div>

        {/* Visual Bun Display */}
        <div className="p-4 rounded-md bg-amber-500/5 border border-amber-500/20">
          <div className="flex flex-wrap justify-center gap-1">
            {[...Array(displayBuns)].map((_, index) => (
              <span
                key={index}
                className="text-base"
                role="img"
                aria-label="cinnamon bun"
              >
                🥐
              </span>
            ))}
            {hasMoreBuns && (
              <span className="text-xs text-slate-500 ml-2 self-center">
                +{bunEquivalent - 10} more
              </span>
            )}
          </div>
        </div>

        {/* Fun Fact */}
        <div className="p-3 rounded-md bg-primary-500/10 border border-primary-500/20">
          <p className="text-xs text-slate-400 text-center">
            ☕ <span className="text-primary-400">{fikaCount} fika moments</span> this period
            <br />
            <span className="text-slate-500">Average: {fikaCount > 0 ? formatSEK(Math.round(totalFikaSpend / fikaCount)) : '0 kr'} per fika</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default FikaVisualizer;
