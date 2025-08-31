import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface AIButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  children: React.ReactNode;
  suggestions?: string[];
  className?: string;
  autoShow?: boolean;
}

const AIButton: React.FC<AIButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  title = "Generate AI suggestions",
  children,
  suggestions = [],
  className = "",
  autoShow = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Auto-show tips on first visit
  useEffect(() => {
    if (autoShow && isFirstVisit && suggestions.length > 0) {
      const timer = setTimeout(() => {
        setShowSuggestions(true);
        setIsFirstVisit(false);
      }, 1000); // Show after 1 second

      return () => clearTimeout(timer);
    }
  }, [autoShow, isFirstVisit, suggestions.length]);

  return (
    <div className="flex items-start gap-4">
      {/* AI Button */}
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 
          bg-white border border-gray-200 text-gray-700 
          rounded-lg transition-all duration-200 
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
          ${className}
        `}
        title={title}
      >
        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="font-medium">{children}</span>
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin ml-1" />
        )}
      </button>

      {/* Message Bubble Tips - Appears when bulb is clicked */}
      {suggestions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-all duration-200 group hover:scale-110"
            title="Click for tips"
          >
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </button>
          
          {/* Message Bubble with Animations */}
          <div className={`absolute bottom-full left-0 mb-2 z-10 min-w-72 transition-all duration-300 ease-out ${
            showSuggestions 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}>
            {/* Arrow pointing down with animation */}
            <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-100 ml-4 transition-all duration-300 ${
              showSuggestions ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            {/* Bubble content with staggered animations */}
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold text-blue-800 flex items-center gap-2 transition-all duration-300 ${
                  showSuggestions ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                }`}>
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Tips for better AI results
                </h4>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className={`text-blue-500 hover:text-blue-700 transition-all duration-300 ${
                    showSuggestions ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-2 text-sm text-blue-700 transition-all duration-300 ${
                      showSuggestions 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ 
                      transitionDelay: showSuggestions ? `${index * 100}ms` : '0ms' 
                    }}
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIButton;
