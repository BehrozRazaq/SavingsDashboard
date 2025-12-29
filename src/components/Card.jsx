import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card Component - Professional enterprise-grade container
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Icon component from lucide-react
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.actions - Optional action buttons for header
 * @param {boolean} props.noPadding - Remove default padding from body
 */
const Card = ({ 
  title, 
  icon: Icon, 
  children, 
  className = '',
  actions = null,
  noPadding = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-navy-900 rounded-lg border border-slate-700/50
        shadow-card hover:shadow-card-hover
        transition-shadow duration-250
        ${className}
      `}
    >
      {/* Card Header */}
      {(title || Icon || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-md bg-slate-800/80 text-slate-400">
                <Icon size={18} strokeWidth={2} />
              </div>
            )}
            {title && (
              <h3 className="text-base font-semibold text-slate-100">
                {title}
              </h3>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Card Content */}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
