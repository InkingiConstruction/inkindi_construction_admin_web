/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SidebarNavItem.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, backend data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  badge?: number;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon, label, isCollapsed, badge }) => {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
        ${isActive
          ? 'bg-[#e6f5f3] text-[#007E6E]' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 w-0.5 h-5 rounded-full"
              style={{ backgroundColor: '#007E6E' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Icon with active state styling */}
          <div
            className={`shrink-0 transition-all duration-200 ${
              isActive ? '' : 'text-gray-400 group-hover:text-gray-600'
            }`}
            style={isActive ? { color: '#007E6E' } : {}}
          >
            {icon}
          </div>

          {/* Label */}
          {!isCollapsed && (
            <span
              className={`text-sm font-medium transition-all duration-200 flex-1 whitespace-nowrap
                ${isActive ? 'font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}
              style={isActive ? { color: '#007E6E' } : {}}
            >
              {label}
            </span>
          )}

          {/* Badge */}
          {!isCollapsed && badge && badge > 0 && (
            <span
              className={`min-w-5 text-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-all
                ${isActive ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
              style={isActive ? { backgroundColor: '#007E6E' } : {}}
            >
              {badge}
            </span>
          )}

          {isCollapsed && badge && badge > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-white" />
          )}

          {/* Tooltip when collapsed */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap shadow-lg">
              {label}
              {badge && badge > 0 && (
                <span className="ml-2 text-white text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#007E6E' }}>{badge}</span>
              )}
              {/* Arrow */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarNavItem;
