'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import AuthRequiredModal from '@/components/AuthRequiredModal';

interface SaveButtonProps {
  talentId: string;
  talentName?: string;
  onSaveStatusChange?: (isSaved: boolean) => void;
}

export default function SaveButton({ talentId, talentName = 'talent', onSaveStatusChange }: SaveButtonProps) {
  const { user } = useAuth();
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !talentId) return;

    const checkSaveStatus = async () => {
      try {
        const res = await fetch(`/api/talent/${talentId}/save`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setIsSaved(Boolean(data?.isSaved));
        }
      } catch (error) {
        console.error('Failed to check save status:', error);
      }
    };

    checkSaveStatus();
  }, [user, talentId]);

  const handleSave = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (isLoading) return;

    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/talent/${talentId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ saved: !prevSaved }),
      });

      if (res.status === 401) {
        setIsSaved(prevSaved);
        openAuthModal();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      const data = await res.json();
      setIsSaved(Boolean(data?.isSaved));
      onSaveStatusChange?.(Boolean(data?.isSaved));
    } catch (error) {
      console.error('Failed to save talent:', error);
      setIsSaved(prevSaved);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="p-2 text-gray-400 hover:text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={isSaved ? 'Remove from saved' : 'Save talent'}
        aria-label={isSaved ? 'Remove from saved' : 'Save talent'}
      >
        <Heart
          size={20}
          fill={isSaved ? 'currentColor' : 'none'}
          className={isSaved ? 'text-amber-500' : ''}
        />
      </button>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to save"
        message={`You need an account to save and bookmark ${talentName} profiles. Continue to sign in or create an account.`}
        action="save profiles"
      />
    </>
  );
}
