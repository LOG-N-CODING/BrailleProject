import React, { useState, useEffect, useCallback } from 'react';
import { BRAILLE_ALPHABET, BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern, findCharacterFromDots } from '../../utils/braille';

interface MemoryCard {
  id: string;
  character: string;
  pattern: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'character' | 'pattern';
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameMode, setGameMode] = useState<'alphabet' | 'numbers' | 'mixed'>('alphabet');

  const difficultySettings = {
    easy: { pairs: 6, characters: 6 },
    medium: { pairs: 8, characters: 8 },
    hard: { pairs: 12, characters: 12 }
  };

  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    let availableCharacters: string[] = [];

    if (gameMode === 'alphabet') {
      availableCharacters = Object.keys(BRAILLE_ALPHABET).slice(0, settings.characters);
    } else if (gameMode === 'numbers') {
      availableCharacters = Object.keys(BRAILLE_NUMBERS).slice(0, settings.characters);
    } else {
      const alphabetChars = Object.keys(BRAILLE_ALPHABET).slice(0, Math.ceil(settings.characters / 2));
      const numberChars = Object.keys(BRAILLE_NUMBERS).slice(0, Math.floor(settings.characters / 2));
      availableCharacters = [...alphabetChars, ...numberChars];
    }

    // Select random characters for the game
    const selectedChars = availableCharacters
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.pairs);

    // Create pairs of cards (character and pattern)
    const gameCards: MemoryCard[] = [];
    selectedChars.forEach((char, index) => {
      const dots = getDotsFromCharacter(char);
      const pattern = dots ? generateBraillePattern(dots) : '⠀';
      const pairId = `pair-${index}`;

      // Character card
      gameCards.push({
        id: `${pairId}-char`,
        character: char,
        pattern,
        isFlipped: false,
        isMatched: false,
        type: 'character'
      });

      // Pattern card
      gameCards.push({
        id: `${pairId}-pattern`,
        character: char,
        pattern,
        isFlipped: false,
        isMatched: false,
        type: 'pattern'
      });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameStarted(false);
    setGameCompleted(false);
    setStartTime(null);
    setEndTime(null);
  }, [difficulty, gameMode]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard) {
        if (firstCard.character === secondCard.character && firstCard.type !== secondCard.type) {
          // Match found
          setMatchedPairs(prev => [...prev, firstCard.character]);
          setCards(prev => prev.map(card => 
            card.character === firstCard.character 
              ? { ...card, isMatched: true }
              : card
          ));
        }

        // Reset flipped cards after a delay
        setTimeout(() => {
          setFlippedCards([]);
          setCards(prev => prev.map(card => ({
            ...card,
            isFlipped: card.isMatched || flippedCards.includes(card.id) ? card.isFlipped : false
          })));
        }, 1000);
      }

      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    const totalPairs = difficultySettings[difficulty].pairs;
    if (matchedPairs.length === totalPairs && totalPairs > 0) {
      setGameCompleted(true);
      setEndTime(new Date());
    }
  }, [matchedPairs, difficulty]);

  const handleCardClick = (cardId: string) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(new Date());
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    setFlippedCards(prev => [...prev, cardId]);
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
  };

  const getGameTime = (): string => {
    if (!startTime) return '00:00';
    const endTimeToUse = endTime || new Date();
    const seconds = Math.floor((endTimeToUse.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = (): { stars: number; message: string } => {
    const totalPairs = difficultySettings[difficulty].pairs;
    const perfectMoves = totalPairs;
    const goodMoves = totalPairs * 1.5;
    
    if (moves <= perfectMoves) {
      return { stars: 3, message: 'Perfect! Amazing memory!' };
    } else if (moves <= goodMoves) {
      return { stars: 2, message: 'Great job! Well done!' };
    } else {
      return { stars: 1, message: 'Good effort! Keep practicing!' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold">🧠</div>
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold">🎯</div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Memory Game</h1>
          <p className="text-lg text-gray-600">Match Braille characters with their patterns</p>
        </div>

        {gameCompleted ? (
          /* Game Complete Screen */
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Congratulations!</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-center space-x-1 text-4xl">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={i < getPerformanceRating().stars ? 'text-yellow-400' : 'text-gray-300'}>
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-xl text-gray-600">{getPerformanceRating().message}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600">{moves}</div>
                <div className="text-blue-600">Moves</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600">{getGameTime()}</div>
                <div className="text-green-600">Time</div>
              </div>
            </div>

            <button
              onClick={initializeGame}
              className="bg-primary-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            {/* Game Settings and Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Game Mode */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={gameStarted}
                  >
                    <option value="alphabet">Alphabet</option>
                    <option value="numbers">Numbers</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={gameStarted}
                  >
                    <option value="easy">Easy (6 pairs)</option>
                    <option value="medium">Medium (8 pairs)</option>
                    <option value="hard">Hard (12 pairs)</option>
                  </select>
                </div>

                {/* Moves */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{moves}</div>
                  <div className="text-sm text-gray-600">Moves</div>
                </div>

                {/* Time */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getGameTime()}</div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <button
                    onClick={initializeGame}
                    className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset Game
                  </button>
                </div>
              </div>
            </div>

            {/* Game Board */}
            <div className={`grid gap-4 mx-auto ${
              difficulty === 'easy' ? 'grid-cols-4 max-w-2xl' :
              difficulty === 'medium' ? 'grid-cols-4 max-w-3xl' :
              'grid-cols-6 max-w-4xl'
            }`}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    relative aspect-square rounded-lg cursor-pointer transform transition-all duration-300
                    ${card.isFlipped || card.isMatched 
                      ? 'bg-white shadow-lg' 
                      : 'bg-gradient-to-br from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 shadow-md hover:shadow-lg hover:scale-105'
                    }
                    ${card.isMatched ? 'ring-4 ring-green-400' : ''}
                  `}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    {card.isFlipped || card.isMatched ? (
                      <div className="text-center">
                        {card.type === 'character' ? (
                          <div className="text-4xl md:text-6xl font-bold text-gray-800">
                            {card.character}
                          </div>
                        ) : (
                          <div className="text-4xl md:text-6xl" style={{ fontFamily: 'monospace' }}>
                            {card.pattern}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-white text-2xl md:text-4xl">
                        ❓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Game Instructions */}
            {!gameStarted && (
              <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Play</h3>
                <p className="text-blue-700">
                  Click on cards to flip them over. Match each Braille character with its corresponding pattern. 
                  Try to complete the game in as few moves as possible!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
