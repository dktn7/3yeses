"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type AdminTheme = 'light' | 'dark' | 'default' | 'blue-light';
type TextSize = 1 | 2 | 3;

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  inverted: boolean;
  setInverted: (v: boolean) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>('light');
  const [textSize, setTextSize] = useState<TextSize>(1);
  const [highContrast, setHighContrast] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('admin_theme_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed.theme || 'light');
        setTextSize(parsed.textSize || 1);
        setHighContrast(parsed.highContrast || false);
        setInverted(parsed.inverted || false);
      } catch (e) {
        console.error("Failed to parse admin theme prefs", e);
      }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('admin_theme_prefs', JSON.stringify({
        theme,
        textSize,
        highContrast,
        inverted,
      }));
    }
  }, [theme, textSize, highContrast, inverted, mounted]);

  // Apply CSS variables based on theme
  useEffect(() => {
    const root = document.documentElement;

    // Apply font size scaling
    if (textSize === 2) {
      root.style.fontSize = '105%';
    } else if (textSize === 3) {
      root.style.fontSize = '110%';
    } else {
      root.style.fontSize = '100%';
    }
    
    // We no longer toggle dark mode class here because next-themes handles it globally.
    // The theme state here is kept for backward compatibility if needed by other admin components.

  }, [theme, textSize]);

  // Apply accessibility filters
  useEffect(() => {
    const root = document.documentElement;
    const filters: string[] = [];
    if (highContrast) filters.push('contrast(1.4)');
    if (inverted) filters.push('invert(1) hue-rotate(180deg)');
    root.style.filter = filters.length > 0 ? filters.join(' ') : '';
    return () => { root.style.filter = ''; };
  }, [highContrast, inverted]);

  if (!mounted) return <>{children}</>;

  return (
    <AdminThemeContext.Provider value={{
      theme, setTheme,
      textSize, setTextSize,
      highContrast, setHighContrast,
      inverted, setInverted,
    }}>
      <div 
        className="admin-root min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] font-sans transition-colors duration-200"
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
