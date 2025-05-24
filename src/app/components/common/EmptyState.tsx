import React from 'react';
import { Search, FileText, Filter, RefreshCw } from 'lucide-react';
import { Theme } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';

interface EmptyStateProps {
  theme: Theme;
  variant?: 'noLogs' | 'noResults' | 'loading' | 'error';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

/**
 * Beautiful empty state component with contextual messaging
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  theme,
  variant = 'noLogs',
  title,
  description,
  action
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const getVariantContent = () => {
    switch (variant) {
      case 'noResults':
        return {
          icon: <Search className="w-12 h-12" />,
          title: title || 'No logs match your search',
          description: description || 'Try adjusting your search terms or filters to find relevant log entries.',
          iconColor: 'text-orange-500',
          bgGradient: isDark ? 'from-orange-500/10 to-amber-500/10' : 'from-orange-50 to-amber-50'
        };
      case 'error':
        return {
          icon: <FileText className="w-12 h-12" />,
          title: title || 'Unable to load logs',
          description: description || 'There was an issue connecting to the log source. Please check your connection and try again.',
          iconColor: 'text-red-500',
          bgGradient: isDark ? 'from-red-500/10 to-rose-500/10' : 'from-red-50 to-rose-50'
        };
      case 'loading':
        return {
          icon: <RefreshCw className="w-12 h-12 animate-spin" />,
          title: title || 'Loading logs...',
          description: description || 'Please wait while we fetch your log data.',
          iconColor: 'text-blue-500',
          bgGradient: isDark ? 'from-blue-500/10 to-cyan-500/10' : 'from-blue-50 to-cyan-50'
        };
      case 'noLogs':
      default:
        return {
          icon: <FileText className="w-12 h-12" />,
          title: title || 'No logs available',
          description: description || 'There are currently no log entries to display. Logs will appear here once your application starts generating them.',
          iconColor: 'text-gray-500',
          bgGradient: isDark ? 'from-gray-500/10 to-slate-500/10' : 'from-gray-50 to-slate-50'
        };
    }
  };

  const content = getVariantContent();

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 text-center`}>
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-gradient-to-br ${content.bgGradient} opacity-50 rounded-xl`} />
      
      {/* Content container */}
      <div className="relative max-w-md mx-auto">
        {/* Icon with decorative background */}
        <div className="relative mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${content.bgGradient} border-2 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } shadow-lg`}>
            <div className={content.iconColor}>
              {content.icon}
            </div>
          </div>
          
          {/* Decorative dots */}
          <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${content.iconColor.replace('text-', 'bg-')} opacity-60`} />
          <div className={`absolute -bottom-2 -left-2 w-3 h-3 rounded-full ${content.iconColor.replace('text-', 'bg-')} opacity-40`} />
        </div>

        {/* Text content */}
        <div className="space-y-3 mb-8">
          <h3 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
            {content.title}
          </h3>
          <p className={`text-sm leading-relaxed ${themeClasses.text.secondary} max-w-sm mx-auto`}>
            {content.description}
          </p>
        </div>

        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            } hover:scale-105 transform`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        )}

        {/* Subtle tips for no results variant */}
        {variant === 'noResults' && (
          <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'} border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-start gap-3 text-left">
              <div className={`flex-shrink-0 p-1 rounded ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Filter className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-medium ${themeClasses.text.primary}`}>Quick tips:</p>
                <ul className={`text-xs space-y-1 ${themeClasses.text.secondary}`}>
                  <li>• Try searching for keywords like "error", "warning", or "fail"</li>
                  <li>• Clear the log level filter to see all entries</li>
                  <li>• Check if the correct log file is selected</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 