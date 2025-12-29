import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import Card from './Card';

/**
 * Compound Visualizer
 * Shows compound interest growth visualization over 30 years
 */
const CompoundChart = () => {
  const [inputs, setInputs] = useState({
    principal: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    years: 30
  });
  
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateChartData = () => {
    const { principal, monthlyContribution, annualReturn, years } = inputs;
    const monthlyRate = parseFloat(annualReturn) / 100 / 12;
    const totalMonths = parseInt(years) * 12;
    const data = [];
    
    let balance = parseFloat(principal);
    let totalContributions = parseFloat(principal);
    
    for (let month = 0; month <= totalMonths; month++) {
      if (month % 12 === 0) {
        const year = month / 12;
        data.push({
          year: year,
          balance: Math.round(balance),
          contributions: Math.round(totalContributions),
          interest: Math.round(balance - totalContributions)
        });
      }
      
      if (month < totalMonths) {
        balance = balance * (1 + monthlyRate) + parseFloat(monthlyContribution);
        totalContributions += parseFloat(monthlyContribution);
      }
    }
    
    setChartData(data);
    setSummary({
      finalBalance: Math.round(balance),
      totalContributions: Math.round(totalContributions),
      totalInterest: Math.round(balance - totalContributions)
    });
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (inputs.principal && inputs.monthlyContribution && inputs.annualReturn && inputs.years) {
        generateChartData();
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [inputs]);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatFullCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border border-violet-500/30">
          <p className="text-white font-medium mb-2">Year {label}</p>
          <p className="text-sm text-violet-400">
            Balance: {formatFullCurrency(payload[0]?.value)}
          </p>
          <p className="text-sm text-cyan-400">
            Contributions: {formatFullCurrency(payload[1]?.value)}
          </p>
          <p className="text-sm text-emerald-400">
            Interest: {formatFullCurrency(payload[2]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Compound Visualizer" icon={TrendingUp} accentColor="violet" className="col-span-full lg:col-span-2">
      <div className="space-y-4">
        {/* Input Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label-cyber text-xs">Principal ($)</label>
            <input
              type="number"
              className="input-cyber text-sm py-2"
              value={inputs.principal}
              onChange={(e) => handleInputChange('principal', e.target.value)}
              placeholder="10000"
            />
          </div>
          <div>
            <label className="label-cyber text-xs">Monthly ($)</label>
            <input
              type="number"
              className="input-cyber text-sm py-2"
              value={inputs.monthlyContribution}
              onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <label className="label-cyber text-xs">Return (%)</label>
            <input
              type="number"
              step="0.1"
              className="input-cyber text-sm py-2"
              value={inputs.annualReturn}
              onChange={(e) => handleInputChange('annualReturn', e.target.value)}
              placeholder="7"
            />
          </div>
          <div>
            <label className="label-cyber text-xs">Years</label>
            <input
              type="number"
              className="input-cyber text-sm py-2"
              value={inputs.years}
              onChange={(e) => handleInputChange('years', e.target.value)}
              placeholder="30"
              min="1"
              max="50"
            />
          </div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-64 md:h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `${value}y`}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorBalance)"
                name="Total Balance"
              />
              <Area
                type="monotone"
                dataKey="contributions"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#colorContributions)"
                name="Contributions"
              />
              <Area
                type="monotone"
                dataKey="interest"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorInterest)"
                name="Interest Earned"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Summary Stats */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="p-3 rounded-lg bg-slate-900/50 text-center">
              <p className="text-xs text-slate-500 mb-1">Final Balance</p>
              <p className="text-lg font-mono text-violet-400 font-bold">
                {formatCurrency(summary.finalBalance)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 text-center">
              <p className="text-xs text-slate-500 mb-1">Contributions</p>
              <p className="text-lg font-mono text-cyan-400 font-bold">
                {formatCurrency(summary.totalContributions)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 text-center">
              <p className="text-xs text-slate-500 mb-1">Interest Earned</p>
              <p className="text-lg font-mono text-emerald-400 font-bold">
                {formatCurrency(summary.totalInterest)}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default CompoundChart;
