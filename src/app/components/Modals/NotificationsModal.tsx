import React from 'react';
import { Bell, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Theme, NotificationItem } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { Modal } from '../common/Modal';

interface NotificationsModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll?: () => void;
  onMarkAsRead?: (id: string) => void;
}

/**
 * Modal component for displaying notifications
 */
export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  theme,
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAsRead
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const getPriorityIcon = (importance: 'INFO' | 'WARNING' | 'ALERT') => {
    if (importance === 'ALERT') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (importance === 'WARNING') return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getPriorityLabel = (importance: 'INFO' | 'WARNING' | 'ALERT') => {
    if (importance === 'ALERT') return 'High';
    if (importance === 'WARNING') return 'Medium';
    return 'Normal';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Notifications</h2>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6">
        {/* Header Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm ${themeClasses.text.secondary}`}>
              Recent notifications from your Unraid system
            </span>
            {onClearAll && (
              <button
                onClick={onClearAll}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isDark 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className={`w-12 h-12 mx-auto mb-4 ${themeClasses.text.secondary}`} />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                You're all caught up! Notifications from your Unraid system will appear here.
              </p>
            </div>
          ) : (
            (notifications || []).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getPriorityIcon(notification.importance)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{notification.subject}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.importance === 'ALERT'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : notification.importance === 'WARNING'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {getPriorityLabel(notification.importance)}
                      </span>
                    </div>
                    
                    <p className={`text-sm ${themeClasses.text.secondary} mb-2`}>
                      {notification.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${themeClasses.text.secondary}`}>
                        {formatDate(notification.timestamp)}
                      </span>
                      
                      {onMarkAsRead && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                            isDark 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};