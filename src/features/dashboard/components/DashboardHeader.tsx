/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : DashboardHeader.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import { Menu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import HeaderSearch from './header/HeaderSearch';
import HeaderChat from './header/HeaderChat';
import HeaderNotifications from './header/HeaderNotifications';
import HeaderUserMenu from './header/HeaderUserMenu';

interface DashboardHeaderProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  
  return (
    <header
      className="h-16 flex items-center gap-4 px-5 md:px-7 shrink-0 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 min-w-0">
        <HeaderSearch />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Admin badge */}
        {user?.role === 'ADMIN' && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mr-2"
            style={{ color: '#007E6E', borderColor: '#b3d9d4', backgroundColor: '#e6f5f3' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#007E6E' }} />
            Admin
          </span>
        )}
        <HeaderChat />
        <HeaderNotifications />
        <div className="w-px h-5 bg-gray-200 mx-2" />
        <HeaderUserMenu />
      </div>
    </header>
  );
};

export default DashboardHeader;