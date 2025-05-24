import React from 'react';
import { Brain, Zap, DollarSign, Clock } from 'lucide-react';
import { Theme, TokenUsage } from '../../../types';
import { getThemeClasses } from '../../../utils/theme';
import { Modal } from '../common/Modal';

interface AnalysisModalProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  isAnalyzing: boolean;
  analysisResult: string;
  tokenUsage: TokenUsage | null;
}

/**
 * Modal component for displaying AI analysis results
 */
export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  theme,
  isOpen,
  onClose,
  isAnalyzing,
  analysisResult,
  tokenUsage
}) => {
  const themeClasses = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const formatCost = (cost: number) => {
    return cost < 0.01 ? `$${cost.toFixed(4)}` : `$${cost.toFixed(2)}`;
  };

  // Calculate cost based on Anthropic Claude 3.5 Sonnet pricing
  const calculateCost = (tokenUsage: TokenUsage) => {
    const inputCostPer1M = 3.00; // $3.00 per million input tokens
    const outputCostPer1M = 15.00; // $15.00 per million output tokens
    
    const inputCost = (tokenUsage.promptTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (tokenUsage.completionTokens / 1_000_000) * outputCostPer1M;
    
    return inputCost + outputCost;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      size="large"
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Log Analysis</h2>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              Powered by Anthropic Claude 3.5 Sonnet
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Token Usage Stats */}
        {tokenUsage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Input Tokens</span>
              </div>
              <p className="text-lg font-bold">{tokenUsage.promptTokens.toLocaleString()}</p>
            </div>
            
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Output Tokens</span>
              </div>
              <p className="text-lg font-bold">{tokenUsage.completionTokens.toLocaleString()}</p>
            </div>
            
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Estimated Cost</span>
              </div>
              <p className="text-lg font-bold">{formatCost(calculateCost(tokenUsage))}</p>
            </div>
          </div>
        )}

        {/* Analysis Content */}
        <div className="relative">
          {isAnalyzing && (
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full overflow-hidden`}>
              <div className="h-full bg-gradient-to-r from-white to-transparent animate-pulse opacity-60" />
            </div>
          )}
          
          <div className={`mt-2 p-6 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} min-h-[400px] max-h-[60vh] overflow-y-auto`}>
            {isAnalyzing && !analysisResult ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-3 animate-spin`}>
                    <Brain className="w-full h-full text-purple-500" />
                  </div>
                  <p className={themeClasses.text.secondary}>Analyzing your logs with AI...</p>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysisResult}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className={themeClasses.text.secondary}>
                  Analysis results will appear here...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {analysisResult && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysisResult);
                // Could add a toast notification here
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Copy Analysis
            </button>
          )}
          
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}; 