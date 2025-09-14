"use client";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ProfileSection from './ProfileSection';

export default function AuthTopRight() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <ProfileSection user={user} />;
  }
  return (
    <div className="flex gap-2">
      <Link
        href="/auth/login"
        className="text-sm font-medium px-4 py-2 rounded-md border bg-white text-primary-blue border-primary-blue hover:bg-primary-blue/10 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-primary-red dark:text-white dark:border-primary-red dark:hover:bg-primary-red/90 dark:focus:ring-primary-red transition-colors"
      >
        Log In
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm font-medium px-4 py-2 rounded-md text-white bg-primary-blue hover:bg-primary-blue/90 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-primary-red dark:hover:bg-primary-red/90 dark:focus:ring-primary-red transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
