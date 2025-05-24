import { SchedulerStatus, SchedulerAction } from '../types';

/**
 * Fetch scheduler status from the API
 * @returns Promise resolving to scheduler status or null on error
 */
export const fetchSchedulerStatus = async (): Promise<SchedulerStatus | null> => {
  try {
    const response = await fetch('/api/schedule');
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.schedule;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch scheduler status:', error);
    return null;
  }
};

/**
 * Control scheduler (start, stop, or trigger)
 * @param action - Action to perform
 * @param schedule - Optional schedule string for start action
 * @returns Promise resolving to updated scheduler status or null on error
 */
export const controlScheduler = async (
  action: SchedulerAction, 
  schedule?: string
): Promise<SchedulerStatus | null> => {
  try {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, schedule })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Scheduler ${action} successful`);
        return data.schedule;
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to ${action} scheduler:`, error);
    return null;
  }
}; 