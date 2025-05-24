'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getThemeClasses } from '../../../utils/theme';
import { useLogs } from '../../../hooks/useLogs';
import { useTheme } from '../../../hooks/useTheme';
import { useNotifications } from '../../../hooks/useNotifications';
import { useScheduler } from '../../../hooks/useScheduler';
import { useLogAnalysis } from '../../../hooks/useLogAnalysis';
import { Header } from '../Header';
import { LogControls } from '../LogControls';
import { LogStats } from './LogStats';
import { LogEntry } from './LogEntry';
import { ScrollToTop } from './ScrollToTop';
import { SkeletonLoader, EmptyState } from '../common';

/**
 * Main LogViewer component - decomposed and modular
 * 
 * This component orchestrates all the sub-components and hooks to provide
 * a complete log viewing and analysis experience. It has been decomposed
 * from a monolithic 1112-line component into smaller, focused modules.
 * 
 * Architecture:
 * - Uses custom hooks for state management (useLogs, useTheme, etc.)
 * - Delegates UI rendering to specialized components (Header, LogControls, etc.)
 * - Separates concerns: API calls in services, utilities in utils, types in types
 * - Maintains the same functionality while improving maintainability
 */
const LogViewer: React.FC = () => {
  // State management through custom hooks
  const { theme, showSettings, setShowSettings, toggleTheme } = useTheme();
  const { 
    logs, 
    availableLogFiles, 
    selectedLogFile, 
    isLoading, 
    isConnected, 
    tailLines, 
    searchTerm, 
    selectedLevel, 
    filteredLogs,
    setSelectedLogFile,
    setSelectedLog,
    setTailLines,
    setSearchTerm,
    setSelectedLevel,
    fetchLogs
  } = useLogs();
  
  const { 
    notificationCount, 
    showNotifications, 
    setShowNotifications 
  } = useNotifications();
  
  const { 
    schedulerStatus, 
    showScheduler, 
    setShowScheduler 
  } = useScheduler();
  
  const { 
    isAnalyzing, 
    analyzeLogsWithAI 
  } = useLogAnalysis();

  // Get theme classes
  const themeClasses = getThemeClasses(theme);

  // Event handlers
  const handleAnalyze = () => {
    analyzeLogsWithAI(filteredLogs, selectedLogFile, selectedLevel);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  return (
    <div className={`min-h-screen ${themeClasses.container} transition-colors duration-300 relative overflow-x-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <Header
          theme={theme}
          isConnected={isConnected}
          notificationCount={notificationCount}
          schedulerStatus={schedulerStatus}
          onThemeToggle={toggleTheme}
          onNotificationsClick={() => setShowNotifications(!showNotifications)}
          onSchedulerClick={() => setShowScheduler(!showScheduler)}
          onSettingsClick={() => setShowSettings(!showSettings)}
        />

        {/* Controls */}
        <div className="mb-8">
          <LogControls
            theme={theme}
            availableLogFiles={availableLogFiles}
            selectedLogFile={selectedLogFile}
            tailLines={tailLines}
            searchTerm={searchTerm}
            selectedLevel={selectedLevel}
            filteredLogs={filteredLogs}
            isLoading={isLoading}
            isAnalyzing={isAnalyzing}
            onLogFileChange={setSelectedLogFile}
            onTailLinesChange={setTailLines}
            onSearchChange={setSearchTerm}
            onLevelChange={setSelectedLevel}
            onRefresh={handleRefresh}
            onAnalyze={handleAnalyze}
          />
        </div>

        {/* Enhanced Stats Component */}
        <LogStats
          theme={theme}
          logs={logs}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
        />

        {/* Enhanced Log Viewer */}
        <div className={`${themeClasses.card} rounded-xl shadow-lg border overflow-hidden backdrop-blur-sm`}>
          {/* Header with gradient background */}
          <div className={`border-b px-6 py-4 bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-gray-800 via-gray-800 to-gray-700 border-gray-700' 
              : 'from-gray-50 via-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Log Entries ({filteredLogs.length.toLocaleString()})
              </h2>
              {isConnected && (
                <div className={`text-sm ${themeClasses.text.secondary} flex items-center gap-2`}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>from {selectedLogFile}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <SkeletonLoader theme={theme} variant="logEntry" count={8} />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                theme={theme}
                variant={logs.length === 0 ? 'noLogs' : 'noResults'}
                action={{
                  label: 'Refresh Logs',
                  onClick: handleRefresh,
                  icon: <RefreshCw className="w-4 h-4" />
                }}
              />
            ) : (
              <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
                {filteredLogs.map((log, index) => (
                  <LogEntry
                    key={log.id}
                    log={log}
                    index={index}
                    theme={theme}
                    searchTerm={searchTerm}
                    onClick={() => setSelectedLog(log)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TODO: Add modal components here */}
        {/* - LogDetailModal */}
        {/* - AnalysisModal */}
        {/* - SchedulerModal */}
        {/* - SettingsModal */}
        {/* - NotificationsPopover */}

      </div>
      
      {/* Scroll to top button */}
      <ScrollToTop theme={theme} />
    </div>
  );
};

export default LogViewer; 