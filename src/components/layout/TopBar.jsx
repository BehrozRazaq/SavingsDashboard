import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Bell, 
  User,
  Calendar,
  ChevronDown,
  Check,
  X,
  Filter
} from 'lucide-react';

/**
 * TopBar Component - Professional top navigation bar
 * @param {Object} props
 * @param {boolean} props.sidebarCollapsed - Whether sidebar is collapsed
 * @param {string} props.dateRange - Currently selected date range
 * @param {Function} props.onDateRangeChange - Date range change handler
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {boolean} props.isRefreshing - Whether data is refreshing
 * @param {Object} props.connectionStatus - Bank connection status
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Search query change handler
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {number} props.activeFilterCount - Number of active filters
 * @param {Function} props.onClearFilters - Clear all filters handler
 */
const TopBar = ({ 
  sidebarCollapsed = false,
  dateRange = '3M',
  onDateRangeChange,
  onRefresh,
  isRefreshing = false,
  connectionStatus = { connected: 0, total: 2 },
  searchQuery = '',
  onSearchChange,
  hasActiveFilters = false,
  activeFilterCount = 0,
  onClearFilters
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const dateRanges = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' },
  ];

  return (
    <header 
      className={`
        fixed top-0 right-0 h-16 bg-navy-950/95 backdrop-blur-sm
        border-b border-slate-700/50 z-30
        transition-all duration-250
        ${sidebarCollapsed ? 'left-16' : 'left-60'}
      `}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      autoFocus
                      className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-md
                        text-slate-100 placeholder-slate-500 text-sm
                        focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    />
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        onSearchChange?.('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  aria-label="Open search"
                >
                  <Search size={20} />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-500/10 border border-primary-500/30">
                <Filter size={14} className="text-primary-400" />
                <span className="text-xs text-primary-400 font-medium">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </span>
              </div>
              <button
                onClick={onClearFilters}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                aria-label="Clear all filters"
                title="Clear all filters"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Center Section - Date Range */}
        <div className="relative">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 border border-slate-700
              text-slate-300 text-sm hover:bg-slate-700 transition-colors"
          >
            <Calendar size={16} />
            <span>{dateRanges.find(d => d.value === dateRange)?.label || '3 Months'}</span>
            <ChevronDown size={14} className={`transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {dateDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-50"
              >
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      onDateRangeChange?.(range.value);
                      setDateDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm
                      ${dateRange === range.value 
                        ? 'text-primary-400 bg-primary-500/10' 
                        : 'text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    <span>{range.label}</span>
                    {dateRange === range.value && <Check size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800/50 border border-slate-700/50">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.connected > 0 ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400">
              {connectionStatus.connected}/{connectionStatus.total} Banks
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh data"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* User Menu */}
          <button
            className="flex items-center gap-2 ml-2 p-1.5 rounded-md hover:bg-slate-800 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={16} className="text-slate-400" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
