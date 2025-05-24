import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { getMcpoEndpoint, MCPO_HEADERS } from '@/lib/mcpo';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  source?: string;
  rawLine?: string;
}

// Parse log line to extract level and other info
const parseLogLine = (line: string, index: number): LogEntry => {
  let level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' = 'INFO';
  
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

// Send notification to Gotify
async function sendGotifyNotification(title: string, message: string, priority: number = 5) {
  const gotifyUrl = process.env.GOTIFY_URL;
  const gotifyToken = process.env.GOTIFY_TOKEN;

  if (!gotifyUrl || !gotifyToken) {
    console.log('⚠️ Gotify URL or token not configured, skipping notification');
    return;
  }

  try {
    console.log('📤 Sending Gotify notification...');
    const response = await fetch(`${gotifyUrl}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gotify-Key': gotifyToken,
      },
      body: JSON.stringify({
        title,
        message,
        priority,
      }),
    });

    if (response.ok) {
      console.log('✅ Gotify notification sent successfully');
    } else {
      console.error('❌ Failed to send Gotify notification:', response.status, await response.text());
    }
  } catch (error) {
    console.error('💥 Error sending Gotify notification:', error);
  }
}

// Fetch logs from Unraid
async function fetchUnraidLogs(logFile: string = '/var/log/syslog', tailLines: number = 1000): Promise<LogEntry[]> {
  try {
    console.log(`🔍 Fetching logs from ${logFile} (${tailLines} lines)...`);
    
    const response = await fetch(getMcpoEndpoint('get_logs'), {
      method: 'POST',
      headers: MCPO_HEADERS,
      body: JSON.stringify({
        log_file_path: logFile,
        tail_lines: tailLines
      })
    });

    if (!response.ok) {
      console.error(`❌ MCP server error: ${response.status} ${response.statusText}`);
      throw new Error(`MCP server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for error in response data
    if (data.error) {
      console.error(`❌ MCP server error in response: ${data.error}`);
      throw new Error(`MCP server error: ${data.error}`);
    }
    
    // Parse logs from Unraid response
    let logLines: string[] = [];
    
    if (data.content && typeof data.content === 'string') {
      logLines = data.content.split('\n').filter((line: string) => line.trim());
    } else if (data.logs && Array.isArray(data.logs)) {
      logLines = data.logs;
    } else {
      console.warn('⚠️ Unexpected response format from MCP server:', data);
    }
    
    console.log(`📊 Found ${logLines.length} log lines to parse`);
    
    const parsedLogs = logLines.map((line, index) => parseLogLine(line, index));
    console.log(`✅ Successfully parsed ${parsedLogs.length} log entries`);
    
    return parsedLogs;
  } catch (error) {
    console.error('💥 Error fetching Unraid logs:', error);
    throw error; // Re-throw instead of returning empty array
  }
}

// Analyze logs with AI and return summary
async function analyzeLogsWithAI(logs: LogEntry[], logFile: string): Promise<{ summary: string; tokenUsage?: unknown }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  console.log(`🤖 Analyzing ${logs.length} log entries from ${logFile}...`);

  // Prepare log data for analysis
  let logSample: LogEntry[];
  
  if (logs.length <= 1000) {
    logSample = logs;
  } else {
    // For larger datasets, use intelligent sampling
    const errorLogs = logs.filter(log => log.level === 'ERROR');
    const warnLogs = logs.filter(log => log.level === 'WARN');
    const infoLogs = logs.filter(log => log.level === 'INFO');
    const debugLogs = logs.filter(log => log.level === 'DEBUG');
    
    logSample = [
      ...errorLogs.slice(0, 200),
      ...warnLogs.slice(0, 200),
      ...infoLogs.slice(0, 300),
      ...debugLogs.slice(0, 300),
    ].slice(0, 1000);
  }
  
  const logText = logSample.map((log: LogEntry) => 
    `[${log.timestamp}] ${log.level}: ${log.message}`
  ).join('\n');
  
  const logStats = {
    ERROR: logs.filter((log: LogEntry) => log.level === 'ERROR').length,
    WARN: logs.filter((log: LogEntry) => log.level === 'WARN').length,
    INFO: logs.filter((log: LogEntry) => log.level === 'INFO').length,
    DEBUG: logs.filter((log: LogEntry) => log.level === 'DEBUG').length,
    total: logs.length
  };

  const analysisPrompt = `You are an expert system administrator analyzing Unraid server logs for an automated monitoring system.

**CONTEXT:**
- Log file: ${logFile}
- Total logs analyzed: ${logs.length}
- Log level breakdown: ${JSON.stringify(logStats)}
- Analysis time: ${new Date().toISOString()}

**LOG DATA:**
${logText}

**REQUIREMENTS:**
Provide a CONCISE summary suitable for push notifications. Focus on:

1. **System Health Status**: One-line overall assessment
2. **Critical Issues**: List only urgent problems requiring immediate attention
3. **Key Warnings**: Important patterns or recurring issues
4. **Action Items**: Specific next steps if any issues found

Keep the summary under 500 words and prioritize actionable information. Use clear, non-technical language when possible.`;

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt: analysisPrompt,
    temperature: 0.3,
  });

  // Collect the full response
  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  // Get token usage
  const finalResult = await result;
  let usage;
  
  try {
    usage = await finalResult.usage;
  } catch {
    usage = finalResult.usage;
  }

  return {
    summary: fullText,
    tokenUsage: usage
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🕐 Starting scheduled log analysis...');
    
    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}));
    const {
      logFile = '/var/log/syslog',
      tailLines = 1000,
      sendNotification = true
    } = body;

    // Fetch logs from Unraid
    const logs = await fetchUnraidLogs(logFile, tailLines);
    
    if (logs.length === 0) {
      const errorMsg = 'No logs found for analysis';
      console.error('❌', errorMsg);
      
      if (sendNotification) {
        await sendGotifyNotification(
          '⚠️ unloggarr Alert',
          `Scheduled analysis failed: ${errorMsg}`,
          8
        );
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMsg 
      }, { status: 400 });
    }

    // Analyze logs with AI
    const { summary, tokenUsage } = await analyzeLogsWithAI(logs, logFile);
    
    // Count critical issues for notification priority
    const errorCount = logs.filter(log => log.level === 'ERROR').length;
    const warnCount = logs.filter(log => log.level === 'WARN').length;
    
    // Determine notification priority based on issues found
    let priority = 5; // Normal
    if (errorCount > 0) {
      priority = 8; // High
    } else if (warnCount > 5) {
      priority = 6; // Medium-High
    }

    // Send Gotify notification with analysis summary
    if (sendNotification) {
      const title = errorCount > 0 
        ? `🚨 Unraid Alert: ${errorCount} Errors Found`
        : warnCount > 5
        ? `⚠️ Unraid Warning: ${warnCount} Warnings`
        : '✅ Unraid Status: System Normal';

      const notificationMessage = `📊 **Log Analysis Summary**
**File:** ${logFile}
**Logs Analyzed:** ${logs.length}
**Issues:** ${errorCount} errors, ${warnCount} warnings

${summary}

---
*Automated analysis • ${new Date().toLocaleString()}*${tokenUsage ? ` • ${(tokenUsage as any).totalTokens || 0} tokens` : ''}`;

      await sendGotifyNotification(title, notificationMessage, priority);
    }

    console.log('✅ Scheduled analysis completed successfully');

    return NextResponse.json({
      success: true,
      analysis: {
        logFile,
        logsAnalyzed: logs.length,
        errorCount,
        warnCount,
        summary,
        tokenUsage,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 Error in scheduled analysis:', error);
    
    // Send error notification
    if (process.env.GOTIFY_URL && process.env.GOTIFY_TOKEN) {
      await sendGotifyNotification(
        '🔥 unloggarr Error',
        `Scheduled analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        10
      );
    }

    return NextResponse.json(
      { success: false, error: 'Scheduled analysis failed' },
      { status: 500 }
    );
  }
}

// Also support GET for simple triggering
export async function GET() {
  return POST(new NextRequest('http://localhost/api/scheduled-analysis', { method: 'POST' }));
} 