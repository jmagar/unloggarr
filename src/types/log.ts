export interface LogEntry {
  id: number;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  source?: string;
  rawLine?: string;
}

export interface UnraidLogResponse {
  success?: boolean;
  logs?: string[];
  total_lines?: number;
  totalLines?: number;
  log_file?: string;
  startLine?: number;
  // Handle different possible response formats
  content?: string;
  data?: string | string[];
  result?: string | string[];
}

export interface AvailableLogsResponse {
  success: boolean;
  available_logs: string[];
}

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LogFilterOptions {
  searchTerm: string;
  selectedLevel: string;
  tailLines: number;
}

export interface LogState {
  logs: LogEntry[];
  availableLogFiles: string[];
  selectedLogFile: string;
  isLoading: boolean;
  isConnected: boolean;
  selectedLog: LogEntry | null;
} 