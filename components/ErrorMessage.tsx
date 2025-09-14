'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-red-700 dark:text-red-400 text-center">{message}</p>
    </div>
  );
};

export default ErrorMessage;
