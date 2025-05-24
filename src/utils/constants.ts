import { LogEntry } from '../types';

// Log level options for filtering
export const LOG_LEVELS = ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'] as const;

// Tail line options
export const TAIL_LINE_OPTIONS = [
  { value: 100, label: '100 lines' },
  { value: 500, label: '500 lines' },
  { value: 1000, label: '1000 lines' },
  { value: 5000, label: '5000 lines' },
  { value: 10000, label: '10000 lines' }
] as const;

// Default values
export const DEFAULT_LOG_FILE = '/var/log/syslog';
export const DEFAULT_TAIL_LINES = 5000;
export const DEFAULT_SELECTED_LEVEL = 'ALL';

// Sample log data for fallback
export const SAMPLE_LOGS: LogEntry[] = [
  {
    id: 1,
    timestamp: '2024-01-15T10:30:15.123Z',
    level: 'INFO',
    message: 'Application started successfully on port 3000',
    source: 'server.js'
  },
  {
    id: 2,
    timestamp: '2024-01-15T10:30:16.456Z',
    level: 'INFO',
    message: 'Connected to database: mongodb://localhost:27017/myapp',
    source: 'database.js'
  },
  {
    id: 3,
    timestamp: '2024-01-15T10:31:02.789Z',
    level: 'WARN',
    message: 'Deprecated API endpoint /api/v1/users accessed',
    source: 'api.js'
  },
  {
    id: 4,
    timestamp: '2024-01-15T10:31:15.234Z',
    level: 'ERROR',
    message: 'Failed to connect to external API: timeout after 5000ms',
    source: 'external-api.js'
  },
  {
    id: 5,
    timestamp: '2024-01-15T10:31:20.567Z',
    level: 'DEBUG',
    message: 'User authentication token validated for user ID: 12345',
    source: 'auth.js'
  },
  {
    id: 6,
    timestamp: '2024-01-15T10:32:01.890Z',
    level: 'ERROR',
    message: 'Database query failed: SELECT * FROM users WHERE active = true',
    source: 'database.js'
  },
  {
    id: 7,
    timestamp: '2024-01-15T10:32:15.123Z',
    level: 'INFO',
    message: 'Cache cleared successfully for key: user_sessions',
    source: 'cache.js'
  }
]; 