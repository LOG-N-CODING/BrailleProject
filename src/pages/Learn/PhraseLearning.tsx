import React, { useState, useEffect } from 'react';
import { BRAILLE_ALPHABET, generateBraillePattern, parseInputBits, findCharacterFromDots, getDotsFromCharacter } from '../../utils/braille';
import { SectionHeader } from '../../components/UI';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Phrases data based on Phrases.md
const phrasesData = {
  'Greetings': [
    'good morning', 'good afternoon', 'good evening', 'good night', 'hello there',
    'how are you', 'nice to meet you', 'see you later', 'have a nice day', 'take care'
  ],
  'Daily Conversation': [
    'excuse me', 'thank you', 'you are welcome', 'i am sorry', 'no problem',
    'what time is it', 'where is the bathroom', 'can you help me', 'i need help', 'how much is this'
  ],
  'School Life': [
    'what is your name', 'how old are you', 'where do you live', 'what grade are you in', 'do you like school',
    'what is your favorite subject', 'can i borrow your pencil', 'when is the test', 'homework is hard', 'lunch time'
  ],
  'Food & Restaurant': [
    'i am hungry', 'i am thirsty', 'what would you like', 'can i have the menu', 'i would like to order',
    'the food is delicious', 'can i have the check', 'table for two please', 'i am allergic to nuts', 'water please'
  ]
};

