import React, { useState, useEffect } from 'react';
import { BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern } from '../../utils/braille';
import { dictionaryService } from '../../utils/dictionary';

const NumberLearning: React.FC = () => {
  const [currentNumber, setCurrentNumber] = useState('1');
  const [mathExample, setMathExample] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const numbers = Object.keys(BRAILLE_NUMBERS);

  useEffect(() => {
    generateMathExample();
  }, [currentNumber]);

  const generateMathExample = () => {
    const num = parseInt(currentNumber);
    const examples = [
      `${num} + 1 = ${num + 1}`,
      `${num} × 2 = ${num * 2}`,
      `${num} - 1 = ${num - 1}`,
      `10 - ${num} = ${10 - num}`,
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setMathExample(randomExample);
  };

  const speakNumber = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentNumber);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const dots = getDotsFromCharacter(currentNumber);
  const braillePattern = dots ? generateBraillePattern(dots) : '';

  const getNumberWord = (num: string): string => {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    return words[parseInt(num)] || num;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">1</div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">2</div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">3</div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Number Learning</h1>
          <p className="text-lg text-gray-600">Master Braille numbers with mathematical examples</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Number Grid */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Number</h2>
            <div className="grid grid-cols-5 gap-4">
              {numbers.map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentNumber(number)}
                  className={`
                    w-16 h-16 rounded-lg border-2 font-bold text-xl transition-all
                    ${currentNumber === number
                      ? 'bg-success-500 text-white border-success-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-success-300 hover:bg-success-50'
                    }
                  `}
                >
                  {number}
                </button>
              ))}
            </div>

            {/* Quick Math Practice */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Math</h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700 mb-4">{mathExample}</p>
                <button
                  onClick={generateMathExample}
                  className="bg-warning-500 text-white px-4 py-2 rounded-lg hover:bg-warning-600 transition-colors"
                >
                  New Example
                </button>
              </div>
            </div>
          </div>

          {/* Current Number Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-6xl font-bold text-success-500 mb-4">{currentNumber}</h2>
              <div className="text-8xl mb-4" style={{ fontFamily: 'monospace' }}>
                {braillePattern}
              </div>
              <p className="text-gray-600 mb-4">
                Braille dots: {dots?.join(', ')}
              </p>
              <button
                onClick={speakNumber}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                🔊 Hear "{getNumberWord(currentNumber)}"
              </button>
            </div>

            {/* Number Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Number Information</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Written:</span> {getNumberWord(currentNumber)}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Value:</span> {parseInt(currentNumber)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-700">
                    <span className="font-medium">Type:</span> {parseInt(currentNumber) % 2 === 0 ? 'Even' : 'Odd'} number
                  </p>
                </div>

                {parseInt(currentNumber) > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
                      <span className="font-medium">Count:</span> 
                      <span className="ml-2">
                        {'●'.repeat(parseInt(currentNumber))}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Practice Patterns */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Number Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {numbers.slice(1, 6).map((num) => {
              const numDots = getDotsFromCharacter(num);
              const numPattern = numDots ? generateBraillePattern(numDots) : '';
              return (
                <div
                  key={num}
                  className="text-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-success-50 transition-colors"
                  onClick={() => setCurrentNumber(num)}
                >
                  <div className="text-3xl font-bold text-gray-700 mb-2">{num}</div>
                  <div className="text-6xl mb-2" style={{ fontFamily: 'monospace' }}>
                    {numPattern}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getNumberWord(num)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <button
            onClick={() => {
              const currentIndex = numbers.indexOf(currentNumber);
              if (currentIndex > 0) {
                setCurrentNumber(numbers[currentIndex - 1]);
              }
            }}
            disabled={numbers.indexOf(currentNumber) === 0}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <button
            onClick={() => {
              const currentIndex = numbers.indexOf(currentNumber);
              if (currentIndex < numbers.length - 1) {
                setCurrentNumber(numbers[currentIndex + 1]);
              }
            }}
            disabled={numbers.indexOf(currentNumber) === numbers.length - 1}
            className="bg-success-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-success-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberLearning;
