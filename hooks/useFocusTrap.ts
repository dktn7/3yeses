import { RefObject, useEffect } from 'react';

export default function useFocusTrap(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const container = containerEl;

    const prevActive = document.activeElement as HTMLElement | null;

    const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));

    // Focus the first focusable element or the container itself
    if (focusable.length) {
      try { focusable[0].focus(); } catch {}
    } else {
      try { container.focus(); } catch {}
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      try {
        if (prevActive && typeof prevActive.focus === 'function') prevActive.focus();
      } catch {}
    };
  }, [containerRef]);
}
