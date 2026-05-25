import React from 'react';

interface SwoopingTickProps {
  readonly size?: number;
  readonly className?: string;
  readonly hovered?: boolean;
  readonly spinnerOnly?: boolean; // Render spinner-only (no check)
  readonly variant?: 'brand' | 'toggle';
}

export default function SwoopingTick({
  size = 48,
  className = '',
  hovered = false,
  spinnerOnly = false,
  variant = 'brand',
}: Readonly<SwoopingTickProps>) {
  // Intentionally avoid inline `stroke` attributes so CSS can control colours
  // Use class names `swoop-outer` and `swoop-check` for styling in globals.css

  if (spinnerOnly) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`swooping-tick animate-spin ${className}`.trim()}
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle cx="24" cy="24" r="20" className="swoop-outer" strokeWidth="3" fill="none" opacity="0.2" />
          <circle cx="24" cy="24" r="20" className="swoop-outer" strokeWidth="3" fill="none" opacity="0.2" stroke="var(--swoop-outer, #2563eb)" />
          <circle cx="24" cy="24" r="20" className="swoop-outer" strokeWidth="3" fill="none" strokeDasharray="31.4 94.2" strokeLinecap="round" stroke="var(--swoop-outer, #2563eb)" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`swooping-tick ${hovered ? 'is-hovered' : ''} ${variant === 'toggle' ? 'variant-toggle' : ''} ${className}`.trim()}
    >
      <circle cx="24" cy="24" r="22" className="swoop-outer transition-all duration-300" strokeWidth="4" fill="transparent" stroke="var(--swoop-outer, #2563eb)" />
      <path
        d="M14 24L20 30L34 16"
        className="swoop-check transition-all duration-300"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke="var(--swoop-check, var(--brand-red))"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.28))' }}
      />
    </svg>
  );
}
