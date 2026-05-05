'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useRequireAuth } from '@/lib/auth-utils';
import AuthRequiredModal from './AuthRequiredModal';

/**
 * EXAMPLE: How to use the reusable auth modal system
 * This component demonstrates the simplest way to add auth protection
 * to any guest-only feature using the useRequireAuth utility hook.
 * 
 * For more examples, see @/lib/AUTH_MODAL_INTEGRATION.md
 */

interface ExampleAuthProtectedFeatureProps {
  itemId: string;
  itemName?: string;
}

export default function ExampleAuthProtectedFeature({ 
  itemId, 
  itemName = 'item' 
}: ExampleAuthProtectedFeatureProps) {
  
  // Use the utility hook for simplified auth management
  const { requireAuth, isAuthenticated } = useRequireAuth({
    title: 'Sign in to favorite',
    message: `You need an account to favorite ${itemName}s on 3YESES.`,
    action: 'favorite items'
  });

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    // Check auth - shows modal if needed, returns false if not authenticated
    if (!requireAuth()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/item/${itemId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ favorited: !isFavorited }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Failed to favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavorite}
      disabled={isLoading}
      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={20}
        fill={isFavorited ? 'currentColor' : 'none'}
        className={isFavorited ? 'text-red-500' : ''}
      />
    </button>
  );
}
