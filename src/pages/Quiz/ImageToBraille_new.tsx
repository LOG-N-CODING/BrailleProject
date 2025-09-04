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
  const [currentQuiz, setCurrentQuiz] = useState<QuizImage | null>(null);
  const [letterCards, setLetterCards] = useState<LetterCard[]>([]);
  const [guessedAnswer, setGuessedAnswer] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  
  // 10문제 세트 관리
  const [currentSet, setCurrentSet] = useState<QuizImage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [setScore, setSetScore] = useState<number>(0);
  const [setResults, setSetResults] = useState<{correct: boolean, question: string, userAnswer: string, correctAnswer: string}[]>([]);
  const [totalSets, setTotalSets] = useState<number>(0);
  const [overallScore, setOverallScore] = useState<number>(0);

  const { isConnected, setOnDataCallback } = useBrailleDevice();

  // 새로운 세트 시작
  const startNewSet = useCallback(async () => {
    // Firebase에서 image quiz 데이터 가져오기
    const q = query(collection(db, 'quizzes'), where('type', '==', 'image'));
    const snap = await getDocs(q);
    const allQuizzes = snap.docs.map(doc => ({
      id: doc.id,
      imageUrl: doc.data().imageUrl,
      answer: doc.data().word,
      hint: doc.data().hint,
      difficulty: doc.data().difficulty,
      createdAt: doc.data().createdAt?.toDate(),
    } as QuizImage));

    // 랜덤하게 10문제 선택
    const shuffled = [...allQuizzes].sort(() => 0.5 - Math.random());
    const newSet = shuffled.slice(0, 10);
    
    setCurrentSet(newSet);
    setCurrentQuestionIndex(0);
    setSetScore(0);
    setSetResults([]);
    setCurrentQuiz(newSet[0]);
    initializeQuizDisplay(newSet[0]);
  }, []);

  // 문제 표시 초기화
  const initializeQuizDisplay = useCallback((quiz: QuizImage) => {
    const answerStr = quiz.answer.toLowerCase();
    const cards: LetterCard[] = answerStr.split('').map((letter, index) => ({
      letter,
      isGuessed: false,
      position: index,
    }));

    setLetterCards(cards);
    setGuessedAnswer('');
    setCurrentPosition(0);
    setShowHint(false);
    setActiveDots([]);
    setUserInput('');
  }, []);

  // 다음 문제로 이동 (세트 내에서)
  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < 9) { // 10문제 중 아직 남은 문제가 있으면
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuiz(currentSet[nextIndex]);
      initializeQuizDisplay(currentSet[nextIndex]);
    } else {
      // 세트 완료
      completeSet();
    }
  }, [currentQuestionIndex, currentSet, initializeQuizDisplay]);

  // 세트 완료 처리
  const completeSet = useCallback(() => {
    setTotalSets(prev => prev + 1);
    setOverallScore(prev => prev + setScore);
    
    // 세트 결과 표시
    showSetResults();
  }, [setScore]);

  // 세트 결과 표시
  const showSetResults = useCallback(() => {
    const accuracy = Math.round((setScore / 10) * 100);
    
    Swal.fire({
      icon: 'success',
      title: '🎯 Set Complete!',
      html: `
        <div class="text-center space-y-4">
          <p class="text-2xl font-bold text-blue-600">${setScore} / 10</p>
          <p class="text-lg">Accuracy: ${accuracy}%</p>
          <div class="text-sm text-gray-600 max-h-48 overflow-y-auto">
            <h4 class="font-semibold mb-2">Results:</h4>
            ${setResults.map((result, index) => `
              <div class="flex justify-between items-center py-1 ${result.correct ? 'text-green-600' : 'text-red-600'}">
                <span>${index + 1}. ${result.question}</span>
                <span>${result.correct ? '✓' : `✗ (${result.userAnswer})`}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Next Set',
      showCancelButton: true,
      cancelButtonText: 'View Overall Stats',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#3B82F6',
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        startNewSet();
      } else {
        showOverallStats();
      }
    });
  }, [setScore, setResults, startNewSet]);

  // 전체 통계 표시
  const showOverallStats = useCallback(() => {
    const overallAccuracy = totalSets > 0 ? Math.round((overallScore / (totalSets * 10)) * 100) : 0;
    
    Swal.fire({
      icon: 'info',
      title: '📊 Overall Statistics',
      html: `
        <div class="text-center space-y-4">
          <p class="text-lg">Sets Completed: <span class="font-bold text-blue-600">${totalSets}</span></p>
          <p class="text-lg">Total Score: <span class="font-bold text-green-600">${overallScore}</span> / ${totalSets * 10}</p>
          <p class="text-lg">Overall Accuracy: <span class="font-bold text-purple-600">${overallAccuracy}%</span></p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Continue Playing',
      showCancelButton: true,
      cancelButtonText: 'Back to Home',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280'
    }).then((result) => {
      if (result.isConfirmed) {
        startNewSet();
      } else {
        window.location.href = '/';
      }
    });
  }, [totalSets, overallScore, startNewSet]);

  // useEffect로 첫 세트 시작
  useEffect(() => {
    startNewSet();
  }, [startNewSet]);

  // 문자 입력 처리
  const handleCharacterInput = useCallback((char: string) => {
    if (!currentQuiz || currentPosition >= currentQuiz.answer.length) return;

    const correctChar = currentQuiz.answer.toLowerCase()[currentPosition];

    if (char.toLowerCase() === correctChar) {
      // 정답 - 카드 상태 업데이트
      setLetterCards(prevCards => {
        const newCards = [...prevCards];
        if (newCards[currentPosition]) {
          newCards[currentPosition] = {
            ...newCards[currentPosition],
            isGuessed: true
          };
        }
        return newCards;
      });

      // 다음 위치로 이동
      setCurrentPosition(prev => prev + 1);

      // 추측한 답안 업데이트
      setGuessedAnswer(prev => {
        const newAnswer = prev + char.toLowerCase();
        
        // 답 완성 체크
        if (newAnswer === currentQuiz.answer.toLowerCase()) {
          // 문제 완성 처리
          setTimeout(() => {
            setSetScore(prev => prev + 1);
            
            // 결과 저장
            setSetResults(prev => [...prev, {
              correct: true,
              question: currentQuiz.answer,
              userAnswer: newAnswer,
              correctAnswer: currentQuiz.answer.toLowerCase()
            }]);
            
            // 다음 문제로 이동하거나 세트 완료
            moveToNextQuestion();
          }, 500);
        }
        
        return newAnswer;
      });

      // 정답 토스트 표시
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🎉 Correct!',
        text: `Perfect!`,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 2000,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        customClass: {
          popup: 'animate-bounce',
          closeButton: 'swal2-toast-success-close'
        }
      });

      // activeDots 초기화
      setActiveDots([]);
      
    } else {
      // 오답
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: '❌ Incorrect!',
        text: `Try again for '${correctChar.toUpperCase()}'`,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 3000,
        timerProgressBar: true,
        background: 'linear-gradient(135deg, #ffe8e8ff 0%, #ff3429ff 100%)',
        color: 'white',
        customClass: {
          popup: 'animate-pulse',
          closeButton: 'swal2-toast-error-close'
        }
      });
      setActiveDots([]);
    }
  }, [currentQuiz, currentPosition, moveToNextQuestion]);

  // 백스페이스 처리
  const handleBackspace = useCallback(() => {
    if (currentPosition > 0) {
      // 이전 위치로 이동
      setCurrentPosition(prev => {
        const newPosition = prev - 1;
        
        // 카드 상태 업데이트
        setLetterCards(prevCards => {
          const newCards = [...prevCards];
          if (newCards[newPosition]) {
            newCards[newPosition] = {
              ...newCards[newPosition],
              isGuessed: false
            };
          }
          return newCards;
        });
        
        return newPosition;
      });

      // 추측한 답안 업데이트
      setGuessedAnswer(prev => prev.slice(0, -1));
    }
  }, [currentPosition]);

  // 힌트 토글
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // 점자 키보드 토글
  const toggleKeyboard = () => {
    setKeyboardVisible(!keyboardVisible);
  };

  // 수동 문자 입력
  const handleManualInput = (char: string) => {
    handleCharacterInput(char);
  };

  // 문제 패스
  const skipQuestion = () => {
    Swal.fire({
      title: 'Skip this question?',
      html: `
        <div class="text-center">
          <p class="mb-2">The answer is <strong>${currentQuiz?.answer}</strong>.</p>
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
        // 오답으로 처리
        setSetResults(prev => [...prev, {
          correct: false,
          question: currentQuiz?.answer || '',
          userAnswer: 'Skipped',
          correctAnswer: currentQuiz?.answer.toLowerCase() || ''
        }]);
        
        // 다음 문제로 이동
        moveToNextQuestion();
      }
    });
  };

  // 점자 키보드로부터 입력 받기
  useEffect(() => {
    if (!isConnected) return;

    setOnDataCallback((data: number) => {
      const bits = parseInputBits(data);
      const char = findCharacterFromDots(bits);
      if (char) {
        setActiveDots(bits);
        handleCharacterInput(char);

        // dots 애니메이션 초기화
        setTimeout(() => setActiveDots([]), 1500);
      }
    });

    return () => setOnDataCallback(null);
  }, [isConnected, setOnDataCallback, handleCharacterInput]);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 알파벳 키 처리
      if (event.key.match(/^[a-zA-Z]$/)) {
        handleCharacterInput(event.key.toLowerCase());
      }
      // 백스페이스 처리
      else if (event.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharacterInput, handleBackspace]);

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🖼️ Image to Braille</h1>
          <p className="text-lg text-gray-600">
            Look at the image and type the word in Braille using your keyboard or Braille device!
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">Set Score:</span>
              <span className="text-green-600 font-bold text-lg">{setScore} / 10</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600 font-semibold">Question:</span>
              <span className="text-purple-600 font-bold text-lg">{currentQuestionIndex + 1} / 10</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">Overall:</span>
              <span className="text-blue-600 font-bold text-lg">
                {overallScore} / {totalSets * 10}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-8">
          {/* 이미지 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <img
              src={currentQuiz.imageUrl}
              alt="Quiz"
              className="mx-auto rounded-lg shadow-lg max-w-md w-full h-64 object-cover"
            />
          </motion.div>

          {/* 답안 카드들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center items-center gap-3 flex-wrap"
          >
            {letterCards.map((card, index) => (
              <div
                key={index}
                className={`w-12 h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                  card.isGuessed
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : index === currentPosition
                    ? 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {card.isGuessed ? card.letter.toUpperCase() : '?'}
              </div>
            ))}
          </motion.div>

          {/* 힌트 */}
          {showHint && currentQuiz.hint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center"
            >
              <p className="text-yellow-800">💡 Hint: {currentQuiz.hint}</p>
            </motion.div>
          )}

          {/* 컨트롤 버튼들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <button
              onClick={toggleHint}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button
              onClick={toggleKeyboard}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Braille Keyboard
            </button>
            <button
              onClick={skipQuestion}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Pass
            </button>
            <button
              onClick={() => moveToNextQuestion()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          </motion.div>
        </div>

        {/* 점자 알파벳 참조 */}
        {keyboardVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-bold mb-4 text-center">Braille Alphabet</h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4">
              {Object.entries(BRAILLE_ALPHABET).map(([letter, dots]) => (
                <div key={letter} className="text-center">
                  <button
                    onClick={() => handleManualInput(letter)}
                    className="w-12 h-12 bg-gray-100 hover:bg-blue-100 rounded-lg mb-1 transition-colors"
                  >
                    {generateBraillePattern(dots)}
                  </button>
                  <div className="text-xs font-medium">{letter.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 현재 점자 입력 표시 */}
        {activeDots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-8 z-50"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{generateBraillePattern(activeDots)}</div>
              <div className="text-lg font-semibold text-blue-600">
                {findCharacterFromDots(activeDots)?.toUpperCase()}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageToBraille;
