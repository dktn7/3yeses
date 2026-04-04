'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Upload, MessageSquare, Search, BarChart3, X } from 'lucide-react';
import { useLocale } from 'next-intl';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export default function QuickActionsBar() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();

  const actions: QuickAction[] = [
    {
      id: 'upload',
      label: 'Upload Media',
      icon: <Upload className="h-5 w-5" />,
      href: `/${locale}/dashboard/gallery`,
      color: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    },
    {
      id: 'search',
      label: 'Search Talents',
      icon: <Search className="h-5 w-5" />,
      href: `/${locale}/search`,
      color: 'bg-blue-500 hover:bg-blue-600 dark:bg-red-600 dark:hover:bg-red-700',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />,
      href: `/${locale}/dashboard/messages`,
      color: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: `/${locale}/dashboard/insights`,
      color: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Action Menu */}
      <div className="fixed bottom-24 right-8 z-50">
        <div
          className={`flex flex-col-reverse space-y-reverse space-y-3 mb-3 transition-all duration-300 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {actions.map((action, index) => (
            <Link
              key={action.id}
              href={action.href}
              className={`${action.color} text-white rounded-full px-4 py-3 shadow-lg flex items-center space-x-3 transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
              onClick={() => setIsOpen(false)}
            >
              {action.icon}
              <span className="font-medium whitespace-nowrap">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen
            ? 'bg-gray-800 dark:bg-gray-700 rotate-45'
            : 'bg-gradient-to-r from-blue-500 to-red-500 dark:from-red-500 dark:to-blue-500'
        }`}
        aria-label="Quick Actions"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Hover hint */}
      {!isOpen && (
        <div className="fixed bottom-8 right-24 z-40 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Quick Actions
        </div>
      )}
    </>
  );
}
