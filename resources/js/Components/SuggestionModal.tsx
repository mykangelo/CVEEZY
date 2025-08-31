import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Copy } from 'lucide-react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  title: string;
  loading?: boolean;
  onRegenerate?: () => void;
  showRegenerateButton?: boolean;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onSelectSuggestion,
  title,
  loading = false,
  onRegenerate,
  showRegenerateButton = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(null);
      setCopiedIndex(null);
    }
  }, [isOpen]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectSuggestion(suggestions[index]);
    onClose();
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      setIsRegenerating(true);
      try {
        await onRegenerate();
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
                          <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">
                  {suggestions.length > 0 
                    ? `Choose from ${suggestions.length} AI-generated suggestions`
                    : 'Choose from 3 AI-generated suggestions'
                  }
                </p>
              </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              {/* Loading Animation */}
              <div className="mb-6">
                <div className="relative w-20 h-20 mx-auto">
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                  {/* Center icon */}
                  <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Loading Message */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Generating AI Suggestions...</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Our AI is analyzing your content and creating personalized suggestions. This usually takes a few seconds.
                </p>
                
                {/* Animated dots */}
                <div className="flex items-center justify-center gap-1 mt-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-8 max-w-sm mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Processing your request...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isRegenerating && (
                <div className="text-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Regenerating suggestions...</span>
                  </div>
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 ${
                    selectedIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelect(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed mb-2">{suggestion}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Suggestion {index + 1}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(suggestion, index);
                        }}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          copiedIndex === index 
                            ? 'bg-green-100 text-green-600' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600">
            Click on a suggestion to apply it, or copy it to your clipboard
          </p>
          <div className="flex items-center gap-3">
            {showRegenerateButton && onRegenerate && (
              <button
                onClick={handleRegenerate}
                disabled={loading || isRegenerating}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;
