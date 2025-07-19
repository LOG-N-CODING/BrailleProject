import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { quizImages, QuizImage } from '../../data/quizData';
import { BRAILLE_ALPHABET, getDotsFromCharacter, generateBraillePattern, parseInputBits, findCharacterFromDots } from '../../utils/braille';

interface LetterCard {
  letter: string;
  isGuessed: boolean;
  position: number;
}

const ImageToBraille: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizImage | null>(null);
  const [letterCards, setLetterCards] = useState<LetterCard[]>([]);
  const [guessedAnswer, setGuessedAnswer] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [totalQuizzes, setTotalQuizzes] = useState<number>(0);

  const { isConnected, setOnDataCallback } = useBrailleDevice();

  // 퀴즈 초기화
  const initializeQuiz = useCallback(() => {
    const randomQuiz = quizImages[Math.floor(Math.random() * quizImages.length)];
    setCurrentQuiz(randomQuiz);
    
    const cards: LetterCard[] = randomQuiz.answer.split('').map((letter, index) => ({
      letter,
      isGuessed: false,
      position: index
    }));
    
    setLetterCards(cards);
    setGuessedAnswer('');
    setCurrentPosition(0);
    setShowHint(false);
    setActiveDots([]);
    setUserInput('');
  }, []);

  // 초기 로드
  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  // 브레일 장치 입력 처리
  useEffect(() => {
    if (!isConnected) return;

    const handleBrailleInput = (data: number) => {
      const bits = parseInputBits(data);
      
      if (bits.includes(-1)) {
        handleBackspace();
      } else if (bits.includes(-2)) {
        handleNextPosition();
      } else if (bits.length > 0) {
        setActiveDots(bits);
        const character = findCharacterFromDots(bits);
        if (character) {
          handleCharacterInput(character.toUpperCase());
        }
      }
    };

    setOnDataCallback(handleBrailleInput);
  }, [isConnected]); // 필요한 함수들은 별도로 관리

  // 문자 입력 처리
  const handleCharacterInput = (character: string) => {
    if (!currentQuiz || currentPosition >= currentQuiz.answer.length) return;

    const currentLetter = currentQuiz.answer[currentPosition];
    
    if (character === currentLetter) {
      // 정답
      const newLetterCards = [...letterCards];
      newLetterCards[currentPosition].isGuessed = true;
      setLetterCards(newLetterCards);
      
      const newGuessedAnswer = guessedAnswer + character;
      setGuessedAnswer(newGuessedAnswer);
      
      // 다음 위치로 이동
      setCurrentPosition(currentPosition + 1);
      setActiveDots([]);
      setUserInput('');
      
      // 단어 완성 체크
      if (newGuessedAnswer === currentQuiz.answer) {
        handleQuizComplete();
      }
    } else {
      // 오답
      Swal.fire({
        title: 'Incorrect!',
        text: `The correct character is '${currentLetter}'.`,
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      setActiveDots([]);
      setUserInput('');
    }
  };

  // 백스페이스 처리
  const handleBackspace = () => {
    if (currentPosition > 0) {
      const newPosition = currentPosition - 1;
      const newLetterCards = [...letterCards];
      newLetterCards[newPosition].isGuessed = false;
      setLetterCards(newLetterCards);
      
      setCurrentPosition(newPosition);
      setGuessedAnswer(guessedAnswer.slice(0, -1));
      setActiveDots([]);
      setUserInput('');
    }
  };

  // 다음 위치로 이동 (Space)
  const handleNextPosition = () => {
    if (currentPosition < letterCards.length - 1) {
      setCurrentPosition(currentPosition + 1);
      setActiveDots([]);
      setUserInput('');
    }
  };

  // 최종 결과 표시
  const showFinalResults = () => {
    const accuracy = totalQuizzes > 0 ? Math.round((score / totalQuizzes) * 100) : 0;
    let message = '';
    let icon: 'success' | 'info' | 'warning' = 'info';
    
    if (accuracy >= 90) {
      message = 'Perfect! You are a Braille master! 🎉';
      icon = 'success';
    } else if (accuracy >= 70) {
      message = 'Excellent! With more practice, you will be perfect! 👍';
      icon = 'success';
    } else if (accuracy >= 50) {
      message = 'Good job! Practice a little more! 💪';
      icon = 'info';
    } else {
      message = 'You need more practice. Don\'t give up! 🌟';
      icon = 'warning';
    }
    
    Swal.fire({
      title: 'Quiz Complete!',
      html: `
        <div class="text-center">
          <p class="text-lg mb-4">${message}</p>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-2xl font-bold text-blue-600 mb-2">${score} / ${totalQuizzes}</p>
            <p class="text-gray-600">Accuracy: ${accuracy}%</p>
          </div>
        </div>
      `,
      icon,
      confirmButtonText: 'Restart',
      showCancelButton: true,
      cancelButtonText: 'Exit',
      confirmButtonColor: '#3B82F6'
    }).then((result) => {
      if (result.isConfirmed) {
        // 점수 초기화 후 새 게임
        setScore(0);
        setTotalQuizzes(0);
        initializeQuiz();
      }
    });
  };

  // 퀴즈 완성 처리
  const handleQuizComplete = () => {
    setScore(score + 1);
    setTotalQuizzes(totalQuizzes + 1);
    
    const accuracy = Math.round(((score + 1) / (totalQuizzes + 1)) * 100);
    
    Swal.fire({
      title: 'Correct! 🎉',
      html: `
        <div class="text-center">
          <p class="text-lg mb-2">You got '<strong>${currentQuiz?.answer}</strong>' correct!</p>
          <p class="text-blue-600">Current accuracy: ${accuracy}%</p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Next Question',
      cancelButtonText: 'End Quiz',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        initializeQuiz();
      } else {
        // 퀴즈 종료 시 최종 결과 표시
        showFinalResults();
      }
    });
  };

  // 힌트 표시
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // 점자 키보드 토글
  const toggleKeyboard = () => {
    setKeyboardVisible(!keyboardVisible);
  };

  // 수동 문자 입력 (키보드용)
  const handleManualInput = (letter: string) => {
    handleCharacterInput(letter);
  };

  // 퀴즈 Pass
  const skipQuiz = () => {
    Swal.fire({
      title: 'Skip this question?',
      html: `
        <div class="text-center">
          <p class="mb-2">The answer is '<strong>${currentQuiz?.answer}</strong>'.</p>
          <p class="text-sm text-gray-600">Skipped questions will be counted as incorrect.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Next Question',
      cancelButtonText: 'Continue',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        setTotalQuizzes(totalQuizzes + 1);
        initializeQuiz();
      }
    });
  };

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* 브레일 키보드 토글 버튼 */}
      <button
        onClick={toggleKeyboard}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg shadow-lg transition-colors"
        title="Toggle Braille Keyboard"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light text-gray-700 mb-4">Image to Braille</h1>
          <p className="text-lg text-gray-600">
            See the image, guess the word, and type it in Braille to check your answer!
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">Correct:</span>
              <span className="text-green-600 font-bold text-lg">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total:</span>
              <span className="text-gray-700 font-bold text-lg">{totalQuizzes}</span>
            </div>
            {totalQuizzes > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">Accuracy:</span>
                <span className="text-blue-600 font-bold text-lg">
                  {Math.round((score / totalQuizzes) * 100)}%
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 이미지 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="relative">
              <img
                src={currentQuiz.imageUrl}
                alt="Quiz Image"
                className="w-80 h-64 object-cover rounded-lg shadow-lg"
              />
              <button
                onClick={toggleHint}
                className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Hint
              </button>
            </div>
          </motion.div>

          {/* 힌트 */}
          {showHint && currentQuiz.hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-yellow-100 border border-yellow-300 rounded-lg p-4 mx-auto max-w-md"
            >
              <p className="text-yellow-800">💡 {currentQuiz.hint}</p>
            </motion.div>
          )}

          {/* 문자 카드들 */}
          <div className="flex justify-center">
            <div className="flex gap-2">
              {letterCards.map((card, index) => (
                <motion.div
                  key={`${currentQuiz.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-16 h-20 rounded-xl border-2 flex items-center justify-center text-2xl font-light shadow-lg transition-all ${
                    card.isGuessed
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : currentPosition === index
                      ? 'bg-red-100 border-red-400 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {card.isGuessed ? card.letter : currentPosition === index ? '?' : ''}
                </motion.div>
              ))}
            </div>
          </div>

          {/* 점자 입력 표시 */}
          {activeDots.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-800 text-center">
                  Input Braille: {generateBraillePattern(activeDots)} ({activeDots.join(', ')})
                </p>
              </div>
            </motion.div>
          )}

          {/* 컨트롤 버튼들 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={skipQuiz}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Pass
            </button>
            <button
              onClick={initializeQuiz}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* 점자 알파벳 참조 */}
        {keyboardVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12 bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Braille Alphabet Reference
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-13 gap-2">
              {Array.from({ length: 26 }, (_, i) => {
                const letter = String.fromCharCode(65 + i);
                const braillePattern = getDotsFromCharacter(letter);
                const brailleChar = braillePattern ? generateBraillePattern(braillePattern) : '⠀';
                
                return (
                  <motion.button
                    key={letter}
                    onClick={() => handleManualInput(letter)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                  >
                    <div className="text-3xl text-blue-600 mb-1">{brailleChar}</div>
                    <div className="text-sm font-semibold text-gray-700">{letter}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageToBraille;
