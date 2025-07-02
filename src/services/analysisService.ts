import { AnalysisRequest, TokenUsage } from '../types';
import { timeAsync } from '../utils/performance';

/**
 * Result from streaming analysis
 */
export interface AnalysisResult {
  content: string;
  tokenUsage: TokenUsage | null;
  isComplete: boolean;
}

/**
 * Callback for streaming analysis updates
 */
export type AnalysisCallback = (result: AnalysisResult) => void;

/**
 * Analyze logs with AI using streaming response
 * @param request - Analysis request parameters
 * @param onUpdate - Callback for streaming updates
 * @returns Promise that resolves when analysis is complete
 */
export const analyzeLogsWithAI = async (
  request: AnalysisRequest,
  onUpdate: AnalysisCallback
): Promise<void> => {
  await timeAsync(
    'log-analysis',
    async () => {
      console.log(`🤖 Starting AI analysis of ${request.logs.length} logs...`);
      
      const response = await fetch('/api/analyze-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

      // Handle streaming response with timeout and iteration limits
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (reader) {
    let result = '';
    let tokenUsage: TokenUsage | null = null;
    let iterationCount = 0;
    const maxIterations = 10000; // Prevent infinite loops
    const streamTimeout = 30000; // 30 second timeout
    const startTime = Date.now();
    
    try {
      while (true) {
        // Check for timeout
        if (Date.now() - startTime > streamTimeout) {
          console.warn('⏰ Stream processing timeout reached, terminating');
          break;
        }
        
        // Check for iteration limit
        if (iterationCount >= maxIterations) {
          console.warn('🔄 Maximum iterations reached, terminating to prevent infinite loop');
          break;
        }
        
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        result += chunk;
        
        // Memory usage check - prevent excessive memory consumption
        if (result.length > 10 * 1024 * 1024) { // 10MB limit
          console.warn('💾 Memory limit reached, truncating stream');
          result = result.substring(0, 10 * 1024 * 1024) + '\n\n[Stream truncated due to size limit]';
          break;
        }
        
        // Check for token usage marker
        const tokenMatch = result.match(/<!--TOKENS:(.+?)-->/);
        if (tokenMatch) {
          try {
            console.log('🔢 Found token marker:', tokenMatch[1]);
            tokenUsage = JSON.parse(tokenMatch[1]);
            console.log('🔢 Parsed token usage:', tokenUsage);
            // Remove the token marker from the display
            result = result.replace(/\n\n<!--TOKENS:.+?-->/, '');
          } catch (e) {
            console.error('Failed to parse token usage:', e, 'Raw token data:', tokenMatch[1]);
          }
        }
        
        onUpdate({
          content: result,
          tokenUsage,
          isComplete: false
        });
        
        iterationCount++;
      }
    } catch (error) {
      console.error('💥 Stream processing error:', error);
      // Continue to final update even on error
    }
      
      // Final update
      onUpdate({
        content: result,
        tokenUsage,
        isComplete: true
      });
    }

      console.log('✅ AI analysis completed successfully');
    },
    { logCount: request.logs.length, logFile: request.logFile }
  ).catch(error => {
    console.error('💥 Error analyzing logs:', error);
    onUpdate({
      content: '❌ **Analysis Error**\n\nFailed to analyze logs. Please try again or check your internet connection.',
      tokenUsage: null,
      isComplete: true
    });
  });
}; 