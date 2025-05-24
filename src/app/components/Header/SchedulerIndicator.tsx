import React from 'react';
import { SchedulerStatus, Theme } from '../../../types';

interface SchedulerIndicatorProps {
  theme: Theme;
  schedulerStatus: SchedulerStatus | null;
  onClick: () => void;
}

/**
 * Scheduler status indicator button
 */
export const SchedulerIndicator: React.FC<SchedulerIndicatorProps> = ({
  theme,
  schedulerStatus,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors relative ${
        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      }`}
      title={`Scheduler: ${schedulerStatus?.enabled ? 'Running' : 'Stopped'}`}
    >
      <div className="relative">
        <div className="w-5 h-5 border-2 border-current rounded-full"></div>
        <div 
          className={`absolute top-1 left-1 w-3 h-3 rounded-full ${
            schedulerStatus?.enabled ? 'bg-green-500' : 'bg-gray-400'
          }`}
        ></div>
      </div>
      {schedulerStatus?.enabled && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-2 h-2"></span>
      )}
    </button>
  );
}; 