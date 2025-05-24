import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Theme } from '../../../types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/**
 * Theme toggle button component
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors ${
        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      }`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}; 