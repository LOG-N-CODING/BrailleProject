import React, { useState, useEffect, useCallback } from 'react';
import { BRAILLE_ALPHABET, getDotsFromCharacter, generateBraillePattern, parseInputBits, findCharacterFromDots } from '../../utils/braille';
import { SectionHeader } from '../../components/UI';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateLetterProgress, getUserLearningProgress } from '../../utils/learningProgress';
import Swal from 'sweetalert2';

const AlphabetLearning: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [targetLetters, setTargetLetters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [completedLetters, setCompletedLetters] = useState<Set<string>>(new Set());
  
  // 점자 디바이스 관련 state
  const { isConnected, setOnDataCallback } = useBrailleDevice();
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [showBrailleKeyboard, setShowBrailleKeyboard] = useState(false);

  const letters = Object.keys(BRAILLE_ALPHABET);

  useEffect(() => {
    // 게임 시작 시 랜덤 알파벳 10개 생성
    generateRandomTargets();
    
    // 사용자의 학습 진행도 로드
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) {
      console.log('🔐 No user logged in - skipping progress load');
      return;
    }
    
    console.log('📊 Loading user progress for:', user.email);
    
    try {
      const progress = await getUserLearningProgress(user);
      console.log('📈 Progress loaded:', progress);
      
      const completed = new Set<string>();
      
      // 완료된 글자들을 Set에 추가
      Object.entries(progress.letters).forEach(([letter, status]) => {
        if (status === 1) {
          completed.add(letter);
          console.log(`✅ Letter ${letter} is already completed`);
        }
      });
      
      setCompletedLetters(completed);
      console.log('🎯 Total completed letters:', completed.size);
    } catch (error) {
      console.error('❌ Failed to load user progress:', error);
    }
  };

  const letterCount = 10;

  const generateRandomTargets = () => {
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setTargetLetters(shuffled.slice(0, letterCount));
    setCurrentIndex(0);
    setUserInput([]);
    setGameCompleted(false);
  };

  const checkAnswer = useCallback(async (inputDots: number[]) => {
    if (targetLetters.length === 0 || inputDots.length === 0) return;
    
    const targetLetter = targetLetters[currentIndex];
    const targetDots = getDotsFromCharacter(targetLetter);
    
    console.log('🔍 Checking answer:', {
      targetLetter,
      inputDots,
      targetDots,
      user: user ? user.email : 'not logged in',
      alreadyCompleted: completedLetters.has(targetLetter)
    });
    
    if (targetDots && JSON.stringify(inputDots.sort()) === JSON.stringify(targetDots.sort())) {
      console.log('✅ Correct answer!');
      
      // 알파벳 발음 - 개선된 버전
      try {
        // speechSynthesis가 사용 가능한지 확인
        if ('speechSynthesis' in window) {
          // 기존 음성 중단
          speechSynthesis.cancel();
          
          // 약간의 딜레이 후 실행 (브라우저 정책 대응)
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(targetLetter);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1.0; // 볼륨 최대
            utterance.lang = 'en-US';
            
            // 이벤트 리스너 추가 (디버깅용)
            utterance.onstart = () => {
              console.log(`🔊 TTS started: ${targetLetter}`);
            };
            utterance.onend = () => {
              console.log(`✅ TTS finished: ${targetLetter}`);
            };
            utterance.onerror = (event) => {
              console.error('❌ TTS error:', event);
            };
            
            console.log(`🎵 Attempting to speak: "${targetLetter}"`);
            console.log('Available voices:', speechSynthesis.getVoices().length);
            
            speechSynthesis.speak(utterance);
          }, 100);
        } else {
          console.error('❌ speechSynthesis not supported in this browser');
        }
      } catch (error) {
        console.error('❌ TTS error:', error);
      }
      
      // 학습 진행도 저장 (로그인한 사용자만)
      if (user && !completedLetters.has(targetLetter)) {
        console.log('💾 Attempting to save progress to Firestore...');
        try {
          await updateLetterProgress(user, targetLetter);
          setCompletedLetters(prev => new Set([...prev, targetLetter]));
          console.log(`🎉 Letter ${targetLetter} progress saved to database successfully!`);
        } catch (error) {
          console.error('❌ Failed to save letter progress:', error);
        }
      } else if (!user) {
        console.log('⚠️ User not logged in - skipping database save');
      } else if (completedLetters.has(targetLetter)) {
        console.log(`ℹ️ Letter ${targetLetter} already completed - skipping save`);
      }
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Correct!',
        text: `${targetLetter} is correct!`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      if (currentIndex + 1 >= targetLetters.length) {
        setTimeout(() => {
          setGameCompleted(true);
          // SweetAlert는 3초 후에 표시하여 Finish Button을 먼저 보여줌
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Completed!',
              text: `All letters completed!`,
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
  }, [targetLetters, currentIndex, user, completedLetters]);

  // 시리얼 디바이스 데이터 수신 처리
  useEffect(() => {
    if (isConnected) {
      const handleData = (data: number) => {
        const bits = parseInputBits(data);
        
        if (bits.includes(-1)) {
          handleBackspace();
        } else if (bits.includes(-2)) {
          // -2는 Space로 처리 (Alphabet 모드에서는 특별한 처리 없음)
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
  }, [isConnected, checkAnswer]);

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

  const currentTarget = targetLetters[currentIndex] || '';
  const progress = targetLetters.length > 0 ? ((currentIndex + 1) / targetLetters.length) * 100 : 0;
  const targetDots = getDotsFromCharacter(currentTarget);
  const targetBraille = targetDots ? generateBraillePattern(targetDots) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center my-8">
          <SectionHeader title="Alphabet Learning (A–Z)" />
          <p className="text-gray-600 mb-6">Match the braille pattern for each letter</p>
          
          {/* Login Status */}
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                📚 Sign in to save your learning progress!
              </p>
            </div>
          )}
          
          {/* Debug Section - 개발 중에만 사용 */}
          {/* {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm mb-2">
                🐛 Debug: Logged in as {user.email}
              </p>
              <button
                onClick={async () => {
                  console.log('🧪 Manual test: Trying to save letter A');
                  try {
                    await updateLetterProgress(user, 'A');
                    console.log('✅ Manual test successful!');
                    alert('Test successful! Check console and Firebase.');
                  } catch (error) {
                    console.error('❌ Manual test failed:', error);
                    alert('Test failed! Check console for details.');
                  }
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
              >
                Test Firebase Save
              </button>
            </div>
          )} */}
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Progress: {currentIndex + 1} of {targetLetters.length}
            {user && completedLetters.size > 0 && (
              <span className="ml-4 text-yellow-600">
                • {completedLetters.size}/26 letters learned overall
              </span>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* Target Display */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">Current Challenge:</div>
              <div className="text-6xl font-bold text-gray-800 mb-4">
                {targetLetters.map((letter, index) => (
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
                    {letter}
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

        {/* Reference Grid */}
        <div className="max-w-[968px] mx-auto bg-white rounded-3xl shadow-lg p-6">
          <div className="text-center mb-4 text-lg font-semibold text-gray-700">
            Alphabet Reference
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mb-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
              <span>Session Complete</span>
            </div>
            {user && (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
                <span>Learned ✓</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {letters.map((letter, index) => {
              const dots = getDotsFromCharacter(letter);
              const braillePattern = dots ? generateBraillePattern(dots) : '';
              const isCompleted = targetLetters.slice(0, currentIndex).includes(letter);
              const isCurrent = targetLetters[currentIndex] === letter;
              const isLearned = completedLetters.has(letter); // 데이터베이스에서 완료된 글자

              return (
                <div
                  key={letter}
                  className={`p-3 rounded-lg text-center transition-all border-2 min-w-[60px] ${
                    isCurrent
                      ? 'bg-blue-100 border-blue-500 scale-105'
                      : isCompleted
                        ? 'bg-green-100 border-green-500'
                        : isLearned
                          ? 'bg-yellow-100 border-yellow-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-bold text-lg text-gray-800">
                    {letter}
                    {isLearned && <span className="text-yellow-600 ml-1">✓</span>}
                  </div>
                  <div className="text-2xl font-mono text-blue-600">{braillePattern}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finish Button */}
        {gameCompleted && (
          <div className="text-center mt-8 space-y-4">
            <div className="text-2xl font-bold text-green-600 mb-4">
              🎉 Congratulations! All letters completed! 🎉
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
              onClick={() => navigate('/learn/alphabet-mode')}
              className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Modes
            </button>
          </div>
      </div>
    </div>
  );
};

export default AlphabetLearning;
