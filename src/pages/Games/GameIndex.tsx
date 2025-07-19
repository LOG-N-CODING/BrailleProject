import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';

const GameIndex: React.FC = () => {
  const navigate = useNavigate();

  const handleTypingGame = () => {
    navigate('/games/typing-game');
  };

  const handleTypingSprint = () => {
    navigate('/games/typing-sprint');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-24">
        <div className="w-full max-w-6xl px-4">
          {/* Title Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              {/* Braille dots decoration */}
              <div className="flex items-center space-x-2 mr-8">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
              </div>
              
              <h1 className="text-5xl font-light text-gray-600 mx-6">Game</h1>
              
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
              </div>
            </div>
            
            <p className="text-lg text-black font-light max-w-3xl mx-auto">
              Different languages around the world have their own mappings for the alphabet to braille dots. 
              Here are the "dot combinations" for English Braille.
            </p>
          </div>

          {/* Game Selection Cards */}
          <div className="flex justify-center space-x-8">
            {/* Typing Game Card */}
            <div 
              onClick={handleTypingGame}
              className="bg-white border border-gray-300 rounded-lg p-8 w-96 h-24 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow duration-300 group"
              style={{ boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.25)' }}
            >
              <h2 className="text-3xl font-light text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                Typing Game
              </h2>
            </div>

            {/* Typing Sprint Card */}
            <div 
              onClick={handleTypingSprint}
              className="bg-white border border-gray-300 rounded-lg p-8 w-96 h-24 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow duration-300 group"
              style={{ boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.25)' }}
            >
              <h2 className="text-3xl font-light text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                Typing Sprint
              </h2>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default GameIndex;
