import React, { Suspense } from 'react';
import SignupStep1Form from './SignupStep1Form';

type SignupStep1PageProps = {
  searchParams: {
    role?: string;
  };
};

// This is now a Server Component. It fetches data on the server and passes it to the client component.
export default function SignupStep1Page({ searchParams }: SignupStep1PageProps) {
  // Determine the initial role from the search parameter on the server.
  // Default to 'talent' if the parameter is missing or not 'client'.
  const initialRole = searchParams?.role === 'client' ? 'client' : 'talent';

  return (
    // Suspense is good practice for wrapping client components that might have their own data fetching or heavy logic.
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <SignupStep1Form initialRole={initialRole} />
    </Suspense>
  );
}
