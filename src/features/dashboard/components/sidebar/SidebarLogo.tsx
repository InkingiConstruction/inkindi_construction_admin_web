/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SidebarLogo.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface SidebarLogoProps {
  isCollapsed: boolean;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ isCollapsed }) => {
  const navigate = useNavigate();
  return (
    <div className="p-5 mb-2 flex items-center border-b border-gray-100">
      {isCollapsed ? (        
          <div
            className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
             <img src="./logo.svg" alt="InkingiPro logo" className="flex-1" />
          </div>        
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-all group">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                  <img src="./logo.svg" alt="InkingiPro logo" className="flex-1" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-base font-bold" style={{ color: '#007E6E' }}>InkingiPro</span>
                  <span className="text-[9px] font-medium text-gray-400 tracking-wider uppercase">Admin Portal</span>
                </div>
              </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default SidebarLogo;