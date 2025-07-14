import React from 'react';

interface BrailleCardProps {
  braille: string;  // 점자 문자 (예: ⠁)
  char: string;     // 알파벳 문자 (예: A)
  numbers?: string; // 숫자 (선택적)
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
  bgColor?: string; // 배경색 (기본값: white)
}

const BrailleCard: React.FC<BrailleCardProps> = ({
  braille,
  char,
  numbers,
  onClick,
  isSelected = false,
  className = '',
  bgColor = 'white'
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col justify-between items-center
        w-[120px] h-[144px] p-2.5 gap-2.5
        border-2 border-primary-500 rounded-[20px]
        shadow-[5px_5px_10px_rgba(0,0,0,0.25)]
        cursor-pointer transition-all duration-200
        hover:shadow-[8px_8px_15px_rgba(0,0,0,0.3)] hover:scale-105
        ${isSelected ? 'border-primary-600 shadow-[8px_8px_15px_rgba(0,0,0,0.3)] scale-105' : ''}
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {/* 점자 문자 */}
      <div className="flex items-center justify-center w-[103px] h-[55px]">
        <span className="text-[48px] font-bold text-primary-500 text-center leading-[1.5] font-sans">
          {braille}
        </span>
      </div>

      {/* 알파벳 문자 */}
      <div className="flex items-center justify-center w-[102px] h-[43px]">
        <span className="text-[30px] font-bold text-primary-500 text-center leading-[1.5] font-sans">
          {char}
        </span>
      </div>

      {/* 숫자 (선택적) */}
      {numbers && (
        <div className="flex items-center justify-center w-[102px]">
          <span className="text-[20px] font-normal text-gray-600 text-center leading-[1.5] font-sans">
            {numbers}
          </span>
        </div>
      )}
    </div>
  );
};

export default BrailleCard;
