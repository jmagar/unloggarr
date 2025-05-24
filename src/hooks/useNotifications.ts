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
    const result = await fetchNotificationsService();
    setNotifications(result.notifications);
    setNotificationCount(result.count);
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