import React, { useRef, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { Theme, NotificationItem } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { formatTimestamp } from '../../../utils/dateFormatter';

interface NotificationsPopoverProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  notificationCount: number;
}

/**
 * Popover component for displaying notifications
 */
export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  theme,
  isOpen,
  onClose,
  notifications,
  notificationCount
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (importance: string) => {
    switch (importance) {
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getNotificationBorderColor = (importance: string) => {
    switch (importance) {
      case 'ALERT':
        return 'border-l-red-500';
      case 'WARNING':
        return 'border-l-orange-500';
      case 'INFO':
        return 'border-l-blue-500';
      default:
        return 'border-l-green-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 z-50">
      <div
        ref={popoverRef}
        className={`w-96 max-h-96 ${themeClasses.card} rounded-xl shadow-xl border backdrop-blur-sm overflow-hidden`}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
          isDark ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Notifications</h3>
              {notificationCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                  {notificationCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${themeClasses.text.secondary}`} />
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                No notifications at this time
              </p>
              <p className={`text-xs ${themeClasses.text.secondary} mt-1`}>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  className={`p-4 border-l-4 ${getNotificationBorderColor(notification.importance)} hover:bg-opacity-50 transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.importance)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          notification.importance === 'ALERT' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          notification.importance === 'WARNING' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          notification.importance === 'INFO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {notification.importance}
                        </span>
                        <div className={`flex items-center gap-1 text-xs ${themeClasses.text.secondary}`}>
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                      </div>
                      <h4 className={`text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                        {notification.subject}
                      </h4>
                      <p className={`text-sm ${themeClasses.text.secondary} line-clamp-2`}>
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={`px-4 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${
            isDark ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white'
          }`}>
            <button
              className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${
                isDark ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'
              }`}
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};