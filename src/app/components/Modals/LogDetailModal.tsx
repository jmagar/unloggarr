import React from 'react';
import { Clock, Code, Copy, ExternalLink, AlertTriangle, Info, Bug } from 'lucide-react';
import { Theme, LogEntry } from '../../../types';
import { getThemeClasses, getLogLevelBadge } from '../../../utils/theme';
import { formatTimestamp } from '../../../utils/dateFormatter';
import { Modal } from '../common/Modal';

interface LogDetailModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  log: LogEntry | null;
}

/**
 * Modal component for displaying detailed log entry information
 */
export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  theme,
  isOpen,
  onClose,
  log
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  if (!log) return null;

  const handleCopyLog = () => {
    const logText = `[${log.timestamp}] ${log.level}: ${log.message}${log.source ? ` (${log.source})` : ''}`;
    navigator.clipboard.writeText(logText);
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'DEBUG':
        return <Bug className="w-5 h-5 text-gray-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'WARN':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'INFO':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'DEBUG':
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getLevelColor(log.level)}`}>
            {getLogIcon(log.level)}
          </div>
          <div>
            <h2 className="text-xl font-bold">Log Entry Details</h2>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Detailed view of log entry #{log.id || 'Unknown'}
            </p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level Badge */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Log Level
            </label>
            <div className="flex items-center gap-2">
              {getLogIcon(log.level)}
              <span className={`${getLogLevelBadge(log.level, theme)} text-sm`}>
                {log.level}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Timestamp
            </label>
            <div className={`flex items-center gap-2 text-sm ${themeClasses.text.primary} font-mono`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimestamp(log.timestamp)}</span>
            </div>
          </div>

          {/* Source */}
          {log.source && (
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Source
              </label>
              <div className={`flex items-center gap-2 text-sm ${themeClasses.text.primary} font-mono`}>
                <Code className="w-4 h-4" />
                <span>{log.source}</span>
              </div>
            </div>
          )}
        </div>

        {/* Log Message */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>
              Log Message
            </label>
            <button
              onClick={handleCopyLog}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          
          <div className={`p-4 rounded-lg border font-mono text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-gray-200' 
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            {log.message}
          </div>
        </div>

        {/* Message Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${themeClasses.text.secondary} mb-1`}>Characters</div>
            <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              {log.message.length.toLocaleString()}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${themeClasses.text.secondary} mb-1`}>Words</div>
            <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              {log.message.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${themeClasses.text.secondary} mb-1`}>Lines</div>
            <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              {log.message.split('\n').length.toLocaleString()}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`text-xs ${themeClasses.text.secondary} mb-1`}>Entry ID</div>
            <div className={`text-lg font-semibold ${themeClasses.text.primary} font-mono`}>
              #{log.id || 'N/A'}
            </div>
          </div>
        </div>

        {/* Raw Log Data */}
        <div>
          <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-3`}>
            Raw Log Data (JSON)
          </label>
          <div className={`p-4 rounded-lg border font-mono text-xs leading-relaxed overflow-x-auto ${
            isDark 
              ? 'bg-gray-900 border-gray-700 text-gray-300' 
              : 'bg-gray-100 border-gray-200 text-gray-700'
          }`}>
            <pre>{JSON.stringify(log, null, 2)}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={handleCopyLog}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
              Copy Log Entry
            </button>
            
            <button
              onClick={() => {
                const jsonData = JSON.stringify(log, null, 2);
                navigator.clipboard.writeText(jsonData);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Code className="w-4 h-4" />
              Copy JSON
            </button>
          </div>
          
          <button
            onClick={onClose}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};