import React from 'react';
import { Search, Filter, RefreshCw, Zap } from 'lucide-react';
import { Theme, LogEntry } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { TAIL_LINE_OPTIONS, LOG_LEVELS } from '../../../utils/constants';
import { Button } from '../common';

interface LogControlsProps {
  theme: Theme;
  availableLogFiles: string[];
  selectedLogFile: string;
  tailLines: number;
  searchTerm: string;
  selectedLevel: string;
  filteredLogs: LogEntry[];
  isLoading: boolean;
  isAnalyzing: boolean;
  onLogFileChange: (value: string) => void;
  onTailLinesChange: (value: number) => void;
  onSearchChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onRefresh: () => void;
  onAnalyze: () => void;
}

/**
 * Log controls component with file selection, search, filters, and actions
 */
export const LogControls: React.FC<LogControlsProps> = ({
  theme,
  availableLogFiles,
  selectedLogFile,
  tailLines,
  searchTerm,
  selectedLevel,
  filteredLogs,
  isLoading,
  isAnalyzing,
  onLogFileChange,
  onTailLinesChange,
  onSearchChange,
  onLevelChange,
  onRefresh,
  onAnalyze
}) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`flex flex-wrap gap-4 items-center justify-between ${themeClasses.card} p-6 rounded-xl shadow-sm border`}>
      <div className="flex gap-4 items-center flex-1">
        {/* Log File Selection */}
        <div className="relative">
          <select
            value={selectedLogFile}
            onChange={(e) => onLogFileChange(e.target.value)}
            className={`pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-32 ${themeClasses.input}`}
          >
            {availableLogFiles.map(logFile => (
              <option key={logFile} value={logFile}>{logFile}</option>
            ))}
          </select>
        </div>

        {/* Tail Lines */}
        <div className="relative">
          <select
            value={tailLines}
            onChange={(e) => onTailLinesChange(Number(e.target.value))}
            className={`pl-3 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${themeClasses.input}`}
          >
            {TAIL_LINE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.secondary}`} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
          />
        </div>
        
        {/* Level Filter */}
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.secondary}`} />
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${themeClasses.input}`}
          >
            {LOG_LEVELS.map(level => (
              <option key={level} value={level}>
                {level === 'ALL' ? `All Levels ${selectedLevel !== 'ALL' ? '(Clear Filter)' : ''}` : level}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          theme={theme}
          onClick={onRefresh}
          disabled={isLoading}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
        
        <Button
          variant="primary"
          theme={theme}
          onClick={onAnalyze}
          disabled={isAnalyzing || filteredLogs.length === 0}
          isLoading={isAnalyzing}
          leftIcon={<Zap className="w-4 h-4" />}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </div>
    </div>
  );
}; 