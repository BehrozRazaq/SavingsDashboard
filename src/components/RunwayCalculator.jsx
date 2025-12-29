import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Clock, AlertTriangle } from 'lucide-react';
import Card from './Card';

/**
 * Runway Simulator
 * Calculates time remaining until funds are depleted based on burn rate
 */
const RunwayCalculator = () => {
  const [inputs, setInputs] = useState({
    totalCash: 100000,
    monthlyBurn: 5000
  });
  
  const [result, setResult] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateRunway = () => {
    const { totalCash, monthlyBurn } = inputs;
    
    if (!totalCash || !monthlyBurn || parseFloat(monthlyBurn) <= 0) {
      setResult(null);
      return;
    }
    
    const months = parseFloat(totalCash) / parseFloat(monthlyBurn);
    const years = months / 12;
    
    // Calculate runway end date
    const runwayEndDate = new Date();
    runwayEndDate.setMonth(runwayEndDate.getMonth() + Math.floor(months));
    
    setResult({
      monthsRemaining: Math.round(months * 10) / 10,
      yearsRemaining: Math.round(years * 10) / 10,
      runwayDate: runwayEndDate,
      status: months > 24 ? 'healthy' : months > 12 ? 'caution' : 'critical'
    });
  };

  // Auto-calculate on input change
  useEffect(() => {
    const debounce = setTimeout(() => {
      calculateRunway();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [inputs]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400';
      case 'caution': return 'text-amber-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'caution': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card title="Runway Simulator" icon={Gauge} accentColor="cyan">
      <div className="space-y-4">
        {/* Total Cash Input */}
        <div>
          <label className="label-cyber">Total Available Cash ($)</label>
          <input
            type="number"
            className="input-cyber"
            value={inputs.totalCash}
            onChange={(e) => handleInputChange('totalCash', e.target.value)}
            placeholder="100000"
          />
        </div>

        {/* Monthly Burn Rate Input */}
        <div>
          <label className="label-cyber">Monthly Burn Rate ($)</label>
          <input
            type="number"
            className="input-cyber"
            value={inputs.monthlyBurn}
            onChange={(e) => handleInputChange('monthlyBurn', e.target.value)}
            placeholder="5000"
          />
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-4 border-t border-cyan-500/20"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span>{getStatusIcon(result.status)}</span>
                  <p className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)} Status
                  </p>
                </div>
                <motion.p
                  key={result.monthsRemaining}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="result-cyber"
                >
                  {result.monthsRemaining} months
                </motion.p>
                <p className="text-slate-500 text-sm mt-1">
                  (~{result.yearsRemaining} years)
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((result.monthsRemaining / 60) * 100, 100)}%` 
                    }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${
                      result.status === 'healthy' 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        : result.status === 'caution'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                  />
                </div>
              </div>

              {/* Runway End Date */}
              <div className="mt-4 p-3 rounded-lg bg-slate-900/50 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-xs">Funds depleted by</span>
                </div>
                <p className="text-sm font-mono text-cyan-400 mt-1">
                  {formatDate(result.runwayDate)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default RunwayCalculator;
