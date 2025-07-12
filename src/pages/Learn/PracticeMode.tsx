import React, { useState, useEffect, useRef } from 'react';
import { BrailleSerialDevice } from '../../utils/serialDevice';
import { parseInputBits, findCharacterFromDots, generateBraillePattern, getDotsFromCharacter } from '../../utils/braille';

const PracticeMode: React.FC = () => {
  const [serialDevice, setSerialDevice] = useState<BrailleSerialDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [inputHistory, setInputHistory] = useState<Array<{input: string, correct: boolean, timestamp: Date}>>([]);
  const [score, setScore] = useState(0);
  const [practiceMode, setPracticeMode] = useState<'alphabet' | 'numbers' | 'mixed'>('alphabet');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isListening, setIsListening] = useState(false);
  const challengeInputRef = useRef<HTMLInputElement>(null);

  const challenges = {
    alphabet: {
      easy: ['A', 'B', 'C', 'D', 'E'],
      medium: ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'],
      hard: ['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    },
    numbers: {
      easy: ['1', '2', '3'],
      medium: ['4', '5', '6', '7'],
      hard: ['8', '9', '0']
    },
    mixed: {
      easy: ['A', 'B', '1', '2'],
      medium: ['C', 'D', 'E', '3', '4', '5'],
      hard: ['F', 'G', 'H', 'I', '6', '7', '8', '9', '0']
    }
  };

  useEffect(() => {
    generateNewChallenge();
  }, [practiceMode, difficulty]);

  useEffect(() => {
    if (serialDevice && isConnected) {
      const handleData = (data: number) => {
        const bits = parseInputBits(data);
        const character = findCharacterFromDots(bits);
        if (character) {
          handleBrailleInput(character);
        }
      };

      serialDevice.setOnDataCallback(handleData);
    }
  }, [serialDevice, isConnected, currentChallenge]);

  const connectDevice = async () => {
    try {
      const device = new BrailleSerialDevice();
      await device.connect();
      setSerialDevice(device);
      setIsConnected(true);
      setIsListening(true);
    } catch (error) {
      console.error('Failed to connect to device:', error);
      alert('Failed to connect to Braille device. Make sure it\'s connected and try again.');
    }
  };

  const disconnectDevice = async () => {
    if (serialDevice) {
      await serialDevice.disconnect();
      setSerialDevice(null);
      setIsConnected(false);
      setIsListening(false);
    }
  };

  const generateNewChallenge = () => {
    const challengeSet = challenges[practiceMode][difficulty];
    const randomChallenge = challengeSet[Math.floor(Math.random() * challengeSet.length)];
    setCurrentChallenge(randomChallenge);
    setUserInput('');
  };

  const handleBrailleInput = (character: string) => {
    setUserInput(character);
    setTimeout(() => checkAnswer(character), 100);
  };

  const handleKeyboardInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer(userInput);
    }
  };

  const checkAnswer = (input: string) => {
    const correct = input.toUpperCase() === currentChallenge.toUpperCase();
    
    setInputHistory(prev => [
      ...prev,
      { input, correct, timestamp: new Date() }
    ]);

    if (correct) {
      setScore(prev => prev + 1);
      setTimeout(generateNewChallenge, 1000);
    }
  };

  const resetPractice = () => {
    setScore(0);
    setInputHistory([]);
    generateNewChallenge();
  };

  const getCurrentChallengeBraille = () => {
    const dots = getDotsFromCharacter(currentChallenge);
    return dots ? generateBraillePattern(dots) : '⠀';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-8">
            <div className="flex space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"></div>
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"></div>
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"></div>
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"></div>
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-4xl font-light text-gray-600 mb-4">Practice Mode</h1>
          <p className="text-lg text-gray-600">Practice Braille input with your Arduino device</p>
        </div>

        {/* Device Connection */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Arduino Device</h2>
              <p className="text-gray-600">
                {isConnected ? '✅ Connected and listening' : '❌ Not connected'}
              </p>
            </div>
            <div>
              {!isConnected ? (
                <button
                  onClick={connectDevice}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Connect Device
                </button>
              ) : (
                <button
                  onClick={disconnectDevice}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Practice Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Practice Mode</h3>
            <div className="space-y-2">
              {(['alphabet', 'numbers', 'mixed'] as const).map((mode) => (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    name="practiceMode"
                    value={mode}
                    checked={practiceMode === mode}
                    onChange={(e) => setPracticeMode(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Difficulty</h3>
            <div className="space-y-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-success-500 mb-2">{score}</div>
              <div className="text-sm text-gray-600">Correct answers</div>
              <button
                onClick={resetPractice}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Challenge Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Current Challenge</h3>
            <div className="text-center">
              <div className="text-8xl font-bold text-warning-500 mb-4">{currentChallenge}</div>
              <div className="text-6xl mb-4" style={{ fontFamily: 'monospace' }}>
                {getCurrentChallengeBraille()}
              </div>
              <p className="text-gray-600">Input this character using your Braille device</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Input</h3>
            <div className="text-center">
              <div className="text-8xl font-bold text-primary-500 mb-4">
                {userInput || '?'}
              </div>
              
              {/* Manual input for testing */}
              <div className="mt-6">
                <input
                  ref={challengeInputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyboardInput}
                  placeholder="Or type manually for testing"
                  className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg"
                  maxLength={1}
                />
                <button
                  onClick={() => checkAnswer(userInput)}
                  className="mt-2 w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Check Answer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Input History */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Attempts</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {inputHistory.slice(-10).reverse().map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl ${entry.correct ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.correct ? '✅' : '❌'}
                  </span>
                  <span className="text-lg font-semibold">{entry.input}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            {inputHistory.length === 0 && (
              <p className="text-center text-gray-500 py-8">No attempts yet. Start practicing!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
