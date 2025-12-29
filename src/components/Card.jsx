import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card Component - Glassmorphic container with cyberpunk aesthetics
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Icon component from lucide-react
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.accentColor - 'violet' | 'cyan' | 'pink' - accent color for borders
 */
const Card = ({ 
  title, 
  icon: Icon, 
  children, 
  className = '', 
  accentColor = 'violet' 
}) => {
  const accentColors = {
    violet: 'border-violet-500/30 hover:border-violet-400/50',
    cyan: 'border-cyan-500/30 hover:border-cyan-400/50',
    pink: 'border-pink-500/30 hover:border-pink-400/50'
  };

  const glowColors = {
    violet: 'hover:shadow-violet-500/20',
    cyan: 'hover:shadow-cyan-500/20',
    pink: 'hover:shadow-pink-500/20'
  };

  const iconColors = {
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative overflow-hidden rounded-xl p-6
        bg-slate-950/60 backdrop-blur-xl
        border ${accentColors[accentColor]}
        transition-all duration-300 ease-out
        hover:shadow-lg ${glowColors[accentColor]}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-500/5 pointer-events-none" />
      
      {/* Card Header */}
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-4 relative z-10">
          {Icon && (
            <div className={`p-2 rounded-lg bg-slate-900/50 ${iconColors[accentColor]}`}>
              <Icon size={20} strokeWidth={2} />
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {title}
            </h3>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl to-transparent rounded-bl-full ${
        accentColor === 'violet' ? 'from-violet-500/10' : 
        accentColor === 'cyan' ? 'from-cyan-500/10' : 
        'from-pink-500/10'
      }`} />
    </motion.div>
  );
};

export default Card;
