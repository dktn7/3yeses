'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'info' | 'danger' | 'warning' | 'success';
  children: ReactNode;
  footer?: ReactNode;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'info',
  children,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    info: {
      border: 'border-[var(--admin-border)]',
      accent: 'text-[var(--admin-text)]',
      glow: 'shadow-lg',
    },
    danger: {
      border: 'border-red-500/30',
      accent: 'text-red-600',
      glow: 'shadow-lg shadow-red-500/10',
    },
    warning: {
      border: 'border-yellow-500/30',
      accent: 'text-yellow-600',
      glow: 'shadow-lg shadow-yellow-500/10',
    },
    success: {
      border: 'border-green-500/30',
      accent: 'text-green-600',
      glow: 'shadow-lg shadow-green-500/10',
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-lg admin-glass border ${currentStyle.border} ${currentStyle.glow} rounded-xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 animate-in fade-in zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-sm">
          <div>
            <h3 className={`text-xl font-bold ${currentStyle.accent}`}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-[var(--admin-muted)] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--admin-bg)] rounded-md transition-colors text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-sm flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