const PhraseLearning: React.FC = () => {
  const navigate = useNavigate();
  const [targetPhrases, setTargetPhrases] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState<string>('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // 점자 디바이스 관련 state
  const { isConnected, setOnDataCallback } = useBrailleDevice();
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [showBrailleKeyboard, setShowBrailleKeyboard] = useState(false);

  const categories = Object.keys(phrasesData);

  useEffect(() => {
    if (selectedCategory) {
      generateRandomTargets();
    }
  }, [selectedCategory]);

  const generateRandomTargets = () => {
    if (!selectedCategory) return;
    
    const categoryPhrases = phrasesData[selectedCategory as keyof typeof phrasesData];
    const shuffled = [...categoryPhrases].sort(() => Math.random() - 0.5);
    setTargetPhrases(shuffled.slice(0, 5)); // 5 phrases per game
    setCurrentIndex(0);
    setUserInput('');
    setGameCompleted(false);
  };

  const checkAnswer = (inputToCheck?: string) => {
    const currentInput = inputToCheck || userInput;
    if (targetPhrases.length === 0 || currentInput.trim().length === 0) return;
    
    const targetPhrase = targetPhrases[currentIndex];
    
    if (currentInput.toLowerCase().trim() === targetPhrase.toLowerCase()) {
      // 구문 발음
      const utterance = new SpeechSynthesisUtterance(targetPhrase);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Correct!',
        text: `"${targetPhrase}" is correct!`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      if (currentIndex + 1 >= targetPhrases.length) {
        setGameCompleted(true);
        Swal.fire({
          icon: 'success',
          title: 'Completed!',
          text: `All phrases completed!`,
          confirmButtonText: 'Practice Again'
        }).then(() => {
          generateRandomTargets();
        });
      } else {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setUserInput('');
        }, 1500);
      }
    }
  };

  // 시리얼 디바이스 데이터 수신 처리
  useEffect(() => {
    if (isConnected) {
      const handleData = (data: number) => {
        const bits = parseInputBits(data);
        
        if (bits.includes(-1)) {
          handleBackspace();
        } else if (bits.includes(-2)) {
          // -2는 Space로 처리
          handleSpaceInput();
        } else if (bits.length > 0) {
          setActiveDots(bits);
          
          const character = findCharacterFromDots(bits);
          if (character && character.match(/[A-Z]/)) {
            const newInput = userInput + character.toLowerCase();
            setUserInput(newInput);
            
            // 자동으로 답 체크
            setTimeout(() => {
              checkAnswer(newInput);
            }, 300);
          }
          
          setTimeout(() => {
            setActiveDots([]);
          }, 500);
        }
      };

      setOnDataCallback(handleData);
    }
  }, [isConnected, userInput, targetPhrases, currentIndex]);

  const handleBrailleKeyClick = (dot: number) => {
    const newActiveDots = activeDots.includes(dot) 
      ? activeDots.filter(d => d !== dot) 
      : [...activeDots, dot];
    
    setActiveDots(newActiveDots);
    // 자동 입력 제거 - Input 버튼을 눌러야 입력됨
  };

  const handleCharacterInput = () => {
    if (activeDots.length === 0) return;
    
    const character = findCharacterFromDots(activeDots);
    if (character && character.match(/[A-Z]/)) {
      const newInput = userInput + character.toLowerCase();
      setUserInput(newInput);
      
      // Input 버튼을 눌렀을 때 답 체크
      setTimeout(() => {
        checkAnswer(newInput);
      }, 100);
    }
    setActiveDots([]); // 입력 후 점자 패턴 초기화
  };

  const handleSpaceInput = () => {
    const newInput = userInput + ' ';
    setUserInput(newInput);
    
    // 자동으로 답 체크
    setTimeout(() => {
      checkAnswer(newInput);
    }, 100);
  };

  const handleBackspace = () => {
    setUserInput(prev => prev.slice(0, -1));
    setActiveDots([]);
  };

  const currentTarget = targetPhrases[currentIndex] || '';
  const progress = targetPhrases.length > 0 ? ((currentIndex + 1) / targetPhrases.length) * 100 : 0;

  // Category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/learn/alphabet-mode')}
              className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Modes
            </button>
            <SectionHeader title="Phrases - Choose Category" />
            <p className="text-gray-600 mb-6">Select a category to start the phrases learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">{category}</h3>
                <p className="text-gray-600">
                  {phrasesData[category as keyof typeof phrasesData].length} phrases available
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Click to start learning with {category.toLowerCase()} phrases
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center my-8">
          <button
            onClick={() => setSelectedCategory('')}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Categories
          </button>
          <SectionHeader title={`Phrases - ${selectedCategory}`} />
          <p className="text-gray-600 mb-6">Type the phrase using braille patterns - phrases are automatically checked when complete</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Progress: {currentIndex + 1} of {targetPhrases.length}
          </div>
        </div>

        {/* Phrases Progress */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4 text-lg font-semibold text-gray-700">
            Progress
          </div>
          <div className="flex justify-center space-x-2 flex-wrap">
            {targetPhrases.map((phrase, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all mb-2 ${
                    isCurrent 
                      ? 'bg-green-100 border-2 border-green-500 text-green-700' 
                      : isCompleted 
                        ? 'bg-teal-100 border-2 border-teal-500 text-teal-700' 
                        : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  {phrase}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Target Display */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">Current Phrase:</div>
              <div className="text-4xl font-bold text-green-600 mb-4">
                {currentTarget.toUpperCase()}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Your Input:</div>
              <div className="text-2xl font-mono text-teal-600 min-h-[3rem] border-2 border-dashed border-gray-300 rounded-lg p-4">
                {userInput.toUpperCase() || 'Type here...'}
              </div>
            </div>
          </div>

          {/* Braille Keyboard - Conditional Display */}
          {showBrailleKeyboard && (
            <div className="mb-8">
              <div className="text-center mb-4 text-lg font-semibold text-gray-700">
                Braille Keyboard
              </div>
              <div className="flex justify-center items-center space-x-4">
                {/* Left Column (Dots 1, 2, 3) */}
                <div className="flex flex-col space-y-2">
                  {[1, 2, 3].map(dot => (
                    <button
                      key={dot}
                      onClick={() => handleBrailleKeyClick(dot)}
                      className={`w-12 h-12 rounded-full border-2 font-bold text-lg transition-all ${
                        activeDots.includes(dot)
                          ? 'bg-green-500 text-white border-green-500 scale-110' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {dot}
                    </button>
                  ))}
                </div>

                {/* Right Column (Dots 4, 5, 6) */}
                <div className="flex flex-col space-y-2">
                  {[4, 5, 6].map(dot => (
                    <button
                      key={dot}
                      onClick={() => handleBrailleKeyClick(dot)}
                      className={`w-12 h-12 rounded-full border-2 font-bold text-lg transition-all ${
                        activeDots.includes(dot)
                          ? 'bg-green-500 text-white border-green-500 scale-110' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {dot}
                    </button>
                  ))}
                </div>

                {/* Control Buttons */}
                <div className="flex flex-col space-y-2 ml-8">
                  <button
                    onClick={handleCharacterInput}
                    disabled={activeDots.length === 0}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeDots.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <span className='material-icons'>input</span>
                  </button>
                  <button
                    onClick={handleSpaceInput}
                    className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <span className='material-icons'>space_bar</span>
                  </button>
                  <button
                    onClick={handleBackspace}
                    disabled={userInput.length === 0}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-all ${
                      userInput.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    <span className='material-icons'>backspace</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Braille Keyboard Toggle Button */}
        <button
          onClick={() => setShowBrailleKeyboard(!showBrailleKeyboard)}
          className={`fixed left-4 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 z-50 ${
            showBrailleKeyboard 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold text-xs flex flex-col items-center justify-center`}
        >
          <div className="text-lg">⠿</div>
          <div>{showBrailleKeyboard ? 'Hide' : 'Show'}</div>
        </button>

        {/* Alphabet Reference */}
        <div className="max-w-[968px] mx-auto bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4 text-lg font-semibold text-gray-700">
            Alphabet Reference
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.keys(BRAILLE_ALPHABET).map((letter, index) => {
              const dots = getDotsFromCharacter(letter);
              const braillePattern = dots ? generateBraillePattern(dots) : '';
              
              return (
                <div
                  key={letter}
                  className="p-3 rounded-lg text-center transition-all border-2 min-w-[60px] bg-gray-50 border-gray-200 hover:bg-gray-100"
                >
                  <div className="font-bold text-lg text-gray-800">{letter}</div>
                  <div className="text-2xl font-mono text-green-600">{braillePattern}</div>
                </div>
              );
            })}
          </div>
        </div>

        

        {/* Finish Button */}
        {gameCompleted && (
          <div className="text-center mt-6">
            <button
              onClick={generateRandomTargets}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105"
            >
              Practice Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseLearning;
