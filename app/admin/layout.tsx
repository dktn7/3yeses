'use client';

import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminFooter from '@/components/admin/AdminFooter';
import AdminProfileDropdown from '@/components/admin/AdminProfileDropdown';
import AdminNotificationsPanel from '@/components/admin/AdminNotificationsPanel';
import { Bell, Menu } from 'lucide-react';
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';
import { AdminModeToggle } from '@/components/admin/AdminModeToggle';
import AdminProvider from '@/components/admin/AdminProvider';
import { QueryProvider } from '@/components/QueryProvider';

const BADGE_POLL_INTERVAL = 60_000; // 60 seconds

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications?countOnly=true');
      const data = await res.json();
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silently ignore — badge is non-critical
    }
  }, []);

  // Fetch count on mount + poll every 60s
  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, BADGE_POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUnreadCount]);

  // Callback for panel to update count (e.g., after Clear All)
  const handleCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  return (
    <QueryProvider>
      <AdminProvider>
        <AdminThemeProvider>
          <div className="min-h-screen flex flex-col md:flex-row bg-[var(--admin-bg)] transition-colors duration-200">
              
              {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 admin-glass sticky top-0 z-50">
                <div className="font-bold text-lg admin-gradient-text tracking-widest">3YESES</div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[var(--admin-text)]">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen overflow-y-hidden
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <AdminSidebar />
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                
                {/* Top Navigation Bar */}
                <header className="h-14 admin-glass flex items-center justify-end px-6 z-10 shrink-0 sticky top-0">

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <AdminModeToggle />
                        
                        <button 
                            onClick={() => setIsNotificationsOpen(true)}
                            className="p-2 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-bg)] rounded-full transition-colors relative"
                        >
                            <Bell className="h-5 w-5" />
                            {/* Dynamic Notification Badge */}
                            {unreadCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[var(--admin-surface)] leading-none">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                        </button>
                        
                        <div className="h-8 w-px bg-[var(--admin-border)]" />
                        
                        <AdminProfileDropdown />
                    </div>
                </header>

                <AdminNotificationsPanel 
                    isOpen={isNotificationsOpen} 
                    onClose={() => setIsNotificationsOpen(false)}
                    onCountChange={handleCountChange}
                />

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--admin-bg)]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                    <div className="mt-8">
                        <AdminFooter />
                    </div>
                </main>
            </div>
          </div>
        </AdminThemeProvider>
      </AdminProvider>
    </QueryProvider>
    );
  }
