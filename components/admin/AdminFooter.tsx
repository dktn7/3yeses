'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, HelpCircle, Settings, BarChart3 } from 'lucide-react';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white/10 dark:bg-white/5 backdrop-blur-md border-t border-gray-200/20 dark:border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Admin Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 dark:text-red-500 mr-2" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">Admin Portal</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Comprehensive management system for your platform.
            </p>
          </div>

          {/* Quick Admin Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Management</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin/users" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  User Management
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/categories" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Content Categories
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/bookings" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Booking Oversight
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/reviews" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Review Moderation
                </Link>
              </li>
            </ul>
          </div>

          {/* Analytics & Reports */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Analytics</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin/analytics" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Platform Analytics
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/reports" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  System Reports
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  System Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Documentation */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin/help" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Admin Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Main Site
                </Link>
              </li>
              <li>
                <a 
                  href="/api/admin/system-status" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  System Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200/20 dark:border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} 3YesEs Admin Portal. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link 
                href="/admin/privacy" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Admin Privacy Policy
              </Link>
              <Link 
                href="/admin/security" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Security Guidelines
              </Link>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
