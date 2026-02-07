'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Auth Content - No need for duplicate header, using root layout's header */}
      <div className="flex items-center justify-center py-8 px-4">
        <div className="max-w-2xl w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
