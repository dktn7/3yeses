import { useState, useCallback } from 'react';

interface UseAuthRequiredOptions {
  title?: string;
  message?: string;
  action?: string;
}

interface UseAuthRequiredReturn {
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

/**
 * Hook for managing auth-required modal state.
 * Use when you need to prompt users to sign in/sign up before an action.
 *
 * @example
 * const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired({
 *   title: 'Sign in to comment',
 *   message: 'You need an account to comment on profiles.',
 *   action: 'comment on profiles'
 * });
 *
 * // In your component:
 * // <AuthRequiredModal
 * //   isOpen={showAuthModal}
 * //   onClose={closeAuthModal}
 * //   title={title}
 * //   message={message}
 * // />
 *
 * // When user tries to comment without auth:
 * // if (!isAuthenticated) return openAuthModal();
 */
export function useAuthRequired(options?: UseAuthRequiredOptions): UseAuthRequiredReturn {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  return {
    showAuthModal,
    openAuthModal,
    closeAuthModal
  };
}
