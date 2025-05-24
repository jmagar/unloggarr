import { LogEntry, LogLevel } from '../types';

/**
 * Parse log line to extract level and other info
 * @param line - Raw log line to parse
 * @param index - Index for unique ID generation
 * @returns Parsed LogEntry object
 */
export const parseLogLine = (line: string, index: number): LogEntry => {
  let level: LogLevel = 'INFO';
  
  // Try to detect log level from the line
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('error') || lowerLine.includes('fail') || lowerLine.includes('critical')) {
    level = 'ERROR';
  } else if (lowerLine.includes('warn') || lowerLine.includes('warning')) {
    level = 'WARN';
  } else if (lowerLine.includes('debug') || lowerLine.includes('trace')) {
    level = 'DEBUG';
  }

  // Parse timestamp from Unraid log format: "May 23 20:00:01" 
  let extractedTimestamp = new Date().toISOString();
  
  // Match patterns like "May 23 20:00:01" or "Jan  1 08:30:45"
  const unraidTimestampMatch = line.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})/);
  if (unraidTimestampMatch) {
    const [, month, day, time] = unraidTimestampMatch;
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNum = monthNames.indexOf(month);
    
    if (monthNum !== -1) {
      const dateStr = `${currentYear}-${String(monthNum + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}`;
      extractedTimestamp = new Date(dateStr).toISOString();
    }
  }

  return {
    id: index + 1,
    timestamp: extractedTimestamp,
    level,
    message: line,
    rawLine: line
  };
};

/**
 * Filter logs based on search term and level
 * @param logs - Array of log entries to filter
 * @param searchTerm - Search term to filter by
 * @param selectedLevel - Log level to filter by
 * @returns Filtered log entries
 */
export const filterLogs = (
  logs: LogEntry[], 
  searchTerm: string, 
  selectedLevel: string
): LogEntry[] => {
  return logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });
}; 