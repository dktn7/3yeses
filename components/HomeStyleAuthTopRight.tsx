"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, ChevronDown, Star, Settings, LogOut, Crown } from 'lucide-react';
import Link from 'next/link';

export default function HomeStyleAuthTopRight() {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors relative border border-gray-200 shadow"
          >
            <Bell className="h-5 w-5 text-gray-800 dark:text-white" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent-red rounded-full flex items-center justify-center text-xs text-white">3</span>
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-[100] max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              </div>
              <div className="p-2">
                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent-red rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">New project match found</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-blue rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">Application status updated</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">Profile view from client</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Profile Dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-2 rounded-full bg-white hover:bg-gray-100 transition-colors border border-gray-200 shadow"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-blue to-accent-blue rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                {user.role === 'talent' && <Crown className="h-3 w-3 mr-1" />}
                {user.role}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-800 dark:text-white" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-[100]">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-accent-blue rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <Link href="/dashboard/talent" className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">View Profile</span>
                </Link>
                <Link href="/dashboard/talent" className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <Star className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">Dashboard</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">Settings</span>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg w-full text-left">
                    <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  // Not logged in
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="px-4 py-2 text-sm font-semibold rounded-md border bg-white text-primary-blue border-primary-blue hover:bg-primary-blue/5 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-white dark:text-primary-red dark:border-primary-red dark:hover:bg-primary-red/10 dark:focus:ring-primary-red transition-colors shadow-sm"
      >
        Log In
      </Link>
      <Link
        href="/auth/signup"
        className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-primary-blue hover:bg-primary-blue/90 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-primary-red dark:hover:bg-primary-red/90 dark:focus:ring-primary-red transition-colors shadow-sm"
      >
        Sign Up
      </Link>
    </div>
  );
}
