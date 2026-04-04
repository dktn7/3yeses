"use client";

import React, { useState } from 'react';
import { useAdminTheme } from './AdminThemeProvider';
import { X, Settings, Type, Eye, Palette, Monitor } from 'lucide-react';

export default function AdminThemeSettings() {
  const { 
    theme, setTheme, 
    textSize, setTextSize, 
    highContrast, setHighContrast,
    inverted, setInverted 
  } = useAdminTheme();
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[var(--admin-border)] text-[var(--admin-muted)] transition-colors"
        title="Theme & Accessibility"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-12 w-72 bg-[var(--admin-surface)] border border-admin-border shadow-xl rounded-lg p-4 z-50">
            <div className="flex justify-between items-center mb-4 border-b border-admin-border pb-2">
              <h3 className="font-semibold text-admin-text">Appearance</h3>
              <button onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>

            {/* Theme Selection */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--admin-muted)]">
                <Palette size={16} /> Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('default')}
                  className={`p-2 rounded border text-sm ${theme === 'default' ? 'border-admin-primary bg-admin-bg font-bold' : 'border-admin-border'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setTheme('blue-light')}
                  className={`p-2 rounded border text-sm ${theme === 'blue-light' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-admin-border'}`}
                >
                  Blue Mode
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--admin-muted)]">
                <Type size={16} /> Text Size
              </label>
              <div className="flex bg-admin-bg rounded-lg border border-admin-border p-1">
                {[1, 2, 3].map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size as 1 | 2 | 3)}
                    className={`flex-1 py-1 rounded text-sm ${textSize === size ? 'bg-[var(--admin-surface)] shadow text-[var(--admin-primary)] font-bold' : 'text-[var(--admin-muted)]'}`}
                  >
                    {size === 1 ? 'Aa' : size === 2 ? 'Aa+' : 'Aa++'}
                  </button>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div className="mb-2">
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-[var(--admin-muted)]">
                <Eye size={16} /> Accessibility
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-admin-bg rounded">
                  <span className="text-sm">High Contrast</span>
                  <input 
                    type="checkbox" 
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="accent-admin-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-admin-bg rounded">
                  <span className="text-sm">Invert Colors</span>
                  <input 
                    type="checkbox" 
                    checked={inverted}
                    onChange={(e) => setInverted(e.target.checked)}
                    className="accent-admin-primary"
                  />
                </label>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
