import React from 'react';
import { motion } from 'framer-motion';
import { Repeat, AlertCircle } from 'lucide-react';
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
 * SubscriptionSlayer Component
 * Lists detected recurring subscriptions with total monthly cost
 */
const SubscriptionSlayer = ({ subscriptions = [], totalCost = 0 }) => {
  return (
    <Card title="Subscriptions" icon={Repeat}>
      <div className="space-y-4">
        {/* Total Monthly Cost Header */}
        <div className="p-4 rounded-md bg-slate-800/50">
          <p className="text-xs text-slate-500 mb-1">Total Monthly Cost</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">
            {formatSEK(totalCost)}
          </p>
        </div>

        {/* Subscription List */}
        {subscriptions.length > 0 ? (
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {subscriptions.map((sub) => (
              <li
                key={sub.merchant}
                className="flex items-center justify-between p-3 rounded-md bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-sm text-slate-300 truncate max-w-[140px]">
                    {sub.merchant}
                  </span>
                </div>
                <span className="text-sm font-mono text-slate-400">
                  {formatSEK(sub.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 p-4 rounded-md bg-slate-800/50 text-slate-500">
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
