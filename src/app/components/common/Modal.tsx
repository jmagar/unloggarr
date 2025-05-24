import React from 'react';
import { Theme } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  theme: Theme;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'large';
  footer?: React.ReactNode;
}

/**
 * Reusable Modal component with theme support
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  theme,
  size = 'lg',
  footer
}) => {
  const themeClasses = getThemeClasses(theme);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    large: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${themeClasses.card} rounded-xl ${sizeClasses[size]} w-full max-h-[80vh] overflow-hidden shadow-xl border`}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {typeof title === 'string' ? (
                <h3 className="text-lg font-semibold">{title}</h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors ml-4`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}; 