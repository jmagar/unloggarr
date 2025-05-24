import { useState } from 'react';
import { Theme } from '../types';

/**
 * Hook for managing theme state and providing theme utilities
 * @returns Theme state and actions
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [showSettings, setShowSettings] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  return {
    theme,
    showSettings,
    setShowSettings,
    toggleTheme,
    isDark
  };
}; 