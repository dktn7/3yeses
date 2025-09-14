import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import AuthService from '@/lib/auth/auth-service';
import { AuthenticatedUser } from '@/types';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminFooter from '@/components/admin/AdminFooter';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  let user: AuthenticatedUser | null = null;

  if (token) {
    try {
      const decoded = AuthService.verifyJWT(token);
      if (decoded && typeof decoded !== 'string') {
        user = {
          userId: decoded.userId,
          role: decoded.role,
          name: decoded.name,
        };
      }
    } catch (error) {
      // Invalid token, treat as not logged in
      console.error('Admin layout token verification failed:', error);
    }
  }

  // Protect the route
  if (!user || user.role !== 'ADMIN') {
    redirect('/'); // Redirect non-admins to the homepage
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md border-b border-gray-200 dark:border-white/20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left Side - Back to Main Site */}
              <Link 
                href="/"
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Main Site</span>
              </Link>

              {/* Center - Admin Portal Title */}
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 dark:text-red-500 mr-3" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
              </div>

              {/* Right Side - User Info */}
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="text-sm">Welcome, {user.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}
