import React from 'react';
import { Zap, Server, Settings } from 'lucide-react';
import { Theme, SchedulerStatus } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { SchedulerIndicator } from './SchedulerIndicator';

interface HeaderProps {
  theme: Theme;
  isConnected: boolean;
  notificationCount: number;
  schedulerStatus: SchedulerStatus | null;
  onThemeToggle: () => void;
  onNotificationsClick: () => void;
  onSchedulerClick: () => void;
  onSettingsClick: () => void;
}

/**
 * Application header with title, status indicators, and action buttons
 */
export const Header: React.FC<HeaderProps> = ({
  theme,
  isConnected,
  notificationCount,
  schedulerStatus,
  onThemeToggle,
  onNotificationsClick,
  onSchedulerClick,
  onSettingsClick
}) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Enhanced logo with animation */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg transform transition-transform duration-200 group-hover:scale-105">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Enhanced title with gradient text */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
            unloggarr
          </h1>
          
          {/* Enhanced subtitle with connection status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>
              AI-Powered Log Analyzer
            </span>
            
            {/* Connection status badge */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              isConnected 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <Server className="w-3 h-3" />
              <span>{isConnected ? 'Connected to Unraid' : 'Using Sample Data'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        <SchedulerIndicator 
          theme={theme} 
          schedulerStatus={schedulerStatus} 
          onClick={onSchedulerClick} 
        />

        <NotificationBell 
          theme={theme} 
          notificationCount={notificationCount} 
          onClick={onNotificationsClick} 
        />
        
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        <button
          onClick={onSettingsClick}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}; 