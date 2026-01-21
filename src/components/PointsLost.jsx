import React from 'react';
import { Plane, AlertTriangle, TrendingDown } from 'lucide-react';
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
 * PointsLost Component
 * Warning card showing missed CashPoints from using wrong card for Travel
 */
const PointsLost = ({ lostPoints = 0, missedTransactions = [] }) => {
  // Calculate total travel spend on wrong card
  const totalMissedSpend = missedTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount), 0
  );

  const hasLostPoints = lostPoints > 0;

  return (
    <Card title="Points Optimizer" icon={Plane}>
      <div className="space-y-4">
        {/* Main Warning */}
        <div
          className={`p-4 rounded-md border ${
            hasLostPoints 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            {hasLostPoints ? (
              <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
            ) : (
              <Plane className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
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
        </div>

        {/* Points Lost Display */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-500 mb-2">CashPoints Missed</p>
          <div className="inline-flex items-center gap-2">
            <span className={`text-3xl font-bold font-mono ${
              hasLostPoints ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {lostPoints.toLocaleString('sv-SE')}
            </span>
            <TrendingDown className={`${hasLostPoints ? 'text-amber-400' : 'text-emerald-400'}`} size={20} />
          </div>
        </div>

        {/* Details */}
        {hasLostPoints && (
          <div className="space-y-3">
            {/* Spend on wrong card */}
            <div className="p-3 rounded-md bg-slate-800/50 flex justify-between items-center">
              <span className="text-xs text-slate-500">Travel on Nordea</span>
              <span className="text-sm font-mono text-teal-400">{formatSEK(totalMissedSpend)}</span>
            </div>

            {/* Tip */}
            <div className="p-3 rounded-md bg-primary-500/10 border border-primary-500/20">
              <p className="text-xs text-slate-400">
                💡 <span className="text-primary-400">Tip:</span> Use Bank Norwegian for travel to earn 1 CashPoint per 10 SEK
              </p>
            </div>
          </div>
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
