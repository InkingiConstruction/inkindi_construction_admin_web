/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : HeaderSearch.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, backend data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Landmark,
  LayoutDashboard,
  Scale,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
  category: string;
}

const navItems: SearchResult[] = [
  { id: 'overview', title: 'Admin Overview', subtitle: 'Platform health and controls', icon: <LayoutDashboard size={16} />, link: '/dashboard', category: 'Operations' },
  { id: 'kyc', title: 'KYC Review', subtitle: 'Identity and compliance queue', icon: <ShieldCheck size={16} />, link: '/dashboard/kyc', category: 'Operations' },
  { id: 'users', title: 'User Management', subtitle: 'Clients, engineers, supervisors, suppliers', icon: <Users size={16} />, link: '/dashboard/users', category: 'Operations' },
  { id: 'projects', title: 'Projects', subtitle: 'Project audit and milestones', icon: <Briefcase size={16} />, link: '/dashboard/projects', category: 'Operations' },
  { id: 'escrow', title: 'Escrow & Finance', subtitle: 'Deposits, balances, releases', icon: <Landmark size={16} />, link: '/dashboard/escrow', category: 'Financial' },
  { id: 'disputes', title: 'Disputes', subtitle: 'Mediation and locked funds', icon: <Scale size={16} />, link: '/dashboard/disputes', category: 'Financial' },
  { id: 'reports', title: 'Reports', subtitle: 'Compliance and reconciliation', icon: <BarChart3 size={16} />, link: '/dashboard/reports', category: 'Compliance' },
  { id: 'audit', title: 'Audit Logs', subtitle: 'Sensitive action history', icon: <ScrollText size={16} />, link: '/dashboard/audit', category: 'Compliance' },
  { id: 'notifications', title: 'Notifications', subtitle: 'Email, push, SMS operations', icon: <Bell size={16} />, link: '/dashboard/notifications', category: 'Compliance' },
  { id: 'settings', title: 'System Config', subtitle: 'Security and integration flags', icon: <Settings size={16} />, link: '/dashboard/settings', category: 'System' },
];

const HeaderSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return navItems;
    return navItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative max-w-xl flex-1">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-brand' : 'text-gray-400'}`}
          size={16}
        />
        <input
          type="text"
          placeholder="Search admin modules..."
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 140)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-3 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{category}</span>
                    </div>
                    {items.map(result => (
                      <button
                        key={result.id}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(result)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          {result.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{result.title}</p>
                          <p className="truncate text-xs text-gray-500">{result.subtitle}</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">No admin modules found.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderSearch;
