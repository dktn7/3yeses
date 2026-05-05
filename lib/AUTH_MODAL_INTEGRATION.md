# AuthRequiredModal Integration Guide

## Overview
The reusable auth modal system provides a consistent, platform-styled authentication prompt for guest-only actions across 3YESES.

## Components & Hooks

### AuthRequiredModal
**Location:** `components/AuthRequiredModal.tsx`

A styled modal component that:
- Auto-detects current locale from pathname
- Builds redirect URLs for sign-in/sign-up
- Handles portal rendering for proper z-index
- Supports customizable title, message, and action text

**Props:**
```typescript
interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  action?: string;
}
```

### useAuthRequired Hook
**Location:** `hooks/useAuthRequired.ts`

A state management hook that provides:
- `showAuthModal`: boolean for modal visibility
- `openAuthModal`: callback to show modal
- `closeAuthModal`: callback to hide modal

**Usage:**
```typescript
const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
```

---

## Integration Examples

### 1. Comments (CommentsSection or CommentInput)

**File:** `components/CommentsSection.tsx` or `components/comments/CommentInput.tsx`

```typescript
'use client';

import { useAuthRequired } from '@/hooks/useAuthRequired';
import AuthRequiredModal from '@/components/AuthRequiredModal';

export default function CommentInput() {
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // from auth context
  
  const handleSubmitComment = async (text: string) => {
    // Check auth first
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    
    // Proceed with comment submission
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, targetId: portfolioItemId }),
      });
      // handle response
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmitComment(formValue);
      }}>
        <textarea placeholder="Write a comment..." />
        <button type="submit">Comment</button>
      </form>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to comment"
        message="You need an account to comment on talent profiles and portfolio items."
        action="comment"
      />
    </>
  );
}
```

---

### 2. Save/Bookmark (ProfileSection or TalentCard)

**File:** `components/ProfileSection.tsx` or similar

```typescript
'use client';

import { useAuthRequired } from '@/hooks/useAuthRequired';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import { Heart } from 'lucide-react';

export default function SaveButton({ talentId }: { talentId: string }) {
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  const [isSaved, setIsSaved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // from auth context

  const handleSave = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    try {
      const res = await fetch(`/api/talent/${talentId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ saved: !isSaved }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Failed to save talent:', error);
    }
  };

  return (
    <>
      <button
        onClick={handleSave}
        className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
        title={isSaved ? 'Remove from saved' : 'Save talent'}
      >
        <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to save"
        message="You need an account to save and bookmark talent profiles."
        action="save profiles"
      />
    </>
  );
}
```

---

### 3. Report/Flag (FlagButton or MediaOverlay)

**File:** `components/FlagButton.tsx` or `components/MediaOverlay.tsx`

```typescript
'use client';

import { useAuthRequired } from '@/hooks/useAuthRequired';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import { Flag } from 'lucide-react';

interface ReportOptions {
  reason: 'INAPPROPRIATE' | 'SPAM' | 'FAKE' | 'HARASSMENT' | 'OTHER';
  details?: string;
}

export default function ReportButton({ itemId, itemType }: { itemId: string; itemType: string }) {
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // from auth context
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReportClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setShowReportForm(true);
  };

  const handleSubmitReport = async (options: ReportOptions) => {
    try {
      const res = await fetch(`/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemId,
          itemType,
          ...options,
        }),
      });

      if (res.ok) {
        setShowReportForm(false);
        // show success toast
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      // show error toast
    }
  };

  return (
    <>
      <button
        onClick={handleReportClick}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        title="Report this content"
      >
        <Flag size={20} />
      </button>

      {showReportForm && (
        <ReportForm
          onSubmit={handleSubmitReport}
          onCancel={() => setShowReportForm(false)}
        />
      )}

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to report"
        message="You need an account to report inappropriate content on 3YESES."
        action="report content"
      />
    </>
  );
}
```

---

## Best Practices

1. **Check auth early**: Always call `openAuthModal()` before attempting the action if user is not authenticated.
2. **Customize messages**: Make the title and message specific to the action (like, comment, save, report).
3. **Import hook near component**: Place `useAuthRequired` import near the top of the file with other hooks.
4. **Keep modal at end**: Place the `<AuthRequiredModal />` component near the end of your JSX return, after all forms/UI.
5. **Use consistent action naming**: For consistency, use action names like:
   - "like profiles"
   - "comment on profiles"
   - "save profiles"
   - "report content"

---

## API Contract

When a guest tries an auth-protected action, the expected response is:

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

The modal will automatically prompt sign-in/sign-up and redirect back to the current page after auth.

---

## Styling

The modal uses Tailwind classes and respects the platform theme (light/dark mode):
- **Light mode**: Blue accent borders, blue-tinted backgrounds
- **Dark mode**: Red accent borders (accent-red class), slate/red darker backgrounds
- **Backdrop**: Slate-950 overlay with blur effect for focus
- **Z-index**: 120 (well above typical content)

No additional CSS required—uses existing Tailwind tokens and color system.

---

## Simplified Integration with useRequireAuth Hook

For even simpler integration without manually managing modal state, use the `useRequireAuth` utility hook from `@/lib/auth-utils`:

```typescript
import { useRequireAuth } from '@/lib/auth-utils';

export default function MyFeature() {
  const { requireAuth } = useRequireAuth({
    title: 'Sign in to use this feature',
    message: 'You need an account to use this feature.',
    action: 'use this feature'
  });

  const handleAction = async () => {
    if (!requireAuth()) return; // Shows modal and returns false if not authenticated
    
    // User is authenticated, proceed with action
    await performAction();
  };

  return <button onClick={handleAction}>Use Feature</button>;
}
```

**Benefits:**
- No need to manage `showAuthModal` state manually
- No need to explicitly render AuthRequiredModal
- Cleaner, more readable code
- `requireAuth()` returns boolean for easy flow control
- Modal shows automatically when needed

This is the recommended approach for new features.
