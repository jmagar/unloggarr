import React, { useState, useEffect } from 'react';
import { Settings, Server, Palette, Bell, Clock, Save } from 'lucide-react';
import { Theme } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { Modal } from '../common/Modal';
import { useSettings, AppSettings } from '../../../hooks/useSettings';

interface SettingsModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

/**
 * Modal component for application settings
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  isOpen,
  onClose,
  onThemeChange,
  onSettingsChange
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';
  const [isSaving, setIsSaving] = useState(false);
  
  const { settings: globalSettings, saveSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(globalSettings);

  // Sync local settings with global settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings({ ...globalSettings, theme });
    }
  }, [isOpen, globalSettings, theme]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Apply theme change immediately if changed
      if (localSettings.theme !== theme) {
        onThemeChange();
      }
      
      // Save settings
      saveSettings(localSettings);
      
      // Notify parent component of settings change
      if (onSettingsChange) {
        onSettingsChange(localSettings);
      }
      
      // Simulate API call delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings({
      theme: 'light',
      autoRefresh: true,
      refreshInterval: 30,
      maxLogEntries: 5000,
      enableNotifications: true,
      notificationSound: false,
      enableScheduler: true,
      defaultLogLevel: 'all',
      compactView: false,
      showTimestamps: true,
      highlightErrors: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 text-white`}>
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Application Settings</h2>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Customize your unloggar experience
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Appearance Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Theme
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'light' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    localSettings.theme === 'light'
                      ? 'bg-blue-500 border-blue-400 text-white'
                      : isDark 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => setLocalSettings(prev => ({ ...prev, theme: 'dark' }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    localSettings.theme === 'dark'
                      ? 'bg-blue-500 border-blue-400 text-white'
                      : isDark 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Compact View
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Show more log entries in less space
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.compactView}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, compactView: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Show Timestamps
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Display timestamps for each log entry
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.showTimestamps}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, showTimestamps: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Highlight Errors
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Use colored borders for error and warning entries
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.highlightErrors}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, highlightErrors: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Data & Performance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Auto Refresh
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Automatically refresh log data
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.autoRefresh}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={localSettings.refreshInterval}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                disabled={!localSettings.autoRefresh}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Max Log Entries
              </label>
              <select
                value={localSettings.maxLogEntries}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, maxLogEntries: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value={500}>500 entries</option>
                <option value={1000}>1,000 entries</option>
                <option value={2000}>2,000 entries</option>
                <option value={5000}>5,000 entries</option>
                <option value={10000}>10,000 entries</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Default Log Level
              </label>
              <select
                value={localSettings.defaultLogLevel}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultLogLevel: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Levels</option>
                <option value="error">Errors Only</option>
                <option value="warning">Warnings & Errors</option>
                <option value="info">Info & Above</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Enable Notifications
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Receive notifications for important events
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enableNotifications}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Notification Sound
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Play sound for new notifications
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.notificationSound}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, notificationSound: e.target.checked }))}
                disabled={!localSettings.enableNotifications}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Scheduler Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Scheduler</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                  Enable Scheduler
                </label>
                <p className={`text-xs ${themeClasses.text.secondary}`}>
                  Allow automated log analysis
                </p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enableScheduler}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, enableScheduler: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Reset to Defaults
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};