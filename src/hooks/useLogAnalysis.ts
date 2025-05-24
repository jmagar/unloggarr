import { useState, useCallback } from 'react';
import { TokenUsage, LogEntry } from '../types';
import { analyzeLogsWithAI as analyzeLogsWithAIService } from '../services/analysisService';

/**
 * Hook for managing log analysis state and operations
 * @returns Analysis state and actions
 */
export const useLogAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);

  // Analyze logs with AI
  const analyzeLogsWithAI = useCallback(async (
    logs: LogEntry[],
    logFile: string,
    selectedLevel: string
  ) => {
    if (logs.length === 0) {
      alert('No logs to analyze. Please select a log file first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');
    setTokenUsage(null);
    setShowAnalysis(true);

    await analyzeLogsWithAIService(
      { logs, logFile, selectedLevel },
      (result) => {
        setAnalysisResult(result.content);
        if (result.tokenUsage) {
          setTokenUsage(result.tokenUsage);
        }
        if (result.isComplete) {
          setIsAnalyzing(false);
        }
      }
    );
  }, []);

  return {
    // State
    isAnalyzing,
    analysisResult,
    showAnalysis,
    tokenUsage,

    // Actions
    setShowAnalysis,
    analyzeLogsWithAI
  };
}; 