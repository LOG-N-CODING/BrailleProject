import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mr-4"></div>
              <h2 className="text-2xl font-bold text-secondary-500 font-irish">BraillePlay</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Contact</p>
              <p className="text-lg font-bold">logncoding@gmail.com</p>
            </div>
          </div>

          {/* Learn Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Learn</h3>
            <div className="space-y-2">
              <Link to="/learn/alphabet" className="block text-gray-300 hover:text-white text-sm">
                Alphabet Learning
              </Link>
              <Link to="/learn/numbers" className="block text-gray-300 hover:text-white text-sm">
                Number Learning
              </Link>
              <Link to="/learn/practice" className="block text-gray-300 hover:text-white text-sm">
                Practice Mode
              </Link>
            </div>
          </div>

          {/* Quiz Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quiz</h3>
            <div className="space-y-2">
              <Link to="/quiz/image-to-braille" className="block text-gray-300 hover:text-white text-sm">
                Image-to-Braille
              </Link>
              <Link to="/quiz/math" className="block text-gray-300 hover:text-white text-sm">
                Math Quiz
              </Link>
            </div>
          </div>

          {/* Game Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Game</h3>
            <div className="space-y-2">
              <Link to="/game/typing" className="block text-gray-300 hover:text-white text-sm">
                Typing Game
              </Link>
              <Link to="/game/sprint" className="block text-gray-300 hover:text-white text-sm">
                Typing Sprint
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Braille Input Device and Web Content for Learning
            </p>
            <p className="text-sm text-gray-400 mt-2">
              COPYRIGHT © ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
