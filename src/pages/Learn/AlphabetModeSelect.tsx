import React from 'react';
import { SectionHeader } from '../../components/UI';
import { useNavigate } from 'react-router-dom';

const AlphabetModeSelect: React.FC = () => {
  const navigate = useNavigate();

const modes = [
    {
        id: 'Letters',
        title: 'Letters',
        description: 'Practice alphabet letters',
        path: '/learn/alphabet',
        icon: '🔤'
    },
    {
        id: 'Words',
        title: 'Words',
        description: 'Practice words',
        path: '/learn/words',
        icon: '📝'
    },
    {
        id: 'phrases',
        title: 'Phrases',
        description: 'Practice phrases',
        path: '/learn/phrases',
        icon: '💬'
    }
];

  const handleModeSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section with Visual Braille */}
        <div className="text-center mb-12 py-20">
          
          <SectionHeader title="Alphabet Learning (A–Z)" />
          <p className="text-lg text-gray-600 mx-auto w-full max-w-[700px] mt-6">
            Different languages around the world have their own mappings for the alphabet to braille dots. 
            Here are the "dot combinations" for English Braille.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="flex justify-center items-center gap-10 p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            {modes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode.path)}
                className="group bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:border-primary-300 relative"
                style={{
                  width: '180px',
                  height: '180px',
                  boxShadow: '5px 5px 5px 0px rgba(0, 0, 0, 0.25)'
                }}
              >
                <div className="h-full flex flex-col justify-center items-center gap-4 p-6">
                  {/* Braille Icon */}
                  <div className="text-4xl font-mono text-primary-500 group-hover:text-primary-600 transition-colors">
                    {mode.icon}
                  </div>
                  
                  {/* Mode Title */}
                  <h3 className="text-2xl font-light text-gray-800 text-center group-hover:text-primary-600 transition-colors">
                    {mode.title}
                  </h3>
                  
                  {/* Hidden description that appears on hover */}
                  <p className="text-sm text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bg-white p-3 rounded-lg shadow-lg border mt-8 max-w-xs z-10">
                    {mode.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        {/* <div className="text-center mt-16 p-8 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Learning Path</h3>
          <p className="text-gray-600 mb-6">
            Start with individual Letters to build your foundation, then progress to Words and phrases as you become more comfortable with braille patterns.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              Beginner Friendly
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              Interactive Learning
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
              Progressive Difficulty
            </span>
          </div>
        </div> */}

        {/* Navigation Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/learn')}
            className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Learn Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlphabetModeSelect;
