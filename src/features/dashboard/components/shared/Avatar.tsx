/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : Avatar.tsx
 * WHAT THIS FILE DOES : Renders circular profile/item images with dynamic fallback gradients
 * PRINCIPLE APPLIED   : SOLID (Single Responsibility)
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Briefcase, Truck, Landmark } from 'lucide-react';

interface AvatarProps {
  name: string;
  src?: string;
  type?: 'user' | 'project' | 'supplier' | 'escrow';
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  type = 'user',
  size = 'sm',
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if source changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = name
    ? name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '?';

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  };

  const themeClasses = {
    user: 'from-brand to-brand-dark text-white',
    project: 'from-blue-500 to-indigo-600 text-white',
    supplier: 'from-amber-500 to-orange-600 text-white',
    escrow: 'from-emerald-500 to-teal-600 text-white',
  };

  const renderFallbackIcon = () => {
    switch (type) {
      case 'project':
        return <Briefcase size={size === 'sm' ? 14 : 18} />;
      case 'supplier':
        return <Truck size={size === 'sm' ? 14 : 18} />;
      case 'escrow':
        return <Landmark size={size === 'sm' ? 14 : 18} />;
      default:
        return <span>{initials}</span>;
    }
  };

  return (
    <div className="flex shrink-0 items-center justify-center">
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-gray-100 quality-image`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br ${themeClasses[type]} flex items-center justify-center rounded-full font-bold shadow-sm`}
        >
          {renderFallbackIcon()}
        </div>
      )}
    </div>
  );
};

export default Avatar;
