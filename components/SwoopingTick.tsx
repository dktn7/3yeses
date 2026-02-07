import React from 'react';

interface SwoopingTickProps {
  readonly size?: number;
  readonly className?: string;
  readonly hovered?: boolean;
  readonly spinnerOnly?: boolean; // New prop for clean spinner without checkmark
}

export default function SwoopingTick({ 
  size = 48, 
  className = '', 
  hovered = false,
  spinnerOnly = false 
}: Readonly<SwoopingTickProps>) {
  
  // Pure spinning circle loader
  if (spinnerOnly) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`animate-spin ${className}`}
        style={{
          animation: 'spin 1s linear infinite'
        }}
      >
        {/* Outer spinning circle */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          opacity="0.2"
        />
        
        {/* Spinning arc */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray="31.4 94.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Original checkmark animation
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="#3B82F6"
        strokeWidth="4"
        fill="transparent"
        className={`transition-all duration-300 ${hovered ? 'stroke-blue-600' : 'stroke-blue-500'}`}
      />
      
      {/* Swooping Check Mark */}
      <path
        d="M14 24L20 30L34 16"
        stroke="#EF4444"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={`transition-all duration-300 ${hovered ? 'stroke-red-600' : 'stroke-red-500'}`}
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(239, 68, 68, 0.3))'
        }}
      />
    </svg>
  );
}
