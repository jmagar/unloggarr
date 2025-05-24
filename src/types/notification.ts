export interface NotificationItem {
  id: string;
  subject: string;
  description: string;
  timestamp: string;
  importance: 'INFO' | 'WARNING' | 'ALERT';
}

export interface NotificationsResponse {
  success: boolean;
  overview: {
    unread: {
      total: number;
      info?: number;
      warning?: number;
      alert?: number;
    };
  };
  notifications: NotificationItem[];
}

export interface NotificationState {
  notifications: NotificationItem[];
  notificationCount: number;
  showNotifications: boolean;
} 