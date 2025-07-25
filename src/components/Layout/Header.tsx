import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isQuizDropdownOpen, setIsQuizDropdownOpen] = useState(false);
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut, user, isAdmin } = useAuth();

  if (isAdmin) {
    return (
      <header className="bg-white shadow-sm relative">
        {/* ──────────────── 데스크탑 헤더 ──────────────── */}
        <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 justify-between items-center h-20">
          {/* 왼쪽 로고 */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/figma/logo-mini.png"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="ml-2 font-bold text-2xl text-[#2575FF]">Braille</span>
            <span className="font-bold text-2xl text-black">Play</span>
          </Link>
          {/* 오른쪽: Admin / Sign out */}
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-gray-700 hover:text-primary-500 font-medium">
              Admin
            </Link>
            <button onClick={signOut} className="text-gray-700 hover:text-primary-500 font-medium">
              Sign out
            </button>
          </div>
        </div>

        {/* ──────────────── 모바일 헤더 ──────────────── */}
        <div className="lg:hidden flex justify-between items-center px-4 py-4">
          <Link to="/" className="flex items-center">
            <img
              src="/images/figma/logo-mini.png"
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            <span className="ml-2 font-bold text-2xl text-[#2575FF]">Braille</span>
            <span className="font-bold text-2xl text-black">Play</span>
          </Link>
          <button
            aria-label="Open admin menu"
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-center w-8 h-8"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* ──────────────── 모바일 오프캔버스 ──────────────── */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
            <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
            <div className="bg-white w-64 h-full shadow-lg p-6 relative">
              <button
                className="absolute top-4 right-4"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              </button>
              <nav className="mt-8 space-y-4">
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  Admin
                </Link>
                <Link
                  to="/admin?section=Users"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  Users
                </Link>
                <Link
                  to="/admin?section=Words"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  Words
                </Link>
                <Link
                  to="/admin?section=Phrases"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  Phrases
                </Link>
                <Link
                  to="/admin?section=Quizzes"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  Quizzes
                </Link>
                <Link
                  to="/admin?section=AdminTest"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  AdminTest
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block text-lg font-medium text-gray-700 hover:text-primary-500"
                >
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div style={{ height: '40px' }} />
        {/* Logo */}
        <div className="flex justify-center items-center mb-4 lg:mb-0">
          <Link
            to="/"
            className="font-bold text-secondary-500 font-irish text-2xl sm:text-3xl md:text-4xl lg:text-5xl break-words"
          >
            <span className="text-[#2575FF]">Braille</span>
            <span className="text-black">Play</span>
          </Link>
        </div>
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg mr-2 sm:mr-4 flex items-center justify-center flex-shrink-0"
            >
              <img
                src="/images/figma/logo-mini.png"
                alt="Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 max-w-full max-h-full object-contain"
              />
            </Link>
            {/* Navigation */}
            <nav className="hidden lg:flex space-x-2 xl:space-x-4 2xl:space-x-8 ">
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-primary-500 font-medium text-sm xl:text-base py-2"
              >
                Home
              </Link>

              {/* Learn Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsLearnDropdownOpen(true)}
                onMouseLeave={() => setIsLearnDropdownOpen(false)}
              >
                <Link
                  to="/learn"
                  className="flex items-center text-gray-700 hover:text-primary-500 font-medium text-sm xl:text-base py-2"
                >
                  Learn
                  <svg
                    className="ml-1 h-3 w-3 xl:h-4 xl:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <div
                  className={`absolute top-full left-0 w-48 xl:w-52 bg-white shadow-lg rounded-md py-2 z-50 transition-all duration-200 ${
                    isLearnDropdownOpen
                      ? 'opacity-100 visible transform translate-y-0'
                      : 'opacity-0 invisible transform translate-y-2'
                  }`}
                >
                  <Link
                    to="/learn/alphabet-mode"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Alphabet Learning
                  </Link>
                  <Link
                    to="/learn/numbers"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Number Learning
                  </Link>
                  <Link
                    to="/learn/practice"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Practice Mode
                  </Link>
                </div>
              </div>

              {/* Quiz Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsQuizDropdownOpen(true)}
                onMouseLeave={() => setIsQuizDropdownOpen(false)}
              >
                <Link
                  to="/quiz"
                  className="flex items-center text-gray-700 hover:text-primary-500 font-medium text-sm xl:text-base py-2"
                >
                  Quiz
                  <svg
                    className="ml-1 h-3 w-3 xl:h-4 xl:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <div
                  className={`absolute top-full left-0 w-48 xl:w-52 bg-white shadow-lg rounded-md py-2 z-50 transition-all duration-200 ${
                    isQuizDropdownOpen
                      ? 'opacity-100 visible transform translate-y-0'
                      : 'opacity-0 invisible transform translate-y-2'
                  }`}
                >
                  <Link
                    to="/quiz/image-to-braille"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Image-to-Braille
                  </Link>
                  <Link
                    to="/quiz/math"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Math Quiz
                  </Link>
                </div>
              </div>

              {/* Game Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setIsGameDropdownOpen(true)}
                onMouseLeave={() => setIsGameDropdownOpen(false)}
              >
                <Link
                  to="/games"
                  className="flex items-center text-gray-700 hover:text-primary-500 font-medium text-sm xl:text-base py-2"
                >
                  Game
                  <svg
                    className="ml-1 h-3 w-3 xl:h-4 xl:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <div
                  className={`absolute top-full left-0 w-48 xl:w-52 bg-white shadow-lg rounded-md py-2 z-50 transition-all duration-200 ${
                    isGameDropdownOpen
                      ? 'opacity-100 visible transform translate-y-0'
                      : 'opacity-0 invisible transform translate-y-2'
                  }`}
                >
                  <Link
                    to="/games/typing-game"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Typing Game
                  </Link>
                  <Link
                    to="/games/typing-sprint"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                  >
                    Typing Sprint
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link
                  to="/"
                  onClick={signOut}
                  className="text-gray-700 hover:text-primary-500 font-medium text-sm sm:text-base"
                >
                  Sign out
                </Link>
                <Link
                  to="/my"
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-700 hover:text-primary-500"
                >
                  <span className="material-icons text-xl sm:text-2xl">person</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-500 font-medium text-sm sm:text-base"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="border border-primary-500 text-primary-500 px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-primary-500 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Sign up
                </Link>
              </>
            )}
            {/* Hamburger Menu for mobile */}
            <button
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Offcanvas Menu */}
            {isMenuOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex m-0">
                <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
                <div className="bg-white w-72 sm:w-80 h-full shadow-lg p-4 sm:p-6 relative">
                  <button
                    className="absolute top-3 right-3 sm:top-4 sm:right-4"
                    aria-label="Close menu"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <nav className="flex flex-col space-y-4 mt-8 sm:mt-12">
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-primary-500 font-medium text-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <div>
                      <Link
                        to="/learn"
                        className="text-gray-700 hover:text-primary-500 font-medium text-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Learn
                      </Link>
                      <div className="ml-2 flex flex-col mt-2">
                        <Link
                          to="/learn/alphabet-mode"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Alphabet Learning
                        </Link>
                        <Link
                          to="/learn/numbers"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Number Learning
                        </Link>
                        <Link
                          to="/learn/practice"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Practice Mode
                        </Link>
                      </div>
                    </div>
                    <div>
                      <Link
                        to="/quiz"
                        className="text-gray-700 font-medium text-lg hover:text-primary-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Quiz
                      </Link>
                      <div className="ml-2 flex flex-col mt-2">
                        <Link
                          to="/quiz/image-to-braille"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Image-to-Braille
                        </Link>
                        <Link
                          to="/quiz/math"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Math Quiz
                        </Link>
                      </div>
                    </div>
                    <div>
                      <Link
                        to="/games"
                        className="text-gray-600 hover:text-primary-500 py-2 text-base"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Game
                      </Link>
                      <div className="ml-2 flex flex-col mt-2">
                        <Link
                          to="/games/typing-game"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Typing Game
                        </Link>
                        <Link
                          to="/games/typing-sprint"
                          className="text-gray-600 hover:text-primary-500 py-2 text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Typing Sprint
                        </Link>
                      </div>
                    </div>
                    {user ? (
                      <>
                        <Link
                          to="/my"
                          className="text-gray-700 hover:text-primary-500 font-medium text-sm sm:text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My
                        </Link>
                        <Link
                          to="/"
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut();
                          }}
                          className="text-gray-700 hover:text-primary-500 font-medium text-sm sm:text-base"
                        >
                          Sign out
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-medium mt-6 text-center px-4 py-3 rounded-md transition-colors text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign in
                        </Link>
                        <Link
                          to="/signup"
                          className="bg-primary-500 text-white px-4 py-3 rounded-md hover:bg-primary-600 transition-colors mt-3 text-center text-base"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
