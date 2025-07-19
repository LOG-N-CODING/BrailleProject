import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { quizImages, QuizImage } from '../../data/quizData';
import {
  BRAILLE_ALPHABET,
  getDotsFromCharacter,
  generateBraillePattern,
  parseInputBits,
  findCharacterFromDots,
} from '../../utils/braille';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface LetterCard {
  letter: string;
  isGuessed: boolean;
  position: number;
}

const ImageToBraille: React.FC = () => {
  const [quizOrder, setQuizOrder] = useState<QuizImage[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
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

  // 1) Firestore fetch
  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'quizzes'), where('type', '==', 'image'));
      const snap = await getDocs(q);
      const data = snap.docs.map(
        doc =>
          ({
            id: doc.id,
            imageUrl: doc.data().imageUrl,
            answer: doc.data().word,
            hint: doc.data().hint,
            difficulty: doc.data().difficulty,
          } as QuizImage)
      );
      const shuffled = data.sort(() => Math.random() - 0.5);
      setQuizOrder(shuffled);
      setQuizIndex(1);
      // ✂️ remove loadQuizAt(0) here
    })();
  }, []);

  // 2) 특정 인덱스의 퀴즈만 화면에 세팅
  const loadQuizAt = useCallback(
    (i: number) => {
      const quiz = quizOrder[i];
      setCurrentQuiz(quiz);
      setLetterCards(
        quiz.answer.split('').map((l, idx) => ({
          letter: l,
          isGuessed: false,
          position: idx,
        }))
      );
      setGuessedAnswer('');
      setCurrentPosition(0);
      setShowHint(false);
      setActiveDots([]);
    },
    [quizOrder]
  );

  // 2) quizOrder 변경 감지해서 한 번만 로드
  useEffect(() => {
    if (quizOrder.length > 0) {
      loadQuizAt(0);
    }
  }, [quizOrder, loadQuizAt]);

  // 3) 다음 문제 혹은 최종결과 분기
  const onNextQuestion = useCallback(() => {
    if (quizIndex >= quizOrder.length) {
      showFinalResults();
    } else {
      loadQuizAt(quizIndex);
      setQuizIndex(prev => prev + 1);
    }
  }, [quizIndex, quizOrder.length, loadQuizAt]);

  // 4) 최종 결과 모달
  const restartQuiz = useCallback(() => {
    const shuffled = [...quizOrder].sort(() => Math.random() - 0.5);
    setQuizOrder(shuffled);
    setQuizIndex(1);
    setScore(0);
    setTotalQuizzes(0);
    loadQuizAt(0);
  }, [quizOrder, loadQuizAt]);

  const showFinalResults = () => {
    const accuracy = totalQuizzes > 0 ? Math.round((score / totalQuizzes) * 100) : 0;
    let message = '',
      icon: 'success' | 'info' | 'warning' = 'info';
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
      message = "You need more practice. Don't give up! 🌟";
      icon = 'warning';
    }

    Swal.fire({
      title: 'Quiz Complete!',
      html: `
        <div class="text-center">
          <p class="text-lg mb-4">${message}</p>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-2xl font-bold text-blue-600 mb-2">${score + 1} / ${totalQuizzes + 1}</p>
            <p class="text-gray-600">Accuracy: ${accuracy}%</p>
          </div>
        </div>`,
      icon,
      confirmButtonText: 'Restart',
      showCancelButton: true,
      cancelButtonText: 'Exit',
      confirmButtonColor: '#3B82F6',
    }).then(result => {
      if (result.isConfirmed) restartQuiz();
    });
  };

  // 5) 정답 처리
  const handleQuizComplete = () => {
    setScore(s => s + 1);
    setTotalQuizzes(t => t + 1);
    const accuracy = Math.round(((score + 1) / (totalQuizzes + 1)) * 100);

    Swal.fire({
      title: 'Correct! 🎉',
      html: `
        <div class="text-center">
          <p class="text-lg mb-2">You got '<strong>${currentQuiz?.answer}</strong>' correct!</p>
          <p class="text-blue-600">Current accuracy: ${accuracy}%</p>
        </div>`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Next Question',
      cancelButtonText: 'End Quiz',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
    }).then(result => {
      if (result.isConfirmed) onNextQuestion();
      else showFinalResults();
    });
  };

  // 6) Pass 처리
  const skipQuiz = () => {
    setTotalQuizzes(t => t + 1);
    Swal.fire({
      title: 'Skip this question?',
      html: `<p>The answer is '<strong>${currentQuiz?.answer}</strong>'.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Next Question',
      cancelButtonText: 'Continue',
      confirmButtonColor: '#EF4444',
    }).then(result => {
      if (result.isConfirmed) onNextQuestion();
    });
  };

  // 7) 문자 입력 처리 (Braille & 수동)
  useEffect(() => {
    if (!isConnected) return;
    const cb = (data: number) => {
      const bits = parseInputBits(data);
      if (bits.includes(-1)) handleBackspace();
      else if (bits.includes(-2)) onNextQuestion();
      else if (bits.length > 0) {
        setActiveDots(bits);
        const ch = findCharacterFromDots(bits);
        if (ch) handleCharacterInput(ch.toUpperCase());
      }
    };
    setOnDataCallback(cb);
  }, [isConnected, onNextQuestion, setOnDataCallback]);

  const handleCharacterInput = (character: string) => {
    if (!currentQuiz || currentPosition >= currentQuiz.answer.length) return;
    const correct = currentQuiz.answer[currentPosition];
    if (character === correct) {
      setLetterCards(cards => {
        const nc = [...cards];
        nc[currentPosition].isGuessed = true;
        return nc;
      });
      setGuessedAnswer(a => a + character);
      setCurrentPosition(p => p + 1);
      setActiveDots([]);
      if (guessedAnswer + character === currentQuiz.answer) {
        handleQuizComplete();
      }
    } else {
      Swal.fire({
        title: 'Incorrect!',
        text: `Correct is '${correct}'`,
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
      setActiveDots([]);
    }
  };

  const handleBackspace = () => {
    if (currentPosition > 0) {
      setCurrentPosition(p => p - 1);
      setLetterCards(cards => {
        const nc = [...cards];
        nc[currentPosition - 1].isGuessed = false;
        return nc;
      });
      setGuessedAnswer(a => a.slice(0, -1));
      setActiveDots([]);
    }
  };

  // 8) 수동 입력
  const handleManualInput = (letter: string) => {
    setActiveDots([]);
    handleCharacterInput(letter);
  };

  // 힌트 표시
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // 점자 키보드 토글
  const toggleKeyboard = () => {
    setKeyboardVisible(!keyboardVisible);
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
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
              onClick={onNextQuestion}
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
                    type="button"
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
