'use client';

import React, { useState } from 'react';

interface StickyPanelProps {
  title?: string;
  children?: React.ReactNode;
}

export default function StickyPanel({ title = 'Quick Panel', children }: StickyPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className="hidden lg:block absolute right-6 top-28 w-80 z-20">
      <div className={`hub-card rounded-2xl border border-blue-100/80 dark:border-gray-700/60 bg-light-surface dark:bg-dark-surface shadow-lg overflow-hidden transition-transform ${collapsed ? 'translate-x-6 opacity-80' : 'translate-x-0'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/80 dark:border-gray-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-red-100">{title}</h4>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            className="p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={collapsed ? 'Open panel' : 'Collapse panel'}
          >
            {collapsed ? '▸' : '▾'}
          </button>
        </div>
        <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
          {children ?? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Quick actions and contextual info appear here.</p>
              <div className="flex flex-col gap-2">
                <button className="px-3 py-2 rounded-lg bg-primary-blue text-white text-sm">Subscribe</button>
                <button className="px-3 py-2 rounded-lg bg-light-surface dark:bg-dark-surface border border-blue-200 dark:border-gray-700 text-sm">Save filter</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
