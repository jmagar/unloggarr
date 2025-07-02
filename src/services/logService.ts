import { UnraidLogResponse, AvailableLogsResponse, LogEntry } from '../types';
import { parseLogLine } from '../utils/logParser';
import { cachedFetch } from '../utils/cache';

/**
 * Fetch available log files from the API
 * @returns Promise resolving to available log files or empty array on error
 */
export const fetchAvailableLogFiles = async (): Promise<string[]> => {
  try {
    console.log('🔍 Fetching available log files...');
    
    // Use cached fetch with 5-minute TTL since log files don't change frequently
    const data: AvailableLogsResponse = await cachedFetch(
      '/api/available-logs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      },
      5 * 60 * 1000, // 5 minutes TTL
      'available-logs' // Custom cache key
    );
    
    console.log('📄 Frontend received available logs response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.available_logs && data.available_logs.length > 0) {
      console.log('✅ Successfully loaded available log files:', data.available_logs);
      return data.available_logs;
    } else {
      console.error('❌ Available logs API returned success=false or no log files');
      console.error('Available logs details:', {
        success: data.success,
        availableLogsExists: !!data.available_logs,
        availableLogsLength: data.available_logs?.length,
        fullData: data
      });
      return [];
    }
  } catch (error) {
    console.error('💥 Error fetching available log files:', error);
    return [];
  }
};

/**
 * Fetch logs from the API
 * @param logFile - Path to the log file
 * @param tailLines - Number of lines to fetch
 * @returns Promise resolving to parsed log entries or empty array on error
 */
export const fetchLogs = async (logFile: string, tailLines: number): Promise<LogEntry[]> => {
  try {
    console.log(`🔍 Fetching logs from ${logFile} (${tailLines} lines)...`);
    
    const requestBody = {
      log_file_path: logFile,
      tail_lines: tailLines
    };
    console.log('📤 Request body:', requestBody);

    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Logs response status:', response.status);

    if (response.ok) {
      const data: UnraidLogResponse = await response.json();
      console.log('📄 Frontend received logs response:', JSON.stringify(data, null, 2));
      
      // Handle different response formats
      let logLines: string[] = [];
      
      if (data.logs && Array.isArray(data.logs)) {
        // If logs is already an array
        logLines = data.logs;
      } else if (data.content && typeof data.content === 'string') {
        // Handle MCP Unraid format with content field
        logLines = data.content.split('\n').filter((line: string) => line.trim());
      } else if (data && typeof data === 'object') {
        // Look for log data in various possible properties
        const possibleLogData = data.logs || data.data || data.result;
        if (typeof possibleLogData === 'string') {
          logLines = possibleLogData.split('\n').filter((line: string) => line.trim());
        } else if (Array.isArray(possibleLogData)) {
          logLines = possibleLogData;
        }
      }

      console.log(`📊 Found ${logLines.length} log lines to parse`);
      
      if (logLines.length > 0) {
        const parsedLogs = logLines.map((line, index) => parseLogLine(line, index));
        console.log(`✅ Successfully parsed ${parsedLogs.length} log entries`);
        return parsedLogs;
      } else {
        console.error('❌ No log lines found in response');
        console.error('Response structure:', {
          hasSuccess: 'success' in data,
          success: data.success,
          hasLogs: 'logs' in data,
          logsType: typeof data.logs,
          totalLines: data.totalLines || data.total_lines,
          responseKeys: Object.keys(data),
          sampleData: JSON.stringify(data).substring(0, 200) + '...'
        });
        return [];
      }
    } else {
      console.error('❌ Failed to fetch logs. Status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return [];
    }
  } catch (error) {
    console.error('💥 Error fetching logs:', error);
    console.error('This might be a CORS issue - check browser network tab');
    return [];
  }
}; 