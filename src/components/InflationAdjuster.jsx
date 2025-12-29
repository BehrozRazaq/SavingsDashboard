import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, ArrowDown, Calendar } from 'lucide-react';
import Card from './Card';

/**
 * Inflation Adjuster
 * Calculates the real value of money after inflation over time
 * Default: 3% inflation over 20 years
 */
const InflationAdjuster = () => {
  const [inputs, setInputs] = useState({
    currentAmount: 100000,
    inflationRate: 3,
    years: 20
  });
  
  const [result, setResult] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateInflation = () => {
    const { currentAmount, inflationRate, years } = inputs;
    
    if (!currentAmount || !inflationRate || !years) {
      setResult(null);
      return;
    }
    
    const rate = parseFloat(inflationRate) / 100;
    const yearsNum = parseInt(years);
    const amount = parseFloat(currentAmount);
    
    // Real value calculation: What today's money will be worth in future (purchasing power)
    const realValue = amount / Math.pow(1 + rate, yearsNum);
    
    // Future equivalent: What you'll need in the future to have same purchasing power
    const futureEquivalent = amount * Math.pow(1 + rate, yearsNum);
    
    // Purchasing power loss percentage
    const purchasingPowerLoss = ((amount - realValue) / amount) * 100;
    
    setResult({
      realValue: Math.round(realValue * 100) / 100,
      futureEquivalent: Math.round(futureEquivalent),
      purchasingPowerLoss: Math.round(purchasingPowerLoss * 10) / 10,
      yearlyData: generateYearlyData(amount, rate, yearsNum)
    });
  };

  const generateYearlyData = (amount, rate, years) => {
    const data = [];
    for (let year = 0; year <= years; year += 5) {
      data.push({
        year,
        value: Math.round(amount / Math.pow(1 + rate, year))
      });
    }
    return data;
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      calculateInflation();
    }, 300);
    
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
    <Card title="Inflation Adjuster" icon={Percent} accentColor="pink">
      <div className="space-y-4">
        {/* Current Amount Input */}
        <div>
          <label className="label-cyber">Current Amount ($)</label>
          <input
            type="number"
            className="input-cyber"
            value={inputs.currentAmount}
            onChange={(e) => handleInputChange('currentAmount', e.target.value)}
            placeholder="100000"
          />
        </div>

        {/* Inflation Rate Input */}
        <div>
          <label className="label-cyber">Inflation Rate (%)</label>
          <input
            type="number"
            step="0.1"
            className="input-cyber"
            value={inputs.inflationRate}
            onChange={(e) => handleInputChange('inflationRate', e.target.value)}
            placeholder="3"
          />
        </div>

        {/* Years Input */}
        <div>
          <label className="label-cyber">Time Period (Years)</label>
          <input
            type="number"
            className="input-cyber"
            value={inputs.years}
            onChange={(e) => handleInputChange('years', e.target.value)}
            placeholder="20"
            min="1"
            max="100"
          />
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-4 border-t border-pink-500/20"
            >
              <div className="text-center mb-4">
                <p className="text-slate-400 text-sm mb-1">Real Value in {inputs.years} Years</p>
                <motion.p
                  key={result.realValue}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="result-cyber"
                >
                  {formatCurrency(result.realValue)}
                </motion.p>
                <p className="text-slate-500 text-xs mt-1">
                  Today's purchasing power equivalent
                </p>
              </div>
              
              {/* Inflation Impact Visualization */}
              <div className="relative py-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Today</p>
                    <p className="text-sm font-mono text-white">
                      {formatCurrency(parseFloat(inputs.currentAmount))}
                    </p>
                  </div>
                  <ArrowDown className="text-pink-400 animate-bounce mx-4" size={20} />
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{inputs.years} Years</p>
                    <p className="text-sm font-mono text-pink-400">
                      {formatCurrency(result.realValue)}
                    </p>
                  </div>
                </div>
                
                {/* Loss indicator bar */}
                <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${100 - result.purchasingPowerLoss}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                  />
                </div>
                <p className="text-center text-xs text-pink-400 mt-2">
                  -{result.purchasingPowerLoss}% purchasing power
                </p>
              </div>

              {/* Future equivalent info */}
              <div className="mt-4 p-3 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar size={14} />
                  <span className="text-xs">To maintain purchasing power</span>
                </div>
                <p className="text-sm">
                  You'll need{' '}
                  <span className="font-mono text-cyan-400 font-bold">
                    {formatCurrency(result.futureEquivalent)}
                  </span>
                  {' '}in {inputs.years} years
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default InflationAdjuster;
