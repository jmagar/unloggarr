import React from 'react';
import { Clock, Code, Hash, ExternalLink } from 'lucide-react';
import { Theme, LogEntry as LogEntryType } from '../../../types';
import { getThemeClasses, getLogLevelBadge } from '../../../utils/theme';
import { formatTimestamp } from '../../../utils/dateFormatter';

interface LogEntryProps {
  log: LogEntryType;
  index: number;
  theme: Theme;
  onClick: () => void;
  searchTerm?: string;
  compact?: boolean;
  showTimestamps?: boolean;
  highlightErrors?: boolean;
}

/**
 * Enhanced log entry component with beautiful styling and micro-interactions
 */
export const LogEntry: React.FC<LogEntryProps> = React.memo(({
  log,
  index,
  theme,
  onClick,
  searchTerm = '',
  compact = false,
  showTimestamps = true,
  highlightErrors = true
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  // Highlight search terms in the message
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded font-medium">
          {part}
        </span>
      ) : part
    );
  };

  const getLevelIndicatorColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-500';
      case 'WARN': return 'bg-orange-500';
      case 'INFO': return 'bg-blue-500';
      case 'DEBUG': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`group relative ${compact ? 'p-2' : 'p-4'} cursor-pointer transition-all duration-200 ${
        highlightErrors ? `border-l-4 ${getLevelIndicatorColor(log.level)}` : 'border-l-2 border-l-gray-300 dark:border-l-gray-600'
      } ${
        isDark ? 'hover:bg-gray-700/50 border-r border-r-gray-700' : 'hover:bg-gray-50/50 border-r border-r-gray-200'
      } hover:shadow-sm`}
      onClick={onClick}
    >
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r ${
        isDark ? 'from-gray-800/50 to-transparent' : 'from-gray-100/50 to-transparent'
      } pointer-events-none`} />
      
      {/* Content */}
      <div className={`relative flex items-start ${compact ? 'gap-2' : 'gap-4'}`}>
        {/* Index number with styling */}
        {!compact && (
          <div className="flex-shrink-0">
            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
              isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
            } font-mono text-xs transition-all duration-200 group-hover:scale-105`}>
              <Hash className="w-3 h-3" />
              {String(index + 1).padStart(3, '0')}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header with badges and timestamp */}
          <div className={`flex items-center gap-3 ${compact ? 'mb-1' : 'mb-3'} flex-wrap`}>
            {/* Level badge */}
            <span className={`${getLogLevelBadge(log.level, theme)} ${compact ? 'text-xs' : ''} transition-all duration-200 group-hover:scale-105`}>
              {log.level}
            </span>

            {/* Timestamp */}
            {showTimestamps && (
              <div className={`flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'} ${themeClasses.text.secondary} font-mono`}>
                <Clock className={`${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
                <span>{formatTimestamp(log.timestamp)}</span>
              </div>
            )}

            {/* Source badge */}
            {log.source && !compact && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              } transition-all duration-200 group-hover:scale-105`}>
                <Code className="w-3 h-3" />
                <span>{log.source}</span>
              </div>
            )}

            {/* Compact mode index */}
            {compact && (
              <div className={`text-xs ${themeClasses.text.secondary} font-mono`}>
                #{index + 1}
              </div>
            )}

            {/* Click to expand indicator */}
            {!compact && (
              <div className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs ${themeClasses.text.secondary} flex items-center gap-1`}>
                <ExternalLink className="w-3 h-3" />
                <span>Click to expand</span>
              </div>
            )}
          </div>

          {/* Log message with syntax highlighting */}
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            <div className={`font-mono ${compact ? 'text-xs' : 'text-sm'} leading-relaxed break-words ${themeClasses.text.primary} ${
              compact ? 'p-2' : 'p-3'
            } rounded-lg ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'
            } border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } transition-all duration-200 group-hover:shadow-sm`}>
              {compact ?
                // Truncate message in compact mode
                (log.message.length > 100 ?
                  <>
                    {highlightSearchTerm(log.message.substring(0, 100), searchTerm)}
                    <span className={`${themeClasses.text.secondary}`}>...</span>
                  </> :
                  highlightSearchTerm(log.message, searchTerm)
                ) :
                highlightSearchTerm(log.message, searchTerm)
              }
            </div>

            {/* Message length indicator for long messages */}
            {!compact && log.message.length > 200 && (
              <div className={`text-xs ${themeClasses.text.secondary} flex items-center gap-1`}>
                <span>{log.message.length} characters</span>
                <span>•</span>
                <span>Click to view full message</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border with level color on hover */}
      {highlightErrors && (
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${getLevelIndicatorColor(log.level)} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
      )}
    </div>
  );
});

LogEntry.displayName = 'LogEntry';