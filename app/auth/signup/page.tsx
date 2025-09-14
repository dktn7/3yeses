'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1 of the signup process
    router.replace('/auth/signup/step-1');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to signup...</p>
      </div>
    </div>
  );
}