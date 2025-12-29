import React from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Card from './Card';

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
      label: 'Connected',
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
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-500/30',
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
      bgColor: 'bg-slate-800/50',
      borderColor: 'border-slate-700/50',
      label: 'Not Connected',
    },
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;
  const needsReauth = status === 'expired' || status === 'error';

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md ${config.bgColor} border ${config.borderColor}`}
    >
      <div className="flex items-center gap-3">
        <Icon 
          size={16} 
          className={`${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm text-slate-100 font-medium">{name}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-xs ${config.color}`}>{config.label}</span>
        
        {needsReauth && (
          <button
            onClick={onReauth}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            Re-auth
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * ConnectionStatus Component
 * Shows the status of linked Swedish banks with BankID integration
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
    <Card title="Bank Connections" icon={Link2}>
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between p-3 rounded-md bg-slate-800/50">
          <span className="text-sm text-slate-400">
            {connectedCount}/{displayBanks.length} banks connected
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
              <RefreshCw className="animate-spin text-primary-400" size={20} />
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
        <button
          onClick={onConnect}
          className="w-full btn btn-primary"
        >
          <Link2 size={16} />
          <span>Connect Bank</span>
          <ExternalLink size={14} className="opacity-60" />
        </button>

        {/* Info Text */}
        <p className="text-xs text-slate-500 text-center">
          Secure authentication via Swedish BankID
        </p>
      </div>
    </Card>
  );
};

export default ConnectionStatus;
