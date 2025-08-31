import React from 'react';
import { generateBraillePattern } from '../../utils/braille';

interface BrailleGuideProps {
  activeDots?: number[];
  showGuide?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showLabels?: boolean;
}

export const BrailleGuide: React.FC<BrailleGuideProps> = ({
  activeDots = [],
  showGuide = true,
  size = 'medium',
  className = '',
  showLabels = false,
}) => {
  const sizeClasses = {
    small: {
      container: 'w-20 h-24',
      dot: 'w-3 h-3',
      label: 'text-xs',
      braille: 'text-xl',
      spacing: 'gap-2',
    },
    medium: {
      container: 'w-24 h-28',
      dot: 'w-4 h-4',
      label: 'text-sm',
      braille: 'text-2xl',
      spacing: 'gap-3',
    },
    large: {
      container: 'w-28 h-40',
      dot: 'w-5 h-5',
      label: 'text-base',
      braille: 'text-3xl',
      spacing: 'gap-4',
    },
  };

  const currentSize = sizeClasses[size];
  const brailleChar = activeDots.length > 0 ? generateBraillePattern(activeDots) : '⠀';

  return (
    <div className={`flex flex-col items-center ${currentSize.spacing} ${className}`}>
      {/* 점자 6점 가이드 */}
      <div className={`relative ${currentSize.container} bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl`}>
        
        {/* 점 1 (좌상) */}
        <div
          className={`absolute top-5 left-5 ${currentSize.dot} rounded-full border-2 transition-all duration-300 transform ${
            activeDots.includes(1)
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 shadow-lg scale-125 ring-4 ring-blue-200'
              : showGuide
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:border-gray-500 hover:scale-110'
              : 'bg-transparent border-transparent'
          }`}
        >
          {showLabels && (
            <span
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${currentSize.label} font-bold ${
                activeDots.includes(1) ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              1
            </span>
          )}
          {activeDots.includes(1) && (
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* 점 2 (좌중) */}
        <div
          className={`absolute top-1/2 left-5 transform -translate-y-1/2 ${currentSize.dot} rounded-full border-2 transition-all duration-300 ${
            activeDots.includes(2)
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 shadow-lg scale-125 ring-4 ring-blue-200'
              : showGuide
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:border-gray-500 hover:scale-110'
              : 'bg-transparent border-transparent'
          }`}
        >
          {showLabels && (
            <span
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${currentSize.label} font-bold ${
                activeDots.includes(2) ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              2
            </span>
          )}
          {activeDots.includes(2) && (
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* 점 3 (좌하) */}
        <div
          className={`absolute bottom-5 left-5 ${currentSize.dot} rounded-full border-2 transition-all duration-300 ${
            activeDots.includes(3)
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 shadow-lg scale-125 ring-4 ring-blue-200'
              : showGuide
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:border-gray-500 hover:scale-110'
              : 'bg-transparent border-transparent'
          }`}
        >
          {showLabels && (
            <span
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${currentSize.label} font-bold ${
                activeDots.includes(3) ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              3
            </span>
          )}
          {activeDots.includes(3) && (
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* 점 4 (우상) */}
        <div
          className={`absolute top-5 right-5 ${currentSize.dot} rounded-full border-2 transition-all duration-300 ${
            activeDots.includes(4)
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 shadow-lg scale-125 ring-4 ring-blue-200'
              : showGuide
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:border-gray-500 hover:scale-110'
              : 'bg-transparent border-transparent'
          }`}
        >
          {showLabels && (
            <span
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${currentSize.label} font-bold ${
                activeDots.includes(4) ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              4
            </span>
          )}
          {activeDots.includes(4) && (
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* 점 5 (우중) */}
        <div
          className={`absolute top-1/2 right-5 transform -translate-y-1/2 ${currentSize.dot} rounded-full border-2 transition-all duration-300 ${
            activeDots.includes(5)
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 shadow-lg scale-125 ring-4 ring-blue-200'
              : showGuide
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:border-gray-500 hover:scale-110'
              : 'bg-transparent border-transparent'
          }`}
        >
          {showLabels && (
            <span
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${currentSize.label} font-bold ${
                activeDots.includes(5) ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              5
            </span>
          )}
          {activeDots.includes(5) && (
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* 점 6 (우하) */}
        <div
          className={`absolute bottom-5 right-5 ${currentSize.dot} rounded-full border-2 transition-all duration-300 ${
            activeDots.includes(6)
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600 shadow-lg scale-125 ring-4 ring-blue-200'
              : showGuide
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 hover:border-gray-500 hover:scale-110'
              : 'bg-transparent border-transparent'
          }`}
        >
          {showLabels && (
            <span
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${currentSize.label} font-bold ${
                activeDots.includes(6) ? 'text-blue-700' : 'text-gray-600'
              }`}
            >
              6
            </span>
          )}
          {activeDots.includes(6) && (
            <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* 점자 문자 표시 */}
      <div className={`${currentSize.braille} font-mono font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm`}>
        {brailleChar}
      </div>
      
      {/* 활성 점 수 표시 */}
      {activeDots.length > 0 && (
        <div className="text-xs text-gray-500 font-medium">
          {activeDots.length} dot{activeDots.length !== 1 ? 's' : ''} active
        </div>
      )}
    </div>
  );
};

export default BrailleGuide;
