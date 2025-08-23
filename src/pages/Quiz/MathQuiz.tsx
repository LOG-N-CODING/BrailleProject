import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { getRandomQuestion, MathQuestion } from '../../data/mathQuizData';
import {
  BRAILLE_NUMBERS,
  getDotsFromCharacter,
  generateBraillePattern,
  parseInputBits,
  findCharacterFromDots,
} from '../../utils/braille';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface DigitCard {
  digit: string;
  isGuessed: boolean;
  position: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const MathQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [remaining, setRemaining] = useState<MathQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [digitCards, setDigitCards] = useState<DigitCard[]>([]);
  const [guessedAnswer, setGuessedAnswer] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60초 제한
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  const { isConnected, setOnDataCallback } = useBrailleDevice();

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);

  // 시간 종료 처리
  const handleTimeUp = () => {
    setIsTimerActive(false);
    Swal.fire({
      title: "Time's Up! ⏰",
      html: `
        <div class="text-center">
          <p class="text-lg mb-4">Time limit has ended!</p>
          <p class="mb-2">Answer: <strong>${currentQuestion?.answer}</strong></p>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-2xl font-bold text-blue-600 mb-2">${score} / ${totalQuestions}</p>
            <p class="text-gray-600">Accuracy: ${
              totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0
            }%</p>
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'Restart',
      confirmButtonColor: '#3B82F6',
    }).then(() => {
      resetGame();
    });
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      // ① 'quizzes' 컬렉션에서 type이 'math'인 문서만 조회
      const q = query(
        collection(db, 'quizzes'),
        where('type', '==', 'math'),
        where('difficulty', '==', difficulty)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map(doc => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          formula: d.formula,
          answer: d.answer,
          hint: d.hint,
          difficulty: d.difficulty,
          createdAt: d.createdAt.toDate(),
          type: d.type,
        } as MathQuestion;
      });

      setQuestions(list);
      setRemaining(list); // 전체 문제를 남은 문제로 복제
      if (list.length > 0) {
        initializeQuestion(list);
      }
    };
    fetchQuestions();

    fetchQuestions();
  }, [difficulty]);

  // 게임 초기화
  const initializeQuestion = useCallback(
    (list: MathQuestion[] = remaining) => {
      // ① list 가 비어 있으면 리턴
      if (list.length === 0) {
        // 더 이상 남은 문제가 없으면
        showFinalResults(); // 결과 팝업 호출
        return;
      }

      // 랜덤 선택
      const idx = Math.floor(Math.random() * list.length);
      const question = list[idx];
      setCurrentQuestion(question);

      // 남은 문제에서 지금 낸 것 제거
      const nextRemaining = [...list];
      nextRemaining.splice(idx, 1);
      setRemaining(nextRemaining);

      // ④ 나머지 초기화 로직
      const answerStr = question.answer.toString();
      const cards: DigitCard[] = answerStr.split('').map((digit, index) => ({
        digit,
        isGuessed: false,
        position: index,
      }));

      setDigitCards(cards);
      setGuessedAnswer('');
      setCurrentPosition(0);
      setShowHint(false);
      setActiveDots([]);
      setTimeLeft(60);
      setIsTimerActive(true);
    },
    [difficulty, remaining]
  );

  // 게임 리셋
  const resetGame = () => {
    setScore(0);
    setTotalQuestions(0);
    setTimeLeft(60);
    setIsTimerActive(false);
    setRemaining(questions);
    initializeQuestion(questions);
  };

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
        // 숫자만 허용
        if (character && /^\d$/.test(character)) {
          handleDigitInput(character);
        }
      }
    };

    setOnDataCallback(handleBrailleInput);
  }, [isConnected]);

  // 숫자 입력 처리
  const handleDigitInput = (digit: string) => {
    if (!currentQuestion || currentPosition >= currentQuestion.answer.toString().length) return;

    const correctDigit = currentQuestion.answer.toString()[currentPosition];

    if (digit === correctDigit) {
      // 정답
      const newDigitCards = [...digitCards];
      newDigitCards[currentPosition].isGuessed = true;
      setDigitCards(newDigitCards);

      const newGuessedAnswer = guessedAnswer + digit;
      setGuessedAnswer(newGuessedAnswer);

      // 다음 위치로 이동
      setCurrentPosition(currentPosition + 1);
      setActiveDots([]);

      // 답 완성 체크
      if (newGuessedAnswer === currentQuestion.answer.toString()) {
        handleQuestionComplete();
      }
    } else {
      // 오답
      Swal.fire({
        title: 'Incorrect!',
        text: `The correct number is '${correctDigit}'.`,
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
      setActiveDots([]);
    }
  };

  // 백스페이스 처리
  const handleBackspace = () => {
    if (currentPosition > 0) {
      const newPosition = currentPosition - 1;
      const newDigitCards = [...digitCards];
      newDigitCards[newPosition].isGuessed = false;
      setDigitCards(newDigitCards);

      setCurrentPosition(newPosition);
      setGuessedAnswer(guessedAnswer.slice(0, -1));
      setActiveDots([]);
    }
  };

  // 다음 위치로 이동
  const handleNextPosition = () => {
    if (currentPosition < digitCards.length - 1) {
      setCurrentPosition(currentPosition + 1);
      setActiveDots([]);
    }
  };

  // 문제 완성 처리
  const handleQuestionComplete = () => {
    setIsTimerActive(false);
    setScore(score + 1);
    setTotalQuestions(totalQuestions + 1);

    const accuracy = Math.round(((score + 1) / (totalQuestions + 1)) * 100);

    Swal.fire({
      title: 'Correct! 🎉',
      html: `
        <div class="text-center">
          <p class="text-lg mb-2">Answer: <strong>${currentQuestion?.answer}</strong></p>
          <p class="text-blue-600">Current accuracy: ${accuracy}%</p>
          <p class="text-sm text-gray-600 mt-2">Time remaining: ${timeLeft} seconds</p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Next Question',
      cancelButtonText: 'End Quiz',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
    }).then(result => {
      if (result.isConfirmed) {
        initializeQuestion();
      } else {
        showFinalResults();
      }
    });
  };

  // 최종 결과 표시
  const showFinalResults = () => {
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let message = '';
    let icon: 'success' | 'info' | 'warning' = 'info';

    if (accuracy >= 90) {
      message = 'Math genius! Perfect! 🏆';
      icon = 'success';
    } else if (accuracy >= 70) {
      message = 'Excellent! Your math skills are outstanding! 🎯';
      icon = 'success';
    } else if (accuracy >= 50) {
      message = "Good job! With more practice, you'll be perfect! 📚";
      icon = 'info';
    } else {
      message = "You need more practice. Don't give up! 💪";
      icon = 'warning';
    }

    Swal.fire({
      title: 'Math Quiz Complete!',
      html: `
        <div class="text-center">
          <p class="text-lg mb-4">${message}</p>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p class="text-2xl font-bold text-blue-600 mb-2">${score + 1} / ${
        totalQuestions + 1
      }</p>
            <p class="text-gray-600">Accuracy: ${accuracy}%</p>
          </div>
        </div>
      `,
      icon,
      confirmButtonText: 'Restart',
      showCancelButton: true,
      cancelButtonText: 'Exit',
      confirmButtonColor: '#3B82F6',
    }).then(result => {
      if (result.isConfirmed) {
        resetGame();
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

  // 수동 숫자 입력
  const handleManualInput = (digit: string) => {
    handleDigitInput(digit);
  };

  // 문제 Pass
  const skipQuestion = () => {
    Swal.fire({
      title: 'Skip this question?',
      html: `
        <div class="text-center">
          <p class="mb-2">The answer is <strong>${currentQuestion?.answer}</strong>.</p>
          <p class="text-sm text-gray-600">Skipped questions will be counted as incorrect.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Next Question',
      cancelButtonText: 'Continue',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
    }).then(result => {
      if (result.isConfirmed) {
        setTotalQuestions(totalQuestions + 1);
        initializeQuestion();
      }
    });
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading math question...</div>
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
          <h1 className="text-4xl font-light text-gray-700 mb-4">Math Quiz</h1>
          <p className="text-lg text-gray-600">
            See the question, solve the math, and type your answer in Braille to check if you're
            right!
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">Correct:</span>
              <span className="text-green-600 font-bold text-lg">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total:</span>
              <span className="text-gray-700 font-bold text-lg">{totalQuestions}</span>
            </div>
            {totalQuestions > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-600">Accuracy:</span>
                <span className="text-blue-600 font-bold text-lg">
                  {Math.round((score / totalQuestions) * 100)}%
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${timeLeft <= 10 ? 'text-red-600' : 'text-orange-600'}`}
              >
                Time: {timeLeft}s
              </span>
            </div>
          </div>
        </motion.div>

        {/* 난이도 선택 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  setIsTimerActive(false);
                  initializeQuestion();
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  difficulty === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'easy' ? 'Easy' : level === 'medium' ? 'Medium' : 'Hard'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 수학 문제 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-gray-100 rounded-3xl p-8 shadow-lg max-w-4xl w-full">
              <h2 className="text-6xl font-normal text-blue-600 text-center">
                {currentQuestion.formula}
              </h2>
              <button
                onClick={toggleHint}
                className="mt-4 mx-auto block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Hint
              </button>
            </div>
          </motion.div>

          {/* 힌트 */}
          {showHint && currentQuestion.hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-yellow-100 border border-yellow-300 rounded-lg p-4 mx-auto max-w-md"
            >
              <p className="text-yellow-800">💡 {currentQuestion.hint}</p>
            </motion.div>
          )}

          {/* 숫자 카드들 */}
          <div className="flex justify-center">
            <div className="flex gap-2">
              {digitCards.map((card, index) => (
                <motion.div
                  key={`${currentQuestion.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-16 h-20 rounded-xl border-2 flex items-center justify-center text-2xl font-bold shadow-lg transition-all ${
                    card.isGuessed
                      ? 'bg-green-100 border-green-400 text-blue-600'
                      : currentPosition === index
                      ? 'bg-red-100 border-red-400 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {card.isGuessed ? card.digit : currentPosition === index ? '?' : ''}
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
              onClick={skipQuestion}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Pass
            </button>
            <button
              onClick={() => initializeQuestion(questions)}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* 점자 숫자 참조 */}
        {keyboardVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12 bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Braille Numbers Reference
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
              {Object.entries(BRAILLE_NUMBERS).map(([number, dots]) => {
                const brailleChar = generateBraillePattern(dots);

                return (
                  <motion.button
                    key={number}
                    onClick={() => handleManualInput(number)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                  >
                    <div className="text-4xl text-blue-600 mb-2">{brailleChar}</div>
                    <div className="text-lg font-bold text-gray-700">{number}</div>
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

export default MathQuiz;
