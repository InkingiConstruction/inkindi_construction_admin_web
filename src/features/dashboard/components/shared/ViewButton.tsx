/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : ViewButton.tsx
 * WHAT THIS FILE DOES : Renders a standardized action button for launching item details
 * PRINCIPLE APPLIED   : Single Responsibility
 * ============================================================================
 */

import React from 'react';
import { Eye } from 'lucide-react';

interface ViewButtonProps {
  label?: string;
  onClick: () => void;
}

export const ViewButton: React.FC<ViewButtonProps> = ({
  label = 'View',
  onClick,
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50"
  >
    <Eye size={13} />
    {label}
  </button>
);

export default ViewButton;
