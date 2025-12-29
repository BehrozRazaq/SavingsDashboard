import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calculator, 
  BarChart3, 
  Link2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

/**
 * Sidebar Component - Professional collapsible navigation
 * @param {Object} props
 * @param {boolean} props.collapsed - Whether sidebar is collapsed
 * @param {Function} props.onToggle - Toggle collapse function
 * @param {string} props.activeSection - Currently active section
 * @param {Function} props.onNavigate - Navigation handler
 */
const Sidebar = ({ 
  collapsed = false, 
  onToggle, 
  activeSection = 'dashboard',
  onNavigate 
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      section: 'main'
    },
    {
      id: 'calculators',
      label: 'Calculators',
      icon: Calculator,
      section: 'tools'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      section: 'tools'
    },
    {
      id: 'connections',
      label: 'Connections',
      icon: Link2,
      section: 'tools'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      section: 'bottom'
    },
  ];

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 64 }
  };

  return (
    <motion.aside
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-navy-950 border-r border-slate-700/50 z-40 flex flex-col"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-white" size={18} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-slate-100 whitespace-nowrap overflow-hidden"
              >
                FluxFinance
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {navItems.filter(item => item.section !== 'bottom').map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate?.(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500 -ml-[2px] pl-[14px]' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-700/50 p-2">
        {/* Settings */}
        {navItems.filter(item => item.section === 'bottom').map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-2
                transition-colors duration-150
                ${isActive 
                  ? 'bg-primary-500/10 text-primary-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-md
            text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
