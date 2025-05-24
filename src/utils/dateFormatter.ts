/**
 * Format timestamp for display
 * @param timestamp - ISO timestamp string
 * @returns Formatted timestamp string
 */
export const formatTimestamp = (timestamp: string): string => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
};

/**
 * Format relative time
 * @param timestamp - ISO timestamp string
 * @returns Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: string): string => {
  try {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatTimestamp(timestamp);
  } catch {
    return timestamp;
  }
}; 