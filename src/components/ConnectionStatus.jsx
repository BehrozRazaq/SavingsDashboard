import React from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import Card from './Card';

/**
 * BankID Icon Component
 * Swedish BankID logo representation
 */
const BankIDIcon = ({ size = 20, className = '' }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

/**
 * Connection Status for individual bank
 */
const BankStatus = ({ name, status, onReauth }) => {
  const statusConfig = {
    connected: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      label: 'Linked',
    },
    expired: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      label: 'Expired',
    },
    syncing: {
      icon: RefreshCw,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      label: 'Syncing',
    },
    error: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'Error',
    },
    disconnected: {
      icon: Link2,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
      label: 'Not Linked',
    },
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;
  const needsReauth = status === 'expired' || status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}
    >
      <div className="flex items-center gap-3">
        <Icon 
          size={16} 
          className={`${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm text-white font-medium">{name}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-xs ${config.color}`}>{config.label}</span>
        
        {needsReauth && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReauth}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            <Smartphone size={12} />
            Re-auth with BankID
          </motion.button>
        )}
        
        {status === 'connected' && (
          <CheckCircle size={14} className="text-emerald-400" />
        )}
      </div>
    </motion.div>
  );
};

/**
 * ConnectionStatus Component
 * Shows the status of linked Swedish banks with BankID integration
 * 
 * @param {Object} props
 * @param {Array} props.banks - Array of bank connection objects
 * @param {boolean} props.isLoading - Whether connection status is being fetched
 * @param {Function} props.onConnect - Callback when user wants to connect a bank
 * @param {Function} props.onReauth - Callback when user needs to re-authenticate
 */
const ConnectionStatus = ({ 
  banks = [], 
  isLoading = false, 
  onConnect = () => {},
  onReauth = () => {}
}) => {
  // Default bank configurations for Swedish market
  const defaultBanks = [
    { 
      id: 'nordea', 
      name: 'Nordea', 
      provider: 'se-nordea-bankid',
      status: 'disconnected' 
    },
    { 
      id: 'norwegian', 
      name: 'Bank Norwegian', 
      provider: 'se-norwegian-bankid',
      status: 'disconnected' 
    },
  ];

  // Merge provided banks with defaults
  const displayBanks = defaultBanks.map(defaultBank => {
    const connectedBank = banks.find(
      b => b.provider?.toLowerCase().includes(defaultBank.id) || 
           b.id === defaultBank.id
    );
    return connectedBank ? { ...defaultBank, ...connectedBank } : defaultBank;
  });

  const connectedCount = displayBanks.filter(b => b.status === 'connected').length;
  const hasExpired = displayBanks.some(b => b.status === 'expired' || b.status === 'error');

  return (
    <Card title="Bank Connections" icon={Link2} accentColor="cyan">
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
          <span className="text-sm text-slate-400">
            {connectedCount}/{displayBanks.length} banks linked
          </span>
          {hasExpired && (
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle size={12} />
              Action required
            </span>
          )}
        </div>

        {/* Bank List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="animate-spin text-cyan-400" size={20} />
              <span className="ml-2 text-sm text-slate-400">Checking connections...</span>
            </div>
          ) : (
            displayBanks.map(bank => (
              <BankStatus
                key={bank.id}
                name={bank.name}
                status={bank.status}
                onReauth={() => onReauth(bank)}
              />
            ))
          )}
        </div>

        {/* Connect Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConnect}
          className="w-full relative overflow-hidden group"
        >
          {/* Pulse Animation Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-violet-600 rounded-lg" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-lg"
          />
          
          {/* Button Content */}
          <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium">
            <BankIDIcon size={20} />
            <span>Connect Bank with BankID</span>
            <ExternalLink size={14} className="opacity-60" />
          </div>
        </motion.button>

        {/* Info Text */}
        <p className="text-xs text-slate-500 text-center">
          Secure authentication via Swedish BankID
        </p>
      </div>
    </Card>
  );
};

export default ConnectionStatus;
