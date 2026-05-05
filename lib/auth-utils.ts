/**
 * Hook-based auth requirement utility
 * 
 * Simple hook that makes it easy to add auth checks to any action.
 * 
 * @example
 * 
 * const MyComponent = () => {
 *   const { requireAuth } = useRequireAuth({
 *     title: 'Sign in to like',
 *     message: 'You need an account to like this.'
 *   });
 *   
 *   const handleLike = async () => {
 *     if (!requireAuth()) return; // Shows modal if needed, returns false if no auth
 *     // User is authenticated, proceed with action
 *     await likeItem();
 *   };
 *   
 *   return <button onClick={handleLike}>Like</button>;
 * };
 */

import { useAuth } from '@/contexts/AuthContext';
import { useAuthRequired } from '@/hooks/useAuthRequired';

export interface UseRequireAuthOptions {
  title?: string;
  message?: string;
  action?: string;
}

/**
 * Hook for protecting actions that require authentication
 * Returns a requireAuth function that returns true if user is authenticated,
 * false if not (will open auth modal)
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthRequired();

  const requireAuth = (): boolean => {
    if (!user) {
      openAuthModal();
      return false;
    }
    return true;
  };

  return { 
    requireAuth,
    isAuthenticated: !!user,
    user 
  };
}
