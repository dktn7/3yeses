'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Settings, 
  HelpCircle, 
  LogOut, 
  Edit3,
  Palette
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'TALENT' | 'CLIENT' | 'ADMIN';
  avatarUrl?: string;
}

interface ProfileDropdownProps {
  user: UserData | null;
  onLogout: () => void;
}

export default function ProfileDropdown({ user, onLogout }: Readonly<ProfileDropdownProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  if (!user) return null;

  const menuItems = [
    {
      icon: Edit3,
      label: 'Edit Profile',
      href: user.role === 'TALENT' ? '/dashboard/talent/profile' : '/dashboard/client/profile',
      separator: false,
    },
    {
      icon: Settings,
      label: 'Settings & Privacy',
      href: user.role === 'TALENT' ? '/dashboard/talent/settings' : '/dashboard/client/settings',
      separator: false,
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/help',
      separator: false,
    },
    {
      icon: Palette,
      label: 'Display & Accessibility',
      href: '/settings/display',
      separator: true,
    },
    {
      icon: LogOut,
      label: 'Logout',
      href: null,
      action: handleLogout,
      separator: false,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="relative">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={item.action || (() => item.href && handleNavigation(item.href))}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 text-sm"
                >
                  <item.icon size={16} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{item.label}</span>
                  <span className="ml-auto text-gray-400">
                    {item.label !== 'Logout' && '›'}
                  </span>
                </button>
                {item.separator && (
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
