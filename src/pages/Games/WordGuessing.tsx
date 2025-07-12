import React, { useState, useEffect, useCallback } from 'react';
import { BRAILLE_ALPHABET, BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern } from '../../utils/braille';

interface WordPuzzle {
  word: string;
  definition: string;
  category: string;
  difficulty: number;
}

interface GuessedLetter {
  character: string;
  pattern: string;
  correct: boolean;
}

const WordGuessing: React.FC = () => {
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<GuessedLetter[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [hint, setHint] = useState<string>('');
  const [showBrailleMode, setShowBrailleMode] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const maxWrongGuesses = 6;

  const wordPuzzles: Record<string, WordPuzzle[]> = {
    easy: [
      { word: 'CAT', definition: 'A small furry pet animal', category: 'Animals', difficulty: 1 },
      { word: 'DOG', definition: 'A loyal pet that barks', category: 'Animals', difficulty: 1 },
      { word: 'SUN', definition: 'The star that lights our day', category: 'Nature', difficulty: 1 },
      { word: 'BOOK', definition: 'You read this for stories', category: 'Objects', difficulty: 1 },
      { word: 'CAKE', definition: 'Sweet dessert for birthdays', category: 'Food', difficulty: 1 },
      { word: 'FISH', definition: 'Animal that swims in water', category: 'Animals', difficulty: 1 },
      { word: 'BALL', definition: 'Round object used in games', category: 'Toys', difficulty: 1 },
    ],
    medium: [
      { word: 'ELEPHANT', definition: 'Large animal with a trunk', category: 'Animals', difficulty: 2 },
      { word: 'COMPUTER', definition: 'Electronic device for work', category: 'Technology', difficulty: 2 },
      { word: 'RAINBOW', definition: 'Colorful arc in the sky', category: 'Nature', difficulty: 2 },
      { word: 'MOUNTAIN', definition: 'Very tall natural formation', category: 'Geography', difficulty: 2 },
      { word: 'BIRTHDAY', definition: 'Annual celebration of birth', category: 'Events', difficulty: 2 },
      { word: 'BICYCLE', definition: 'Two-wheeled transportation', category: 'Vehicles', difficulty: 2 },
    ],
    hard: [
      { word: 'PHILOSOPHY', definition: 'Study of knowledge and existence', category: 'Academic', difficulty: 3 },
      { word: 'ARCHITECTURE', definition: 'Art of designing buildings', category: 'Professions', difficulty: 3 },
      { word: 'PHOTOSYNTHESIS', definition: 'How plants make food from sunlight', category: 'Science', difficulty: 3 },
      { word: 'CONSTELLATION', definition: 'Group of stars forming a pattern', category: 'Astronomy', difficulty: 3 },
      { word: 'METAMORPHOSIS', definition: 'Complete change in form', category: 'Biology', difficulty: 3 },
    ]
  };

  const selectRandomPuzzle = useCallback(() => {
    const puzzles = wordPuzzles[difficulty];
    const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    setCurrentPuzzle(randomPuzzle);
    setGuessedLetters([]);
    setWrongGuesses([]);
    setGameStatus('playing');
    setHint('');
  }, [difficulty]);

  useEffect(() => {
    selectRandomPuzzle();
  }, [selectRandomPuzzle]);

  useEffect(() => {
    if (currentPuzzle && gameStatus === 'playing') {
      const wordLetters = currentPuzzle.word.split('');
      const allGuessed = wordLetters.every(letter => 
        guessedLetters.some(g => g.character === letter && g.correct)
      );
      
      if (allGuessed) {
        setGameStatus('won');
        setScore(prev => prev + (currentPuzzle.difficulty * 10));
      } else if (wrongGuesses.length >= maxWrongGuesses) {
        setGameStatus('lost');
      }
    }
  }, [guessedLetters, wrongGuesses, currentPuzzle, gameStatus]);

  const makeGuess = (letter: string) => {
    if (!currentPuzzle || gameStatus !== 'playing') return;
    
    const upperLetter = letter.toUpperCase();
    
    // Check if already guessed
    const alreadyGuessed = guessedLetters.some(g => g.character === upperLetter) || 
                          wrongGuesses.includes(upperLetter);
    if (alreadyGuessed) return;

    const dots = getDotsFromCharacter(upperLetter);
    const pattern = dots ? generateBraillePattern(dots) : '⠀';
    
    const correct = currentPuzzle.word.includes(upperLetter);
    
    if (correct) {
      setGuessedLetters(prev => [...prev, {
        character: upperLetter,
        pattern,
        correct: true
      }]);
    } else {
      setWrongGuesses(prev => [...prev, upperLetter]);
      setGuessedLetters(prev => [...prev, {
        character: upperLetter,
        pattern,
        correct: false
      }]);
    }
  };

  const nextRound = () => {
    setRound(prev => prev + 1);
    selectRandomPuzzle();
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    selectRandomPuzzle();
  };

  const showHint = () => {
    if (currentPuzzle) {
      setHint(currentPuzzle.definition);
    }
  };

  const getDisplayWord = () => {
    if (!currentPuzzle) return '';
    
    return currentPuzzle.word
      .split('')
      .map(letter => {
        const guessed = guessedLetters.find(g => g.character === letter && g.correct);
        return guessed ? letter : '_';
      })
      .join(' ');
  };

  const getHangmanStage = () => {
    const stages = [
      '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
      '  +---+\n  |   |\n  |   |\n      |\n      |\n      |\n=========',
      '  +---+\n  |   |\n  |   |\n  O   |\n      |\n      |\n=========',
      '  +---+\n  |   |\n  |   |\n  O   |\n  |   |\n      |\n=========',
      '  +---+\n  |   |\n  |   |\n  O   |\n /|   |\n      |\n=========',
      '  +---+\n  |   |\n  |   |\n  O   |\n /|\\  |\n      |\n=========',
      '  +---+\n  |   |\n  |   |\n  O   |\n /|\\  |\n /    |\n=========',
      '  +---+\n  |   |\n  |   |\n  O   |\n /|\\  |\n / \\  |\n========='
    ];
    return stages[wrongGuesses.length] || stages[0];
  };

  if (!currentPuzzle) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">🎯</div>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold">📝</div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Word Guessing Game</h1>
          <p className="text-lg text-gray-600">Guess the word using Braille letters</p>
        </div>

        {/* Game Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-500">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{round}</div>
              <div className="text-sm text-gray-600">Round</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{maxWrongGuesses - wrongGuesses.length}</div>
              <div className="text-sm text-gray-600">Lives Left</div>
            </div>
            <div className="text-center">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
                disabled={gameStatus === 'playing' && (guessedLetters.length > 0 || wrongGuesses.length > 0)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowBrailleMode(!showBrailleMode)}
                className={`p-2 rounded-lg text-sm font-semibold transition-colors ${
                  showBrailleMode ? 'bg-success-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showBrailleMode ? 'Braille' : 'Text'}
              </button>
              <div className="text-sm text-gray-600">Mode</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Area */}
          <div className="space-y-6">
            {/* Hangman Drawing */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <pre className="text-center text-sm font-mono text-gray-700 leading-tight">
                {getHangmanStage()}
              </pre>
            </div>

            {/* Word Display */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Word to Guess</h3>
              <div className="text-4xl font-bold text-primary-500 mb-4 font-mono tracking-wider">
                {getDisplayWord()}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Category: <span className="font-semibold">{currentPuzzle.category}</span>
              </div>
              
              {hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-yellow-800">Hint:</div>
                  <div className="text-yellow-700">{hint}</div>
                </div>
              )}

              {gameStatus === 'playing' && !hint && (
                <button
                  onClick={showHint}
                  className="bg-warning-500 text-white px-4 py-2 rounded-lg hover:bg-warning-600 transition-colors"
                >
                  Show Hint (-5 points)
                </button>
              )}
            </div>

            {/* Game Status */}
            {gameStatus !== 'playing' && (
              <div className={`rounded-lg shadow-lg p-8 text-center ${
                gameStatus === 'won' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="text-4xl mb-4">
                  {gameStatus === 'won' ? '🎉' : '😔'}
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  gameStatus === 'won' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {gameStatus === 'won' ? 'Congratulations!' : 'Game Over!'}
                </h3>
                <p className={`mb-4 ${gameStatus === 'won' ? 'text-green-700' : 'text-red-700'}`}>
                  {gameStatus === 'won' 
                    ? `You guessed "${currentPuzzle.word}" correctly!`
                    : `The word was "${currentPuzzle.word}"`
                  }
                </p>
                <div className="space-x-4">
                  <button
                    onClick={nextRound}
                    className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Next Round
                  </button>
                  <button
                    onClick={resetGame}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Letter Input */}
          <div className="space-y-6">
            {/* Alphabet Grid */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {showBrailleMode ? 'Select Braille Pattern' : 'Select Letter'}
              </h3>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {Object.keys(BRAILLE_ALPHABET).map((letter) => {
                  const dots = getDotsFromCharacter(letter);
                  const pattern = dots ? generateBraillePattern(dots) : '⠀';
                  const isGuessed = guessedLetters.some(g => g.character === letter) || 
                                   wrongGuesses.includes(letter);
                  const isCorrect = guessedLetters.some(g => g.character === letter && g.correct);
                  const isWrong = wrongGuesses.includes(letter);

                  return (
                    <button
                      key={letter}
                      onClick={() => makeGuess(letter)}
                      disabled={isGuessed || gameStatus !== 'playing'}
                      className={`
                        aspect-square rounded-lg border-2 font-bold text-lg transition-all
                        ${isCorrect ? 'bg-green-500 text-white border-green-500' :
                          isWrong ? 'bg-red-500 text-white border-red-500' :
                          isGuessed ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' :
                          'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50 cursor-pointer'
                        }
                      `}
                    >
                      {showBrailleMode ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '1.5rem' }}>
                          {pattern}
                        </span>
                      ) : (
                        letter
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guessed Letters */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Guessed Letters</h3>
              
              {guessedLetters.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No letters guessed yet</p>
              ) : (
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-semibold text-green-600 mb-2">Correct:</h4>
                    <div className="flex flex-wrap gap-2">
                      {guessedLetters
                        .filter(g => g.correct)
                        .map((guess, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold"
                          >
                            {showBrailleMode ? guess.pattern : guess.character}
                          </span>
                        ))}
                    </div>
                  </div>
                  
                  {wrongGuesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-600 mb-2">Wrong:</h4>
                      <div className="flex flex-wrap gap-2">
                        {wrongGuesses.map((letter, index) => {
                          const dots = getDotsFromCharacter(letter);
                          const pattern = dots ? generateBraillePattern(dots) : '⠀';
                          return (
                            <span
                              key={index}
                              className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-semibold"
                            >
                              {showBrailleMode ? pattern : letter}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordGuessing;
