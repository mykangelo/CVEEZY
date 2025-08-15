import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Generating...' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <div className="bg-[#354eab] rounded-xl px-6 py-4 flex items-center gap-4 shadow-2xl">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white border-t-transparent`}></div>
        <span className="text-white font-bold text-lg font-alte">{text}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
