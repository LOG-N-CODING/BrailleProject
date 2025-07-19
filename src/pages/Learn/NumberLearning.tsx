import React, { useState, useEffect, useCallback } from 'react';
import { BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern, parseInputBits } from '../../utils/braille';
import { SectionHeader } from '../../components/UI';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NumberLearning: React.FC = () => {
  const navigate = useNavigate();
  const [targetNumbers, setTargetNumbers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // 점자 디바이스 관련 state
  const { isConnected, setOnDataCallback } = useBrailleDevice();
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [showBrailleKeyboard, setShowBrailleKeyboard] = useState(false);

  const numbers = Object.keys(BRAILLE_NUMBERS);

  useEffect(() => {
    // 게임 시작 시 랜덤 숫자 10개 생성 (0-9 중에서)
    generateRandomTargets();
  }, []);

  const numberCount = 10;

  const generateRandomTargets = () => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setTargetNumbers(shuffled.slice(0, numberCount));
    setCurrentIndex(0);
    setUserInput([]);
    setGameCompleted(false);
  };

  const checkAnswer = useCallback((inputDots: number[]) => {
    if (targetNumbers.length === 0 || inputDots.length === 0) return;
    
    const targetNumber = targetNumbers[currentIndex];
    const targetDots = getDotsFromCharacter(targetNumber);
    
    if (targetDots && JSON.stringify(inputDots.sort()) === JSON.stringify(targetDots.sort())) {
      // 숫자를 영어 단어로 변환해서 발음
      const numberWords: { [key: string]: string } = {
        '0': 'zero',
        '1': 'one',
        '2': 'two', 
        '3': 'three',
        '4': 'four',
        '5': 'five',
        '6': 'six',
        '7': 'seven',
        '8': 'eight',
        '9': 'nine'
      };
      
      const wordToSpeak = numberWords[targetNumber] || targetNumber;
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Correct!',
        text: `${targetNumber} is correct!`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      if (currentIndex + 1 >= targetNumbers.length) {
        setTimeout(() => {
          setGameCompleted(true);
          // SweetAlert는 3초 후에 표시하여 Finish Button을 먼저 보여줌
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Completed!',
              text: `All numbers completed!`,
              confirmButtonText: 'Practice Again',
              cancelButtonText: 'Back to Learning Menu',
              showCancelButton: true,
              allowOutsideClick: true
            }).then((result) => {
              if (result.isConfirmed) {
                generateRandomTargets();
              } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                navigate('/learn');
              }
            });
          }, 1500);
        }, 1000);
      } else {
        setTimeout(() => {
          setCurrentIndex(prevIndex => prevIndex + 1);
          setUserInput([]);
        }, 1000);
      }
    }
  }, [targetNumbers, currentIndex, navigate]);

  // 시리얼 디바이스 데이터 수신 처리
  useEffect(() => {
    if (isConnected) {
      const handleData = (data: number) => {
        const bits = parseInputBits(data);
        
        if (bits.includes(-1)) {
          handleBackspace();
        } else if (bits.includes(-2)) {
          // -2는 Space로 처리 (Number 모드에서는 특별한 처리 없음)
          console.log('Space input received');
        } else if (bits.length > 0) {
          setActiveDots(bits);
          setUserInput(bits);
          
          // 자동으로 답 체크
          setTimeout(() => checkAnswer(bits), 300);
          
          setTimeout(() => {
            setActiveDots([]);
          }, 500);
        }
      };

      setOnDataCallback(handleData);
    }
  }, [isConnected, checkAnswer, setOnDataCallback]);

  const handleBrailleKeyClick = (dot: number) => {
    let newInput;
    if (userInput.includes(dot)) {
      newInput = userInput.filter(d => d !== dot);
    } else {
      newInput = [...userInput, dot].sort((a, b) => a - b);
    }
    setUserInput(newInput);
    
    // 자동으로 답 체크 (점자 패턴이 완성되면 즉시)
    setTimeout(() => checkAnswer(newInput), 100);
  };

  const handleBackspace = () => {
    setUserInput([]);
    setActiveDots([]);
  };

  const currentTarget = targetNumbers[currentIndex] || '';
  const progress = targetNumbers.length > 0 ? ((currentIndex + 1) / targetNumbers.length) * 100 : 0;
  const targetDots = getDotsFromCharacter(currentTarget);
  const targetBraille = targetDots ? generateBraillePattern(targetDots) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center my-8">
          <SectionHeader title="Number Learning (0–9)" />
          <p className="text-gray-600 mb-6">Different languages around the world have their own mappings for the numbers to braille dots. Here are the "dot combinations" for English Braille numbers.</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Progress: {currentIndex + 1} of {targetNumbers.length}
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Target Display */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">Current Challenge:</div>
              <div className="text-6xl font-bold text-gray-800 mb-4">
                {targetNumbers.map((number, index) => (
                  <span 
                    key={index}
                    className={`inline-block mx-2 ${
                      index === currentIndex 
                        ? 'text-blue-600 bg-blue-100 px-4 py-2 rounded-lg' 
                        : index < currentIndex 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                    }`}
                  >
                    {number}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Target Pattern:</div>
              <div className="text-8xl font-mono text-blue-600">
                {targetBraille}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Your Input:</div>
              <div className="text-6xl font-mono text-green-600">
                {userInput.length > 0 ? generateBraillePattern(userInput) : '⠀'}
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
                        userInput.includes(dot)
                          ? 'bg-blue-500 text-white border-blue-500 scale-110' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
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
                        userInput.includes(dot)
                          ? 'bg-blue-500 text-white border-blue-500 scale-110' 
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {dot}
                    </button>
                  ))}
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
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-bold text-xs flex flex-col items-center justify-center`}
        >
          <div className="text-lg">⠿</div>
          <div>{showBrailleKeyboard ? 'Hide' : 'Show'}</div>
        </button>

        {/* Reference Grid - Number Cards */}
        <div className="max-w-[1000px] mx-auto bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-4 text-lg font-semibold text-gray-700">
            Number Reference (0-9)
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { num: '1', braille: '⠁' },
              { num: '2', braille: '⠃' },
              { num: '3', braille: '⠉' },
              { num: '4', braille: '⠙' },
              { num: '5', braille: '⠑' },
              { num: '6', braille: '⠋' },
              { num: '7', braille: '⠛' },
              { num: '8', braille: '⠓' },
              { num: '9', braille: '⠊' },
              { num: '0', braille: '⠚' }
            ].map((item, index) => {
              const isCompleted = targetNumbers.slice(0, currentIndex).includes(item.num);
              const isCurrent = targetNumbers[currentIndex] === item.num;

              return (
                <div
                  key={item.num}
                  className={`p-3 rounded-lg text-center transition-all border-2 min-w-[80px] ${
                    isCurrent
                      ? 'bg-blue-100 border-blue-500 scale-105'
                      : isCompleted
                        ? 'bg-green-100 border-green-500'
                        : index % 2 === 0 
                          ? 'bg-white border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl font-mono text-blue-600 mb-1">{item.braille}</div>
                  <div className="font-bold text-lg text-gray-800">{item.num}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finish Button */}
        {gameCompleted && (
          <div className="text-center mt-8 space-y-4">
            <div className="text-2xl font-bold text-green-600 mb-4">
              🎉 Congratulations! All numbers completed! 🎉
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={generateRandomTargets}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Practice Again
              </button>
              <button
                onClick={() => navigate('/learn')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Back to Learning Menu
              </button>
            </div>
          </div>
        )}
        
        <div className="my-10 flex justify-center">
          <button
            onClick={() => navigate('/learn')}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Learning Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default NumberLearning;
