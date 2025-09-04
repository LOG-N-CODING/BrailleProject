import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { BRAILLE_NUMBERS, getDotsFromCharacter, generateBraillePattern, parseInputBits, findCharacterFromDots } from '../../utils/braille';
import { useBrailleDevice } from '../../contexts/BrailleDeviceContext';
import { useAuth } from '../../contexts/AuthContext';
import { saveGameHistory } from '../../utils/gameHistory';

interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  cpm: number;
  accuracy: number;
  startTime: number | null;
  charactersTyped: number;
  correctAnswers: number;
  timeRemaining: number;
}

const TypingSprint: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, setOnDataCallback } = useBrailleDevice();
  
  // Game duration in seconds - 게임 지속시간 (초)
  const GAME_DURATION = 60;
  
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    cpm: 0,
    accuracy: 100,
    startTime: null,
    charactersTyped: 0,
    correctAnswers: 0,
    timeRemaining: GAME_DURATION
  });

  const [currentTarget, setCurrentTarget] = useState<string>('');
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [showComboBonus, setShowComboBonus] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [upcomingTargets, setUpcomingTargets] = useState<string[]>([]);
  const [historyAlreadySaved, setHistoryAlreadySaved] = useState(false);

  // Character pools
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = '0123456789'.split('');
  const allCharacters = [...alphabets, ...numbers];

  // Braille mapping
  const brailleMap: { [key: string]: string } = {
    'A': '⠁', 'B': '⠃', 'C': '⠉', 'D': '⠙', 'E': '⠑', 'F': '⠋', 'G': '⠛', 'H': '⠓', 'I': '⠊', 'J': '⠚',
    'K': '⠅', 'L': '⠇', 'M': '⠍', 'N': '⠝', 'O': '⠕', 'P': '⠏', 'Q': '⠟', 'R': '⠗', 'S': '⠎', 'T': '⠞',
    'U': '⠥', 'V': '⠧', 'W': '⠺', 'X': '⠭', 'Y': '⠽', 'Z': '⠵',
    '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚'
  };

  const generateRandomTarget = useCallback(() => {
    const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
    setCurrentTarget(randomChar);
  }, [allCharacters]);

  // 다음 타겟들을 미리 생성하는 함수
  const generateUpcomingTargets = useCallback(() => {
    const targets = [];
    for (let i = 0; i < 3; i++) {
      const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      targets.push(randomChar);
    }
    setUpcomingTargets(targets);
  }, [allCharacters]);

  // 다음 타겟으로 이동하는 함수
  const moveToNextTarget = useCallback(() => {
    // 현재 타겟을 히스토리에 추가
    setGameHistory(prev => {
      const newHistory = [currentTarget, ...prev].slice(0, 3); // 최대 3개까지만 유지
      return newHistory;
    });

    // 다음 타겟으로 이동
    if (upcomingTargets.length > 0) {
      setCurrentTarget(upcomingTargets[0]);
      setUpcomingTargets(prev => {
        const newUpcoming = prev.slice(1);
        // 새로운 타겟 하나 추가
        const newRandomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
        return [...newUpcoming, newRandomChar];
      });
    } else {
      generateRandomTarget();
      generateUpcomingTargets();
    }
  }, [currentTarget, upcomingTargets, allCharacters, generateRandomTarget, generateUpcomingTargets]);

  // 숫자를 영어 단어로 변환하는 함수
  const getEnglishWord = (char: string): string => {
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
    
    return numberWords[char] || char;
  };

  const calculateCPM = useCallback(() => {
    if (!gameStats.startTime) return 0;
    const currentTime = Date.now();
    const elapsedMinutes = (currentTime - gameStats.startTime) / (1000 * 60);
    return elapsedMinutes > 0 ? Math.round(gameStats.charactersTyped / elapsedMinutes) : 0;
  }, [gameStats.startTime, gameStats.charactersTyped]);

  const calculateAccuracy = useCallback(() => {
    if (gameStats.charactersTyped === 0) return 100;
    return Math.round((gameStats.correctAnswers / gameStats.charactersTyped) * 100);
  }, [gameStats.correctAnswers, gameStats.charactersTyped]);

  const startGame = () => {
    setGameStats({
      score: 0,
      combo: 0,
      maxCombo: 0,
      cpm: 0,
      accuracy: 100,
      startTime: Date.now(),
      charactersTyped: 0,
      correctAnswers: 0,
      timeRemaining: GAME_DURATION
    });
    setIsGameActive(true);
    setGameFinished(false);
    setHistoryAlreadySaved(false); // 히스토리 저장 상태 초기화
    setGameHistory([]); // 히스토리 초기화
    generateRandomTarget();
    generateUpcomingTargets(); // 다음 타겟들 생성

    // Start game timer
    const timer = setInterval(() => {
      setGameStats(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          setIsGameActive(false);
          setGameFinished(true);
          clearInterval(timer);
          
          // Calculate final stats safely
          const finalCPM = prev.startTime ? Math.round(prev.charactersTyped / ((Date.now() - prev.startTime) / (1000 * 60))) : 0;
          const finalAccuracy = prev.charactersTyped > 0 ? Math.round((prev.correctAnswers / prev.charactersTyped) * 100) : 100;
          
          // 게임 히스토리 저장 - 타이머 종료 시에만 저장
          const finalStatsForSave = {
            ...prev,
            cpm: finalCPM,
            accuracy: finalAccuracy
          };
          
          // 즉시 저장 처리 (setTimeout 제거하여 동기적으로 처리)
          saveGameResult(finalStatsForSave);
          
          // Show final results
          setTimeout(() => {
            Swal.fire({
              title: 'Time\'s Up!',
              html: `
                <div style="text-align: left;">
                  <p><strong>Final Score:</strong> ${prev.score}</p>
                  <p><strong>Max Combo:</strong> ${prev.maxCombo}</p>
                  <p><strong>CPM:</strong> ${finalCPM}</p>
                  <p><strong>Accuracy:</strong> ${finalAccuracy}%</p>
                </div>
              `,
              icon: 'info',
              confirmButtonText: 'Play Again',
              showCancelButton: true,
              cancelButtonText: 'Back to Menu',
              allowOutsideClick: false,
              allowEscapeKey: false
            }).then((result) => {
              if (result.isConfirmed) {
                retryGame();
              } else if (result.isDismissed || result.dismiss === Swal.DismissReason.cancel) {
                // navigate('/games');
              }
            }).catch((error) => {
              console.error('SweetAlert2 error:', error);
              // Fallback: navigate to games if SweetAlert2 fails
              // navigate('/games');
            });
          }, 500);
        }
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    setGameTimer(timer);
  };

  const stopGame = () => {
    if (!isGameActive) return; // 이미 중지된 게임이면 리턴
    
    setIsGameActive(false);
    setGameFinished(true);
    if (gameTimer) {
      clearInterval(gameTimer);
      setGameTimer(null);
    }
    
    // 수동 종료 시에는 게임 히스토리를 저장하지 않음 (타이머 종료 시에만 저장)
    console.log('🛑 Game manually stopped - history not saved');
  };

  const retryGame = () => {
    if (gameTimer) {
      clearInterval(gameTimer);
    }
    // 이전 게임 상태 완전히 초기화 후 새 게임 시작
    setHistoryAlreadySaved(false);
    setGameFinished(false);
    startGame();
  };

  // 게임 히스토리 저장 함수
  const saveGameResult = async (finalStats: GameStats) => {
    console.log(`🔍 saveGameResult called - historyAlreadySaved: ${historyAlreadySaved}`);
    
    if (!user) {
      console.log('⚠️ User not logged in - skipping game history save');
      return;
    }

    if (historyAlreadySaved) {
      console.log('⚠️ Game history already saved - skipping duplicate save');
      return;
    }

    // 저장 시작 전에 즉시 플래그 설정하여 중복 호출 방지
    console.log('🚀 Setting historyAlreadySaved to true');
    setHistoryAlreadySaved(true);

    try {
      console.log('💾 Saving Sprint game history...');

      const finalCPM = finalStats.startTime 
        ? Math.round(finalStats.charactersTyped / ((Date.now() - finalStats.startTime) / (1000 * 60))) 
        : 0;
      const accuracy = finalStats.charactersTyped > 0 
        ? (finalStats.correctAnswers / finalStats.charactersTyped) * 100 
        : 0;

      const gameData = {
        type: 'SPRINT' as const,
        cpm: finalCPM,
        combo: finalStats.maxCombo,
        score: finalStats.score,
        accuracy: Math.round(accuracy * 100) / 100 // 소수점 2자리까지
      };

      console.log('📊 Game data to save:', gameData);
      
      await saveGameHistory(user, gameData);

      console.log('✅ Sprint game history saved successfully!');
    } catch (error) {
      console.error('❌ Failed to save sprint game history:', error);
      // 실패한 경우에만 플래그 재설정하여 재시도 가능하게 함
      console.log('🔄 Resetting historyAlreadySaved to false due to error');
      setHistoryAlreadySaved(false);
    }
  };

  // 점자 키보드 토글
  // const toggleKeyboard = () => {
  //   setKeyboardVisible(!keyboardVisible);
  // };

  // 점자 입력 장치 처리
  useEffect(() => {
    if (!isConnected || !isGameActive || gameFinished || gameStats.timeRemaining <= 0) return;

    const handleBrailleInput = (data: number) => {
      const bits = parseInputBits(data);
      
      if (bits.includes(-1)) {
        // 백스페이스 처리
        console.log('Backspace received');
      } else if (bits.includes(-2)) {
        // 스페이스 처리
        console.log('Space received');
      } else if (bits.length > 0) {
        setActiveDots(bits);
        const character = findCharacterFromDots(bits);
        if (character) {
          // 점자 입력을 직접 처리
          let pressedKey = character.toUpperCase();
          
          // 현재 타겟이 숫자인 경우, 알파벳으로 인식된 문자를 숫자로 변환
          if (/\d/.test(currentTarget)) {
            const numberMapping: { [key: string]: string } = {
              'A': '1', 'B': '2', 'C': '3', 'D': '4', 'E': '5',
              'F': '6', 'G': '7', 'H': '8', 'I': '9', 'J': '0'
            };
            if (numberMapping[pressedKey]) {
              pressedKey = numberMapping[pressedKey];
            }
          }
          
          if (pressedKey === currentTarget) {
            // 정답 처리
            const newCombo = gameStats.combo + 1;
            const newMaxCombo = Math.max(gameStats.maxCombo, newCombo);
            
            const newStats = {
              ...gameStats,
              score: gameStats.score + 10,
              combo: newCombo,
              maxCombo: newMaxCombo,
              charactersTyped: gameStats.charactersTyped + 1,
              correctAnswers: gameStats.correctAnswers + 1,
              cpm: calculateCPM(),
              accuracy: calculateAccuracy()
            };

            setGameStats(newStats);

            // Show success animation
            Swal.fire({
              title: 'Correct!',
              text: `+10 points! Combo: ${newStats.combo}`,
              icon: 'success',
              timer: 500,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });

            // 음성 피드백 추가 - 현재 타겟 문자를 읽어줌
            if ('speechSynthesis' in window) {
              const wordToSpeak = getEnglishWord(currentTarget);
              const utterance = new SpeechSynthesisUtterance(wordToSpeak);
              utterance.rate = 0.8;
              utterance.pitch = 1;
              utterance.volume = 0.8;
              utterance.lang = 'en-US';
              speechSynthesis.speak(utterance);
            }

            // Check for combo bonus
            if (newStats.combo > 1 && newStats.combo % 5 === 0) {
              setShowComboBonus(true);
              setTimeout(() => setShowComboBonus(false), 2000);
            }

            // 콤보 타이머 제거 - 틀렸을 때만 콤보가 리셋되도록 변경

            moveToNextTarget();
          } else {
            // 오답 처리
            const newStats = {
              ...gameStats,
              combo: 0,
              charactersTyped: gameStats.charactersTyped + 1,
              cpm: calculateCPM(),
              accuracy: calculateAccuracy()
            };

            setGameStats(newStats);

            // 오답 시 콤보는 즉시 리셋 (타이머 불필요)

            // Show error animation
            Swal.fire({
              title: 'Wrong!',
              text: 'Combo broken!',
              icon: 'error',
              timer: 500,
              showConfirmButton: false,
              toast: true,
              position: 'top-end'
            });

            // 오답 시에도 새로운 문제 생성
            moveToNextTarget();
          }
        }
        
        // 잠시 후 activeDots 초기화
        setTimeout(() => {
          setActiveDots([]);
        }, 1000);
      }
    };

    setOnDataCallback(handleBrailleInput);
  }, [isConnected, isGameActive, gameFinished, gameStats, currentTarget, calculateCPM, calculateAccuracy, generateRandomTarget]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isGameActive || gameFinished || gameStats.timeRemaining <= 0) return;

    const pressedKey = event.key.toUpperCase();
    
    if (pressedKey === currentTarget) {
      // Correct answer
      const newCombo = gameStats.combo + 1;
      const newMaxCombo = Math.max(gameStats.maxCombo, newCombo);
      
      const newStats = {
        ...gameStats,
        score: gameStats.score + 10,
        combo: newCombo,
        maxCombo: newMaxCombo,
        charactersTyped: gameStats.charactersTyped + 1,
        correctAnswers: gameStats.correctAnswers + 1,
        cpm: calculateCPM(),
        accuracy: calculateAccuracy()
      };

      setGameStats(newStats);

      // Show success animation
      Swal.fire({
        title: 'Correct!',
        text: `+10 points! Combo: ${newStats.combo}`,
        icon: 'success',
        timer: 500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // 음성 피드백 추가 - 현재 타겟 문자를 읽어줌
      if ('speechSynthesis' in window) {
        const wordToSpeak = getEnglishWord(currentTarget);
        const utterance = new SpeechSynthesisUtterance(wordToSpeak);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
      }

      // Check for combo bonus
      if (newStats.combo > 1 && newStats.combo % 5 === 0) {
        setShowComboBonus(true);
        setTimeout(() => setShowComboBonus(false), 2000);
      }

      // 콤보 타이머 제거 - 틀렸을 때만 콤보가 리셋되도록 변경

      moveToNextTarget();
    } else {
      // Wrong answer
      const newCharactersTyped = gameStats.charactersTyped + 1;
      const newAccuracy = Math.round((gameStats.correctAnswers / newCharactersTyped) * 100);
      
      const newStats = {
        ...gameStats,
        combo: 0,
        charactersTyped: newCharactersTyped,
        cpm: calculateCPM(),
        accuracy: newAccuracy
      };

      setGameStats(newStats);

      // 오답 시 콤보는 즉시 리셋 (타이머 불필요)

      // Show error animation
      Swal.fire({
        title: 'Wrong!',
        text: 'Combo broken!',
        icon: 'error',
        timer: 500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      // 오답 시에도 새로운 문제 생성
      moveToNextTarget();
    }
  }, [isGameActive, gameFinished, currentTarget, gameStats, calculateCPM, calculateAccuracy, generateRandomTarget]);

  // Update CPM and accuracy periodically
  useEffect(() => {
    if (isGameActive && gameStats.startTime) {
      const interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          cpm: calculateCPM(),
          accuracy: calculateAccuracy()
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGameActive, gameStats.startTime, calculateCPM, calculateAccuracy]);

  // Handle keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Initialize first target
  useEffect(() => {
    if (!currentTarget) {
      generateRandomTarget();
      generateUpcomingTargets();
    }
  }, [currentTarget, generateRandomTarget, generateUpcomingTargets]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (gameTimer) clearInterval(gameTimer);
    };
  }, [gameTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 브레일 키보드 토글 버튼 */}
      {/* <button
        onClick={toggleKeyboard}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg shadow-lg transition-colors"
        title="Toggle Braille Reference"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button> */}
      
      <main className="flex-1 flex flex-col items-center py-16">
        <div className="w-full max-w-6xl px-4">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2 mr-8">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
              </div>
              
              <h1 className="text-5xl font-light text-gray-600 mx-6">Typing Sprint</h1>
              
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-700"></div>
              </div>
            </div>
            
            <p className="text-lg text-black font-light">
              Type as many characters as possible in {GAME_DURATION} seconds!
            </p>
          </div>

          {/* Game Stats */}
          <div className="flex justify-between items-center mb-8 px-24">
            <div className="text-center">
              <p className="text-3xl text-red-600 font-bold">TIME : {formatTime(gameStats.timeRemaining)}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-blue-600">score : {gameStats.score}</p>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="flex justify-center items-center mb-8 space-x-8">

            <div className="flex items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white text-sm font-bold text-center">
                  {gameStats.combo}<br/>Combo
                </span>
              </div>
            </div>


            {/* TIME Section - 피그마 디자인 참조 */}
            <div className="flex flex-col items-center relative">
              {/* TIME Label */}
              <div className="bg-red-600 rounded-2xl px-8 py-1 absolute top-[-15px] z-10">
                <span className="text-white text-sm font-medium">TIME</span>
              </div>
              {/* TIME Value Box */}
              <div className="bg-white border-2 border-red-600 rounded-2xl px-12 py-4 shadow-lg">
                <span className="text-3xl text-red-600 font-bold">{formatTime(gameStats.timeRemaining)}</span>
              </div>

            </div>

            {/* Empty Box */}
            <div className="w-28 h-28 rounded-full"></div>

          </div>


            {/* Progress bar container */}
            <div className="w-full mt-2 mb-10 px-24">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
                <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                initial={{ width: "0%" }}
                animate={{ width: `${((GAME_DURATION - gameStats.timeRemaining) / GAME_DURATION) * 100}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-600">00:00</span>
                <span className="text-sm text-gray-600">{formatTime(GAME_DURATION)}</span>
              </div>
            </div>


          {/* Performance Stats */}
          <div className="flex justify-center items-center mb-8 space-x-8">

            {/* CPM Section - 피그마 디자인 참조 */}
            <div className="flex flex-col items-center relative">
              {/* CPM Label */}
                <div className="bg-blue-600 rounded-2xl px-8 py-1 absolute top-[-15px]">
                <span className="text-white text-sm">CPM</span>
              </div>
              {/* CPM Value Box */}
              <div className="bg-white border border-blue-600 rounded-2xl px-[60px] py-4 shadow-lg mb-2">
                <span className="text-3xl text-blue-600 font-normal text-center">{gameStats.cpm}</span>
              </div>
              {/* Description */}
              <span className="text-gray-600 text-sm mt-1">Characters Per Minute</span>
            </div>

            {/* Accuracy Section - 피그마 디자인 참조 */}
            <div className="flex flex-col items-center relative">
              {/* CPM Label */}
                <div className="bg-blue-600 rounded-2xl px-4 py-1 absolute top-[-15px]">
                <span className="text-white text-sm">Accuracy(%)</span>
              </div>
              {/* CPM Value Box */}
              <div className="bg-white border border-blue-600 rounded-2xl px-[50px] py-4 shadow-lg mb-2">
                <span className="text-3xl text-blue-600 font-normal text-center">{gameStats.accuracy}</span>
              </div>
              {/* Description */}
              <span className="text-gray-600 text-sm mt-1">Accuracy</span>
            </div>
            
          </div>

            {/* Challenge Display - History, Current, Next */}
            <div className="flex justify-center items-center mb-12">
            <div className="flex items-center space-x-8">
              {/* History (Left) */}
              <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">History</p>
              <div className="flex space-x-2">
                {/* Show last 3 characters in reverse order (oldest to newest) */}
                {Array.from({ length: 3 }, (_, index) => {
                  const historyChar = gameHistory[2 - index]; // 역순으로 표시
                  return (
                    <div
                      key={`history-${index}`}
                      className="w-16 h-20 rounded-2xl border border-gray-300 flex items-center justify-center bg-gray-100"
                      style={{ opacity: historyChar ? 0.5 + (index * 0.2) : 0.3 }}
                    >
                      <span className="text-2xl font-light text-gray-500">
                        {historyChar || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
              </div>

              {/* Current Target (Center) */}
              <div className="flex flex-col items-center">
              <p className="text-sm text-blue-600 font-semibold mb-2">Current</p>
              <motion.div
                className="w-24 h-28 rounded-2xl border-2 border-blue-600 flex flex-col items-center justify-center shadow-xl bg-white"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-3xl font-bold text-blue-600 mb-2">{currentTarget}</span>
                {/* <span className="text-4xl text-blue-600">{brailleMap[currentTarget] || '⠿'}</span> */}
              </motion.div>
              </div>

              {/* Next (Right) */}
              <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">Next</p>
              <div className="flex space-x-2">
                {/* Show next 3 characters */}
                {upcomingTargets.slice(0, 3).map((char, index) => (
                <div
                  key={`next-${char}-${index}`}
                  className="w-16 h-20 rounded-2xl border border-gray-300 flex items-center justify-center bg-blue-100"
                  style={{ opacity: 0.9 - (index * 0.2) }}
                >
                  <span className="text-2xl font-light text-gray-600">{char}</span>
                </div>
                ))}
                {/* 부족한 칸들은 빈 칸으로 채우기 */}
                {Array.from({ length: Math.max(0, 3 - upcomingTargets.length) }, (_, index) => (
                  <div
                    key={`next-empty-${index}`}
                    className="w-16 h-20 rounded-2xl border border-gray-300 flex items-center justify-center bg-blue-100 opacity-30"
                  >
                    <span className="text-2xl font-light text-gray-400">-</span>
                  </div>
                ))}
              </div>
              </div>
            </div>
            </div>

            {/* 점자 입력 표시 */}
            {activeDots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center mb-8"
            >
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
              <p className="text-blue-800 text-center mb-2">Braille Input:</p>
              <div className="text-4xl text-blue-600 text-center">
                {generateBraillePattern(activeDots)}
              </div>
              <p className="text-sm text-blue-600 text-center mt-1">
                Dots: {activeDots.join(', ')}
              </p>
              </div>
            </motion.div>
            )}

          {/* Combo Bonus */}
          <AnimatePresence>
            {showComboBonus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-6"
              >
                <p className="text-orange-600 text-lg font-bold">
                  🔥 COMBO BONUS! +{gameStats.combo} Points!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-8">
            {!isGameActive && !gameFinished && (
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-xl transition-colors duration-300"
              >
                Start Sprint
              </button>
            )}
            
            {isGameActive && (
              <button
                onClick={stopGame}
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-lg text-xl transition-colors duration-300"
              >
                Stop Sprint
              </button>
            )}

            {gameFinished && (
              <div className="flex space-x-4">
                <button
                  onClick={retryGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-xl transition-colors duration-300"
                >
                  Retry Sprint
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-xl transition-colors duration-300"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          {!isGameActive && !gameFinished && (
            <div className="text-center mt-8">
              <p className="text-gray-600 text-lg">
                Press the corresponding keyboard key for each displayed character.<br/>
                Keep your combo going for bonus points!<br/>
                <strong>Goal:</strong> Type as fast and accurately as possible in {GAME_DURATION} seconds.
              </p>
            </div>
          )}

          {/* Braille Reference */}
          {/* {keyboardVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-16 bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Braille Reference
              </h3>
              
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-700 mb-4 text-center">Alphabet</h4>
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-13 gap-2">
                  {Array.from({ length: 26 }, (_, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const braillePattern = getDotsFromCharacter(letter);
                    const brailleChar = braillePattern ? generateBraillePattern(braillePattern) : '⠀';
                    
                    return (
                      <motion.div
                        key={letter}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                      >
                        <div className="text-3xl text-blue-600 mb-1">{brailleChar}</div>
                        <div className="text-sm font-semibold text-gray-700">{letter}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-4 text-center">Numbers</h4>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-4 max-w-4xl mx-auto">
                  {Object.entries(BRAILLE_NUMBERS).map(([number, dots]) => {
                    const brailleChar = generateBraillePattern(dots);
                    
                    return (
                      <motion.div
                        key={number}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                      >
                        <div className="text-4xl text-blue-600 mb-2">{brailleChar}</div>
                        <div className="text-lg font-bold text-gray-700">{number}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )} */}
        </div>
      </main>
    </div>
  );
};

export default TypingSprint;
