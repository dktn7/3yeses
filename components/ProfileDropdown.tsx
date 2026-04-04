'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Settings, 
  HelpCircle, 
  LogOut, 
  Edit3,
  User,
  BarChart3,
  Upload,
  Activity,
  LayoutDashboard,
  Users,
  FileText
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'TALENT' | 'ADMIN';
  avatarUrl?: string;
}

interface MenuItem {
  icon: typeof Settings;
  label: string;
  href: string | null;
  separator: boolean;
  action?: () => void;
}

interface ProfileDropdownProps {
  user: UserData | null;
  onLogout: () => void;
}

export default function ProfileDropdown({ user, onLogout }: Readonly<ProfileDropdownProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  // Supported locale files in `messages/` (map lowercase -> canonical)
  const supportedLocalesMap: Record<string, string> = {
    'ar': 'ar',
    'de-de': 'de-DE',
    'en-gb': 'en-gb',
    'en': 'en',
    'es-es': 'es-ES',
    'fr-fr': 'fr-FR',
    'it-it': 'it-IT',
    'ja-jp': 'ja-JP',
    'pt-pt': 'pt-PT',
    'ru-ru': 'ru-RU',
    'zh-cn': 'zh-CN'
  };

  const first = pathname?.split('/')[1];
  const firstKey = first ? first.toLowerCase() : undefined;
  const locale = firstKey && supportedLocalesMap[firstKey] ? supportedLocalesMap[firstKey] : 'en-gb';

  // Fetch profile completion
  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const response = await fetch('/api/user/profile-completion');
        if (response.ok) {
          const data = await response.json();
          setProfileCompletion(data.percentage);
          setMissingFields(data.missingFields || []);
        }
      } catch (error) {
        console.error('Error fetching profile completion:', error);
      }
    };
    fetchCompletion();
  }, []);

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

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      onLogout();
      router.push(`/${locale}`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  // Base menu for regular talent users
  const talentBaseMenuItems: MenuItem[] = [
    {
      icon: User,
      label: 'Dashboard',
      href: `/dashboard`,
      separator: false,
    },
    {
      icon: Edit3,
      label: 'Profile',
      href: `/talent/${user.id}`,
      separator: false,
    },
    {
      icon: Upload,
      label: 'Gallery',
      href: `/dashboard/gallery`,
      separator: false,
    },
    {
      icon: BarChart3,
      label: 'Insights',
      href: `/dashboard/analytics`,
      separator: false,
    },
    {
      icon: Activity,
      label: 'Activity',
      href: `/dashboard/activity`,
      separator: true,
    },
    {
      icon: Settings,
      label: 'Settings',
      href: `/dashboard/settings`,
      separator: false,
    },
  ];

  // For admins, hide normal talent dashboard/profile options and only keep shared items
  const sharedMenuItems: MenuItem[] = [
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: `/${locale}/support`,
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

  const baseMenuItems: MenuItem[] = user.role === 'ADMIN'
    ? sharedMenuItems
    : [...talentBaseMenuItems, ...sharedMenuItems];


  const adminMenuItems: MenuItem[] = user.role === 'ADMIN'
    ? [
        {
          icon: LayoutDashboard,
          label: 'Admin Control Center',
          href: `/admin`,
          separator: false,
        },
        {
          icon: Users,
          label: 'Admin Users',
          href: `/admin/users`,
          separator: false,
        },
        {
          icon: FileText,
          label: 'Admin Reports',
          href: `/admin/reports`,
          separator: true,
        },
      ]
    : [];

  const menuItems: MenuItem[] = [...adminMenuItems, ...baseMenuItems];

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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-500 dark:from-red-500 dark:to-blue-500 rounded-full flex items-center justify-center">
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
                {/* Circular Progress Ring */}
                {profileCompletion !== null && profileCompletion < 100 && (
                  <svg className="absolute -inset-1 w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - profileCompletion / 100)}`}
                      className="text-blue-600 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 dark:from-red-500 dark:to-blue-500 rounded-full flex items-center justify-center">
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {user.role === 'ADMIN' ? 'Admin' : 'Talent'}
                  </span>
                  {profileCompletion !== null && profileCompletion < 100 && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {profileCompletion}% complete
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Completion Banner */}
            {profileCompletion !== null && profileCompletion < 100 && missingFields.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Complete your profile
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  {missingFields.length === 1 ? (
                    missingFields[0]
                  ) : missingFields.length === 2 ? (
                    `${missingFields[0]}, ${missingFields[1]}`
                  ) : (
                    <>
                      {missingFields.slice(0, 2).join(', ')}
                      {missingFields.length > 2 && (
                        <span className="block mt-0.5 text-blue-600 dark:text-blue-400 font-medium">
                          +{missingFields.length - 2} more item{missingFields.length - 2 > 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  )}
                </p>
                <button
                  onClick={() => handleNavigation('/dashboard/profile')}
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Complete now →
                </button>
              </div>
            )}
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
