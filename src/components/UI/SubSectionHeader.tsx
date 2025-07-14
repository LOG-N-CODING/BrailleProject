import React from 'react';

interface SubSectionHeaderProps {
  subtitle: string;
  className?: string;
  subtitleClassName?: string;
  dotClassName?: string;
}

const SubSectionHeader: React.FC<SubSectionHeaderProps> = ({ 
  subtitle, 
  className = "",
  subtitleClassName = "",
  dotClassName = ""
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 ${className}`}>
      <div className="flex gap-2">
        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ${dotClassName}`}></div>
        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ${dotClassName}`}></div>
      </div>
      <span className={`text-sm sm:text-lg text-gray-600 font-light ${subtitleClassName}`}>
        {subtitle}
      </span>
      <div className="flex gap-2">
        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ${dotClassName}`}></div>
        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 ${dotClassName}`}></div>
      </div>
    </div>
  );
};

export default SubSectionHeader;
