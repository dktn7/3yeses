'use client';

import React from 'react';

const LoadingSpinner = ({ size = 'h-12 w-12', color = 'border-primary-blue' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`}></div>
    </div>
  );
};

export default LoadingSpinner;
