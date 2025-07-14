import React from 'react';

interface SectionHeaderProps {
  title: string;
  className?: string;
  titleClassName?: string;
  dotClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  className = "",
  titleClassName = "",
  dotClassName = ""
}) => {
  return (
    <div className={`flex justify-center items-center mb-6 sm:mb-8 ${className}`}>
      <div className="flex space-x-4 sm:space-x-8 items-center">
        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full ${dotClassName}`}></div>
        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full ${dotClassName}`}></div>
        <h2 className={`text-xl sm:text-3xl lg:text-4xl font-light text-gray-600 lg:px-20 ${titleClassName}`}>
          {title}
        </h2>
        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full ${dotClassName}`}></div>
        <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full ${dotClassName}`}></div>
      </div>
    </div>
  );
};

export default SectionHeader;
