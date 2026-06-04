/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AuthLayout.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, backend data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * File: AuthLayout.tsx
 * What it is doing: Provides a consistent, premium visual wrapper for all authentication pages.
 * Responsibility: Rendering a high-quality background image with a sophisticated overlay and centering the auth content.
 * Outcomes: Enhanced brand identity, premium user experience, and visual consistency across login, register, and reset flows.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    // Add more vertical padding with py-8 or py-12
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#f3f4f6] px-4 py-12 md:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,126,110,0.08),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex w-full max-w-7xl justify-center"
      >
        {children}
      </motion.div>          
    </div>
  );
};

export default AuthLayout;