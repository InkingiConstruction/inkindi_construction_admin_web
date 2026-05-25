/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : DashboardSidebar.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React from 'react';
import { motion } from 'framer-motion';
import SidebarLogo from './sidebar/SidebarLogo';
import SidebarNav from './sidebar/SidebarNav';
import SidebarFooter from './sidebar/SidebarFooter';

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isCollapsed }) => {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col shrink-0 relative z-20"
    >
      <SidebarLogo isCollapsed={isCollapsed} />
      <SidebarNav isCollapsed={isCollapsed} />
      <SidebarFooter isCollapsed={isCollapsed} />
    </motion.aside>
  );
};

export default DashboardSidebar;