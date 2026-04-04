'use client';

import { usePathname } from 'next/navigation';
import AuthTopRight from '@/components/AuthTopRight';
import { ModeToggle } from '@/components/ThemeToggle';
import Tooltip from '@/components/Tooltip';
import DynamicHeader from '@/components/DynamicHeader';

export default function GlobalHeader() {
  const pathname = usePathname();
  
  // Hide the global header for admin routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth/admin-login') || pathname?.startsWith('/admin-login')) {
    return null;
  }

  return (
    <header className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0 h-16 z-50">
      <div className="flex items-center gap-4">
        <DynamicHeader />
        <Tooltip text="Toggle theme">
          <ModeToggle />
        </Tooltip>
      </div>
      <AuthTopRight />
    </header>
  );
}
