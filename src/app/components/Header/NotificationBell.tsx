import React from 'react';
import { Bell } from 'lucide-react';
import { Theme } from '../../../types';

interface NotificationBellProps {
  theme: Theme;
  notificationCount: number;
  onClick: () => void;
}

/**
 * Notification bell button with count badge
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  theme,
  notificationCount,
  onClick
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
        title="View notifications"
      >
        <Bell className="w-5 h-5" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>
    </div>
  );
}; 