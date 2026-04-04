'use server';

import { cookies } from 'next/headers';

/**
 * Server action to check if the accessToken cookie exists.
 * Used for debugging authentication state.
 */
export async function checkAccessToken() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has('accessToken');
  return {
    hasToken,
    cookieCount: cookieStore.getAll().length,
  };
}
