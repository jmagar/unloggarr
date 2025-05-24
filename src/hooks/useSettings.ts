import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
  maxLogEntries: number;
  enableNotifications: boolean;
  notificationSound: boolean;
  enableScheduler: boolean;
  defaultLogLevel: string;
  compactView: boolean;
  showTimestamps: boolean;
  highlightErrors: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  autoRefresh: true,
  refreshInterval: 30,
  maxLogEntries: 10000, // Match the component default
  enableNotifications: true,
  notificationSound: false,
  enableScheduler: true,
  defaultLogLevel: 'all',
  compactView: false,
  showTimestamps: true,
  highlightErrors: true,
};

/**
 * Hook for managing application settings
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [autoRefreshTimer, setAutoRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('unloggar-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem('unloggar-settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      try {
        localStorage.setItem('unloggar-settings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving setting:', error);
      }
      return newSettings;
    });
  }, []);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    try {
      localStorage.setItem('unloggar-settings', JSON.stringify(DEFAULT_SETTINGS));
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }, []);

  // Auto-refresh functionality
  const startAutoRefresh = useCallback((callback: () => void) => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
    }

    if (settings.autoRefresh) {
      const timer = setInterval(callback, settings.refreshInterval * 1000);
      setAutoRefreshTimer(timer);
      return timer;
    }
    return null;
  }, [settings.autoRefresh, settings.refreshInterval, autoRefreshTimer]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      setAutoRefreshTimer(null);
    }
  }, [autoRefreshTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
      }
    };
  }, [autoRefreshTimer]);

  return {
    settings,
    saveSettings,
    updateSetting,
    resetSettings,
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshActive: !!autoRefreshTimer,
  };
};