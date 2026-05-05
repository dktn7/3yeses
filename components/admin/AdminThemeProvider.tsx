"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type AdminTheme = 'light' | 'dark' | 'default' | 'blue-light';
type TextSize = 1 | 2 | 3;

interface AdminThemeContextType {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  inverted: boolean;
  setInverted: (v: boolean) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>('light');
  const [textSize, setTextSizeState] = useState<TextSize>(1);
  const [fontSize, setFontSizeState] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
    if (size === 1) setFontSizeState(16);
    if (size === 2) setFontSizeState(18);
    if (size === 3) setFontSizeState(20);
  }, []);

  const setFontSize = useCallback((size: number) => {
    const clamped = Math.max(12, Math.min(24, Math.round(size)));
    setFontSizeState(clamped);
    if (clamped >= 20) {
      setTextSizeState(3);
    } else if (clamped >= 17) {
      setTextSizeState(2);
    } else {
      setTextSizeState(1);
    }
  }, []);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('admin_theme_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme(parsed.theme || 'light');
        const parsedTextSize = parsed.textSize || 1;
        const parsedFontSize = typeof parsed.fontSize === 'number'
          ? parsed.fontSize
          : (parsedTextSize === 3 ? 20 : parsedTextSize === 2 ? 18 : 16);
        setTextSizeState(parsedTextSize);
        setFontSize(parsedFontSize);
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
  }, [setFontSize]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('admin_theme_prefs', JSON.stringify({
        theme,
        textSize,
        fontSize,
        highContrast,
        inverted,
      }));
    }
  }, [theme, textSize, fontSize, highContrast, inverted, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const previousFontSize = root.style.fontSize;
    root.style.fontSize = `${fontSize}px`;
    return () => {
      root.style.fontSize = previousFontSize;
    };
  }, [fontSize, mounted]);

  return (
    <AdminThemeContext.Provider value={{
      theme, setTheme,
      textSize, setTextSize,
      fontSize, setFontSize,
      highContrast, setHighContrast,
      inverted, setInverted,
    }}>
      <div 
        className={`admin-root min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] font-sans transition-colors duration-200 ${highContrast ? 'admin-high-contrast' : ''} ${inverted ? 'admin-inverted' : ''}`}
        style={{ fontSize: `${fontSize}px` }}
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
