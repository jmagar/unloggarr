import React from 'react';
import { AlertTriangle, Info, Bug, Filter } from 'lucide-react';
import { Theme, LogEntry } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';

interface LogStatsProps {
  theme: Theme;
  logs: LogEntry[];
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

/**
 * Enhanced log statistics component with beautiful cards and animations
 */
export const LogStats: React.FC<LogStatsProps> = ({
  theme,
  logs,
  selectedLevel,
  onLevelChange
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const stats = [
    {
      level: 'ERROR',
      icon: AlertTriangle,
      count: logs.filter(log => log.level === 'ERROR').length,
      label: 'Errors',
      gradient: 'from-red-500 to-rose-600',
      bgGradient: isDark ? 'from-red-500/10 to-rose-600/10' : 'from-red-50 to-rose-50',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: isDark ? 'text-red-300' : 'text-red-600',
      badgeColor: isDark ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
    },
    {
      level: 'WARN',
      icon: AlertTriangle,
      count: logs.filter(log => log.level === 'WARN').length,
      label: 'Warnings',
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: isDark ? 'from-orange-500/10 to-amber-600/10' : 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: isDark ? 'text-orange-300' : 'text-orange-600',
      badgeColor: isDark ? 'bg-orange-900/50 text-orange-200' : 'bg-orange-100 text-orange-800'
    },
    {
      level: 'INFO',
      icon: Info,
      count: logs.filter(log => log.level === 'INFO').length,
      label: 'Information',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: isDark ? 'from-blue-500/10 to-cyan-600/10' : 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: isDark ? 'text-blue-300' : 'text-blue-600',
      badgeColor: isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'
    },
    {
      level: 'DEBUG',
      icon: Bug,
      count: logs.filter(log => log.level === 'DEBUG').length,
      label: 'Debug',
      gradient: 'from-gray-500 to-slate-600',
      bgGradient: isDark ? 'from-gray-500/10 to-slate-600/10' : 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200 dark:border-gray-700',
      textColor: isDark ? 'text-gray-300' : 'text-gray-600',
      badgeColor: isDark ? 'bg-gray-700/50 text-gray-200' : 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const isSelected = selectedLevel === stat.level;
        const isFilterActive = selectedLevel !== 'ALL';
        const IconComponent = stat.icon;

        return (
          <button
            key={stat.level}
            onClick={() => onLevelChange(isSelected ? 'ALL' : stat.level)}
            className={`group relative overflow-hidden ${themeClasses.card} rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${
              isSelected 
                ? `ring-2 ring-blue-500 shadow-lg scale-[1.02] bg-gradient-to-br ${stat.bgGradient}` 
                : isFilterActive 
                  ? 'opacity-60 hover:opacity-90' 
                  : 'hover:scale-[1.02] hover:shadow-xl'
            } cursor-pointer ${stat.borderColor}`}
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header with icon and count */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} text-white shadow-sm`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    isDark 
                      ? 'text-white' 
                      : 'bg-gradient-to-br bg-clip-text text-transparent from-gray-900 to-gray-600'
                  }`}>
                    {stat.count.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Label and badge */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${stat.textColor}`}>
                  {stat.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stat.badgeColor}`}>
                  {stat.level}
                </span>
              </div>

              {/* Active filter indicator */}
              {isSelected && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Filter className="w-3 h-3" />
                  <span>Filtering active - click to clear</span>
                </div>
              )}

              {/* Hover effect indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: `linear-gradient(to right, rgb(59 130 246), rgb(147 51 234))`}} />
            </div>
          </button>
        );
      })}
    </div>
  );
}; 