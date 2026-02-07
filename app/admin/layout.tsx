import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminFooter from '@/components/admin/AdminFooter';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Admin Panel - 3Yeses',
  description: 'Administrative dashboard for managing the 3Yeses platform',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      {/* Admin Security Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-900 text-white py-2 px-4 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Secure Admin Area - All actions are logged and monitored</span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-2.5rem)]">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <AdminSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
