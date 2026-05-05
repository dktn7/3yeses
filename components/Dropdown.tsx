"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
  className?: string;
};

export default function Dropdown<T extends string>({ options, value, onChange, ariaLabel, className }: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = options.find((o) => o.value === value)?.label ?? '';
  // present options sorted by label so they are easier to scan
  const sortedOptions = React.useMemo(() => {
    return [...options].sort((a, b) => a.label.localeCompare(b.label));
  }, [options]);

  const [portalStyle, setPortalStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    if (!open || !ref.current) {
      setPortalStyle(null);
      return;
    }

    function compute() {
      const rect = ref.current!.getBoundingClientRect();
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

      const spaceBelow = vh - rect.bottom;
      const spaceAbove = rect.top;

      // prefer below, but if not enough space show above. keep at most 70% of viewport height
      const maxAllowed = Math.round(vh * 0.7);
      let maxHeight = Math.min(Math.max(spaceBelow - 16, 120), maxAllowed);
      let top = rect.bottom + 8;

      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        // open upwards
        maxHeight = Math.min(Math.max(spaceAbove - 16, 120), maxAllowed);
        top = Math.max(rect.top - maxHeight - 8, 8);
      }

      setPortalStyle({
        position: 'fixed',
        top: top,
        left: rect.left,
        minWidth: rect.width,
        maxHeight: maxHeight,
        overflow: 'auto',
      });
    }

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block text-left ${className || ''}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-2 bg-light-surface/70 dark:bg-dark-surface/70 border border-gray-200/60 dark:border-white/10 text-sm text-light-surface dark:text-dark-surface px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-accent-red/30"
      >
        <span className="truncate">{selected}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        // render options in a portal so they're not clipped by parent containers
        portalStyle && createPortal(
          <ul
            role="listbox"
            tabIndex={-1}
            style={portalStyle}
            className="z-50 bg-light-surface dark:bg-dark-surface border border-gray-200/60 dark:border-gray-800 rounded-lg shadow-lg overflow-auto py-1 focus:outline-none"
          >
            {sortedOptions.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-light-surface/90 dark:hover:bg-dark-surface/90 ${opt.value === value ? 'bg-light-surface/90 dark:bg-dark-surface/90 font-semibold' : ''}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>,
          document.body,
        )
      )}
    </div>
  );
}
