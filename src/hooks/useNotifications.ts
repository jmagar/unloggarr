import { useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { fetchNotifications as fetchNotificationsService } from '../services/notificationService';

/**
 * Hook for managing notification state and operations
 * @returns Notification state and actions
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const result = await fetchNotificationsService();
      // Add safety checks to ensure arrays are properly handled
      const safeNotifications = Array.isArray(result.notifications) ? result.notifications : [];
      const safeCount = typeof result.count === 'number' ? result.count : 0;
      
      setNotifications(safeNotifications);
      setNotificationCount(safeCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set safe fallback values
      setNotifications([]);
      setNotificationCount(0);
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    // State
    notifications,
    notificationCount,
    showNotifications,

    // Actions
    setShowNotifications,
    fetchNotifications
  };
}; 