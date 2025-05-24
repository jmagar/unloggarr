export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  analysisResult: string;
  showAnalysis: boolean;
  tokenUsage: TokenUsage | null;
}

export interface AnalysisRequest {
  logs: any[];
  logFile: string;
  selectedLevel: string;
} 