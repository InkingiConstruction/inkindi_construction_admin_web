/**
 * ============================================================================
 * FILE NAME        : ActionsMenu.tsx
 * WHAT THIS FILE DOES : Exports portal-based action menus with animations and improved UX
 * PRINCIPLE APPLIED   : Single Responsibility, DRY, KISS
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Loader2 } from 'lucide-react';

interface ActionsMenuButtonProps {
  menuId: string;
  isOpen: boolean;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'outline' | 'ghost';
}

export const ActionsMenuButton: React.FC<ActionsMenuButtonProps> = ({
  menuId,
  isOpen,
  onToggle,
  size = 'md',
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-white border-gray-200 shadow-sm hover:bg-gray-50',
    outline: 'border-gray-300 hover:bg-gray-50',
    ghost: 'border-transparent hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'p-2',
  };

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={`actions-menu-${menuId}`}
      onClick={onToggle}
      className={`inline-flex items-center justify-center gap-1 rounded-lg border transition-all duration-200 ${variants[variant]} ${sizes[size]} ${
        isOpen ? 'ring-2 ring-brand-500 ring-offset-2' : ''
      }`}
    >
      <MoreHorizontal size={size === 'sm' ? 14 : 18} />
      {size === 'sm' && <span className="text-xs font-medium">Actions</span>}
    </button>
  );
};

interface ActionsMenuPanelProps {
  menuId: string;
  isOpen: boolean;
  position: { top: number; left: number };
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
  variant?: 'anchored' | 'centered';
}

export const ActionsMenuPanel: React.FC<ActionsMenuPanelProps> = ({
  menuId,
  isOpen,
  position,
  onClose,
  children,
  widthClass = 'w-56',
  variant = 'anchored',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`[data-menu-id="${menuId}"]`)) {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClickOutside);
    
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onClickOutside);
    };
  }, [isOpen, onClose, menuId]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-menu-id={menuId}
      className={
        variant === 'centered'
          ? `fixed left-1/2 top-1/2 z-[101] max-h-[min(70vh,420px)] w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200`
          : `fixed z-[101] max-h-[min(70vh,420px)] overflow-y-auto ${widthClass} rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200`
      }
      style={
        variant === 'centered'
          ? undefined
          : { top: `${position.top}px`, left: `${position.left}px` }
      }
    >
      {children}
    </div>,
    document.body
  );
};

interface ActionMenuItemProps {
  busy: boolean;
  onClick: () => void;
  label: React.ReactNode;
  className: string;
  icon?: React.ReactNode;
  description?: string;
}

export const ActionMenuItem: React.FC<ActionMenuItemProps> = ({
  busy,
  onClick,
  label,
  className,
  icon,
  description,
}) => (
  <button
    type="button"
    disabled={busy}
    onClick={onClick}
    className={`group mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 last:mb-0 disabled:opacity-50 hover:scale-[1.02] ${className}`}
  >
    <div className="flex items-center gap-2">
      {icon && <span className="shrink-0">{icon}</span>}
      <div>
        <div>{label}</div>
        {description && (
          <div className="text-xs opacity-75 group-hover:opacity-100">{description}</div>
        )}
      </div>
    </div>
    {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
  </button>
);