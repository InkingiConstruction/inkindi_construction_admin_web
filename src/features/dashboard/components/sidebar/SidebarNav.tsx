/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SidebarNav.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, backend data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Briefcase,
  Landmark,
  Scale,
  BarChart3,
  ScrollText,
  Settings,
  ChevronDown,
  ClipboardList,
  Truck,
  Wrench,
  UserCog,
} from 'lucide-react';
import SidebarNavItem from './SidebarNavItem';

interface SidebarNavProps {
  isCollapsed: boolean;
  messageBadge?: number;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

// ─── Admin-only navigation ──────────────────────────────────────────────────

const NAV_MAIN: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
];

const NAV_OPERATIONS: NavItem[] = [
  { to: '/dashboard/kyc', icon: <ShieldCheck size={18} />, label: 'KYC Review'},
  { to: '/dashboard/users', icon: <Users size={18} />, label: 'User Management' },
  { to: '/dashboard/projects', icon: <Briefcase size={18} />, label: 'Projects' },
  { to: '/dashboard/supply', icon: <Truck size={18} />, label: 'Supply Chain'},
  // { to: '/dashboard/inspections', icon: <Wrench size={18} />, label: 'Inspections', badge: 1 },
];

const NAV_FINANCIAL: NavItem[] = [
  { to: '/dashboard/escrow', icon: <Landmark size={18} />, label: 'Escrow & Finance'},
  // { to: '/dashboard/disputes', icon: <Scale size={18} />, label: 'Disputes', badge: 2 },
];

const NAV_COMPLIANCE: NavItem[] = [
  // { to: '/dashboard/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
  // { to: '/dashboard/audit', icon: <ScrollText size={18} />, label: 'Audit Logs' },
  // { to: '/dashboard/notifications', icon: <ClipboardList size={18} />, label: 'Notifications', badge: 2 },
  // { to: '/dashboard/settings', icon: <Settings size={18} />, label: 'System Config' },
  // { to: '/dashboard/profile', icon: <UserCog size={18} />, label: 'Profile' },
];

// ─── Nav Group ───────────────────────────────────────────────────────────────

interface NavGroupProps {
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
  messageBadge?: number;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, items, isCollapsed, messageBadge }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.to}
            {...item}
            isCollapsed={isCollapsed}
            badge={item.badge ?? (item.label === 'Messages' ? messageBadge : undefined)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors group uppercase tracking-wider"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronDown size={12} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            {items.map((item) => (
              <SidebarNavItem
                key={item.to}
                {...item}
                isCollapsed={isCollapsed}
                badge={item.badge ?? (item.label === 'Messages' ? messageBadge : undefined)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed, messageBadge }) => {
  return (
    <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto no-scrollbar">
      {/* Main */}
      <div className="space-y-1">
        {NAV_MAIN.map((item) => (
          <SidebarNavItem key={item.to} {...item} isCollapsed={isCollapsed} />
        ))}
      </div>

      {/* Operations */}
      <NavGroup title="Operations" items={NAV_OPERATIONS} isCollapsed={isCollapsed} messageBadge={messageBadge} />

      {/* Financial */}
      <NavGroup title="Financial" items={NAV_FINANCIAL} isCollapsed={isCollapsed} />

      {/* Compliance */}
      <NavGroup title="Compliance" items={NAV_COMPLIANCE} isCollapsed={isCollapsed} />
    </nav>
  );
};

export default SidebarNav;
