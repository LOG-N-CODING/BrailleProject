import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isQuizDropdownOpen, setIsQuizDropdownOpen] = useState(false);
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mr-4"></div>
            <Link to="/" className="text-2xl font-bold text-secondary-500 font-irish">
              BraillePlay
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-500 font-medium">
              Home
            </Link>

            {/* Learn Dropdown */}
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-primary-500 font-medium"
                onMouseEnter={() => setIsLearnDropdownOpen(true)}
                onMouseLeave={() => setIsLearnDropdownOpen(false)}
              >
                Learn
                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isLearnDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md py-2 z-10"
                  onMouseEnter={() => setIsLearnDropdownOpen(true)}
                  onMouseLeave={() => setIsLearnDropdownOpen(false)}
                >
                  <Link to="/learn/alphabet" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Alphabet Learning
                  </Link>
                  <Link to="/learn/numbers" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Number Learning
                  </Link>
                  <Link to="/learn/practice" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Practice Mode
                  </Link>
                </div>
              )}
            </div>

            {/* Quiz Dropdown */}
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-primary-500 font-medium"
                onMouseEnter={() => setIsQuizDropdownOpen(true)}
                onMouseLeave={() => setIsQuizDropdownOpen(false)}
              >
                Quiz
                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isQuizDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md py-2 z-10"
                  onMouseEnter={() => setIsQuizDropdownOpen(true)}
                  onMouseLeave={() => setIsQuizDropdownOpen(false)}
                >
                  <Link to="/quiz/image-to-braille" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Image-to-Braille
                  </Link>
                  <Link to="/quiz/math" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Math Quiz
                  </Link>
                </div>
              )}
            </div>

            {/* Game Dropdown */}
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-primary-500 font-medium"
                onMouseEnter={() => setIsGameDropdownOpen(true)}
                onMouseLeave={() => setIsGameDropdownOpen(false)}
              >
                Game
                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isGameDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md py-2 z-10"
                  onMouseEnter={() => setIsGameDropdownOpen(true)}
                  onMouseLeave={() => setIsGameDropdownOpen(false)}
                >
                  <Link to="/game/typing" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Typing Game
                  </Link>
                  <Link to="/game/sprint" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Typing Sprint
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/auth/login" className="text-gray-700 hover:text-primary-500 font-medium">
              Sign in
            </Link>
            <Link
              to="/auth/signup"
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
