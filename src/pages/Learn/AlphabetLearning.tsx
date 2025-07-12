import React, { useState, useEffect } from 'react';
import { BRAILLE_ALPHABET, getDotsFromCharacter, generateBraillePattern } from '../../utils/braille';
import { dictionaryService } from '../../utils/dictionary';

const AlphabetLearning: React.FC = () => {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [wordData, setWordData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const letters = Object.keys(BRAILLE_ALPHABET);

  useEffect(() => {
    loadExampleWord();
  }, [currentLetter]);

  const loadExampleWord = async () => {
    setIsLoading(true);
    try {
      // 각 알파벳에 대한 예시 단어
      const exampleWords: Record<string, string> = {
        'A': 'apple', 'B': 'ball', 'C': 'cat', 'D': 'dog', 'E': 'elephant',
        'F': 'fish', 'G': 'guitar', 'H': 'house', 'I': 'ice', 'J': 'jump',
        'K': 'key', 'L': 'lion', 'M': 'moon', 'N': 'nose', 'O': 'orange',
        'P': 'piano', 'Q': 'queen', 'R': 'rabbit', 'S': 'sun', 'T': 'tree',
        'U': 'umbrella', 'V': 'violin', 'W': 'water', 'X': 'x-ray', 'Y': 'yellow', 'Z': 'zebra'
      };

      const word = exampleWords[currentLetter];
      const data = await dictionaryService.searchWord(word);
      setWordData({ word, data });
    } catch (error) {
      console.error('Failed to load word data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playPronunciation = async () => {
    if (wordData?.word) {
      await dictionaryService.playPronunciation(wordData.word);
    }
  };

  const dots = getDotsFromCharacter(currentLetter);
  const braillePattern = dots ? generateBraillePattern(dots) : '';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-8">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
              <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Alphabet Learning</h1>
          <p className="text-lg text-gray-600">Learn Braille alphabet with interactive examples</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Alphabet Grid */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Letter</h2>
            <div className="grid grid-cols-5 gap-4">
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setCurrentLetter(letter)}
                  className={`
                    w-16 h-16 rounded-lg border-2 font-bold text-xl transition-all
                    ${currentLetter === letter
                      ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                    }
                  `}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Current Letter Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-6xl font-bold text-primary-500 mb-4">{currentLetter}</h2>
              <div className="text-8xl mb-4" style={{ fontFamily: 'monospace' }}>
                {braillePattern}
              </div>
              <p className="text-gray-600">
                Braille dots: {dots?.join(', ')}
              </p>
            </div>

            {/* Example Word */}
            {wordData && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Example Word</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-800 capitalize">
                      {wordData.word}
                    </span>
                    <button
                      onClick={playPronunciation}
                      className="bg-success-500 text-white p-2 rounded-full hover:bg-success-600 transition-colors"
                      disabled={isLoading}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464l3.536 3.536-3.536 3.536M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {wordData.data && (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Pronunciation:</span> {dictionaryService.getPhonetic(wordData.data) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Part of speech:</span> {dictionaryService.getPartOfSpeech(wordData.data) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Definition:</span> {dictionaryService.getFirstDefinition(wordData.data) || 'Loading...'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <button
            onClick={() => {
              const currentIndex = letters.indexOf(currentLetter);
              if (currentIndex > 0) {
                setCurrentLetter(letters[currentIndex - 1]);
              }
            }}
            disabled={letters.indexOf(currentLetter) === 0}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <button
            onClick={() => {
              const currentIndex = letters.indexOf(currentLetter);
              if (currentIndex < letters.length - 1) {
                setCurrentLetter(letters[currentIndex + 1]);
              }
            }}
            disabled={letters.indexOf(currentLetter) === letters.length - 1}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlphabetLearning;
