import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import Card from './Card';

/**
 * Freedom Engine (FIRE Calculator)
 * Calculates Years to Financial Independence / Early Retirement
 * 
 * Formula: Uses compound growth to determine when net worth reaches 25x annual expenses
 * (Based on the 4% safe withdrawal rate)
 */
const FireCalculator = () => {
  const [inputs, setInputs] = useState({
    netWorth: 50000,
    monthlySavings: 2000,
    annualReturn: 7
  });
  
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFIRE = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay for UX
    setTimeout(() => {
      const { netWorth, monthlySavings, annualReturn } = inputs;
      
      // FIRE number = 25x annual expenses (assuming monthly savings = surplus after expenses)
      // Using simplified formula: target = current lifestyle expenses * 12 * 25
      // Assuming monthly savings represents what you can save, we'll target 25x that annual saving
      const FIRE_MULTIPLIER = 25; // Based on 4% safe withdrawal rate (1/0.04 = 25)
      const MONTHS_PER_YEAR = 12;
      const annualSavings = parseFloat(monthlySavings) * MONTHS_PER_YEAR;
      const targetWealth = annualSavings * FIRE_MULTIPLIER;
      
      const monthlyReturn = parseFloat(annualReturn) / 100 / 12;
      let currentWealth = parseFloat(netWorth);
      let months = 0;
      const maxMonths = 1200; // 100 years cap
      
      // Compound growth calculation
      while (currentWealth < targetWealth && months < maxMonths) {
        currentWealth = currentWealth * (1 + monthlyReturn) + parseFloat(monthlySavings);
        months++;
      }
      
      const years = months / 12;
      
      setResult({
        yearsToFIRE: Math.round(years * 10) / 10,
        targetWealth: Math.round(targetWealth),
        projectedWealth: Math.round(currentWealth),
        monthsToFIRE: months
      });
      
      setIsCalculating(false);
    }, 300);
  };

  // Auto-calculate on input change
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (inputs.netWorth && inputs.monthlySavings && inputs.annualReturn) {
        calculateFIRE();
      }
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [inputs]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card title="FIRE Calculator" icon={Flame}>
      <div className="space-y-4">
        {/* Net Worth Input */}
        <div>
          <label className="label-professional">Current Net Worth ($)</label>
          <input
            type="number"
            className="input-professional"
            value={inputs.netWorth}
            onChange={(e) => handleInputChange('netWorth', e.target.value)}
            placeholder="50000"
          />
        </div>

        {/* Monthly Savings Input */}
        <div>
          <label className="label-professional">Monthly Savings ($)</label>
          <input
            type="number"
            className="input-professional"
            value={inputs.monthlySavings}
            onChange={(e) => handleInputChange('monthlySavings', e.target.value)}
            placeholder="2000"
          />
        </div>

        {/* Annual Return Input */}
        <div>
          <label className="label-professional">Expected Annual Return (%)</label>
          <input
            type="number"
            step="0.1"
            className="input-professional"
            value={inputs.annualReturn}
            onChange={(e) => handleInputChange('annualReturn', e.target.value)}
            placeholder="7"
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
                <p className="text-slate-400 text-sm mb-1">Years to FIRE</p>
                <motion.p
                  key={result.yearsToFIRE}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-primary-400"
                >
                  {isCalculating ? '...' : `${result.yearsToFIRE} years`}
                </motion.p>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-md bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">FIRE Target</p>
                  <p className="text-sm font-mono text-teal-400">
                    {formatCurrency(result.targetWealth)}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">Projected Value</p>
                  <p className="text-sm font-mono text-emerald-400">
                    {formatCurrency(result.projectedWealth)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default FireCalculator;
