'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, BarChart, Settings, Briefcase, MessageSquare, Star, FileText } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: BarChart, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/categories', icon: Briefcase, label: 'Categories' },
  { href: '/admin/bookings', icon: FileText, label: 'Bookings' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/site-settings', icon: Settings, label: 'Site Settings' },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <Link href="/admin" className="flex items-center text-2xl font-bold text-gray-800 dark:text-white">
          <Shield className="mr-2 text-indigo-500" />
          Admin Panel
        </Link>
      </div>
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center px-6 py-4 text-lg font-medium transition-colors duration-200
              ${
                pathname === item.href
                  ? 'text-white bg-indigo-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <item.icon className="w-6 h-6 mr-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
