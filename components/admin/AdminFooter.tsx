'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, HelpCircle, Settings, BarChart3, Lock, FileText, Activity, Key } from 'lucide-react';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--admin-surface)]/55 backdrop-blur-sm border-t border-[var(--admin-border)]">
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 text-[var(--admin-primary)] mr-2" />
              <span className="text-base font-black tracking-[0.18em] text-[var(--admin-text)]">3YESES</span>
            </div>
            <p className="text-sm text-[var(--admin-muted)] leading-relaxed max-w-sm">
              Admin portal for the 3YESES talent marketplace. Manage users, content, subscriptions, and platform operations.
            </p>
            <div className="flex items-center mt-3 gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs font-semibold text-[var(--admin-muted)]">System Online &middot; v2.5.0</span>
            </div>
          </div>

          {/* Management Links */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)] mb-3">Management</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/users" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150">
                  User Management
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/admin/cms" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Content (CMS)
                </Link>
              </li>
              <li>
                <Link href="/admin/financials" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150">
                  Financials
                </Link>
              </li>
            </ul>
          </div>

          {/* Analytics & System */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)] mb-3">Analytics & System</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/analytics" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  Platform Analytics
                </Link>
              </li>
              <li>
                <Link href="/admin/system" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  System Health
                </Link>
              </li>
              <li>
                <Link href="/admin/api-keys" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <Key className="h-3.5 w-3.5 mr-1.5" />
                  API Keys
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policies */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)] mb-3">Support & Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/support" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                  Support Centre
                </Link>
              </li>
              <li>
                <Link href="/admin/privacy" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/admin/security" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Security Guidelines
                </Link>
              </li>
              <li>
                <Link href="/en-gb" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors duration-150 flex items-center">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Main Site
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--admin-border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-[var(--admin-muted)]">
              &copy; {currentYear} <span className="font-bold">3YESES</span> Admin Portal. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link
                href="/admin/privacy"
                className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors font-medium"
              >
                Admin Privacy Policy
              </Link>
              <Link
                href="/admin/security"
                className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors font-medium"
              >
                Security Guidelines
              </Link>
              <Link
                href="/admin/audit"
                className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-primary)] transition-colors font-medium"
              >
                Audit Log
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
