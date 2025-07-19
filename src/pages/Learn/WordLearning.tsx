import React, { useState, useEffect } from 'react';
import {
  BRAILLE_ALPHABET,
  generateBraillePattern,
  parseInputBits,
  findCharacterFromDots,
  getDotsFromCharacter,
} from '../../utils/braille';
import { SectionHeader } from '../../components/UI';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateWordProgress, getUserLearningProgress } from '../../utils/learningProgress';
import Swal from 'sweetalert2';
import { query, collection, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Words data based on Words.md
const WordLearning: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState<string>('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [completedWords, setCompletedWords] = useState<{ [category: string]: Set<string> }>({});

  // 점자 디바이스 관련 state
  const { isConnected, setOnDataCallback } = useBrailleDevice();
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [showBrailleKeyboard, setShowBrailleKeyboard] = useState(false);

  const [wordsData, setWordsData] = useState<Record<string, string[]>>({});
  const categories = Object.keys(wordsData);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        // 'words' 콜렉션 전체 문서 조회, category 오름차순 정렬
        const q = query(collection(db, 'words'), orderBy('category'));
        const snap = await getDocs(q);

        const grouped: Record<string, string[]> = {};
        snap.docs.forEach(docSnap => {
          const { category, content } = docSnap.data() as {
            category: string;
            content: string;
            createdAt: any;
          };
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(content);
        });

        setWordsData(grouped);
      } catch (err) {
        console.error('❌ words 불러오기 실패:', err);
      }
    };
    fetchWords();
  }, []);

  useEffect(() => {
    // 사용자의 학습 진행도 로드
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      generateRandomTargets();
    }
  }, [selectedCategory]);

  const loadUserProgress = async () => {
    if (!user) {
      console.log('🔐 No user logged in - skipping progress load');
      return;
    }

    console.log('📊 Loading user progress for:', user.email);

    try {
      const progress = await getUserLearningProgress(user);
      console.log('📈 Progress loaded:', progress);

      const completed: { [category: string]: Set<string> } = {};

      // 완료된 단어들을 카테고리별로 Set에 추가
      Object.entries(progress.words).forEach(([category, words]) => {
        completed[category] = new Set<string>();
        Object.entries(words as { [word: string]: number }).forEach(([word, status]) => {
          if (status === 1) {
            completed[category].add(word);
            console.log(`✅ Word ${word} in ${category} is already completed`);
          }
        });
      });

      setCompletedWords(completed);
      console.log(
        '🎯 Total completed words by category:',
        Object.entries(completed)
          .map(([cat, words]) => `${cat}: ${words.size}`)
          .join(', ')
      );
    } catch (error) {
      console.error('❌ Failed to load user progress:', error);
    }
  };

  const wordCount = 5; // 단어 개수

  const generateRandomTargets = () => {
    if (!selectedCategory) return;

    const categoryWords = wordsData[selectedCategory as keyof typeof wordsData];
    const shuffled = [...categoryWords].sort(() => Math.random() - 0.5);
    setTargetWords(shuffled.slice(0, wordCount));
    setCurrentIndex(0);
    setUserInput('');
    setGameCompleted(false);
  };

  const checkAnswer = async (inputToCheck?: string) => {
    const currentInput = inputToCheck || userInput;
    if (targetWords.length === 0 || currentInput.length === 0) return;

    const targetWord = targetWords[currentIndex];

    console.log('🔍 Checking word answer:', {
      targetWord,
      currentInput: currentInput.toLowerCase(),
      user: user ? user.email : 'not logged in',
      selectedCategory,
      alreadyCompleted: completedWords[selectedCategory]?.has(targetWord),
    });

    if (currentInput.toLowerCase() === targetWord.toLowerCase()) {
      console.log('✅ Correct word answer!');

      // 단어 발음 - 개선된 버전
      try {
        // speechSynthesis가 사용 가능한지 확인
        if ('speechSynthesis' in window) {
          // 기존 음성 중단
          speechSynthesis.cancel();

          // 약간의 딜레이 후 실행 (브라우저 정책 대응)
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(targetWord);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1.0; // 볼륨 최대
            utterance.lang = 'en-US';

            // 이벤트 리스너 추가 (디버깅용)
            utterance.onstart = () => {
              console.log(`🔊 TTS started: ${targetWord}`);
            };
            utterance.onend = () => {
              console.log(`✅ TTS finished: ${targetWord}`);
            };
            utterance.onerror = event => {
              console.error('❌ TTS error:', event);
            };

            console.log(`🎵 Attempting to speak: "${targetWord}"`);
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
      if (user && !completedWords[selectedCategory]?.has(targetWord)) {
        console.log('💾 Attempting to save word progress to Firestore...');
        try {
          await updateWordProgress(user, selectedCategory, targetWord);

          // 로컬 상태 업데이트
          setCompletedWords(prev => ({
            ...prev,
            [selectedCategory]: new Set([...(prev[selectedCategory] || []), targetWord]),
          }));

          console.log(
            `🎉 Word "${targetWord}" in category "${selectedCategory}" progress saved to database successfully!`
          );
        } catch (error) {
          console.error('❌ Failed to save word progress:', error);
        }
      } else if (!user) {
        console.log('⚠️ User not logged in - skipping database save');
      } else if (completedWords[selectedCategory]?.has(targetWord)) {
        console.log(`ℹ️ Word "${targetWord}" already completed - skipping save`);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Correct!',
        text: `"${targetWord}" is correct!`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      if (currentIndex + 1 >= targetWords.length) {
        setTimeout(() => {
          setGameCompleted(true);
          // SweetAlert는 3초 후에 표시하여 Finish Button을 먼저 보여줌
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Completed!',
              text: `All words completed!`,
              confirmButtonText: 'Practice Again',
              cancelButtonText: 'Back to Learning Menu',
              showCancelButton: true,
              allowOutsideClick: true,
            }).then(result => {
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
          setCurrentIndex(currentIndex + 1);
          setUserInput('');
        }, 1000);
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
          // -2는 Space로 처리 (WordLearning에서는 공백이 필요 없지만 일관성을 위해)
          const newInput = userInput + ' ';
          setUserInput(newInput);
          setTimeout(() => {
            checkAnswer(newInput);
          }, 100);
        } else if (bits.length > 0) {
          setActiveDots(bits);

          const character = findCharacterFromDots(bits);
          if (character && character.match(/[A-Z]/)) {
            const newInput = userInput + character.toLowerCase();
            setUserInput(newInput);

            // 자동으로 답 체크 - 새로운 입력값으로 즉시 체크
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
  }, [isConnected, userInput, targetWords, currentIndex]);

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

  const handleBackspace = () => {
    setUserInput(prev => prev.slice(0, -1));
    setActiveDots([]);
  };

  const currentTarget = targetWords[currentIndex] || '';
  const progress = targetWords.length > 0 ? ((currentIndex + 1) / targetWords.length) * 100 : 0;

  // Category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-3xl mx-auto text-center my-8">
            <SectionHeader title="Words - Choose Category" />
            <p className="text-gray-600 mb-6">Select a category to start the words learning</p>

            {/* Login Status */}
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  📚 Sign in to save your learning progress!
                </p>
              </div>
            )}

            {/* Debug Section - 개발 중에만 사용 */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm mb-2">🐛 Debug: Logged in as {user.email}</p>
                <button
                  onClick={async () => {
                    console.log(
                      '🧪 Manual test: Trying to save word "subject" in "School & Education"'
                    );
                    try {
                      await updateWordProgress(user, 'School & Education', 'subject');
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
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(category => {
              const totalWords = wordsData[category as keyof typeof wordsData].length;
              const completedCount = completedWords[category]?.size || 0;

              return (
                <div
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{category}</h3>
                  <p className="text-gray-600">{totalWords} words available</p>
                  {user && (
                    <p className="text-sm text-purple-600 mt-2">
                      ✓ {completedCount}/{totalWords} completed
                    </p>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    Click to start learning with {category.toLowerCase()} words
                  </div>
                </div>
              );
            })}
          </div>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center my-8">
          <SectionHeader title={`Words - ${selectedCategory}`} />
          <p className="text-gray-600 mb-6">
            Type the word using braille patterns - words are automatically checked when complete
          </p>

          {/* Login Status */}
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">📚 Sign in to save your learning progress!</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            Progress: {currentIndex + 1} of {targetWords.length}
            {user && completedWords[selectedCategory] && (
              <span className="ml-4 text-purple-600">
                • {completedWords[selectedCategory].size}/
                {wordsData[selectedCategory as keyof typeof wordsData].length} words learned in this
                category
              </span>
            )}
          </div>
        </div>

        {/* Words Progress */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="text-center mb-4 text-lg font-semibold text-gray-700">Progress</div>
          <div className="flex justify-center space-x-2 flex-wrap">
            {targetWords.map((word, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all mb-2 ${
                    isCurrent
                      ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                      : isCompleted
                      ? 'bg-green-100 border-2 border-green-500 text-green-700'
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  {word}
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
              <div className="text-sm text-gray-500 mb-2">Current Word:</div>
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {currentTarget.toUpperCase()}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Your Input:</div>
              <div className="text-4xl font-mono text-green-600 min-h-[3rem] border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                          ? 'bg-purple-500 text-white border-purple-500 scale-110'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
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
                          ? 'bg-purple-500 text-white border-purple-500 scale-110'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {dot}
                    </button>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={handleBackspace}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <span className="material-icons">backspace</span>
                </button>
                <button
                  onClick={handleCharacterInput}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <span className="material-icons">keyboard_return</span>
                </button>
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
              : 'bg-purple-500 hover:bg-purple-600'
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
                  <div className="text-2xl font-mono text-purple-600">{braillePattern}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finish Button */}
        {gameCompleted && (
          <div className="text-center mt-8 space-y-4">
            <div className="text-2xl font-bold text-green-600 mb-4">
              🎉 Congratulations! All words completed! 🎉
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

        <div className="max-w-3xl mx-auto text-center my-6">
          <button
            onClick={() => setSelectedCategory('')}
            className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordLearning;
