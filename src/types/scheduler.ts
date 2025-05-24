export interface SchedulerStatus {
  enabled: boolean;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: string;
  environment?: {
    gotifyConfigured: boolean;
    anthropicConfigured: boolean;
    schedule: string;
  };
}

export interface SchedulerState {
  schedulerStatus: SchedulerStatus | null;
  showScheduler: boolean;
}

export type SchedulerAction = 'start' | 'stop' | 'trigger'; 