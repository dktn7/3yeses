"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAdminTheme } from './AdminThemeProvider';

export function AdminThemeToggle() {
  const { theme, setTheme } = useAdminTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-bg)] rounded-full transition-colors relative"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
