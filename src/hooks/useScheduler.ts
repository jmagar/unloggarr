import { useState, useEffect, useCallback } from 'react';
import { SchedulerStatus, SchedulerAction } from '../types';
import { fetchSchedulerStatus as fetchSchedulerStatusService, controlScheduler as controlSchedulerService } from '../services/schedulerService';

/**
 * Hook for managing scheduler state and operations
 * @returns Scheduler state and actions
 */
export const useScheduler = () => {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);

  // Fetch scheduler status
  const fetchSchedulerStatus = useCallback(async () => {
    const status = await fetchSchedulerStatusService();
    setSchedulerStatus(status);
  }, []);

  // Control scheduler
  const controlScheduler = useCallback(async (action: SchedulerAction, schedule?: string) => {
    const newStatus = await controlSchedulerService(action, schedule);
    if (newStatus) {
      setSchedulerStatus(newStatus);
    }
    return newStatus;
  }, []);

  // Load scheduler status on mount
  useEffect(() => {
    fetchSchedulerStatus();
  }, [fetchSchedulerStatus]);

  return {
    // State
    schedulerStatus,
    showScheduler,

    // Actions
    setShowScheduler,
    fetchSchedulerStatus,
    controlScheduler
  };
}; 