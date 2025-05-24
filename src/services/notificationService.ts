import { NotificationsResponse, NotificationItem } from '../types';

/**
 * Fetch notifications from the API
 * @returns Promise resolving to object with notifications and count
 */
export const fetchNotifications = async (): Promise<{
  notifications: NotificationItem[];
  count: number;
}> => {
  try {
    const response = await fetch('/api/notifications');
    if (response.ok) {
      const data: NotificationsResponse = await response.json();
      if (data.success) {
        return {
          notifications: data.notifications || [],
          count: data.overview?.unread?.total || 0
        };
      }
    }
    return { notifications: [], count: 0 };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { notifications: [], count: 0 };
  }
}; 