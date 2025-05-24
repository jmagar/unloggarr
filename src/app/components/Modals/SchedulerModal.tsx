import React, { useState } from 'react';
import { Clock, Play, Pause, Settings, Calendar } from 'lucide-react';
import { Theme, SchedulerStatus, SchedulerAction } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { Modal } from '../common/Modal';

interface SchedulerModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  schedulerStatus: SchedulerStatus | null;
  onControlScheduler: (action: SchedulerAction, schedule?: string) => Promise<SchedulerStatus | null>;
}

/**
 * Modal component for managing scheduler settings
 */
export const SchedulerModal: React.FC<SchedulerModalProps> = ({
  theme,
  isOpen,
  onClose,
  schedulerStatus,
  onControlScheduler
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';
  const [isUpdating, setIsUpdating] = useState(false);
  const [customSchedule, setCustomSchedule] = useState('0 * * * *'); // Default: every hour

  const handleControlAction = async (action: SchedulerAction, schedule?: string) => {
    setIsUpdating(true);
    try {
      await onControlScheduler(action, schedule);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatNextRun = (nextRun: string) => {
    return new Date(nextRun).toLocaleString();
  };

  const formatLastRun = (lastRun: string) => {
    return new Date(lastRun).toLocaleString();
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-500' : 'text-gray-400';
  };

  const getStatusText = (enabled: boolean) => {
    return enabled ? 'Running' : 'Stopped';
  };

  const presetSchedules = [
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every 30 minutes', value: '*/30 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 2 hours', value: '0 */2 * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 6 AM', value: '0 6 * * *' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 text-white`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Scheduler Settings</h2>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Manage automated log analysis schedule
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6">
        {/* Current Status */}
        <div className={`p-4 rounded-lg border mb-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                schedulerStatus?.enabled ? 'bg-green-500' : 'bg-gray-400'
              } animate-pulse`} />
              <span className={`font-medium ${getStatusColor(schedulerStatus?.enabled || false)}`}>
                {getStatusText(schedulerStatus?.enabled || false)}
              </span>
            </div>
          </div>

          {schedulerStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>
                  Schedule Pattern
                </label>
                <p className="text-lg font-mono">{schedulerStatus.schedule}</p>
              </div>
              
              {schedulerStatus.nextRun && (
                <div>
                  <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>
                    Next Run
                  </label>
                  <p className="text-lg">{formatNextRun(schedulerStatus.nextRun)}</p>
                </div>
              )}
              
              {schedulerStatus.lastRun && (
                <div>
                  <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>
                    Last Run
                  </label>
                  <p className="text-lg">{formatLastRun(schedulerStatus.lastRun)}</p>
                </div>
              )}
              
              <div>
                <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>
                  Status
                </label>
                <p className="text-lg">{schedulerStatus.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleControlAction(schedulerStatus?.enabled ? 'stop' : 'start')}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                schedulerStatus?.enabled
                  ? isDark 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  : isDark 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {schedulerStatus?.enabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Scheduler
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Scheduler
                </>
              )}
            </button>

            <button
              onClick={() => handleControlAction('trigger')}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              Run Now
            </button>
          </div>
        </div>

        {/* Schedule Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Schedule Configuration</h3>
          
          {/* Preset Schedules */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Preset Schedules
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(presetSchedules || []).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCustomSchedule(preset.value)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    customSchedule === preset.value
                      ? isDark 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-blue-500 border-blue-400 text-white'
                      : isDark 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className={`text-sm font-mono ${
                    customSchedule === preset.value ? 'text-blue-100' : themeClasses.text.secondary
                  }`}>
                    {preset.value}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Schedule */}
          <div className="mb-4">
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Custom Cron Expression
            </label>
            <input
              type="text"
              value={customSchedule}
              onChange={(e) => setCustomSchedule(e.target.value)}
              placeholder="0 * * * *"
              className={`w-full px-3 py-2 rounded-lg border font-mono ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <p className={`text-xs ${themeClasses.text.secondary} mt-1`}>
              Format: minute hour day month weekday (e.g., "0 * * * *" = every hour)
            </p>
          </div>

          {/* Update Schedule Button */}
          <button
            onClick={() => handleControlAction('stop')}
            disabled={isUpdating || !customSchedule.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              isDark
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Apply Schedule
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};