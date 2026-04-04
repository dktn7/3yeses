'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  LogOut, 
  User,
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  Activity
} from 'lucide-react';

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
}

export default function AdminProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data?.user?.name) {
            setAdmin({
              id: data.user.id || 'admin',
              name: data.user.name,
              email: data.user.email || 'admin@3yeses.online',
              role: 'ADMIN'
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
      }
      // Always fall back to a default so the dropdown renders
      setAdmin({
        id: 'admin',
        name: 'System Admin',
        email: 'admin@3yeses.online',
        role: 'ADMIN'
      });
    };
    fetchAdminInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.push('/auth/admin-login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!admin) {
    // Show a placeholder shimmer while loading — never hide the slot
    return (
      <div className="flex items-center gap-3 p-2">
        <div className="w-8 h-8 bg-[var(--admin-border)] rounded-md animate-pulse" />
        <div className="hidden md:block space-y-1">
          <div className="w-20 h-3 bg-[var(--admin-border)] rounded animate-pulse" />
          <div className="w-14 h-2 bg-[var(--admin-border)] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const adminMenuItems = [
    {
      icon: LayoutDashboard,
      label: 'Control Center',
      href: '/admin',
    },
    {
      icon: Users,
      label: 'User Directory',
      href: '/admin/users',
    },
    {
      icon: FileText,
      label: 'Audit Reports',
      href: '/admin/reports',
    },
    {
      icon: Activity,
      label: 'System Health',
      href: '/api/admin/system-status',
      external: true,
    },
    {
      icon: Settings,
      label: 'Platform Settings',
      href: '/admin/settings',
      separator: true,
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--admin-bg)] transition-all border border-transparent hover:border-[var(--admin-border)] focus:outline-none"
      >
        <div className="w-8 h-8 bg-[var(--admin-primary)] rounded-md flex items-center justify-center shadow-sm">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-[var(--admin-text)]">{admin.name}</p>
          <p className="text-xs text-[var(--admin-muted)]">Administrator</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl overflow-hidden z-[100]">
          <div className="p-4 bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
            <p className="text-sm font-bold text-[var(--admin-text)]">{admin.name}</p>
            <p className="text-xs text-[var(--admin-muted)] truncate">{admin.email}</p>
          </div>
          <div className="p-2">
            {adminMenuItems.map((item, idx) => (
              <div key={item.label}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (item.action) item.action();
                    else if (item.href) {
                      if (item.external) window.open(item.href, '_blank');
                      else router.push(item.href);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] hover:text-[var(--admin-text)]'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
                {item.separator && <div className="my-2 border-t border-[var(--admin-border)]" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
