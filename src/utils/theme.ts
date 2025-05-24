import { Theme, ThemeClassNames } from '../types';

/**
 * Get theme-specific CSS classes
 * @param theme - Current theme ('light' | 'dark')
 * @returns Object containing theme-specific CSS classes
 */
export const getThemeClasses = (theme: Theme): ThemeClassNames => {
  const isDark = theme === 'dark';
  
  return {
    container: isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-400' : 'text-gray-600',
      muted: isDark ? 'text-gray-500' : 'text-gray-500'
    }
  };
};

/**
 * Get log level specific colors based on theme
 * @param level - Log level
 * @param theme - Current theme
 * @returns CSS class string for log level styling
 */
export const getLogLevelColor = (level: string, theme: Theme): string => {
  const isDark = theme === 'dark';
  
  switch (level) {
    case 'ERROR': 
      return isDark ? 'text-red-400 bg-red-950 border-red-800' : 'text-red-500 bg-red-50 border-red-200';
    case 'WARN': 
      return isDark ? 'text-orange-400 bg-orange-950 border-orange-800' : 'text-orange-500 bg-orange-50 border-orange-200';
    case 'INFO': 
      return isDark ? 'text-blue-400 bg-blue-950 border-blue-800' : 'text-blue-500 bg-blue-50 border-blue-200';
    case 'DEBUG': 
      return isDark ? 'text-gray-400 bg-gray-900 border-gray-700' : 'text-gray-500 bg-gray-50 border-gray-200';
    default: 
      return isDark ? 'text-gray-400 bg-gray-900 border-gray-700' : 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

/**
 * Get log level badge classes
 * @param level - Log level
 * @param theme - Current theme
 * @returns CSS class string for log level badges
 */
export const getLogLevelBadge = (level: string, theme: Theme): string => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
  const isDark = theme === 'dark';
  
  switch (level) {
    case 'ERROR': 
      return `${baseClasses} ${isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'}`;
    case 'WARN': 
      return `${baseClasses} ${isDark ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'}`;
    case 'INFO': 
      return `${baseClasses} ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`;
    case 'DEBUG': 
      return `${baseClasses} ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
    default: 
      return `${baseClasses} ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`;
  }
};

/**
 * Get notification badge color based on importance
 * @param importance - Notification importance level
 * @returns CSS class string for notification badge color
 */
export const getNotificationBadgeColor = (importance: string): string => {
  switch (importance) {
    case 'ALERT': return 'bg-red-500';
    case 'WARNING': return 'bg-orange-500';
    default: return 'bg-blue-500';
  }
}; 