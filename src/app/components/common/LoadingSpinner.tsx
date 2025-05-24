import React from 'react';
import { Theme } from '../../../types';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  theme: Theme;
  message?: string;
}

/**
 * Reusable LoadingSpinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  theme,
  message
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClass = theme === 'dark' ? 'text-gray-600' : 'text-gray-300';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClass} animate-spin`}>
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}; 