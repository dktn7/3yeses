"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 8, // 8px gap
      });
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <>
      <div
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>
      {visible &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            className="absolute px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            {text}
          </div>,
          document.getElementById('tooltip-root')!
        )}
    </>
  );
};

export default Tooltip;