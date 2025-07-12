import React, { useState, useEffect } from 'react';
import { BRAILLE_ALPHABET, BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern } from '../../utils/braille';

interface FlashCard {
  character: string;
  dots: number[];
  pattern: string;
  category: 'alphabet' | 'number';
}

const FlashCards: React.FC = () => {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState<'alphabet' | 'numbers' | 'mixed'>('alphabet');
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000);

  useEffect(() => {
    generateCards();
  }, [studyMode]);

  useEffect(() => {
    if (autoPlay && cards.length > 0) {
      const interval = setInterval(() => {
        if (showAnswer) {
          nextCard();
        } else {
          setShowAnswer(true);
        }
      }, autoPlaySpeed);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlaySpeed, showAnswer, cards.length]);

  const generateCards = () => {
    let characters: string[] = [];
    
    if (studyMode === 'alphabet') {
      characters = Object.keys(BRAILLE_ALPHABET);
    } else if (studyMode === 'numbers') {
      characters = Object.keys(BRAILLE_NUMBERS);
    } else {
      characters = [...Object.keys(BRAILLE_ALPHABET), ...Object.keys(BRAILLE_NUMBERS)];
    }

    const newCards: FlashCard[] = characters.map(char => {
      const dots = getDotsFromCharacter(char);
      const pattern = dots ? generateBraillePattern(dots) : '⠀';
      const category = /[0-9]/.test(char) ? 'number' : 'alphabet';
      
      return {
        character: char,
        dots: dots || [],
        pattern,
        category
      };
    });

    // Shuffle cards
    const shuffledCards = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setShowAnswer(false);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        prevCard();
        break;
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        if (showAnswer) {
          nextCard();
        } else {
          setShowAnswer(true);
        }
        break;
      case 'Enter':
        toggleAnswer();
        break;
    }
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div 
      className="min-h-screen bg-gray-50 py-12 focus:outline-none" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Flash Cards</h1>
          <p className="text-lg text-gray-600">Study Braille characters with interactive flash cards</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Study Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Study Mode</label>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="alphabet">Alphabet</option>
                <option value="numbers">Numbers</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Auto Play */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Auto Play</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${
                    autoPlay
                      ? 'bg-success-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {autoPlay ? '⏸️ Pause' : '▶️ Play'}
                </button>
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Speed (seconds)</label>
              <select
                value={autoPlaySpeed}
                onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={!autoPlay}
              >
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
                <option value={5000}>5s</option>
              </select>
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Progress</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {currentCardIndex + 1} / {cards.length}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Card */}
        {currentCard && (
          <div className="max-w-2xl mx-auto">
            <div 
              className="bg-white rounded-lg shadow-2xl min-h-96 cursor-pointer transform transition-transform hover:scale-105"
              onClick={toggleAnswer}
            >
              <div className="p-12 text-center">
                {!showAnswer ? (
                  /* Front of card - Character */
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">
                      What is the Braille pattern for this character?
                    </h2>
                    <div className="text-9xl font-bold text-primary-500 mb-8">
                      {currentCard.character}
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      currentCard.category === 'alphabet' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentCard.category === 'alphabet' ? 'Letter' : 'Number'}
                    </div>
                    <p className="text-gray-500 mt-6">Click to reveal answer</p>
                  </div>
                ) : (
                  /* Back of card - Braille Pattern */
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">
                      Braille Pattern
                    </h2>
                    <div className="text-9xl mb-8" style={{ fontFamily: 'monospace' }}>
                      {currentCard.pattern}
                    </div>
                    <div className="space-y-4">
                      <p className="text-lg text-gray-600">
                        <span className="font-semibold">Character:</span> {currentCard.character}
                      </p>
                      <p className="text-lg text-gray-600">
                        <span className="font-semibold">Dots:</span> {currentCard.dots.join(', ')}
                      </p>
                      <p className="text-lg text-gray-600">
                        <span className="font-semibold">Category:</span> {currentCard.category}
                      </p>
                    </div>
                    <p className="text-gray-500 mt-6">Click to hide answer</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevCard}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={toggleAnswer}
                  className="bg-warning-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-warning-600 transition-colors"
                >
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
                
                <button
                  onClick={() => {
                    generateCards();
                  }}
                  className="bg-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
                >
                  🔀 Shuffle
                </button>
              </div>

              <button
                onClick={nextCard}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-8 bg-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div><kbd className="bg-white px-2 py-1 rounded shadow">←</kbd> Previous</div>
                <div><kbd className="bg-white px-2 py-1 rounded shadow">→</kbd> Next</div>
                <div><kbd className="bg-white px-2 py-1 rounded shadow">Space</kbd> Show/Next</div>
                <div><kbd className="bg-white px-2 py-1 rounded shadow">Enter</kbd> Toggle</div>
              </div>
            </div>
          </div>
        )}

        {cards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600">Loading flash cards...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCards;
