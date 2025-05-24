'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { getThemeClasses } from '../../../utils/theme';
import { useLogs } from '../../../hooks/useLogs';
import { useTheme } from '../../../hooks/useTheme';
import { useNotifications } from '../../../hooks/useNotifications';
import { useScheduler } from '../../../hooks/useScheduler';
import { useLogAnalysis } from '../../../hooks/useLogAnalysis';
import { useSettings } from '../../../hooks/useSettings';
import { Header } from '../Header';
import { LogControls } from '../LogControls';
import { LogStats } from './LogStats';
import { LogEntry } from './LogEntry';
import { ScrollToTop } from './ScrollToTop';
import { SkeletonLoader, EmptyState } from '../common';
import { AnalysisModal, SchedulerModal, SettingsModal, LogDetailModal } from '../Modals';

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
  // Client-side rendering check to prevent hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // State management through custom hooks
  const { theme, showSettings, setShowSettings, toggleTheme } = useTheme();
  const {
    logs,
    availableLogFiles,
    selectedLogFile,
    selectedLog,
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
    notifications,
    notificationCount,
    showNotifications,
    setShowNotifications
  } = useNotifications();
  
  const {
    schedulerStatus,
    showScheduler,
    setShowScheduler,
    controlScheduler
  } = useScheduler();
  
  const { 
    isAnalyzing, 
    analysisResult,
    showAnalysis,
    tokenUsage,
    setShowAnalysis,
    analyzeLogsWithAI 
  } = useLogAnalysis();

  const {
    settings,
    startAutoRefresh,
    stopAutoRefresh
  } = useSettings();

  // Get theme classes
  const themeClasses = getThemeClasses(theme);

  // Auto-refresh functionality
  useEffect(() => {
    if (settings.autoRefresh && !isLoading) {
      const timer = startAutoRefresh(() => {
        console.log('🔄 Auto-refreshing logs...');
        fetchLogs();
      });
      return () => {
        if (timer) clearInterval(timer);
      };
    } else {
      stopAutoRefresh();
    }
  }, [settings.autoRefresh, settings.refreshInterval, isLoading, fetchLogs, startAutoRefresh, stopAutoRefresh]);

  // Event handlers
  const handleAnalyze = () => {
    analyzeLogsWithAI(filteredLogs, selectedLogFile, selectedLevel);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  // Apply max log entries setting with memoization for performance
  const limitedFilteredLogs = useMemo(() => {
    return filteredLogs.slice(0, settings.maxLogEntries);
  }, [filteredLogs, settings.maxLogEntries]);

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
          notifications={notifications || []}
          showNotifications={showNotifications}
          schedulerStatus={schedulerStatus}
          onThemeToggle={toggleTheme}
          onNotificationsClick={() => setShowNotifications(!showNotifications)}
          onNotificationsClose={() => setShowNotifications(false)}
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
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Log Entries ({limitedFilteredLogs.length.toLocaleString()})
                </h2>
                {filteredLogs.length > settings.maxLogEntries && (
                  <p className={`text-xs ${themeClasses.text.secondary} mt-1`}>
                    Showing {settings.maxLogEntries.toLocaleString()} of {filteredLogs.length.toLocaleString()} entries
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {settings.autoRefresh && (
                  <div className={`text-xs ${themeClasses.text.secondary} flex items-center gap-2`}>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Auto-refresh: {settings.refreshInterval}s</span>
                  </div>
                )}
                {isConnected && (
                  <div className={`text-sm ${themeClasses.text.secondary} flex items-center gap-2`}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>from {selectedLogFile}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <SkeletonLoader theme={theme} variant="logEntry" count={8} />
            ) : limitedFilteredLogs.length === 0 ? (
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
              <div className={`${settings.compactView ? 'divide-y-0' : 'divide-y'} ${theme === 'dark' ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
                {(limitedFilteredLogs || []).map((log, index) => (
                  <div
                    key={log.id || `log-${index}`}
                    className={settings.compactView ? 'py-1' : ''}
                  >
                    <LogEntry
                      log={log}
                      index={index}
                      theme={theme}
                      searchTerm={searchTerm}
                      onClick={() => setSelectedLog(log)}
                      compact={settings.compactView}
                      showTimestamps={settings.showTimestamps}
                      highlightErrors={settings.highlightErrors}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Components - Only render on client side to prevent hydration issues */}
        {isClient && (
          <>
            <AnalysisModal
              theme={theme}
              isOpen={showAnalysis}
              onClose={() => setShowAnalysis(false)}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              tokenUsage={tokenUsage}
            />

            <SchedulerModal
              theme={theme}
              isOpen={showScheduler}
              onClose={() => setShowScheduler(false)}
              schedulerStatus={schedulerStatus}
              onControlScheduler={controlScheduler}
            />

            <SettingsModal
              theme={theme}
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
              onThemeChange={toggleTheme}
              onSettingsChange={(newSettings) => {
                console.log('Settings updated:', newSettings);
                // Settings are automatically saved by the useSettings hook
              }}
            />

            <LogDetailModal
              theme={theme}
              isOpen={!!selectedLog}
              onClose={() => setSelectedLog(null)}
              log={selectedLog}
            />
          </>
        )}

      </div>
      
      {/* Scroll to top button */}
      <ScrollToTop theme={theme} />
    </div>
  );
};

export default LogViewer; 