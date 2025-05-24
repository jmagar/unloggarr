import { useState, useEffect, useCallback } from 'react';
import { LogEntry } from '../types';
import { fetchLogs as fetchLogsService, fetchAvailableLogFiles as fetchAvailableLogFilesService } from '../services/logService';
import { filterLogs } from '../utils/logParser';
import { SAMPLE_LOGS, DEFAULT_LOG_FILE, DEFAULT_TAIL_LINES, DEFAULT_SELECTED_LEVEL } from '../utils/constants';

/**
 * Hook for managing log state and operations
 * @returns Log state and actions
 */
export const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS);
  const [availableLogFiles, setAvailableLogFiles] = useState<string[]>([DEFAULT_LOG_FILE]);
  const [selectedLogFile, setSelectedLogFile] = useState(DEFAULT_LOG_FILE);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [tailLines, setTailLines] = useState(DEFAULT_TAIL_LINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(DEFAULT_SELECTED_LEVEL);

  // Fetch available log files
  const fetchAvailableLogFiles = useCallback(async () => {
    const files = await fetchAvailableLogFilesService();
    if (files.length > 0) {
      setAvailableLogFiles(files);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async (logFile?: string) => {
    setIsLoading(true);
    const targetFile = logFile || selectedLogFile;
    
    try {
      const fetchedLogs = await fetchLogsService(targetFile, tailLines);
      if (fetchedLogs.length > 0) {
        setLogs(fetchedLogs);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLogFile, tailLines]);

  // Get filtered logs
  const filteredLogs = filterLogs(logs, searchTerm, selectedLevel);

  // Load available log files on mount
  useEffect(() => {
    fetchAvailableLogFiles();
  }, [fetchAvailableLogFiles]);

  // Fetch logs when log file or tail lines change
  useEffect(() => {
    fetchLogs(selectedLogFile);
  }, [fetchLogs, selectedLogFile]);

  return {
    // State
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

    // Actions
    setSelectedLogFile,
    setSelectedLog,
    setTailLines,
    setSearchTerm,
    setSelectedLevel,
    fetchLogs,
    fetchAvailableLogFiles
  };
}; 