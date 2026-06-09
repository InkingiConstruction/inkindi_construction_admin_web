/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SectionHeader.tsx
 * WHAT THIS FILE DOES : Renders administrative page section headers with title, icon, and capabilities list
 * PRINCIPLE APPLIED   : Single Responsibility
 * ============================================================================
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  capabilities: string[];
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  capabilities,
}) => (
  <div className="space-y-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {capabilities.slice(0, 6).map(item => (
        <div
          key={item}
          className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-600"
        >
          <CheckCircle className="mt-0.5 shrink-0 text-brand" size={14} />
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default SectionHeader;
