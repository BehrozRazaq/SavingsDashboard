import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * DashboardLayout Component - Main layout wrapper with sidebar and topbar
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.activeSection - Currently active section
 * @param {Function} props.onNavigate - Navigation handler
 * @param {Object} props.connectionStatus - Bank connection status
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {boolean} props.isRefreshing - Whether data is refreshing
 */
const DashboardLayout = ({ 
  children,
  activeSection = 'dashboard',
  onNavigate,
  connectionStatus = { connected: 0, total: 2 },
  onRefresh,
  isRefreshing = false
}) => {
  // Persist sidebar state in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  const [dateRange, setDateRange] = useState('3M');

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onNavigate={onNavigate}
      />

      {/* TopBar */}
      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        connectionStatus={connectionStatus}
      />

      {/* Main Content Area */}
      <main 
        className={`
          pt-16 min-h-screen
          transition-all duration-250
          ${sidebarCollapsed ? 'ml-16' : 'ml-60'}
        `}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
