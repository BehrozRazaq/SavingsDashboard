import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, Clock } from 'lucide-react';
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'healthy': 
        return { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Healthy' };
      case 'caution': 
        return { color: 'text-amber-400', bg: 'bg-amber-500', label: 'Caution' };
      case 'critical': 
        return { color: 'text-red-400', bg: 'bg-red-500', label: 'Critical' };
      default: 
        return { color: 'text-slate-400', bg: 'bg-slate-500', label: 'Unknown' };
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card title="Runway Calculator" icon={Hourglass}>
      <div className="space-y-4">
        {/* Total Cash Input */}
        <div>
          <label className="label-professional">Total Available Cash ($)</label>
          <input
            type="number"
            className="input-professional"
            value={inputs.totalCash}
            onChange={(e) => handleInputChange('totalCash', e.target.value)}
            placeholder="100000"
          />
        </div>

        {/* Monthly Burn Rate Input */}
        <div>
          <label className="label-professional">Monthly Burn Rate ($)</label>
          <input
            type="number"
            className="input-professional"
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
              className="mt-6 pt-4 border-t border-slate-700/50"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusConfig(result.status).bg}`} />
                  <p className={`text-sm font-medium ${getStatusConfig(result.status).color}`}>
                    {getStatusConfig(result.status).label} Status
                  </p>
                </div>
                <motion.p
                  key={result.monthsRemaining}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-primary-400"
                >
                  {result.monthsRemaining} months
                </motion.p>
                <p className="text-slate-500 text-sm mt-1">
                  (~{result.yearsRemaining} years)
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((result.monthsRemaining / 60) * 100, 100)}%` 
                    }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full ${getStatusConfig(result.status).bg}`}
                  />
                </div>
              </div>

              {/* Runway End Date */}
              <div className="mt-4 p-3 rounded-md bg-slate-800/50 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-xs">Funds depleted by</span>
                </div>
                <p className="text-sm font-mono text-teal-400 mt-1">
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
