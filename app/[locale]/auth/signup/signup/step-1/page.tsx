// @ts-nocheck
import React, { Suspense } from 'react';
import SignupStep1Form from './SignupStep1Form';
import LoadingSpinner from '@/components/LoadingSpinner';

// This is now a Server Component. It fetches data on the server and passes it to the client component.
export default function SignupStep1Page(props: any) {
  // Only allow 'talent' role for signup
  const initialRole = 'talent';

  return (
    // Suspense is good practice for wrapping client components that might have their own data fetching or heavy logic.
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><LoadingSpinner /></div>}>
      <SignupStep1Form initialRole={initialRole} />
    </Suspense>
  );
}
