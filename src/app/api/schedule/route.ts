import { NextRequest, NextResponse } from 'next/server';

// Store the schedule information
const scheduleInfo = {
  enabled: false,
  schedule: process.env.UNLOGGARR_SCHEDULE || '0 * * * *',
  lastRun: null as Date | null,
  nextRun: null as Date | null,
  status: 'stopped' as 'running' | 'stopped' | 'error'
};

// Parse cron expression to get next run time
function getNextRunTime(cronExpression: string): Date {
  // Simple cron parser for basic expressions like "0 * * * *" (every hour)
  const [minute, hour] = cronExpression.split(' ');
  
  const now = new Date();
  const next = new Date(now);
  
  // For "0 * * * *" (every hour at minute 0)
  if (minute === '0' && hour === '*') {
    next.setMinutes(0, 0, 0);
    if (now.getMinutes() >= 0) {
      next.setHours(next.getHours() + 1);
    }
  }
  // For "0 0 * * *" (daily at midnight)
  else if (minute === '0' && hour === '0') {
    next.setHours(0, 0, 0, 0);
    if (now.getHours() >= 0) {
      next.setDate(next.getDate() + 1);
    }
  }
  // For "*/15 * * * *" (every 15 minutes)
  else if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2));
    const nextMinute = Math.ceil(now.getMinutes() / interval) * interval;
    next.setMinutes(nextMinute, 0, 0);
    if (nextMinute >= 60) {
      next.setHours(next.getHours() + 1);
      next.setMinutes(0, 0, 0);
    }
  }
  // Default: next hour
  else {
    next.setHours(next.getHours() + 1, 0, 0, 0);
  }
  
  return next;
}

// Check if it's time to run
function shouldRunNow(cronExpression: string): boolean {
  const [minute, hour] = cronExpression.split(' ');
  const now = new Date();
  
  // Check minute
  if (minute !== '*' && !minute.startsWith('*/')) {
    if (parseInt(minute) !== now.getMinutes()) return false;
  } else if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2));
    if (now.getMinutes() % interval !== 0) return false;
  }
  
  // Check hour
  if (hour !== '*' && parseInt(hour) !== now.getHours()) return false;
  
  // For now, we'll only support minute and hour patterns
  return true;
}

// Run the scheduled analysis
async function runScheduledAnalysis() {
  try {
    console.log('🕐 Triggering scheduled analysis...');
    scheduleInfo.status = 'running';
    scheduleInfo.lastRun = new Date();
    
    // Call the scheduled analysis endpoint
    const response = await fetch('http://localhost:3000/api/scheduled-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logFile: '/var/log/syslog',
        tailLines: 1000,
        sendNotification: true
      })
    });
    
    if (response.ok) {
      console.log('✅ Scheduled analysis completed successfully');
      scheduleInfo.status = 'stopped';
    } else {
      console.error('❌ Scheduled analysis failed:', response.status);
      scheduleInfo.status = 'error';
    }
    
    // Calculate next run time
    scheduleInfo.nextRun = getNextRunTime(scheduleInfo.schedule);
    
  } catch (error) {
    console.error('💥 Error running scheduled analysis:', error);
    scheduleInfo.status = 'error';
  }
}

// Simple scheduler that checks every minute
let schedulerInterval: NodeJS.Timeout | null = null;

function startScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }
  
  scheduleInfo.enabled = true;
  scheduleInfo.nextRun = getNextRunTime(scheduleInfo.schedule);
  
  schedulerInterval = setInterval(() => {
    if (scheduleInfo.enabled && shouldRunNow(scheduleInfo.schedule)) {
      runScheduledAnalysis();
    }
  }, 60000); // Check every minute
  
  console.log('⏰ Scheduler started with cron:', scheduleInfo.schedule);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  
  scheduleInfo.enabled = false;
  scheduleInfo.nextRun = null;
  scheduleInfo.status = 'stopped';
  
  console.log('⏹️ Scheduler stopped');
}

// GET: Get current schedule status
export async function GET() {
  return NextResponse.json({
    success: true,
    schedule: {
      ...scheduleInfo,
      cronExpression: scheduleInfo.schedule,
      isRunning: scheduleInfo.enabled,
      environment: {
        schedule: process.env.UNLOGGARR_SCHEDULE,
        gotifyConfigured: !!(process.env.GOTIFY_URL && process.env.GOTIFY_TOKEN),
        anthropicConfigured: !!process.env.ANTHROPIC_API_KEY
      }
    }
  });
}

// POST: Control the scheduler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, schedule } = body;
    
    switch (action) {
      case 'start':
        if (schedule) {
          scheduleInfo.schedule = schedule;
        }
        startScheduler();
        break;
        
      case 'stop':
        stopScheduler();
        break;
        
      case 'trigger':
        // Manual trigger
        await runScheduledAnalysis();
        break;
        
      case 'status':
        // Just return current status
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: start, stop, trigger, status' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      schedule: {
        ...scheduleInfo,
        cronExpression: scheduleInfo.schedule,
        isRunning: scheduleInfo.enabled
      },
      message: `Scheduler ${action} completed`
    });
    
  } catch (error) {
    console.error('💥 Error in schedule route:', error);
    return NextResponse.json(
      { success: false, error: 'Schedule operation failed' },
      { status: 500 }
    );
  }
}

// Auto-start scheduler if enabled in environment
if (process.env.UNLOGGARR_SCHEDULE) {
  console.log('🚀 Auto-starting scheduler from environment configuration...');
  console.log('📅 Schedule:', process.env.UNLOGGARR_SCHEDULE);
  console.log('🔧 Environment:', process.env.NODE_ENV);
  startScheduler();
} 