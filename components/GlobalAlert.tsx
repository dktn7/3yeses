'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
}

export default function GlobalAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const pathname = usePathname();

  // Don't show alerts on admin pages or login
  const isHiddenPage =
    pathname?.startsWith('/admin') ||
    pathname === '/login' ||
    pathname?.startsWith('/auth/admin-login');

  useEffect(() => {
    if (isHiddenPage) return;

    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/communications/alerts');
        if (response.ok) {
          const data = await response.json();
          setAlerts(data);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };

    fetchAlerts();
  }, [isHiddenPage]);

  if (isHiddenPage || alerts.length === 0) return null;

  return (
    <div className="w-full z-50">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`
            w-full px-4 py-3 flex items-center justify-center text-sm font-medium
            ${alert.type === 'INFO' ? 'bg-blue-600 text-white' : ''}
            ${alert.type === 'WARNING' ? 'bg-yellow-500 text-black' : ''}
            ${alert.type === 'CRITICAL' ? 'bg-red-600 text-white' : ''}
          `}
        >
          <span className="mr-2 font-bold uppercase tracking-wider text-xs border border-current px-1 rounded">
            {alert.type}
          </span>
          <span className="font-bold mr-2">{alert.title}:</span>
          <span>{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
