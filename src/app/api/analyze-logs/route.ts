import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  source?: string;
  rawLine?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { logs, logFile, selectedLevel }: { 
      logs: LogEntry[], 
      logFile: string, 
      selectedLevel: string 
    } = await request.json();

    if (!logs || logs.length === 0) {
      return NextResponse.json({ error: 'No logs provided for analysis' }, { status: 400 });
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    console.log(`🤖 Analyzing ${logs.length} log entries from ${logFile} (level: ${selectedLevel})`);

    // Prepare log data for analysis - much more comprehensive sampling
    let logSample: LogEntry[];
    
    if (logs.length <= 1000) {
      // If we have 1000 or fewer logs, analyze them all
      logSample = logs;
    } else {
      // For larger datasets, use intelligent sampling
      const errorLogs = logs.filter(log => log.level === 'ERROR');
      const warnLogs = logs.filter(log => log.level === 'WARN');
      const infoLogs = logs.filter(log => log.level === 'INFO');
      const debugLogs = logs.filter(log => log.level === 'DEBUG');
      
      // Prioritize errors and warnings, then sample from others
      logSample = [
        ...errorLogs.slice(0, 200),           // All errors up to 200
        ...warnLogs.slice(0, 200),            // All warnings up to 200
        ...infoLogs.slice(0, 300),            // Recent info logs
        ...debugLogs.slice(0, 300),           // Recent debug logs
      ].slice(0, 1000); // Cap at 1000 total logs
    }
    
    const logText = logSample.map((log: LogEntry) => 
      `[${log.timestamp}] ${log.level}: ${log.message}`
    ).join('\n');
    
    console.log(`📊 Analyzing ${logSample.length} out of ${logs.length} total log entries`);

    // Count log levels for context
    const logStats = {
      ERROR: logs.filter((log: LogEntry) => log.level === 'ERROR').length,
      WARN: logs.filter((log: LogEntry) => log.level === 'WARN').length,
      INFO: logs.filter((log: LogEntry) => log.level === 'INFO').length,
      DEBUG: logs.filter((log: LogEntry) => log.level === 'DEBUG').length,
      total: logs.length
    };

    const analysisPrompt = `You are an expert system administrator analyzing Unraid server logs. 

**CONTEXT:**
- Log file: ${logFile}
- Filter level: ${selectedLevel}
- Total logs in dataset: ${logs.length}
- Logs being analyzed: ${logSample.length}
- Log level breakdown: ${JSON.stringify(logStats)}
- Sampling strategy: ${logs.length <= 1000 ? 'Complete analysis of all logs' : 'Intelligent sampling prioritizing errors and warnings'}

**LOG DATA:**
${logText}

**ANALYSIS REQUIREMENTS:**
Please provide a comprehensive analysis including:

1. **🏥 SYSTEM HEALTH OVERVIEW**
   - Overall system status assessment
   - Critical issues requiring immediate attention

2. **🚨 ERROR ANALYSIS** 
   - Key errors and their potential causes
   - Severity assessment of each error type

3. **⚠️ WARNING PATTERNS**
   - Recurring warnings and their implications
   - Trends that might indicate future problems

4. **💡 RECOMMENDATIONS**
   - Specific actionable steps to resolve issues
   - Preventive measures for better system stability

5. **📊 INSIGHTS**
   - Notable patterns or anomalies
   - Performance or security observations

Format your response in clear markdown with emojis for better readability. Be specific about Unraid-related issues and provide practical solutions.`;

    // Get model from environment variable with fallback
    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    console.log(`🤖 Using AI model: ${modelName}`);

    const result = streamText({
      model: anthropic(modelName),
      prompt: analysisPrompt,
      temperature: 0.3,
    });

    // Create a custom stream that includes token usage at the end
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the text content
          for await (const chunk of result.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          
                  // Get the final result with simplified usage information
        const finalResult = await result;
        console.log('🔢 Final result received');
        
        let usage = null;
        
        // Simplified token usage extraction
        try {
          // Try to get usage directly from the result
          if (finalResult.usage) {
            usage = await Promise.resolve(finalResult.usage);
            console.log('🔢 Token usage extracted:', usage);
          } else {
            console.log('⚠️ No usage information available in result');
          }
        } catch (error) {
          console.log('🔢 Error extracting usage:', error);
        }
          
                  // Send token usage as a final chunk with a special marker
        const tokenData = usage ? {
          promptTokens: (usage as any).promptTokens || (usage as any).inputTokens || 0,
          completionTokens: (usage as any).completionTokens || (usage as any).outputTokens || 0,
          totalTokens: (usage as any).totalTokens || 0
        } : {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };
        
        // Calculate total if not provided
        if (tokenData.totalTokens === 0 && (tokenData.promptTokens > 0 || tokenData.completionTokens > 0)) {
          tokenData.totalTokens = tokenData.promptTokens + tokenData.completionTokens;
        }
        
        console.log('🔢 Final token data:', tokenData);
        const tokenInfo = `\n\n<!--TOKENS:${JSON.stringify(tokenData)}-->`;
        controller.enqueue(new TextEncoder().encode(tokenInfo));
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('💥 Error in analyze-logs API route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze logs' },
      { status: 500 }
    );
  }
} 